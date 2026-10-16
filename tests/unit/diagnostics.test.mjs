// Tanılama raporu: kişisel veri (profil adı, kural, site adresi, alan değeri) içermez; yalnızca sayılar ve bayraklar
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXT = join(ROOT, 'extension');
const require = createRequire(import.meta.url);
const FillHubDiagnostics = require(join(EXT, 'scripts', 'diagnostics.js'));

const SECRET_STATE = {
    preferredLocale: 'tr-TR',
    uiLang: 'tr',
    piiSafe: false,
    autoSubmit: true,
    profiles: [{ id: 'p1', name: 'GİZLİ-PROFİL-ADI', mode: 'fixed', identity: { first: { n: 'GİZLİ-AD' } } }],
    customRules: [{ selector: '#gizli-secici', type: 'firstName' }],
    noAutoSubmitSites: ['gizli-banka.example'],
};

test('rapor kişisel veri içermez: profil adı, kural, site adresi ve kimlik değerleri yok', () => {
    const r = FillHubDiagnostics.createReport({
        state: SECRET_STATE, lastFillReport: null, extensionVersion: '1.2.1', userAgent: 'UA', now: new Date('2026-10-16T00:00:00Z'),
    });
    const text = JSON.stringify(r);
    for (const secret of ['GİZLİ-PROFİL-ADI', 'GİZLİ-AD', '#gizli-secici', 'gizli-banka.example']) {
        assert.equal(text.includes(secret), false, `rapor "${secret}" içermemeli`);
    }
    assert.equal(r.format, 'fillhub-diagnostics');
    assert.equal(r.version, 1);
    assert.equal(r.generatedAt, '2026-10-16T00:00:00.000Z');
    assert.equal(r.extensionVersion, '1.2.1');
});

test('ayarlar: bayraklar ve sayılar doğru, adlar yok', () => {
    const s = FillHubDiagnostics.createReport({ state: SECRET_STATE }).settings;
    assert.equal(s.preferredLocale, 'tr-TR');
    assert.equal(s.piiSafe, false);
    assert.equal(s.autoSubmit, true);
    assert.equal(s.profileCount, 1);
    assert.equal(s.ruleCount, 1);
    assert.equal(s.excludedSiteCount, 1);
    assert.equal(s.onboardingComplete, false);
});

test('son doldurma: yalnızca beyan edilen alanlar, geçersiz değerler sıfıra iner', () => {
    const r = FillHubDiagnostics.createReport({
        state: {},
        lastFillReport: {
            at: '2026-10-16T10:00:00.000Z',
            filled: 12,
            detected: { firstName: 2, email: 1, '../bozuk': 9, phone: -4, city: 'x' },
            captchaVisible: true,
            siteExcluded: false,
            submitRequested: false,
            durationMs: 340,
            value: 'gizli-alan-degeri',
        },
    });
    assert.equal(r.lastFill.filled, 12);
    assert.deepEqual(r.lastFill.detected, { firstName: 2, email: 1, phone: 0, city: 0 }, 'geçersiz anahtar düşer, değer sayıya indirilir');
    assert.equal(r.lastFill.captchaVisible, true);
    assert.equal(r.lastFill.durationMs, 340);
    assert.equal(JSON.stringify(r).includes('gizli-alan-degeri'), false, 'beyan edilmeyen alanlar kopyalanmaz');
});

test('son doldurma yoksa null; eksik ayarlar güvenli varsayılana döner', () => {
    const r = FillHubDiagnostics.createReport({ state: {}, lastFillReport: undefined });
    assert.equal(r.lastFill, null);
    assert.equal(r.settings.profileCount, 0);
    assert.equal(r.settings.preferredLocale, null);
    assert.equal(r.settings.autoSubmit, false);
});
