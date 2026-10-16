// Yedekleme: dışa aktarılan dosya geri okunabilir; bozuk ya da kötü niyetli içe aktarmalar reddedilir
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXT = join(ROOT, 'extension');
const require = createRequire(import.meta.url);
const FillHubBackup = require(join(EXT, 'scripts', 'backup.js'));
const FakeDataGenerator = require(join(EXT, 'scripts', 'generator.js'));
const FillHubSiteRules = require(join(EXT, 'scripts', 'site-rules.js'));

// Tarayıcıdaki document.createDocumentFragment().querySelector sınamasının Node'daki karşılığı: yalnız bilinen biçimler
const simpleSelector = (s) => /^[#.]?[\w-]+$/.test(s);
const KNOWN_TYPES = FakeDataGenerator.getDataTypes();

function sampleState() {
    return {
        theme: 'light',
        preferredLocale: 'tr-TR',
        uiLang: 'tr',
        smartEmail: true,
        matchPasswords: false,
        checkAllBoxes: false,
        consentBoxes: true,
        piiSafe: true,
        autoSubmit: true,
        onboardingComplete: true,
        activeProfileId: 'p1',
        profiles: [
            { id: 'default', name: 'Standard Persona', mode: 'random' },
            { id: 'p1', name: 'Test kişi', mode: 'fixed', identity: FakeDataGenerator.createIdentity('tr-TR') },
        ],
        customRules: [{ selector: '#ad', type: 'firstName' }],
        noAutoSubmitSites: ['bank.com'],
        // Dışa aktarılmayan, ayar sayfasının iç durumu
        secret: 'x',
    };
}

const wrap = (data) => ({ format: FillHubBackup.FORMAT, version: FillHubBackup.VERSION, exportedAt: '2026-10-16T00:00:00.000Z', data });

test('dışa aktarma: biçim, sürüm ve yalnız ayar alanları', () => {
    const state = sampleState();
    const b = FillHubBackup.createBackup(state, new Date('2026-10-16T12:00:00Z'));
    assert.equal(b.format, 'fillhub-backup');
    assert.equal(b.version, 1);
    assert.equal(b.exportedAt, '2026-10-16T12:00:00.000Z');
    assert.equal(b.data.secret, undefined, 'iç durum dışa aktarılmamalı');
    assert.equal(b.data.theme, 'light');
    assert.deepEqual(b.data.customRules, [{ selector: '#ad', type: 'firstName' }]);
    assert.deepEqual(b.data.profiles[1].identity, state.profiles[1].identity, 'sabit profilin kimliği korunmalı');
});

test('dışa aktarılan dosya kendi doğrulamasından geçer ve değerleri korur', () => {
    const state = sampleState();
    const b = JSON.parse(JSON.stringify(FillHubBackup.createBackup(state)));
    const r = FillHubBackup.validateBackup(b, { isValidSelector: simpleSelector, knownTypes: KNOWN_TYPES, isValidHost: FillHubSiteRules.isValidHost });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.data.preferredLocale, 'tr-TR');
    assert.deepEqual(r.data.noAutoSubmitSites, ['bank.com'], 'site istisnaları geri gelmeli');
    assert.equal(r.data.autoSubmit, true);
    assert.deepEqual(r.data.profiles[1].identity, state.profiles[1].identity, 'kimlik kaydı değişmeden geri gelmeli');
});

test('biçim: yanlış format, sürüm ya da yapı reddedilir', () => {
    const v = (x) => FillHubBackup.validateBackup(x, { isValidSelector: simpleSelector });
    assert.deepEqual(v(null), { ok: false, reason: 'format' });
    assert.deepEqual(v([]), { ok: false, reason: 'format' });
    assert.equal(v({ ...wrap({}), format: 'baska' }).reason, 'format');
    assert.equal(v({ ...wrap({}), version: 2 }).reason, 'format');
    assert.equal(v({ format: 'fillhub-backup', version: 1, data: [] }).reason, 'format');
});

test('alanlar: geçersiz değerler alan adıyla reddedilir', () => {
    const v = (data) => FillHubBackup.validateBackup(wrap(data), { isValidSelector: simpleSelector, knownTypes: KNOWN_TYPES });
    assert.deepEqual(v({ theme: 'mavi' }), { ok: false, reason: 'field', field: 'theme' });
    assert.deepEqual(v({ preferredLocale: 'tr' }), { ok: false, reason: 'field', field: 'preferredLocale' });
    assert.deepEqual(v({ uiLang: 'TR-tr' }), { ok: false, reason: 'field', field: 'uiLang' });
    assert.deepEqual(v({ autoSubmit: 'evet' }), { ok: false, reason: 'field', field: 'autoSubmit' });
    assert.deepEqual(v({ activeProfileId: '' }), { ok: false, reason: 'field', field: 'activeProfileId' });
});

test('profiller: boş liste, geçersiz mod, yinelenen kimlik ve kimliksiz sabit profil reddedilir', () => {
    const v = (profiles) => FillHubBackup.validateBackup(wrap({ profiles }), { isValidSelector: simpleSelector });
    assert.equal(v([]).field, 'profiles');
    assert.equal(v([{ id: 'a', name: 'A', mode: 'gizli' }]).field, 'profiles');
    assert.equal(v([{ id: 'a', name: 'A', mode: 'random' }, { id: 'a', name: 'B', mode: 'random' }]).field, 'profiles');
    assert.equal(v([{ id: 'a', name: 'A', mode: 'fixed' }]).field, 'profiles');
    assert.equal(v([{ id: 'a', name: '   ', mode: 'random' }]).field, 'profiles');
    assert.equal(v(Array.from({ length: 51 }, (_, i) => ({ id: `p${i}`, name: 'P', mode: 'random' }))).field, 'profiles');
});

test('güvenlik: kimlik kaydındaki __proto__ anahtarı ve aşırı derinlik reddedilir', () => {
    const v = (identity) => FillHubBackup.validateBackup(wrap({ profiles: [{ id: 'a', name: 'A', mode: 'fixed', identity }] }), { isValidSelector: simpleSelector });
    const proto = JSON.parse('{"first":{"n":"A"},"__proto__":{"polluted":true}}');
    assert.equal(v(proto).field, 'profiles');
    assert.equal(({}).polluted, undefined, 'prototip kirlenmemeli');
    let deep = { v: 'x' };
    for (let i = 0; i < 10; i++) deep = { child: deep };
    assert.equal(v(deep).field, 'profiles');
});

test('kimlik kaydı: gerçek üretilen kimlik kabul edilir (iç içe nesne ve diziler)', () => {
    const identity = FakeDataGenerator.createIdentity('tr-TR');
    const r = FillHubBackup.validateBackup(wrap({ profiles: [{ id: 'a', name: 'A', mode: 'fixed', identity }] }), { isValidSelector: simpleSelector });
    assert.equal(r.ok, true, JSON.stringify(r));
});

test('özel kurallar: geçersiz seçici, bilinmeyen tür ve fazla kural reddedilir', () => {
    const v = (customRules) => FillHubBackup.validateBackup(wrap({ customRules }), { isValidSelector: simpleSelector, knownTypes: KNOWN_TYPES });
    assert.equal(v([{ selector: 'div[', type: 'firstName' }]).field, 'customRules');
    assert.equal(v([{ selector: '#ad', type: 'bilinmeyen' }]).field, 'customRules');
    assert.equal(v([{ selector: '', type: 'firstName' }]).field, 'customRules');
    assert.equal(v(Array.from({ length: 201 }, () => ({ selector: '#a', type: 'firstName' }))).field, 'customRules');
    const ok = v([{ selector: ' #ad ', type: 'firstName', extra: 'yok sayılır' }]);
    assert.equal(ok.ok, true);
    assert.deepEqual(ok.data.customRules, [{ selector: '#ad', type: 'firstName' }], 'seçici kırpılır, bilinmeyen alanlar düşer');
});

test('eksik alanlar: yalnız dosyada bulunan alanlar döner (mevcut değerler korunur)', () => {
    const r = FillHubBackup.validateBackup(wrap({ theme: 'dark' }), { isValidSelector: simpleSelector });
    assert.deepEqual(r.data, { theme: 'dark' });
});

test('boyut sınırı sabiti tanımlı ve makul', () => {
    assert.equal(FillHubBackup.MAX_BYTES, 1000000);
});

test('site istisnaları: geçersiz, büyük harfli ya da fazla alan adı reddedilir', () => {
    const v = (sites) => FillHubBackup.validateBackup(wrap({ noAutoSubmitSites: sites }), { isValidHost: FillHubSiteRules.isValidHost });
    assert.equal(v(['Bank.com']).field, 'noAutoSubmitSites', 'büyük harf kanonik değildir');
    assert.equal(v(['bu olmaz']).field, 'noAutoSubmitSites');
    assert.equal(v([42]).field, 'noAutoSubmitSites');
    assert.equal(v(Array.from({ length: 201 }, (_, i) => `s${i}.com`)).field, 'noAutoSubmitSites');
    assert.deepEqual(v(['bank.com', 'bank.com']).data.noAutoSubmitSites, ['bank.com'], 'yinelenenler tekilleştirilir');
    assert.deepEqual(v([]).data.noAutoSubmitSites, []);
});

test('site istisnaları: doğrulayıcı verilmezse hiçbir alan adı kabul edilmez', () => {
    const r = FillHubBackup.validateBackup(wrap({ noAutoSubmitSites: ['bank.com'] }), { isValidSelector: simpleSelector });
    assert.equal(r.field, 'noAutoSubmitSites');
});
