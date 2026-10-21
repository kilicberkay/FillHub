// Doldurma betikleri sayfalara otomatik enjekte edilmez. FillHub kullanıldığında (kısayol, simge, menü)
// her çerçeveye bir kez enjekte edilir; böylece kullanılmayan sayfalar bellek harcamaz.
const CONTENT_FILES = ["scripts/locale-data.js", "scripts/id-rules.js", "scripts/field-detect.js", "scripts/generator.js", "scripts/site-rules.js", "scripts/content-dates.js", "scripts/content.js"];

// Betikler çerçevenin "boşta" olmasını beklemeden çalışır. Varsayılan bekleme, hiç boşa geçmeyen bir çerçevede
// (ör. "about:blank#…" adresli iframe) tüm çağrıyı süresiz bekletir. Betikler yüklenirken DOM'a dokunmaz;
// doldurma, kullanıcı eyleminden sonra mesajla başlar.
const IMMEDIATE = { injectImmediately: true };

// Her çerçevede içerik betiği yoksa enjekte eder; zaten yüklü olanlara dokunmaz
async function ensureContentScripts(tabId) {
    try {
        const frames = await chrome.scripting.executeScript({
            target: { tabId, allFrames: true },
            ...IMMEDIATE,
            func: () => window.__fillhubInjected === true
        });
        const frameIds = frames.filter((f) => f.result !== true).map((f) => f.frameId);
        if (frameIds.length === 0) return;
        await chrome.scripting.executeScript({ target: { tabId, frameIds }, ...IMMEDIATE, files: CONTENT_FILES });
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
        ...IMMEDIATE,
        func: () => window.__fillhubInjected === true && typeof findVisibleCaptcha === 'function' && findVisibleCaptcha() !== null
    }).catch(() => []);
    return probes.some((p) => p.result === true);
}

// Doldurma ve geri alma her çerçeveye ayrı gönderilir ve yanıtlar toplanır.
// tabs.sendMessage tek yanıt döndürür: iframe'in (ör. alanı olmayan bir reklam) yanıtı önce gelirse sonuç 0 görünürdü.
async function sendToAllFrames(tab, message) {
    await ensureContentScripts(tab.id);
    const probes = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        ...IMMEDIATE,
        func: () => window.__fillhubInjected === true
    }).catch(() => []);
    const frameIds = probes.filter((p) => p.result === true).map((p) => p.frameId);
    const tabCaptcha = FILL_ACTIONS.has(message.action) && await tabHasVisibleCaptcha(tab.id);
    const payload = { ...message, pageHost: hostOf(tab.url), tabCaptcha };
    const replies = await Promise.all(frameIds.map((frameId) =>
        chrome.tabs.sendMessage(tab.id, payload, { frameId }).catch(() => null)));
    return replies.filter(Boolean);
}

// Çerçeve yanıtlarındaki bir sayının toplamı (her çerçeve kendi alanlarını doldurur ve geri alır)
function sumReplies(replies, key) {
    return replies.reduce((total, r) => total + (Number.isFinite(r[key]) ? r[key] : 0), 0);
}

// Doldurma ve geri alma her çerçeveye gönderilir. Doldurmada çerçeveler bildirim göstermez (deferToast);
// bildirim, tüm çerçevelerin toplamıyla üst çerçevede gösterilir (alan yoksa "alan bulunamadı").
async function runInTab(tab, message) {
    const isFill = FILL_ACTIONS.has(message.action);
    const replies = await sendToAllFrames(tab, isFill ? { ...message, deferToast: true } : message);
    if (isFill && replies.length) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'fill_result',
            filled: sumReplies(replies, 'filled'),
            submitted: replies.some((r) => r.submitted === true),
            captcha: replies.some((r) => r.captcha === true),
            chaos: message.action === 'fill_chaos'
        }, { frameId: 0 }).catch(() => {});
    }
    return replies;
}

// "Bu alanı doldur" yalnız sağ tıklanan çerçeveye gider: başka bir çerçevede odakta kalmış eski alan dolmaz
async function fillFieldInFrame(tab, frameId) {
    await ensureContentScripts(tab.id);
    const { preferredLocale } = await chrome.storage.local.get(['preferredLocale']);
    return chrome.tabs.sendMessage(tab.id, { action: 'fill_field', locale: preferredLocale, pageHost: hostOf(tab.url) }, { frameId }).catch(() => null);
}

// Kısayol, sağ tık menüsü ve araç çubuğu simgesi aynı yolu kullanır: tercih edilen ülke ayarlardan okunur,
// activeTab izni bu kullanıcı eylemleriyle verilir.
async function runTabAction(tab, action = 'fill') {
    if (!tab || !Number.isInteger(tab.id)) return [];
    const { preferredLocale } = await chrome.storage.local.get(['preferredLocale']);
    return runInTab(tab, { action, locale: preferredLocale });
}

// Araç çubuğu simgesi açılır pencere açmaz: tıklandığı anda formu doldurur.
chrome.action.onClicked.addListener((tab) => {
    runTabAction(tab, 'fill');
});

chrome.runtime.onInstalled.addListener(async () => {
    // Güncellemede eski menü öğeleri kalırsa aynı kimlikle oluşturmak hata verir; önce temizlenir
    await chrome.contextMenus.removeAll();
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
    // "all" bağlamı hem sayfa menüsünde hem araç çubuğu simgesinin sağ tık menüsünde görünür
    chrome.contextMenus.create({
        id: "openSettings",
        title: chrome.i18n.getMessage('menuSettings'),
        contexts: ["all"]
    });
});

// Bildirimdeki Geri al: doldurulan sekmenin her çerçevesi geri alınır (iframe içindeki alanlar dahil).
// Doldurma istekleri artık yalnızca kullanıcı eylemlerinden (kısayol, sağ tık, simge) gelir.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== 'undo-all' || !sender.tab) return false;
    runInTab(sender.tab, { action: 'undo' }).then((replies) => {
        sendResponse(replies.length ? { status: 'success', restored: sumReplies(replies, 'restored') } : { status: 'error' });
    }, () => sendResponse({ status: 'error' }));
    return true;
});

const MENU_ACTIONS = {
    fillForm: 'fill',
    fillField: 'fill_field',
    undoFill: 'undo'
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSettings') {
        chrome.runtime.openOptionsPage();
        return;
    }
    const action = MENU_ACTIONS[info.menuItemId];
    if (!action || !tab) return;
    if (action === 'fill_field') fillFieldInFrame(tab, Number.isInteger(info.frameId) ? info.frameId : 0);
    else runTabAction(tab, action);
});

const COMMAND_ACTIONS = {
    fill_chaos: 'fill_chaos',
    undo_fill: 'undo'
};

chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    runTabAction(tab, COMMAND_ACTIONS[command] || 'fill');
});
