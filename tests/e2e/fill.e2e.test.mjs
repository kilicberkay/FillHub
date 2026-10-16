// Uçtan uca: gerçek Chromium'da uzantıyı yükler, form doldurur ve değerleri DOM'dan okur.
// Çalıştırma: node --test tests/e2e/   (Chromium yoksa atlanır; CHROME_BIN ile yol verilebilir)
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { PageSession, wait } from '../../tools/lib/browser.mjs';
import { chromeAvailable, startEnv, setStorage, openForm, send, readForm, closeForm, EXT } from './harness.mjs';

const require = createRequire(import.meta.url);
const FakeDataGenerator = require(`${EXT}/scripts/generator.js`);

const SKIP = chromeAvailable() ? false : 'Chromium bulunamadı (CHROME_BIN ayarlayın)';
const PII_EMAIL = /@(example\.com|example\.org|test\.example\.com)$/;
const TR_PII_PHONE = /^5\d{2}0{7}$/;
const TR_REAL_PHONE = /^5\d{9}$/;
const TR_PII_TC = /^(\d)\1{9}0$/;

// Ad/e-posta karşılaştırması için: küçük harf, aksan kaldırma, yalnızca harf-rakam
const fold = (s) => String(s).toLowerCase().replace(/ı/g, 'i').normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const distinct = (list) => new Set(list).size;

describe('FillHub uçtan uca', { skip: SKIP, timeout: 300000 }, () => {
    let env;

    before(async () => {
        env = await startEnv();
    });

    after(async () => {
        if (env) await env.close();
    });

    // Her doldurma taze bir form sekmesinde yapılır; değerler sıfırdan okunur
    async function fillTimes(storage, n) {
        await setStorage(env, storage);
        const values = [];
        for (let i = 0; i < n; i++) {
            const form = await openForm(env);
            try {
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success', 'doldurma başarılı dönmeli');
                assert.ok(r.filled > 0, 'en az bir alan doldurulmalı');
                values.push(await readForm(form.page));
            } finally {
                await closeForm(form);
            }
        }
        return values;
    }

    describe('rastgelelik ve PII Safe (Madde 1)', () => {
        it('PII Safe açık: her doldurmada farklı kişi, güvenli değerler', async () => {
            const v = await fillTimes({ preferredLocale: 'tr-TR', piiSafe: true }, 8);
            assert.ok(distinct(v.map((x) => x.ad)) >= 4, `ad çeşitliliği: ${v.map((x) => x.ad)}`);
            assert.ok(distinct(v.map((x) => x.eposta)) >= 7, 'e-postalar birbirinden farklı olmalı');
            for (const x of v) {
                assert.notEqual(fold(x.ad), fold(x.soyad), 'ad ve soyad aynı olmamalı');
                assert.match(x.eposta, PII_EMAIL, `güvenli e-posta alan adı: ${x.eposta}`);
                assert.ok(fold(x.eposta).startsWith(fold(x.ad)), `e-posta ada bağlı olmalı: ${x.ad} / ${x.eposta}`);
                assert.equal(x.eposta2, x.eposta, 'e-posta tekrar alanı aynı değeri almalı');
                assert.match(x.tel, TR_PII_PHONE, `güvenli telefon: ${x.tel}`);
                assert.match(x.tc, TR_PII_TC, `güvenli TCKN: ${x.tc}`);
                assert.ok(x.sirket.startsWith('Test Şirketi '), `güvenli şirket: ${x.sirket}`);
                assert.equal(x.kvkk, true, 'zorunlu onay kutusu işaretlenmeli');
            }
        });

        it('PII Safe kapalı: gerçekçi telefon ve kimlik, yine rastgele', async () => {
            const v = await fillTimes({ preferredLocale: 'tr-TR', piiSafe: false }, 8);
            assert.ok(distinct(v.map((x) => x.ad)) >= 4, `ad çeşitliliği: ${v.map((x) => x.ad)}`);
            assert.equal(v.filter((x) => TR_REAL_PHONE.test(x.tel)).length, 8, `10 haneli TR telefonu: ${v.map((x) => x.tel)}`);
            assert.ok(v.filter((x) => !TR_PII_PHONE.test(x.tel)).length >= 7, 'gerçekçi telefonlar sıfır dizisi taşımamalı');
            assert.ok(v.filter((x) => !TR_PII_TC.test(x.tc)).length >= 7, 'gerçekçi TCKN sentinel olmamalı');
        });

        it('Taze kurulumda PII Safe varsayılan olarak açıktır', async () => {
            const v = await fillTimes({}, 1);
            assert.match(v[0].eposta, PII_EMAIL, `varsayılan güvenli e-posta: ${v[0].eposta}`);
        });

        it('Eski "Murat" şablonu tek değer dayatmaz (R1)', async () => {
            const legacy = {
                preferredLocale: 'tr-TR',
                piiSafe: false,
                activeProfileId: 'default',
                profiles: [{
                    id: 'default', name: 'Standard Persona', firstName: 'Murat', lastName: 'Murat.',
                    email: 'murat.kara2@example.com', phone: '5320478545',
                }],
            };
            const v = await fillTimes(legacy, 8);
            assert.ok(distinct(v.map((x) => x.ad)) >= 4, `eski şablon sabitlenmemeli: ${v.map((x) => x.ad)}`);
            assert.ok(v.every((x) => x.tel !== '5320478545'), 'eski sabit telefon tekrar etmemeli');
            assert.ok(v.every((x) => x.soyad !== 'Murat.'), 'eski sabit soyad tekrar etmemeli');
        });

        it('Eski dolu özel şablon içerik betiğinde sabit kimlik olarak taşınır (migrasyon)', async () => {
            const legacyCustom = {
                preferredLocale: 'tr-TR',
                piiSafe: false,
                activeProfileId: 'x1',
                profiles: [
                    { id: 'default', name: 'Standard Persona', firstName: 'Murat', lastName: 'Murat.' },
                    { id: 'x1', name: 'Benim', firstName: 'Ayşe', lastName: 'Demir' },
                ],
            };
            const v = await fillTimes(legacyCustom, 3);
            assert.ok(v.every((x) => x.ad === 'Ayşe'), `eski özel şablon sabit kalmalı: ${v.map((x) => x.ad)}`);
            assert.ok(v.every((x) => x.soyad === 'Demir'), 'eski özel şablonun soyadı sabit kalmalı');
        });

        it('Sabit kimlik modu aynı kişiyi verir; PII alanları yine güvenli kalır', async () => {
            const identity = FakeDataGenerator.createPerson('tr-TR', {});
            identity.first = { n: 'Ayşe', l: 'Ayse' };
            identity.last = { n: 'Demir', l: 'Demir' };
            identity.fullNative = 'Ayşe Demir';
            identity.fullLatin = 'Ayse Demir';
            identity.emailLocal = 'ayse.demir';
            const storage = {
                preferredLocale: 'tr-TR',
                piiSafe: true,
                activeProfileId: 'p1',
                profiles: [
                    { id: 'default', name: 'Standard Persona', mode: 'random' },
                    { id: 'p1', name: 'Sabit', mode: 'fixed', identity },
                ],
            };
            const v = await fillTimes(storage, 4);
            assert.ok(v.every((x) => ['Ayşe', 'Ayse'].includes(x.ad)), `sabit ad: ${v.map((x) => x.ad)}`);
            assert.ok(v.every((x) => x.soyad === 'Demir'), 'sabit soyad');
            assert.ok(v.every((x) => x.eposta.startsWith('ayse.demir@')), `sabit e-posta yerel kısmı: ${v.map((x) => x.eposta)}`);
            assert.ok(v.every((x) => TR_PII_PHONE.test(x.tel)), 'sabit kimlikte telefon yine güvenli');
        });

        it('fill_field her çağrıda yeni kişi üretir (R4)', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: false });
            const form = await openForm(env);
            try {
                const values = [];
                for (let i = 0; i < 3; i++) {
                    await form.page.eval('document.getElementById("ad").focus()');
                    const r = await send(env, form.tabId, { action: 'fill_field' });
                    assert.equal(r.status, 'success');
                    values.push(await form.page.eval('document.getElementById("ad").value'));
                }
                assert.ok(distinct(values) >= 2, `tek alan doldurma aynı kişiyi tekrarlamamalı: ${values}`);
            } finally {
                await closeForm(form);
            }
        });

        it('Geri al alanları doldurma öncesi haline döndürür', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env);
            try {
                await send(env, form.tabId, { action: 'fill' });
                const filled = await readForm(form.page);
                assert.ok(filled.ad && filled.eposta, 'doldurma yapılmış olmalı');
                const r = await send(env, form.tabId, { action: 'undo' });
                assert.equal(r.status, 'success');
                const after = await readForm(form.page);
                assert.equal(after.ad, '');
                assert.equal(after.eposta, '');
                assert.equal(after.kvkk, false, 'onay kutusu da geri alınmalı');
            } finally {
                await closeForm(form);
            }
        });
    });

    describe('onay kutuları ve yerel metin', () => {
        // Her doldurma taze bir onay formunda yapılır; değerler DOM'dan okunur
        async function fillConsentForm(n) {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const out = [];
            for (let i = 0; i < n; i++) {
                const form = await openForm(env, { fixture: 'consent' });
                try {
                    const r = await send(env, form.tabId, { action: 'fill' });
                    assert.equal(r.status, 'success');
                    out.push(await form.page.eval(`JSON.stringify({
                        kvkk: document.getElementById('kvkk').checked,
                        sartlar: document.getElementById('sartlar').checked,
                        bulten: document.getElementById('bulten').checked,
                        aciklama: document.getElementById('aciklama').value,
                        faaliyet: document.getElementById('faaliyet').value,
                        bitis: document.getElementById('bitis').value,
                    })`).then(JSON.parse));
                } finally {
                    await closeForm(form);
                }
            }
            return out;
        }

        it('gizlilik ve şart kutuları her doldurmada işaretli, bülten kutusu hiç işaretlenmez', async () => {
            const v = await fillConsentForm(6);
            assert.ok(v.every((x) => x.kvkk === true), `KVKK kutusu: ${v.map((x) => x.kvkk)}`);
            assert.ok(v.every((x) => x.sartlar === true), 'şart kutusu işaretli olmalı');
            assert.ok(v.every((x) => x.bulten === false), 'bülten kutusu işaretlenmemeli');
        });

        it('metin alanları yerel dilde ve Lorem içermeden dolar; maxlength aşılmaz', async () => {
            const v = await fillConsentForm(4);
            for (const x of v) {
                assert.ok(x.aciklama.length > 0, 'açıklama dolmalı');
                assert.ok(!/lorem/i.test(x.aciklama + x.faaliyet), `Lorem kalmamalı: ${x.aciklama}`);
                assert.ok(x.faaliyet.length > 0 && x.faaliyet.length <= 30, `maxlength 30: ${x.faaliyet.length}`);
            }
        });

        it('devre dışı tarih alanına dokunulmaz', async () => {
            const v = await fillConsentForm(3);
            assert.ok(v.every((x) => x.bitis === ''), `devre dışı alan dolmamalı: ${v.map((x) => x.bitis)}`);
        });
    });

    describe('otomatik gönder ve özel kurallar', () => {
        // Gönderimi sayar ve engeller; fixture formunun action="#" olduğu için sayfa yeniden yüklenmez
        async function countSubmits(page) {
            await page.eval(`(() => {
                window.__submits = 0;
                document.getElementById('kayit').addEventListener('submit', (e) => { e.preventDefault(); window.__submits++; });
            })()`);
        }

        const storedRules = async () => JSON.parse(await env.swEval(
            `chrome.storage.local.get('customRules').then((r) => JSON.stringify(r.customRules || []))`,
        ));

        const storedSites = async () => JSON.parse(await env.swEval(
            `chrome.storage.local.get('noAutoSubmitSites').then((r) => JSON.stringify(r))`,
        ));

        it('captcha bulunduğunda sayfa kaydırılmaz ve odak captcha’ya geçmez', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env);
            try {
                // Captcha sayfanın altında: eskiden burada sayfa captcha'ya kaydırılıyordu
                await form.page.eval(`(() => {
                    const d = document.createElement('div');
                    d.id = 'uzak-captcha';
                    d.className = 'g-recaptcha';
                    d.style.cssText = 'width:304px;height:78px;background:#eee;position:relative;top:3000px';
                    document.body.appendChild(d);
                    window.scrollTo(0, 0);
                })()`);
                const before = await form.page.eval('window.scrollY');
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                await wait(900);
                assert.equal(await form.page.eval('window.scrollY'), before, 'sayfa captcha’ya kaydırılmamalı');
                assert.notEqual(await form.page.eval('document.activeElement?.id'), 'uzak-captcha', 'captcha odaklanmamalı');
            } finally {
                await closeForm(form);
            }
        });

        it('captcha ile ilgili gönder benzeri düğme otomatik tıklanmaz', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, autoSubmit: true });
            const form = await openForm(env);
            try {
                // Tek gönder düğmesi bir captcha düğmesi: otomatik gönderim onu da tıklamamalı
                await form.page.eval(`(() => {
                    document.querySelectorAll('#kayit button').forEach((b) => b.remove());
                    const b = document.createElement('button');
                    b.textContent = 'Ben robot değilim';
                    window.__captchaClicks = 0;
                    b.addEventListener('click', (e) => { e.preventDefault(); window.__captchaClicks++; });
                    document.getElementById('kayit').appendChild(b);
                })()`);
                await send(env, form.tabId, { action: 'fill' });
                await wait(900);
                assert.equal(await form.page.eval('window.__captchaClicks'), 0, 'captcha düğmesi tıklanmamalı');
            } finally {
                await closeForm(form);
            }
        });

        it('alan doldurulunca gönder düğmesine bir kez tıklanır', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, autoSubmit: true });
            const form = await openForm(env);
            try {
                await countSubmits(form.page);
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                await wait(900);
                assert.equal(await form.page.eval('window.__submits'), 1, 'gönder bir kez tetiklenmeli');
            } finally {
                await closeForm(form);
            }
        });

        it('görünür captcha varken form gönderilmez', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, autoSubmit: true });
            const form = await openForm(env);
            try {
                await countSubmits(form.page);
                await form.page.eval(`(() => {
                    const d = document.createElement('div');
                    d.className = 'g-recaptcha';
                    d.style.cssText = 'width:304px;height:78px;background:#eee';
                    document.body.appendChild(d);
                })()`);
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                await wait(900);
                assert.equal(await form.page.eval('window.__submits'), 0, 'captcha varken gönderilmemeli');
            } finally {
                await closeForm(form);
            }
        });

        it('hiç alan doldurulmadıysa gönder düğmesine tıklanmaz', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, autoSubmit: true });
            const form = await openForm(env);
            try {
                await countSubmits(form.page);
                // Doldurulacak alan kalmaz; sayfada yalnızca gönder düğmesi görünür
                await form.page.eval(`document.querySelectorAll('input, textarea, select').forEach((e) => e.remove())`);
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                assert.equal(r.filled, 0, 'doldurulacak alan olmamalı');
                await wait(900);
                assert.equal(await form.page.eval('window.__submits'), 0, 'doldurulmayan çerçevede gönderilmemeli');
            } finally {
                await closeForm(form);
            }
        });

        it('site istisnasındaki sayfada gönder yapılmaz, diğer sayfalarda yapılır', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, autoSubmit: true, noAutoSubmitSites: ['example.com'] });
            const excluded = await openForm(env);
            try {
                await countSubmits(excluded.page);
                // Sayfa alan adı arka plandan gelir; alt alan adı da istisnanın kapsamındadır
                const r = await send(env, excluded.tabId, { action: 'fill', pageHost: 'pay.example.com' });
                assert.equal(r.status, 'success');
                await wait(900);
                assert.equal(await excluded.page.eval('window.__submits'), 0, 'istisna listesindeki sitede gönderilmemeli');
            } finally {
                await closeForm(excluded);
            }

            const open = await openForm(env);
            try {
                await countSubmits(open.page);
                await send(env, open.tabId, { action: 'fill', pageHost: 'other.org' });
                await wait(900);
                assert.equal(await open.page.eval('window.__submits'), 1, 'listede olmayan sitede gönderilmeli');
            } finally {
                await closeForm(open);
            }
        });

        it('ayar sayfasında alan adı eklenir, geçersiz giriş reddedilir', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("siteAddBtn")', 10000);
                await wait(300);
                const add = (text) => page.eval(`(() => {
                    const input = document.getElementById('siteInput');
                    input.value = ${JSON.stringify(text)};
                    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                })()`);

                await add('bu olmaz');
                assert.equal(await page.eval(`!document.getElementById('siteError').hidden`), true, 'geçersiz alan adı için hata gösterilmeli');
                await wait(200);
                assert.deepEqual((await storedSites()).noAutoSubmitSites ?? [], [], 'geçersiz alan adı kaydedilmemeli');

                await add('https://www.Bank.com/giris');
                await wait(200);
                assert.deepEqual((await storedSites()).noAutoSubmitSites, ['bank.com'], 'URL alan adına çevrilip kaydedilmeli');
                assert.equal(await page.eval(`document.getElementById('siteList').textContent.includes('bank.com')`), true, 'liste güncellenmeli');
            } finally {
                await page.close();
            }
        });

        // Satırdaki düğmeyi metnine göre bulur (↑, ↓ ya da düzenleme metni)
        const rowButton = (page, rowIndex, text) => page.eval(`(() => {
            const row = document.querySelectorAll('#rulesList > div')[${rowIndex}];
            const btn = [...row.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)});
            btn.click();
        })()`);

        it('kurallar yukarı ve aşağı taşınır, sıra kaydedilir', async () => {
            await setStorage(env, {
                preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true,
                customRules: [{ selector: '#ad', type: 'firstName' }, { selector: '#eposta', type: 'email' }],
            });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('document.querySelectorAll("#rulesList > div").length === 2', 10000);
                await rowButton(page, 1, '↑');
                await wait(300);
                assert.deepEqual((await storedRules()).map((r) => r.selector), ['#eposta', '#ad'], 'ikinci kural yukarı taşınmalı');
            } finally {
                await page.close();
            }
        });

        it('kural düzenlenir, güncellenir ve iptal edilebilir', async () => {
            await setStorage(env, {
                preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true,
                customRules: [{ selector: '#ad', type: 'firstName' }],
            });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('document.querySelectorAll("#rulesList > div").length === 1', 10000);
                await rowButton(page, 0, 'Edit');
                assert.equal(await page.eval(`document.getElementById('ruleSelector').value`), '#ad', 'düzenleme seçiciyi forma yüklemeli');
                await page.eval(`document.getElementById('ruleSelector').value = '#soyad'`);
                await page.eval(`document.getElementById('addRuleBtn').click()`);
                await wait(300);
                assert.deepEqual((await storedRules()).map((r) => r.selector), ['#soyad'], 'kural güncellenmeli, çoğaltılmamalı');
                assert.equal(await page.eval(`document.getElementById('ruleCancelBtn').hidden`), true, 'güncellemeden sonra düzenleme modu kapanmalı');

                await rowButton(page, 0, 'Edit');
                await page.eval(`document.getElementById('ruleSelector').value = '#eposta'`);
                await page.eval(`document.getElementById('ruleCancelBtn').click()`);
                assert.equal(await page.eval(`document.getElementById('ruleSelector').value`), '', 'iptal girişi temizlemeli');
                await wait(200);
                assert.deepEqual((await storedRules()).map((r) => r.selector), ['#soyad'], 'iptal kaydı değiştirmemeli');
            } finally {
                await page.close();
            }
        });

        it('seçici bu sayfada kaç alanla eşleştiğini gösterir', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const form = await openForm(env);
            await send(env, form.tabId, { action: 'fill' });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("ruleTestBtn")', 10000);
                await page.eval(`document.getElementById('ruleSelector').value = '#ad'`);
                await page.eval(`document.getElementById('ruleTestBtn').click()`);
                await page.waitFor(`!document.getElementById('ruleTestResult').hidden`, 10000);
                const shown = await page.eval(`document.getElementById('ruleTestResult').textContent`);
                assert.match(shown, /:\s*1$/, `tek bir alan eşleşmeli: "${shown}"`);
                // Sayfa içeriği okunmaz: sonuç yalnızca eşleşme sayısını taşır, alan değerini değil
                const values = await readForm(form.page);
                if (typeof values.ad === 'string' && values.ad.length > 0) assert.equal(shown.includes(values.ad), false, 'alan değeri gösterilmemeli');
            } finally {
                await page.close();
                await closeForm(form);
            }
        });

        it('geçersiz CSS seçici reddedilir, geçerli olan kaydedilir', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("addRuleBtn")', 10000);
                await wait(300);
                const addRule = (selector) => page.eval(`(() => {
                    document.getElementById('ruleSelector').value = ${JSON.stringify(selector)};
                    document.getElementById('addRuleBtn').click();
                })()`);

                await addRule('div[');
                assert.equal(await page.eval(`!document.getElementById('ruleSelectorError').hidden`), true, 'geçersiz seçici için hata gösterilmeli');
                await wait(200);
                assert.deepEqual(await storedRules(), [], 'geçersiz seçici kaydedilmemeli');

                await addRule('#ad');
                assert.equal(await page.eval(`document.getElementById('ruleSelectorError').hidden`), true, 'geçerli seçicide hata gizlenmeli');
                await wait(200);
                assert.deepEqual((await storedRules()).map((r) => r.selector), ['#ad'], 'geçerli seçici kaydedilmeli');
            } finally {
                await page.close();
            }
        });
    });

    describe('çok dilli formlar', () => {
        const CJK = /[぀-ヿ一-鿿]/;
        const ARABIC = /[؀-ۿ]/;

        // Yerel yazılı etiketler; gerçek veri havuzu için piiSafe kapalı
        async function fillFixture(fixture, locale) {
            await setStorage(env, { preferredLocale: locale, piiSafe: false });
            const form = await openForm(env, { fixture });
            try {
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                assert.ok(r.filled >= 3, `en az üç alan doldurulmalı (${r.filled})`);
                return await readForm(form.page);
            } finally {
                await closeForm(form);
            }
        }

        it('Japonca etiketli form: ad ve soyad Japonca yazılır, e-posta ve telefon biçimi doğrudur', async () => {
            const v = await fillFixture('ja', 'ja-JP');
            assert.match(v.ad, CJK, `ad Japonca olmalı: "${v.ad}"`);
            assert.match(v.soyad, CJK, `soyad Japonca olmalı: "${v.soyad}"`);
            assert.match(v.eposta, /^[^\s@]+@[^\s@]+\.[a-z]+$/i, `e-posta biçimi: "${v.eposta}"`);
            assert.match(v.tel, /\d{6,}/, `telefon rakam içermeli: "${v.tel}"`);
            assert.ok(v.sehir.length > 0 && v.adres.length > 0, 'adres alanları dolu olmalı');
        });

        it('Çince etiketli form: ad ve soyad Çince yazılır, telefon rakamlardan oluşur', async () => {
            const v = await fillFixture('zh', 'zh-CN');
            assert.match(v.ad, CJK, `ad Çince olmalı: "${v.ad}"`);
            assert.match(v.soyad, CJK, `soyad Çince olmalı: "${v.soyad}"`);
            assert.match(v.eposta, /@/, `e-posta içermeli: "${v.eposta}"`);
            assert.match(v.tel, /^\d{8,}$/, `telefon rakamlardan oluşmalı: "${v.tel}"`);
        });

        it('Arapça etiketli form (RTL): ad Arapça yazılır, e-posta yerel kısmı Latin harfle', async () => {
            const v = await fillFixture('ar', 'ar-EG');
            assert.match(v.ad, ARABIC, `ad Arapça olmalı: "${v.ad}"`);
            assert.match(v.eposta, /^[a-z0-9._-]+@/i, `e-posta yerel kısmı Latin olmalı: "${v.eposta}"`);
        });
    });

    describe('zengin metin alanları (contenteditable)', () => {
        const editorText = (page) => page.eval(`document.getElementById('aciklama').textContent`);

        it('düzenlenebilir alan doldurulur, salt okunur alana dokunulmaz, geri alma eski metni döndürür', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env, { fixture: 'rich' });
            try {
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                const filled = await editorText(form.page);
                assert.notEqual(filled, 'Eski metin', 'düzenlenebilir alan doldurulmalı');
                assert.ok(filled.trim().length > 3, `anlamlı metin beklenir: "${filled}"`);
                assert.equal(await form.page.eval(`document.getElementById('salt').textContent`), 'Dokunma', 'salt okunur alan değişmemeli');

                const u = await send(env, form.tabId, { action: 'undo' });
                assert.equal(u.status, 'success');
                assert.equal(await editorText(form.page), 'Eski metin', 'geri alma eski metni döndürmeli');
            } finally {
                await closeForm(form);
            }
        });

        it('tek alan doldurma (fill_field) odaklanan düzenlenebilir alanda çalışır', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env, { fixture: 'rich' });
            try {
                await form.page.eval(`document.getElementById('aciklama').focus()`);
                const r = await send(env, form.tabId, { action: 'fill_field' });
                assert.equal(r.status, 'success');
                assert.notEqual(await editorText(form.page), 'Eski metin', 'odaklanan alan doldurulmalı');
            } finally {
                await closeForm(form);
            }
        });
    });

    describe('tarih seçici', () => {
        const DATE_RE = /^\d{2}\.\d{2}\.\d{4}$/;
        const thisYear = new Date().getFullYear();
        const yearOf = (v) => +v.slice(6);

        it('yazılabilir tarih alanı takvimden seçilerek doldurulur', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env, { fixture: 'picker' });
            try {
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                const v = await form.page.eval(`({ dogum: document.getElementById('dogum').value, secim: window.__pickerSelections })`);
                assert.match(v.dogum, DATE_RE, `gg.aa.yyyy biçiminde olmalı: "${v.dogum}"`);
                assert.ok(yearOf(v.dogum) >= 2000 && yearOf(v.dogum) <= thisYear, `yıl 2000 ile bu yıl arasında: ${v.dogum}`);
                assert.ok(v.secim >= 1, 'takvim seçimi kullanılmalı');
            } finally {
                await closeForm(form);
            }
        });

        it('salt okunur tarih alanı yalnızca takvimle doldurulur (birkaç doldurmada)', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            for (let i = 0; i < 3; i++) {
                const form = await openForm(env, { fixture: 'picker' });
                try {
                    await send(env, form.tabId, { action: 'fill' });
                    const vade = await form.page.eval(`document.getElementById('vade').value`);
                    assert.match(vade, DATE_RE, `salt okunur alan takvimle dolmalı: "${vade}"`);
                    assert.ok(yearOf(vade) >= 2000 && yearOf(vade) <= thisYear, `yıl aralığı: ${vade}`);
                } finally {
                    await closeForm(form);
                }
            }
        });

        it('takvim yoksa yazılabilir alan doğrudan yazılır, takvim seçimi yapılmaz', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env, { fixture: 'picker' });
            try {
                await form.page.eval(`document.getElementById('takvim').remove()`);
                await send(env, form.tabId, { action: 'fill' });
                await wait(300);
                const v = await form.page.eval(`({ dogum: document.getElementById('dogum').value, secim: window.__pickerSelections })`);
                assert.match(v.dogum, DATE_RE, `doğrudan yazım yedeği çalışmalı: "${v.dogum}"`);
                assert.equal(v.secim, 0, 'takvim olmadığında seçim yapılmamalı');
            } finally {
                await closeForm(form);
            }
        });

        it('takvim yoksa salt okunur tarih alanı atlanır', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env, { fixture: 'picker' });
            try {
                await form.page.eval(`document.getElementById('takvim').remove()`);
                await send(env, form.tabId, { action: 'fill' });
                await wait(300);
                assert.equal(await form.page.eval(`document.getElementById('vade').value`), '', 'salt okunur alan doğrudan yazılmamalı');
            } finally {
                await closeForm(form);
            }
        });
    });

    describe('bildirim', () => {
        it('bildirimdeki Geri al düğmesi doldurmayı geri alır, odak almaz', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env);
            try {
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                const buttons = await form.page.eval(`document.querySelectorAll('#fake-filler-toast [data-role="action"]').length`);
                assert.equal(buttons, 1, 'bildirimde Geri al düğmesi olmalı');
                assert.equal(await form.page.eval(`!!document.activeElement?.closest('#fake-filler-toast')`), false, 'bildirim odak almamalı');

                await form.page.eval(`document.querySelector('#fake-filler-toast [data-role="action"]').click()`);
                await wait(300);
                const restored = await readForm(form.page);
                assert.ok(Object.values(restored).every((v) => v === '' || v === false), 'alanlar önceki haline dönmeli');
                assert.equal(await form.page.eval(`document.querySelectorAll('#fake-filler-toast [data-role="action"]').length`), 0, 'geri alındıktan sonra düğme kalkmalı');
            } finally {
                await closeForm(form);
            }
        });

        it('otomatik gönderim istenen doldurmada Geri al düğmesi sunulmaz', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, autoSubmit: true });
            const form = await openForm(env);
            try {
                // Gönderim sayfayı yeniden yüklememeli; olayı engellemek yeterli
                await form.page.eval(`document.getElementById('kayit').addEventListener('submit', (e) => e.preventDefault())`);
                await send(env, form.tabId, { action: 'fill' });
                await wait(900);
                const buttons = await form.page.eval(`document.querySelectorAll('#fake-filler-toast [data-role="action"]').length`);
                assert.equal(buttons, 0, 'gönderilmiş bir formu geri almak sunulmamalı');
            } finally {
                await closeForm(form);
            }
        });
    });

    describe('tanılama', () => {
        it('son doldurma özeti sayı ve tür içerir, alan değeri içermez', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env);
            try {
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                const values = await readForm(form.page);
                // Depolama yazımı yanıttan sonra tamamlanır; okumadan önce kısa bir bekleme
                await wait(300);
                const report = JSON.parse(await env.swEval(
                    `chrome.storage.local.get('lastFillReport').then((r) => JSON.stringify(r.lastFillReport))`,
                ));
                assert.equal(report.filled, r.filled);
                assert.ok(Object.values(report.detected).some((n) => n > 0), 'tespit edilen alan türleri sayılmalı');
                assert.equal(report.submitRequested, false, 'otomatik gönder kapalıyken istenmemeli');
                const text = JSON.stringify(report);
                for (const v of [values.ad, values.soyad, values.eposta, values.tel]) {
                    if (typeof v === 'string' && v.length > 2) assert.equal(text.includes(v), false, `rapor alan değeri içermemeli: ${v}`);
                }
            } finally {
                await closeForm(form);
            }
        });

        it('ayar sayfası kısayol kartında varsayılan tuşları ve değiştirme yolunu gösterir', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("shortcutFill")', 10000);
                const keys = await page.eval(`[...document.querySelectorAll('dl kbd')].map((k) => k.textContent)`);
                assert.deepEqual(keys, ['Ctrl+Shift+F', 'Ctrl+Shift+D', 'Ctrl+Shift+U'], 'kısayol tuşları manifest ile eşleşmeli');
                const desc = await page.eval(`document.getElementById('shortcutDesc').innerText`);
                assert.match(desc, /chrome:\/\/extensions\/shortcuts/, 'değiştirme yolu açıklamada olmalı');
            } finally {
                await page.close();
            }
        });

        it('ayar sayfasındaki tanılama düğmesi raporu indirir ve durum gösterir', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("diagBtn")', 10000);
                await wait(300);
                await page.eval(`document.getElementById('diagBtn').click()`);
                await page.waitFor(`!document.getElementById('diagStatus').hidden`, 10000);
                assert.ok((await page.eval(`document.getElementById('diagStatus').textContent`)).trim().length > 0, 'durum metni boş olmamalı');
            } finally {
                await page.close();
            }
        });
    });

    describe('performans', () => {
        it('500 alanlı formu bütçe içinde doldurur', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env);
            try {
                // Büyük formu simüle eder: 500 etiketli metin alanı form içine eklenir
                await form.page.eval(`(() => {
                    const kayit = document.getElementById('kayit');
                    for (let i = 0; i < 500; i++) {
                        const label = document.createElement('label');
                        label.htmlFor = 'ek' + i;
                        label.textContent = 'Ek alan ' + i;
                        const input = document.createElement('input');
                        input.id = 'ek' + i;
                        input.name = 'ek' + i;
                        input.type = 'text';
                        kayit.append(label, input);
                    }
                })()`);
                const started = Date.now();
                const r = await send(env, form.tabId, { action: 'fill' });
                const ms = Date.now() - started;
                assert.equal(r.status, 'success');
                assert.ok(r.filled >= 500, `500 eklenen alan doldurulmalı: ${r.filled}`);
                // Bütçe geniş tutulur: yalnızca belirgin bir yavaşlama (ör. alan başına gecikme) yakalanır
                assert.ok(ms < 20000, `doldurma bütçeyi aştı: ${ms} ms`);
            } finally {
                await closeForm(form);
            }
        });
    });

    describe('profil sabit değerleri', () => {
        it('aktif profilin sabit ad, soyad, e-posta ve telefonu her doldurmada kullanılır', async () => {
            await setStorage(env, {
                preferredLocale: 'tr-TR', piiSafe: true, activeProfileId: 'qa',
                profiles: [
                    { id: 'default', name: 'Standard Persona', mode: 'random' },
                    { id: 'qa', name: 'QA hesabı', mode: 'random', values: { firstName: 'Ayşe', lastName: 'Demir', email: 'qa@test.example.com', phone: '5551112233' } },
                ],
            });
            const form = await openForm(env);
            try {
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                const v = await readForm(form.page);
                assert.equal(v.ad, 'Ayşe');
                assert.equal(v.soyad, 'Demir');
                assert.equal(v.eposta, 'qa@test.example.com', 'e-posta sabit olmalı');
                assert.equal(v.eposta2, 'qa@test.example.com', 'onay alanı aynı e-postayı almalı');
                assert.equal(v.tel, '5551112233', 'telefon sabit olmalı');
            } finally {
                await closeForm(form);
            }
        });

        it('diyalogda girilen sabit değerler profile kaydedilir ve kartta görünür', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, uiLang: 'tr', onboardingComplete: true });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("newProfileBtn")', 10000);
                await page.eval(`document.getElementById('nav-profiles').click()`);
                await wait(300);
                await page.eval(`document.getElementById('newProfileBtn').click()`);
                await wait(300);
                await page.eval(`(() => {
                    document.getElementById('profileName').value = 'Test kullanıcı';
                    document.getElementById('profileValueEmailInput').value = 'kullanici@test.example.com';
                    document.getElementById('profileValuePasswordInput').value = 'Gizli123!';
                    document.getElementById('profileForm').requestSubmit();
                })()`);
                await wait(500);
                const all = JSON.parse(await env.swEval(`chrome.storage.local.get('profiles').then((r) => JSON.stringify(r))`));
                const saved = all.profiles.find((p) => p.name === 'Test kullanıcı');
                assert.ok(saved, 'profil kaydedilmeli');
                assert.deepEqual(saved.values, { email: 'kullanici@test.example.com', password: 'Gizli123!' }, 'boş alanlar kaydedilmez');
                const cards = await page.eval(`document.getElementById('profilesList').textContent`);
                assert.match(cards, /Sabit:.*E-posta/, 'kartta sabit alanların adları görünmeli');
            } finally {
                await page.close();
            }
        });
    });

    describe('açılır pencere', () => {
        const openPopup = async () => {
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/popup/popup.html`);
            await page.waitFor('document.getElementById("popupCountry").options.length > 0', 10000);
            await wait(200);
            return page;
        };

        it('ülke ve profil seçimi ayarlara kalıcı olarak yazılır', async () => {
            await setStorage(env, {
                preferredLocale: 'tr-TR', piiSafe: true, activeProfileId: 'default',
                profiles: [{ id: 'default', name: 'Standard Persona', mode: 'random' }, { id: 'p2', name: 'İkinci', mode: 'random' }],
            });
            const page = await openPopup();
            try {
                await page.eval(`(() => { const s = document.getElementById('popupCountry'); s.value = 'en-US'; s.dispatchEvent(new Event('change')); })()`);
                await page.eval(`(() => { const s = document.getElementById('popupProfile'); s.value = 'p2'; s.dispatchEvent(new Event('change')); })()`);
                await wait(300);
                const all = JSON.parse(await env.swEval(`chrome.storage.local.get(null).then((r) => JSON.stringify(r))`));
                assert.equal(all.preferredLocale, 'en-US');
                assert.equal(all.activeProfileId, 'p2');
            } finally {
                await page.close();
            }
        });

        it('iframe içindeki alanlar da doldurulur ve sonuç tüm çerçevelerin toplamıdır', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const form = await openForm(env, { fixture: 'frames' });
            const popup = await openPopup();
            try {
                await env.swEval(`chrome.tabs.update(${form.tabId}, { active: true })`);
                await popup.eval(`document.getElementById('popupFillBtn').click()`);
                await popup.waitFor(`!document.getElementById('popupResult').hidden`, 10000);
                const shown = await popup.eval(`document.getElementById('popupResult').textContent`);
                const count = Number((shown.match(/(\d+)\s*$/) || [])[1]);
                const filledIn = (doc) => `[...${doc}.querySelectorAll('#kayit input')].filter((i) => (i.type === 'checkbox' ? i.checked : i.value)).length`;
                const topFilled = await form.page.eval(filledIn('document'));
                const frameFilled = await form.page.eval(`(() => { const d = document.getElementById('cerceve').contentDocument; return ${filledIn('d')}; })()`);
                assert.ok(frameFilled > 0, 'iframe içindeki alanlar dolmalı');
                assert.ok(count >= topFilled + frameFilled, `sonuç tüm çerçevelerin toplamı olmalı (üst ${topFilled}, iframe ${frameFilled}): "${shown}"`);
            } finally {
                await popup.close();
                await closeForm(form);
            }
        });

        it('doldurma ve geri alma etkin sekmede çalışır ve sonucu gösterir', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const form = await openForm(env);
            // Açılır pencere yeni sekme olarak açılır ve etkinleşir; etkin sekme form olacak şekilde geri alınır
            const popup = await openPopup();
            try {
                await env.swEval(`chrome.tabs.update(${form.tabId}, { active: true })`);
                await popup.eval(`document.getElementById('popupFillBtn').click()`);
                await popup.waitFor(`!document.getElementById('popupResult').hidden`, 10000);
                // "0" de bir sayıdır; sonucun gerçekten doldurulmuş alan sayısı olduğunu pozitiflikle denetle
                const shownFill = await popup.eval(`document.getElementById('popupResult').textContent`);
                assert.ok(Number((shownFill.match(/(\d+)\s*$/) || [])[1]) > 0, `doldurulan alan sayısı pozitif olmalı: "${shownFill}"`);
                const filled = await readForm(form.page);
                assert.ok(Object.values(filled).some((v) => v === true || (typeof v === 'string' && v.length > 0)), 'form doldurulmalı');

                await popup.eval(`document.getElementById('popupUndoBtn').click()`);
                await wait(800);
                const restored = await readForm(form.page);
                assert.ok(Object.values(restored).every((v) => v === '' || v === false), 'geri alma alanları önceki haline döndürmeli');
            } finally {
                await popup.close();
                await closeForm(form);
            }
        });

        it('doldurulamayan sayfada açılır pencere bildirim gösterir', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const popup = await openPopup();
            try {
                await popup.eval(`document.getElementById('popupFillBtn').click()`);
                await popup.waitFor(`!document.getElementById('popupResult').hidden`, 10000);
                assert.match(await popup.eval(`document.getElementById('popupResult').textContent`), /not available/i);
            } finally {
                await popup.close();
            }
        });
    });

    describe('yedekleme', () => {
        const openOptions = async () => {
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            await page.waitFor('!!document.getElementById("importFile")', 10000);
            await wait(300);
            return page;
        };

        // Dosya seçici yerine girişe dosya bırakır ve değişiklik olayını tetikler; onay penceresi otomatik kabul edilir
        const uploadFile = (page, text) => page.eval(`(() => {
            window.confirm = () => true;
            const dt = new DataTransfer();
            dt.items.add(new File([${JSON.stringify(text)}], 'yedek.json', { type: 'application/json' }));
            const input = document.getElementById('importFile');
            input.files = dt.files;
            input.dispatchEvent(new Event('change'));
        })()`);

        const stored = async (key) => JSON.parse(await env.swEval(
            `chrome.storage.local.get(${JSON.stringify(key)}).then((r) => JSON.stringify(r))`,
        ));

        it('geçerli yedek içe aktarılır: ayarlar ve kurallar yazılır', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await openOptions();
            try {
                const backup = {
                    format: 'fillhub-backup', version: 1, exportedAt: '2026-10-16T00:00:00.000Z',
                    data: { theme: 'light', preferredLocale: 'en-US', autoSubmit: true, customRules: [{ selector: '#ad', type: 'firstName' }] },
                };
                await uploadFile(page, JSON.stringify(backup));
                await wait(1500);
                const r = await env.swEval(`chrome.storage.local.get(null).then((r) => JSON.stringify(r))`);
                const all = JSON.parse(r);
                assert.equal(all.preferredLocale, 'en-US');
                assert.equal(all.autoSubmit, true);
                assert.deepEqual(all.customRules, [{ selector: '#ad', type: 'firstName' }]);
            } finally {
                await page.close();
            }
        });

        it('bozuk dosya reddedilir ve mevcut ayarlar değişmez', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await openOptions();
            try {
                await uploadFile(page, JSON.stringify({ format: 'baska', version: 1, data: {} }));
                await wait(300);
                assert.equal(await page.eval(`!document.getElementById('backupStatus').hidden`), true, 'hata durumu gösterilmeli');
                assert.equal((await stored('preferredLocale')).preferredLocale, 'tr-TR', 'ayar değişmemeli');
            } finally {
                await page.close();
            }
        });
    });

    describe('captcha ve profil yönetimi', () => {
        it('görünür captcha bildirilir ve vurgulanır, otomatik tıklanmaz', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true });
            const form = await openForm(env);
            try {
                await form.page.eval(`(() => {
                    const d = document.createElement('div');
                    d.id = 'captcha-test';
                    d.className = 'g-recaptcha';
                    d.setAttribute('data-sitekey', 'test-anahtar');
                    d.style.cssText = 'width:304px;height:78px;background:#eee';
                    window.__clicks = 0;
                    d.addEventListener('click', () => window.__clicks++);
                    document.body.appendChild(d);
                })()`);
                const r = await send(env, form.tabId, { action: 'fill' });
                assert.equal(r.status, 'success');
                const toast = await form.page.eval(`document.getElementById('fake-filler-toast')?.textContent || ''`);
                assert.ok(/captcha/i.test(toast), `captcha bildirimi gösterilmeli: "${toast}"`);
                const outline = await form.page.eval(`document.getElementById('captcha-test').style.outline`);
                assert.ok(outline.length > 0, 'captcha vurgulanmalı');
                assert.equal(await form.page.eval('window.__clicks'), 0, 'captcha otomatik tıklanmamalı');
            } finally {
                await closeForm(form);
            }
        });

        it('yeni sabit profil diyalogla oluşur, kaydedilince aktif olur', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("newProfileBtn")', 10000);
                await wait(300);
                await page.eval('document.getElementById("newProfileBtn").click()');
                await page.waitFor('!document.getElementById("profileDialog").hidden', 5000);
                await page.eval(`(() => {
                    document.getElementById('profileName').value = 'Test Müşteri';
                    document.getElementById('profileModeFixed').click();
                })()`);
                await page.eval('document.getElementById("profileSaveBtn").click()');
                await page.waitFor('document.getElementById("profileDialog").hidden', 5000);

                const stored = await env.swEval("chrome.storage.local.get(['profiles', 'activeProfileId']).then(r => JSON.stringify(r))")
                    .then(JSON.parse);
                const created = (stored.profiles || []).find((p) => p.name === 'Test Müşteri');
                assert.ok(created, 'profil kaydedilmeli');
                assert.equal(created.mode, 'fixed');
                assert.ok(created.identity && created.identity.first && created.identity.emailDomain, 'sabit kimlik kaydedilmeli');
                assert.equal(stored.activeProfileId, created.id, 'yeni profil aktif olmalı');
                assert.deepEqual(page.errors, [], `sayfa hatası: ${page.errors.join(' | ')}`);
            } finally {
                await page.close();
            }
        });

        it('vazgeçilen yeni profil kaydedilmez', async () => {
            await setStorage(env, { preferredLocale: 'tr-TR', piiSafe: true, onboardingComplete: true });
            const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
            try {
                await page.waitFor('!!document.getElementById("newProfileBtn")', 10000);
                await wait(300);
                await page.eval('document.getElementById("newProfileBtn").click()');
                await page.waitFor('!document.getElementById("profileDialog").hidden', 5000);
                await page.eval(`(() => { document.getElementById('profileName').value = 'Vazgeçilen'; })()`);
                await page.eval('document.getElementById("profileCancelBtn").click()');
                await page.waitFor('document.getElementById("profileDialog").hidden', 5000);
                const stored = await env.swEval("chrome.storage.local.get(['profiles']).then(r => JSON.stringify(r))").then(JSON.parse);
                const extra = (stored.profiles || []).filter((p) => p.name === 'Vazgeçilen');
                assert.equal(extra.length, 0, 'vazgeçilen profil oluşmamalı');
            } finally {
                await page.close();
            }
        });
    });

    describe('ayarlar sayfası', () => {
        it('destek bölümü ve GitHub Sponsors bağlantısı çalışır', async () => {
            const url = `chrome-extension://${env.extId}/options/options.html`;
            const page = await PageSession.open(env.cdp, url);
            try {
                await page.waitFor('!!document.getElementById("nav-support")', 10000);
                await wait(300);
                const links = await page.eval(`JSON.stringify([...document.querySelectorAll('a[href="https://github.com/sponsors/kilicberkay"]')]
                    .map(a => ({ target: a.target, rel: a.rel })))`).then(JSON.parse);
                assert.ok(links.length >= 2, `sponsor bağlantısı en az iki yerde olmalı: ${links.length}`);
                assert.ok(links.every((l) => l.target === '_blank' && l.rel.includes('noopener')), 'harici bağlantı güvenli açılmalı');

                await page.eval('document.getElementById("nav-support").click()');
                await page.waitFor('document.getElementById("support").classList.contains("active")', 5000);

                assert.ok(await page.eval('!!document.getElementById("profileModeRandom") && !!document.getElementById("profileModeFixed")'),
                    'profil kipi seçicileri bulunmalı');
                assert.deepEqual(page.errors, [], `sayfa hatası olmamalı: ${page.errors.join(' | ')}`);
            } finally {
                await page.close();
            }
        });
    });
});
