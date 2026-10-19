// Doldurma betikleri sayfalara otomatik enjekte edilmez. FillHub kullanıldığında (kısayol, simge, menü)
// her çerçeveye bir kez enjekte edilir; böylece kullanılmayan sayfalar bellek harcamaz.
const CONTENT_FILES = ["scripts/locale-data.js", "scripts/id-rules.js", "scripts/field-detect.js", "scripts/generator.js", "scripts/site-rules.js", "scripts/content-dates.js", "scripts/content.js"];

// Her çerçevede içerik betiği yoksa enjekte eder; zaten yüklü olanlara dokunmaz
async function ensureContentScripts(tabId) {
    try {
        const frames = await chrome.scripting.executeScript({
            target: { tabId, allFrames: true },
            func: () => window.__fillhubInjected === true
        });
        const frameIds = frames.filter((f) => f.result !== true).map((f) => f.frameId);
        if (frameIds.length === 0) return;
        await chrome.scripting.executeScript({ target: { tabId, frameIds }, files: CONTENT_FILES });
    } catch (e) {
        // Enjeksiyona izin verilmeyen sayfalar (chrome://, Web Mağazası) sessizce atlanır
    }
}

// Sayfanın üst düzey alan adı, site istisnalarının karar verebilmesi için her mesajla birlikte gönderilir;
// iframe'ler de bu alan adına göre değerlendirilir
function hostOf(url) {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return '';
    }
}

// Gönderim kararı sayfa genelinde verilir: görünür bir captcha herhangi bir çerçevedeyse hiçbir çerçeve formu göndermez.
// Yalnızca doldurma istekleri yoklanır; geri al ve tek alan doldurma zaten göndermez.
const FILL_ACTIONS = new Set(['fill', 'fill_chaos']);

async function tabHasVisibleCaptcha(tabId) {
    const probes = await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        func: () => window.__fillhubInjected === true && typeof findVisibleCaptcha === 'function' && findVisibleCaptcha() !== null
    }).catch(() => []);
    return probes.some((p) => p.result === true);
}

async function sendToTab(tab, message) {
    await ensureContentScripts(tab.id);
    const tabCaptcha = FILL_ACTIONS.has(message.action) && await tabHasVisibleCaptcha(tab.id);
    return chrome.tabs.sendMessage(tab.id, { ...message, pageHost: hostOf(tab.url), tabCaptcha }).catch(() => {
        // Sayfa kısıtlıysa ya da içerik betiği yanıt vermiyorsa yoksay
    });
}

// Sonucu olan istekler (popup) her çerçeveye ayrı gönderilir ve yanıtlar toplanır.
// tabs.sendMessage tek yanıt döndürür: iframe'in (ör. alanı olmayan bir reklam) yanıtı önce gelirse sonuç 0 görünürdü.
async function sendToAllFrames(tab, message) {
    await ensureContentScripts(tab.id);
    const probes = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => window.__fillhubInjected === true
    }).catch(() => []);
    const frameIds = probes.filter((p) => p.result === true).map((p) => p.frameId);
    const tabCaptcha = FILL_ACTIONS.has(message.action) && await tabHasVisibleCaptcha(tab.id);
    const payload = { ...message, pageHost: hostOf(tab.url), tabCaptcha };
    const replies = await Promise.all(frameIds.map((frameId) =>
        chrome.tabs.sendMessage(tab.id, payload, { frameId }).catch(() => null)));
    return replies.filter(Boolean);
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fillForm",
        title: chrome.i18n.getMessage('menuFillForm'),
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "fillField",
        title: chrome.i18n.getMessage('menuFillField'),
        contexts: ["editable"]
    });
    chrome.contextMenus.create({
        id: "undoFill",
        title: chrome.i18n.getMessage('menuUndo'),
        contexts: ["all"]
    });
});

// Hedef sekme: popup'ın kendi penceresi dışındaki en son odaklanan normal pencerenin etkin sekmesi.
// Araç çubuğu popup'ı ayrı pencere olarak açıldığında odağı alır; lastFocusedWindow o pencereyi döndürür.
// Popup'ın sekme (popupTabId) ve pencere (popupWindowId) kimlikleri bu yüzden dışlanır.
async function findTargetTab(popupTabId, popupWindowId) {
    const windows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
    const candidates = windows
        .filter((w) => w.id !== popupWindowId)
        .sort((a, b) => (b.focused ? 1 : 0) - (a.focused ? 1 : 0));
    for (const w of candidates) {
        const active = (w.tabs || []).find((t) => t.active && t.id !== popupTabId);
        if (active) return active;
    }
    return null;
}

// Araç çubuğu simgesi açılır pencereyi (popup/) açar; doldur ve geri al istekleri oradan buraya gelir.
// Yanıt içerik betiğinin sonucudur. Açılır pencere bir sekme olmadığından hedef sekme burada bulunur.
// Seçici testi: etkin sekmede CSS seçicinin eşleştiği öğe sayısı. Yalnızca sayı döner; sayfa içeriği okunmaz.
// Popup'taki Test düğmesi bir kullanıcı eylemidir; activeTab izni bu eylemle etkin sekmeye verilir.
async function countSelectorMatches(selector, popupTabId, popupWindowId) {
    const tab = await findTargetTab(popupTabId, popupWindowId);
    if (!tab) return { status: 'no-page' };
    const [injection] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (sel) => { try { return document.querySelectorAll(sel).length; } catch (e) { return -1; } },
        args: [selector]
    }).catch(() => []);
    if (!injection || typeof injection.result !== 'number') return { status: 'no-page' };
    if (injection.result < 0) return { status: 'invalid' };
    return { status: 'success', matches: injection.result };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'selector-test') {
        const popupTabId = Number.isInteger(message.popupTabId) ? message.popupTabId : -1;
        const popupWindowId = Number.isInteger(message.popupWindowId) ? message.popupWindowId : -1;
        countSelectorMatches(String(message.selector || ''), popupTabId, popupWindowId).then(sendResponse, () => sendResponse({ status: 'no-page' }));
        return true;
    }
    if (message?.type !== 'popup-action') return false;
    (async () => {
        const popupTabId = Number.isInteger(message.popupTabId) ? message.popupTabId : -1;
        const popupWindowId = Number.isInteger(message.popupWindowId) ? message.popupWindowId : -1;
        const tab = await findTargetTab(popupTabId, popupWindowId);
        if (!tab) {
            sendResponse({ status: 'skipped' });
            return;
        }
        const { preferredLocale } = await chrome.storage.local.get(['preferredLocale']);
        const replies = await sendToAllFrames(tab, { action: message.action, locale: preferredLocale });
        if (replies.length === 0) {
            sendResponse({ status: 'error' });
            return;
        }
        // Sayılar çerçeveler arasında toplanır: her çerçeve kendi alanlarını doldurur ve geri alır
        const sum = (key) => replies.reduce((total, r) => total + (Number.isFinite(r[key]) ? r[key] : 0), 0);
        sendResponse({ status: 'success', filled: sum('filled'), restored: sum('restored') });
    })();
    return true;
});

const MENU_ACTIONS = {
    fillForm: 'fill',
    fillField: 'fill_field',
    undoFill: 'undo'
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const action = MENU_ACTIONS[info.menuItemId];
    if (!action) return;
    const { preferredLocale } = await chrome.storage.local.get(['preferredLocale']);
    sendToTab(tab, { action, locale: preferredLocale });
});

const COMMAND_ACTIONS = {
    fill_chaos: 'fill_chaos',
    undo_fill: 'undo'
};

chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    const action = COMMAND_ACTIONS[command] || 'fill';
    const { preferredLocale } = await chrome.storage.local.get(['preferredLocale']);
    sendToTab(tab, { action, locale: preferredLocale });
});
