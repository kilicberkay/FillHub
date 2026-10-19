// Uçtan uca testler için ortam: yerel form sunucusu, uzantılı Chromium ve servis çalışanı üzerinden komut.
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchWithExtension, Cdp, PageSession, wait, findChrome } from '../../tools/lib/browser.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Paketlenmemiş bir uzantının kimliği, klasörün mutlak yolunun SHA-256 özetinden üretilir (Chromium'un yöntemi)
export function unpackedExtensionId(dir) {
    const hex = createHash('sha256').update(resolve(dir)).digest('hex').slice(0, 32);
    return [...hex].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

// Uzantı sayfasını açıp bir mesaj gönderir; servis çalışanı olay geldiğinde başlar. Sonuç: kimlik ve yanıt.
async function wakeServiceWorker(cdp, extId) {
    const { targetId } = await cdp.send('Target.createTarget', { url: `chrome-extension://${extId}/options/options.html` });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    for (let k = 0; k < 50; k++) {
        const href = await cdp.send('Runtime.evaluate', { expression: 'location.href', returnByValue: true }, sessionId)
            .then((r) => r.result.value).catch(() => '');
        if (String(href).startsWith('chrome-extension://')) break;
        await wait(100);
    }
    const r = await cdp.send('Runtime.evaluate', {
        expression: `(async () => {
            const id = chrome.runtime.id;
            const reply = await new Promise((res) => chrome.runtime.sendMessage({ type: 'harness-wake' }, () => res(chrome.runtime.lastError ? chrome.runtime.lastError.message : 'yanıtsız')));
            return JSON.stringify({ id, reply });
        })()`,
        awaitPromise: true,
        returnByValue: true,
    }, sessionId);
    return r.exceptionDetails ? `istisna: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}` : r.result.value;
}

// Tarayıcıya yüklenen eklenti klasörü (paketlenen tek kaynak)
export const EXT = join(ROOT, 'extension');
const FIXTURES = {
    tr: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'form.html')),
    en: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'form-en.html')),
    consent: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'consent.html')),
    rich: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'rich.html')),
    ja: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'form-ja.html')),
    zh: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'form-zh.html')),
    ar: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'form-ar.html')),
    picker: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'picker.html')),
    frames: readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'frames.html')),
    'frames-cross-origin': readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'frames-cross-origin.html')),
    'cross-frame': readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'form-cross-frame.html')),
    'no-fields': readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'no-fields.html')),
};
// ?page=<anahtar> ile seçilen sayfalar; diğer istekler dile göre TR ya da EN formunu alır
const NAMED_PAGES = ['consent', 'rich', 'ja', 'zh', 'ar', 'picker', 'frames', 'frames-cross-origin', 'cross-frame', 'no-fields'];

export const chromeAvailable = () => Boolean(findChrome());

// Uzantı, form sunucusu ve kontrol bağlantısını açar
export async function startEnv() {
    const srv = createServer((req, res) => {
        // ?lang=en → İngilizce etiketli form; varsayılan Türkçe
        // ?page=consent → adlandırılmış fixture; tam eşleşme (ör. "frames" ile "frames-cross-origin" karışmaz)
        const wanted = new URL(req.url, 'http://127.0.0.1').searchParams.get('page');
        const key = NAMED_PAGES.includes(wanted) ? wanted : (req.url.includes('lang=en') ? 'en' : 'tr');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(FIXTURES[key]);
    });
    await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${srv.address().port}/form.html`;
    // Alan adı gerektiren testler için (site istisnası): tarayıcı "--host-resolver-rules" ile bu adı 127.0.0.1'e çözer
    const hostBase = `http://fillhub.test:${srv.address().port}/form.html`;

    // FILLHUB_EXT_DIR: açılmış paket kopyası (ör. dist/fillhub-*.zip çıktısı) de sınanabilir
    const browser = await launchWithExtension(process.env.FILLHUB_EXT_DIR || EXT, {});
    const cdp = await new Cdp(browser.browserWs).connect();

    // Yalnızca bu uzantının servis çalışanı. Tarayıcı --disable-extensions-except ile açıldığı için
    // chrome-extension:// adresli bir servis çalışanı aday olur; ayrıca chrome.storage erişimi olmalıdır
    // (bu izin yalnızca FillHub'ın manifestinde var). Hedef adresinin biçimi Chromium sürümüne göre
    // değiştiğinden dosya adına bakılmaz. Yavaş makinelerde (CI) ayağa kalkması 30 saniyeye kadar sürebilir.
    let sw = null;
    let sessionId = null;
    let seen = [];
    const started = Date.now();
    const deadline = started + 30000;
    const expectedId = unpackedExtensionId(process.env.FILLHUB_EXT_DIR || EXT);
    let wake = null;
    let lastWake = 0;
    while (!sw && Date.now() < deadline) {
        const { targetInfos } = await cdp.send('Target.getTargets');
        seen = targetInfos.map((t) => `${t.type} ${t.url.slice(0, 60)}`);
        // Uzantı geç yüklenirse uyandırma bir kez yetmeyebilir; beş saniyede bir yeniden denenir
        if (Date.now() - started > 5000 && Date.now() - lastWake > 5000) {
            lastWake = Date.now();
            wake = await wakeServiceWorker(cdp, expectedId).catch((e) => `hata: ${e.message}`);
        }
        for (const candidate of targetInfos.filter((t) => t.type === 'service_worker' && t.url.startsWith('chrome-extension://'))) {
            const attached = await cdp.send('Target.attachToTarget', { targetId: candidate.targetId, flatten: true });
            let ready = false;
            for (let k = 0; k < 10 && !ready; k++) {
                ready = await cdp.send('Runtime.evaluate', {
                    expression: "typeof chrome !== 'undefined' && !!chrome.storage",
                    returnByValue: true,
                }, attached.sessionId).then((r) => r.result.value === true).catch(() => false);
                if (!ready) await wait(300);
            }
            if (ready) {
                sw = candidate;
                sessionId = attached.sessionId;
                break;
            }
            await cdp.send('Target.detachFromTarget', { sessionId: attached.sessionId }).catch(() => {});
        }
        if (!sw) await wait(200);
    }
    if (!sw) {
        // Tarayıcı açık kalırsa test süreci hiç bitmez; hatayı tanılama bilgisiyle birlikte hemen fırlat
        const stderr = browser.stderrTail();
        const version = execFileSync(browser.chrome, ['--version'], { encoding: 'utf8' }).trim();
        cdp.close();
        srv.close();
        await browser.close();
        throw new Error(`FillHub servis çalışanı bulunamadı (kimlik ${expectedId}, uyandırma: ${wake}). Tarayıcı: ${browser.chrome} (${version}). Görülen hedefler: [${seen.join(' | ')}]. Chromium stderr: ${stderr}`);
    }
    const extId = sw.url.split('/')[2];

    const env = {
        base, hostBase, extId, browser, cdp, srv, runCounter: 0,
        // Servis çalışanında ifade değerlendirir (chrome.* API'leri burada)
        swEval: async (expression) => {
            const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
            if (r.exceptionDetails) throw new Error(`SW hatası: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
            return r.result.value;
        },
        close: async () => {
            await browser.close();
            cdp.close();
            srv.close();
        },
    };
    // Attach sonrası bağlam hemen hazır olmayabilir; chrome.* erişilene kadar beklenir
    for (let i = 0; i < 50; i++) {
        if (await env.swEval("typeof chrome !== 'undefined' && !!chrome.storage").catch(() => false)) break;
        await wait(100);
    }
    return env;
}

// Depolamayı temizler ve verilen anahtarları yazar (undefined dönerse hiç yazılmaz)
export async function setStorage(env, data) {
    await env.swEval('chrome.storage.local.clear()');
    if (data && Object.keys(data).length) {
        await env.swEval(`chrome.storage.local.set(${JSON.stringify(data)})`);
    }
}

// Her çağrı benzersiz bir sorgu parametresiyle yeni bir form sekmesi açar.
// host: 'fillhub.test' verilirse form alan adı üzerinden açılır (site istisnası testleri için).
export async function openForm(env, { lang = 'tr', fixture = null, host = null } = {}) {
    env.runCounter += 1;
    const origin = host ? env.hostBase : env.base;
    const url = `${origin}?${fixture ? `page=${fixture}&` : ''}${lang === 'en' ? 'lang=en&' : ''}run=${env.runCounter}_${Date.now()}`;
    const page = await PageSession.open(env.cdp, url);
    await page.waitFor('document.readyState === "complete" && !!document.getElementById("kayit")', 10000);
    // activeTab: Chrome sekmenin URL'ini yalnız kullanıcı eyleminden sonra gösterir. Bu yüzden sekme,
    // etkinleştirilip bir eylem (kısayol) ile izin verildikten sonra aktif sekmeden bulunur.
    await env.cdp.send('Target.activateTarget', { targetId: page.targetId }).catch(() => {});
    await wait(300);
    await grantActiveTab(env, page);
    const tabId = await env.swEval(
        `chrome.tabs.query({active: true, currentWindow: true}).then(ts => ts.find(t => t.url === ${JSON.stringify(url)})?.id ?? null)`,
    );
    if (!tabId) throw new Error('form sekmesi bulunamadı');
    return { page, tabId, url };
}

// Manifest'teki kısayollar: Ctrl+Shift+F (doldur), Ctrl+Shift+Y (chaos), Ctrl+Shift+U (geri al).
// Tarayıcı düzeyindeki komutlar CDP tuş olayıyla tetiklenir; sayfa içeriği bu tuşları görmez.
const SHORTCUT_KEYS = { F: 70, Y: 89, U: 85 };

export async function pressShortcut(env, page, letter) {
    const vk = SHORTCUT_KEYS[letter];
    if (!vk) throw new Error(`bilinmeyen kısayol: ${letter}`);
    const mods = 10; // Ctrl (2) + Shift (8)
    const key = async (type) => env.cdp.send('Input.dispatchKeyEvent', {
        type, modifiers: mods, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, code: `Key${letter}`, key: letter,
    }, page.sid);
    await key('rawKeyDown');
    await key('keyUp');
}

// Kullanıcı jesti: Ctrl+Shift+U (geri al) kısayolu, activeTab iznini etkin sekmeye verir. Doldurma kısayolu da aynı izni verir.
export async function grantActiveTab(env, page) {
    await pressShortcut(env, page, 'U');
    await wait(600);
}

// Content script'e mesaj gönderir; içerik betiği hazır olana kadar yeniden dener
export async function send(env, tabId, message) {
    // Betikler artık isteğe bağlı enjekte edilir; mesajdan önce servis çalışanı enjeksiyonu sağlar
    await env.swEval(`ensureContentScripts(${tabId})`);
    let lastErr = null;
    for (let i = 0; i < 30; i++) {
        const result = await env.swEval(
            `chrome.tabs.sendMessage(${tabId}, ${JSON.stringify(message)}).then(r => ({ ok: true, r }), e => ({ ok: false, e: String(e) }))`,
        );
        if (result.ok && result.r) return result.r;
        lastErr = result.e;
        await wait(150);
    }
    throw new Error(`içerik betiği yanıt vermedi: ${lastErr}`);
}

// Formdaki alanların değerlerini okur (ana dünya; içerik betiği DOM'a yazar)
export async function readForm(page) {
    return page.eval(`JSON.stringify(Object.fromEntries([...document.querySelectorAll('#kayit input')]
        .map(i => [i.id, i.type === 'checkbox' ? i.checked : i.value])))`).then(JSON.parse);
}

// Sekmeyi kapatır; ortam kapatılırken zaten kapanmış olabilir
export async function closeForm(form) {
    await form.page.close();
}
