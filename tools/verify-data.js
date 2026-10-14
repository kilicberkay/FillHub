// Veri ve kimlik kurallarının bağımsız denetimi (bağımlılıksız Node).
// Kullanım: node tools/verify-data.js
// 1) Bilinen geçerli/geçersiz vektörler (kimlik, IBAN)
// 2) Harita bütünlüğü (dil ↔ ülke ↔ profil)
// 3) Ülke başına örnek kişiler: IBAN, kimlik sağlaması, posta/telefon biçimi, şehir–bölge tutarlılığı
// 4) Arayüz çevirisi: her dilde İngilizce ile aynı anahtar kümesi
// Hata varsa çıkış kodu 1 döner.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const RULES = require(path.join(root, 'scripts/id-rules.js'));
const DATA = require(path.join(root, 'scripts/locale-data.js'));
const G = require(path.join(root, 'scripts/generator.js'));

let failures = 0;
let passes = 0;
const fail = (msg) => { failures++; console.log('  FAIL ' + msg); };
const pass = () => { passes++; };
const expect = (cond, msg) => (cond ? pass() : fail(msg));

// ---------- 1) Bilinen vektörler ----------
console.log('1) Bilinen vektörler');
const vectors = [
    ['TCKN geçerli', RULES.tckn.valid('10000000146'), true],
    ['TCKN geçersiz', RULES.tckn.valid('10000000147'), false],
    ['CPF geçerli', RULES.cpf.valid('52998224725'), true],
    ['CPF geçersiz', RULES.cpf.valid('52998224726'), false],
    ['CNPJ geçerli', RULES.cnpj.valid('11222333000181'), true],
    ['CN kimlik geçerli', RULES.cnId.valid('11010519491231002X'), true],
    ['SNILS geçerli', RULES.snils.valid('11223344595'), true],
    ['INN-10 geçerli (Sberbank)', RULES.inn.valid('7707083893'), true],
    ['My Number geçerli', RULES.myNumber.valid('123456789018'), true],
    ['My Number geçersiz', RULES.myNumber.valid('123456789019'), false],
    ['CURP geçerli (1)', RULES.curp.valid('BOXW310820HNERXN09'), true],
    ['CURP geçerli (2)', RULES.curp.valid('XEXX010101HNEXXXA4'), true],
    ['CURP geçersiz', RULES.curp.valid('BOXW310820HNERXN08'), false],
    ['IBAN DE geçerli', RULES.iban.valid('DE89370400440532013000'), true],
    ['IBAN GB geçerli', RULES.iban.valid('GB82WEST12345698765432'), true],
    ['IBAN bozuk', RULES.iban.valid('DE89370400440532013001'), false],
    ['Verhoeff 236 → 3', RULES.verhoeffCheckDigit('236') === 3, true]
];
for (const [name, got, want] of vectors) expect(got === want, `${name}: beklenen ${want}, alınan ${got}`);

// ---------- 2) Harita bütünlüğü ----------
console.log('2) Harita bütünlüğü');
for (const [code, lang] of Object.entries(DATA.countries).map(([c, p]) => [c, p.lang])) {
    expect(!!DATA.languages[lang], `profil ${code}: dil ${lang} yok`);
}
for (const [code, lang] of Object.entries(DATA.languages)) {
    expect(!!DATA.countries[lang.defaultCountry], `dil ${code}: varsayılan ülke ${lang.defaultCountry} profilde yok`);
    expect(!!(lang.firstNames || lang.firstNamesM), `dil ${code}: ad havuzu yok`);
    expect(!!lang.lastNames, `dil ${code}: soyad havuzu yok`);
    const latin = lang.firstNamesLatin || lang.firstNamesMLatin || lang.firstNames;
    expect(!lang.firstNames || (latin && latin.length === lang.firstNames.length), `dil ${code}: Latin karşılık sayısı ad sayısıyla eşleşmiyor`);
}
for (const [code, p] of Object.entries(DATA.countries)) {
    expect(p.cities.length >= 8, `ülke ${code}: en az 8 şehir bekleniyor (${p.cities.length})`);
    expect(p.phone && p.phone.cc && p.phone.length > 0, `ülke ${code}: telefon belirtimi eksik`);
    expect(p.postal && p.postal.length > 0, `ülke ${code}: posta belirtimi eksik`);
}

// ---------- 3) Ülke başına örnekler ----------
console.log('3) Ülke başına örnek kişiler (300 kişi/ülke)');
const ZIP = {
    US: /^\d{5}$/, CN: /^\d{6}$/, IN: /^\d{6}$/, MX: /^\d{5}$/, EG: /^\d{5}$/, FR: /^\d{5}$/, BD: /^\d{4}$/,
    BR: /^\d{5}-\d{3}$/, RU: /^\d{6}$/, PK: /^\d{5}$/, ID: /^\d{5}$/, DE: /^\d{5}$/, JP: /^\d{3}-\d{4}$/, TR: /^\d{5}$/, VN: /^\d{6}$/
};
const IBAN_LEN = { DE: 22, FR: 27, TR: 26, EG: 29, PK: 24, BR: 29 };
// Sağlaması doğrulanmış kimlik türleri (ülke → kişisel kimlik doğrulayıcısı)
const CHECKED_ID = {
    US: null, CN: RULES.cnId, IN: RULES.aadhaar, MX: RULES.curp, FR: RULES.nir, RU: RULES.snils,
    TR: RULES.tckn, JP: RULES.myNumber, BR: RULES.cpf
};
for (const cc of Object.keys(DATA.countries)) {
    const lang = DATA.countries[cc].lang;
    let bad = 0;
    for (let i = 0; i < 300; i++) {
        const p = G.createPerson(`${lang}-${cc}`, {});
        const where = `${cc}#${i}`;
        if (p.country !== cc) { bad++; fail(`${where}: ülke ${p.country}`); }
        if (!p.first.l || !p.last.l || !/^[\x00-\x7FÀ-ɏḀ-ỿ'’ .-]+$/.test(p.first.l + p.last.l)) { bad++; fail(`${where}: Latin ad/soyad hatalı (${p.first.l} ${p.last.l})`); }
        if (!/^\d+$/.test(p.phoneNsn) || p.phoneNsn.length !== DATA.countries[cc].phone.length) { bad++; fail(`${where}: telefon uzunluğu ${p.phoneNsn}`); }
        if (ZIP[cc] && !ZIP[cc].test(p.zip)) { bad++; fail(`${where}: posta ${p.zip}`); }
        if (!p.city.region) { bad++; fail(`${where}: şehir bölgesi yok`); }
        if (IBAN_LEN[cc]) {
            if (!p.ids.iban || p.ids.iban.length !== IBAN_LEN[cc] || !RULES.iban.valid(p.ids.iban)) { bad++; fail(`${where}: IBAN ${p.ids.iban}`); }
        } else if (p.ids.iban) { bad++; fail(`${where}: beklenmeyen IBAN`); }
        const checker = CHECKED_ID[cc];
        if (checker && !checker.valid(p.ids.person)) { bad++; fail(`${where}: kimlik sağlaması ${p.ids.person}`); }
        if (cc === 'BR' && !RULES.cnpj.valid(p.ids.tax)) { bad++; fail(`${where}: CNPJ ${p.ids.tax}`); }
        if (cc === 'RU' && !RULES.inn.valid(p.ids.tax.slice(0, 10)) && !RULES.inn12.valid(p.ids.tax)) { bad++; fail(`${where}: INN ${p.ids.tax}`); }
        if (cc === 'TR' && !/^\d{10}$/.test(p.ids.tax)) { bad++; fail(`${where}: VKN biçimi ${p.ids.tax}`); }
    }
    expect(bad === 0, `ülke ${cc}: ${bad} hatalı örnek`);
    if (bad === 0) pass();
}

// ---------- 4) Arayüz çevirileri ----------
console.log('4) Arayüz çevirileri (options/i18n.js)');
// Çeviriler modülü doğrudan yüklenir: metin ayrıştırma yerine gerçek nesne karşılaştırılır.
const I18N = require(path.join(root, 'options/i18n.js'));
const LANGS = ['en', 'tr', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi', 'bn', 'ur', 'id', 'vi'];
const enKeys = Object.keys(I18N.en || {});
expect(enKeys.length >= 60, `i18n en: en az 60 anahtar bekleniyor, bulunan ${enKeys.length}`);
expect(Object.keys(I18N).sort().join() === [...LANGS].sort().join(), 'i18n: dil listesi 15 dil olmalı');
for (const lang of LANGS) {
    const keys = Object.keys(I18N[lang] || {});
    const missing = enKeys.filter(k => !keys.includes(k));
    const extra = keys.filter(k => !enKeys.includes(k));
    expect(missing.length === 0, `i18n ${lang}: eksik anahtarlar ${missing.join(', ')}`);
    expect(extra.length === 0, `i18n ${lang}: fazla anahtarlar ${extra.join(', ')}`);
    const empty = keys.filter(k => typeof I18N[lang][k] !== 'string' || !I18N[lang][k].trim());
    expect(empty.length === 0, `i18n ${lang}: boş değerler ${empty.join(', ')}`);
}

console.log(`\nSonuç: ${passes} geçti, ${failures} başarısız`);
process.exit(failures ? 1 : 0);
