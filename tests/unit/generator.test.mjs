// Üreteç ve kişi modeli: 15 dil, çeşitlilik, PII Safe değerleri, e-posta kararlılığı, persona göçü, tarihler
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const G = require('../../extension/scripts/generator.js');
const R = require('../../extension/scripts/id-rules.js');

const LANGS = ['en-US', 'tr-TR', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'ru-RU', 'zh-CN', 'ja-JP', 'ar-EG', 'hi-IN', 'bn-BD', 'ur-PK', 'id-ID', 'vi-VN'];
const fold = (s) => String(s).toLowerCase().replace(/[ıđßøł]/g, (c) => ({ 'ı': 'i', 'đ': 'd', 'ß': 'ss', 'ø': 'o', 'ł': 'l' })[c]).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const digitsOnly = (s) => String(s).replace(/\D/g, '');

test('15 dilin her biri için ad ve soyad üretilir ve ad≠soyad', () => {
    assert.equal(G.getLocales().length, 15);
    for (const loc of LANGS) {
        for (let i = 0; i < 30; i++) {
            const p = G.createPerson(loc, {});
            assert.ok(p.first.n && p.first.l && p.last.n && p.last.l, `${loc}: boş ad`);
            assert.notEqual(fold(p.first.l), fold(p.last.l), `${loc}: ad=soyad`);
        }
    }
});

test('her dilde 60 kişide en az 20 farklı ad çıkar (havuz çeşitliliği)', () => {
    for (const loc of LANGS) {
        const names = new Set();
        for (let i = 0; i < 60; i++) names.add(G.createPerson(loc, {}).first.l);
        assert.ok(names.size >= 20, `${loc}: yalnız ${names.size} farklı ad`);
    }
});

test('e-posta kişiye bağlıdır: aynı kişi aynı e-postayı verir', () => {
    const p = G.createPerson('tr-TR', {});
    const a = G.generate('email', 'tr-TR', { person: p, piiSafe: false });
    const b = G.generate('email', 'tr-TR', { person: p, piiSafe: false });
    assert.equal(a, b);
    assert.ok(fold(a).startsWith(fold(p.first.l)), `e-posta adı izlemeli: ${a}`);
});

test('PII Safe e-posta yalnızca ayrılmış alan adlarını kullanır', () => {
    const allowed = /@(example\.com|example\.org|test\.example\.com)$/;
    for (let i = 0; i < 40; i++) {
        const p = G.createPerson('en-US', {});
        assert.match(G.generate('email', 'en-US', { person: p, piiSafe: true }), allowed);
    }
});

test('PII Safe TR telefon: operatör öneki + yedi sıfır (5320000000 biçimi)', () => {
    for (let i = 0; i < 40; i++) {
        const p = G.createPerson('tr-TR', {});
        assert.match(G.generate('phone', 'tr-TR', { person: p, piiSafe: true }), /^5\d{2}0{7}$/);
    }
});

test('PII Safe kapalı TR telefon: 10 haneli ulusal numara, sıfır dizisi yok', () => {
    let zeroTails = 0;
    for (let i = 0; i < 60; i++) {
        const p = G.createPerson('tr-TR', {});
        const t = digitsOnly(G.generate('phone', 'tr-TR', { person: p, piiSafe: false }));
        assert.match(t, /^5\d{9}$/, `TR telefon: ${t}`);
        if (/0{7}$/.test(t)) zeroTails++;
    }
    assert.ok(zeroTails < 3, `gerçekçi telefonlarda sıfır kuyruğu fazla: ${zeroTails}`);
});

test('PII Safe TCKN geçerli sentinel (11111111110 biçimi)', () => {
    for (let i = 0; i < 40; i++) {
        const p = G.createPerson('tr-TR', {});
        const v = G.generate('idNumber', 'tr-TR', { person: p, piiSafe: true });
        assert.match(v, /^(\d)\1{9}0$/, `TCKN sentinel: ${v}`);
        assert.equal(R.tckn.valid(v), true, `sağlama: ${v}`);
    }
});

test('kişi JSON\'a dönüştürülebilir (depolamada saklanabilir)', () => {
    const p = G.createPerson('ru-RU', {});
    assert.deepEqual(JSON.parse(JSON.stringify(p)), p);
});

test('Rusça soyadı cinsiyete göre çekimlenir', () => {
    let female = 0;
    for (let i = 0; i < 80 && female === 0; i++) {
        const p = G.createPerson('ru-RU', {});
        if (!p.male && /а$/.test(p.last.n)) female++;
    }
    assert.ok(female > 0, 'kadın kişide soyadı -а ile biter bekleniyor');
});

test('dil kodları yerel çözümlenir (canonicalLocale)', () => {
    assert.equal(G.canonicalLocale('ar'), 'ar-EG');
    assert.equal(G.canonicalLocale('es'), 'es-MX');
    assert.equal(G.canonicalLocale('pt'), 'pt-BR');
    assert.equal(G.canonicalLocale('vi'), 'vi-VN');
    assert.equal(G.canonicalLocale('es-AR'), 'es-AR');
    assert.equal(G.canonicalLocale('us'), 'en-US');
});

test('tarihler 2000 ile bu yıl arasında, ay 1-12, gün 1-28', () => {
    const maxYear = new Date().getFullYear();
    for (let i = 0; i < 80; i++) {
        const [y, m, d] = G.generate('date', 'en-US', {}).split('-').map(Number);
        assert.ok(y >= 2000 && y <= maxYear, `yıl ${y}`);
        assert.ok(m >= 1 && m <= 12, `ay ${m}`);
        assert.ok(d >= 1 && d <= 28, `gün ${d}`);
    }
});

test('tarihler ve doğum tarihi bugünü geçmez (bu yıl seçildiğinde de)', () => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const original = Math.random;
    // Her çekilişte en büyük değer: bu yıl, aralığın son ayı ve son günü
    Math.random = () => 0.999999;
    try {
        assert.ok(G.generate('date', 'en-US', {}) <= todayIso, 'tarih gelecekte olmamalı');
        assert.ok(G.generate('datetime', 'en-US', {}).slice(0, 10) <= todayIso, 'tarih-saat gelecekte olmamalı');
        assert.ok(G.createPerson('mx').birthDate <= todayIso, 'doğum tarihi gelecekte olmamalı');
    } finally {
        Math.random = original;
    }
});

test('HTML pattern kuralı önce karşılanır (\\d{11} → 11 rakam)', () => {
    const v = G.generate('text', 'tr-TR', { pattern: '\\d{11}' });
    assert.match(v, /^\d{11}$/);
});

test('persona göçü: eski "default" rastgele olur; eski dolu şablon sabit kimlik olur', () => {
    const { profiles, changed } = G.migrateProfiles([
        { id: 'default', name: 'Standard Persona', firstName: 'Murat', lastName: 'Murat.', email: 'murat.kara2@example.com', phone: '5320478545' },
        { id: 'x1', name: 'Benim', firstName: 'Ayşe', lastName: 'Demir' },
    ], 'tr-TR');
    assert.equal(changed, true);
    const def = profiles.find((p) => p.id === 'default');
    assert.equal(def.mode, 'random');
    assert.equal(def.identity, undefined);
    const x1 = profiles.find((p) => p.id === 'x1');
    assert.equal(x1.mode, 'fixed');
    assert.equal(x1.identity.first.n, 'Ayşe');
    assert.equal(x1.identity.last.n, 'Demir');
});

test('persona göçü: varsayılan şablon her zaman bulunur ve idempotenttir', () => {
    const once = G.migrateProfiles([], 'tr-TR');
    assert.ok(once.profiles.some((p) => p.id === 'default' && p.mode === 'random'));
    const twice = G.migrateProfiles(once.profiles, 'tr-TR');
    assert.equal(twice.changed, false);
    assert.deepEqual(twice.profiles, once.profiles);
});

test('activeIdentity: yalnız sabit modda kimlik döner', () => {
    const identity = G.createPerson('tr-TR', {});
    const fixed = { profiles: [{ id: 'p', mode: 'fixed', identity }], activeProfileId: 'p' };
    assert.equal(G.activeIdentity(fixed), identity);
    assert.equal(G.activeIdentity({ profiles: [{ id: 'd', mode: 'random' }], activeProfileId: 'd' }), null);
    assert.equal(G.activeIdentity({ profiles: [], activeProfileId: 'yok' }), null);
});

test('chaos modu metin döndürür ve çökmez', () => {
    for (let i = 0; i < 30; i++) {
        assert.equal(typeof G.generate('email', 'en-US', { chaosMode: true }), 'string');
    }
});
