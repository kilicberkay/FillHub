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

async function sendToTab(tab, message) {
    await ensureContentScripts(tab.id);
    return chrome.tabs.sendMessage(tab.id, { ...message, pageHost: hostOf(tab.url) }).catch(() => {
        // Sayfa kısıtlıysa ya da içerik betiği yanıt vermiyorsa yoksay
    });
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

// Araç çubuğu simgesi açılır pencereyi (popup/) açar; doldur ve geri al istekleri oradan buraya gelir.
// Yanıt içerik betiğinin sonucudur. Açılır pencere bir sekme olmadığından etkin sekme burada bulunur.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== 'popup-action') return false;
    (async () => {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (!tab) {
            sendResponse({ status: 'skipped' });
            return;
        }
        const { preferredLocale } = await chrome.storage.local.get(['preferredLocale']);
        const response = await sendToTab(tab, { action: message.action, locale: preferredLocale });
        sendResponse(response ?? { status: 'error' });
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
