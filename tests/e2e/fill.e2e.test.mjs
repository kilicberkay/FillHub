// Uçtan uca: gerçek Chromium'da uzantıyı yükler, form doldurur ve değerleri DOM'dan okur.
// Çalıştırma: node --test tests/e2e/   (Chromium yoksa atlanır; CHROME_BIN ile yol verilebilir)
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { PageSession, wait } from '../../tools/lib/browser.mjs';
import { chromeAvailable, startEnv, setStorage, openForm, send, readForm, closeForm, ROOT } from './harness.mjs';

const require = createRequire(import.meta.url);
const FakeDataGenerator = require(`${ROOT}/scripts/generator.js`);

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

                assert.ok(await page.eval('!!document.getElementById("personaModeRandom") && !!document.getElementById("personaModeFixed")'),
                    'kimlik modu seçicileri bulunmalı');
                assert.deepEqual(page.errors, [], `sayfa hatası olmamalı: ${page.errors.join(' | ')}`);
            } finally {
                await page.close();
            }
        });
    });
});
