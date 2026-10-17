// Uçtan uca testler için ortam: yerel form sunucusu, uzantılı Chromium ve servis çalışanı üzerinden komut.
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchWithExtension, Cdp, PageSession, wait, findChrome } from '../../tools/lib/browser.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Paketlenmemiş bir uzantının kimliği, klasörün mutlak yolunun SHA-256 özetinden üretilir (Chromium'un yöntemi)
export function unpackedExtensionId(dir) {
    const hex = createHash('sha256').update(resolve(dir)).digest('hex').slice(0, 32);
    return [...hex].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

// Servis çalışanı bazı ortamlarda olay gelene kadar başlamaz. Uzantı sayfasından bir mesaj göndermek onu uyandırır;
// arka plan betiği bilinmeyen mesaj türlerini yok sayar (onMessage false döner), bu yüzden yan etkisi yoktur.
async function wakeServiceWorker(cdp, extId) {
    const { targetId } = await cdp.send('Target.createTarget', { url: `chrome-extension://${extId}/options/options.html` });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await wait(1000);
    await cdp.send('Runtime.evaluate', {
        expression: "chrome.runtime.sendMessage({ type: 'harness-wake' }).catch(() => {}); 'sent'",
        returnByValue: true,
    }, sessionId);
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
    'no-fields': readFileSync(join(ROOT, 'tests', 'e2e', 'fixtures', 'no-fields.html')),
};
// ?page=<anahtar> ile seçilen sayfalar; diğer istekler dile göre TR ya da EN formunu alır
const NAMED_PAGES = ['consent', 'rich', 'ja', 'zh', 'ar', 'picker', 'frames', 'no-fields'];

export const chromeAvailable = () => Boolean(findChrome());

// Uzantı, form sunucusu ve kontrol bağlantısını açar
export async function startEnv() {
    const srv = createServer((req, res) => {
        // ?lang=en → İngilizce etiketli form; varsayılan Türkçe
        // ?page=consent → onay kutuları ve metin alanları formu; ?lang=en → İngilizce etiketli form
        const named = NAMED_PAGES.find((p) => req.url.includes(`page=${p}`));
        const key = named ?? (req.url.includes('lang=en') ? 'en' : 'tr');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(FIXTURES[key]);
    });
    await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${srv.address().port}/form.html`;

    // FILLHUB_EXT_DIR: açılmış paket kopyası (ör. dist/fillhub-*.zip çıktısı) de sınanabilir
    const browser = await launchWithExtension(process.env.FILLHUB_EXT_DIR || EXT, {});
    const cdp = await new Cdp(browser.browserWs).connect();

    // Yalnızca bu uzantının servis çalışanı (Chrome'un kendi bileşenleri hariç). Hedef adresi Chromium
    // sürümüne göre değişebildiği için (ör. CI'da "service_worker_…" biçimi) dosya adına değil, uzantının
    // manifest adına bakılır. Yavaş makinelerde (CI) ayağa kalkması 30 saniyeye kadar sürebilir.
    let sw = null;
    let sessionId = null;
    let seen = [];
    let wakeError = null;
    let woke = false;
    const expectedId = unpackedExtensionId(process.env.FILLHUB_EXT_DIR || EXT);
    for (let i = 0; i < 300 && !sw; i++) {
        const { targetInfos } = await cdp.send('Target.getTargets');
        seen = targetInfos.map((t) => `${t.type} ${t.url.slice(0, 60)}`);
        if (!woke && i === 30) {
            woke = true;
            await wakeServiceWorker(cdp, expectedId).catch((e) => { wakeError = e.message; });
            continue;
        }
        for (const t of targetInfos.filter((x) => x.type === 'service_worker' && x.url.startsWith('chrome-extension://'))) {
            const attached = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
            const name = await cdp.send('Runtime.evaluate', {
                expression: "(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().name : ''",
                returnByValue: true,
            }, attached.sessionId).then((r) => r.result.value).catch(() => '');
            if (name === 'FillHub') {
                sw = t;
                sessionId = attached.sessionId;
                break;
            }
            await cdp.send('Target.detachFromTarget', { sessionId: attached.sessionId }).catch(() => {});
        }
        if (!sw) await wait(100);
    }
    if (!sw) {
        // Tarayıcı açık kalırsa test süreci hiç bitmez; hatayı tanılama bilgisiyle birlikte hemen fırlat
        const stderr = browser.stderrTail();
        cdp.close();
        srv.close();
        await browser.close();
        throw new Error(`FillHub servis çalışanı bulunamadı (kimlik ${expectedId}, uyandırma: ${wakeError ?? 'gönderildi'}). Görülen hedefler: [${seen.join(' | ')}]. Chromium stderr: ${stderr}`);
    }
    const extId = sw.url.split('/')[2];

    const env = {
        base, extId, browser, cdp, srv, runCounter: 0,
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

// Her çağrı benzersiz bir sorgu parametresiyle yeni bir form sekmesi açar
export async function openForm(env, { lang = 'tr', fixture = null } = {}) {
    env.runCounter += 1;
    const url = `${env.base}?${fixture ? `page=${fixture}&` : ''}${lang === 'en' ? 'lang=en&' : ''}run=${env.runCounter}_${Date.now()}`;
    const page = await PageSession.open(env.cdp, url);
    await page.waitFor('document.readyState === "complete" && !!document.getElementById("kayit")', 10000);
    await wait(300);
    const tabId = await env.swEval(
        `chrome.tabs.query({}).then(ts => ts.find(t => t.url === ${JSON.stringify(url)})?.id ?? null)`,
    );
    if (!tabId) throw new Error('form sekmesi bulunamadı');
    return { page, tabId, url };
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
