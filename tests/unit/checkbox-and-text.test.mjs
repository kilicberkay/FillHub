// Onay kutusu sınıfları (gizlilik/şart, pazarlama, diğer), URL havuzu ve yerel örnek metinler
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const D = require('../../extension/scripts/field-detect.js');
const G = require('../../extension/scripts/generator.js');
const L = require('../../extension/scripts/locale-data.js');

const CONSENT = [
    'KVKK metnini okudum', 'Kişisel verilerimin işlenmesine açık rıza veriyorum', 'Kullanım koşullarını kabul ediyorum',
    'Gizlilik politikasını okudum ve onaylıyorum', 'I agree to the terms of service', 'I accept the privacy policy',
    'I have read and accept the Terms and Conditions', 'I consent to the processing of my personal data',
    'Ich akzeptiere die Datenschutzerklärung', 'Acepto los términos y condiciones', "J'accepte les conditions générales",
    'Eu aceito os termos de uso', 'Я согласен с условиями использования', '我已阅读并同意隐私政策', '利用規約に同意します',
    'أوافق على الشروط والأحكام', 'मैं शर्तों से सहमत हूँ', 'আমি শর্তাবলীতে সম্মত', 'Saya setuju dengan syarat dan ketentuan',
    'Tôi đồng ý với điều khoản sử dụng', 'Beyan ederim ki verdiğim bilgiler doğrudur', 'Aydınlatma metnini okudum',
];
const MARKETING = [
    'E-bülten almak istiyorum', 'Kampanya ve duyurulardan haberdar olmak istiyorum', 'I want to receive our newsletter',
    'Send me marketing emails', 'Yes, send me promotional offers', 'Ich möchte den Newsletter erhalten',
    'Quiero recibir el boletín', "Je souhaite recevoir la lettre d'information", 'Quero receber newsletter',
    '我想接收营销邮件', 'ニュースレターを受け取る', 'Saya ingin menerima promosi',
];
const OTHER = ['Ben robot değilim', "I'm not a robot", 'Remember me', 'Keep me signed in', 'Show password', 'Beni hatırla', 'Select all'];

test('onay kutusu: gizlilik ve şart metinleri consent sınıfına girer (15 dilden)', () => {
    for (const t of CONSENT) assert.equal(D.classifyCheckbox([t]), 'consent', t);
});

test('onay kutusu: bülten ve kampanya metinleri marketing sınıfına girer', () => {
    for (const t of MARKETING) assert.equal(D.classifyCheckbox([t]), 'marketing', t);
});

test('onay kutusu: pazarlama, gizlilikle birlikte geçse bile önceliklidir', () => {
    assert.equal(D.classifyCheckbox(['I accept the privacy policy and receive our newsletter']), 'marketing');
});

test('onay kutusu: ilgisiz metinler other döner', () => {
    for (const t of OTHER) assert.equal(D.classifyCheckbox([t]), 'other', t);
    assert.equal(D.classifyCheckbox([]), 'other');
});

test('onay kutusu: ASCII anahtarlar kelime başında eşleşir ("disagree" consent değildir)', () => {
    assert.equal(D.classifyCheckbox(['Yes, send me promotional offers']), 'marketing');
    assert.notEqual(D.classifyCheckbox(['Notify me about updates']), 'consent');
});

test('URL üretimi yalnızca ayrılmış test alan adlarını kullanır (her dilde)', () => {
    const re = /^https:\/\/www\.example\.(com|org|net)(\/[a-z-]*)?$/;
    for (const loc of G.getLocales().map((l) => ({ en: 'en-US', tr: 'tr-TR', es: 'es-MX', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-EG', hi: 'hi-IN', bn: 'bn-BD', ur: 'ur-PK', id: 'id-ID', vi: 'vi-VN' })[l])) {
        for (let i = 0; i < 25; i++) {
            const v = G.generate('url', loc, { piiSafe: false });
            assert.match(v, re, `${loc}: ${v}`);
        }
    }
});

test('her dilde 6 kısa ve 4 uzun örnek metin tanımlı, boş değer yok', () => {
    for (const [code, lang] of Object.entries(L.languages)) {
        assert.equal(lang.sampleShort.length, 6, `${code} kısa`);
        assert.equal(lang.sampleLong.length, 4, `${code} uzun`);
        for (const s of [...lang.sampleShort, ...lang.sampleLong]) assert.ok(s.trim().length > 0, `${code} boş örnek`);
    }
});

test('metin alanları Lorem üretmez; çok satırlı alanlar uzun, diğerleri kısa örnek alır', () => {
    for (const loc of ['tr-TR', 'en-US', 'ja-JP', 'ar-EG', 'vi-VN']) {
        for (let i = 0; i < 20; i++) {
            const short = G.generate('text', loc, { fieldName: 'baslik', multiline: false });
            assert.ok(!/lorem/i.test(short), `${loc}: ${short}`);
            const longText = G.generate('text', loc, { fieldName: 'aciklama', multiline: true });
            assert.ok(!/lorem/i.test(longText), `${loc}: ${longText}`);
        }
    }
});

test('maxlength aşılmaz ve mümkünse kelime sınırında kesilir', () => {
    for (let i = 0; i < 40; i++) {
        const v = G.generate('text', 'en-US', { fieldName: 'baslik', multiline: false, maxLength: 20 });
        assert.ok(v.length > 0 && v.length <= 20, `uzunluk ${v.length}: ${v}`);
        assert.ok(!/\s$/.test(v), 'sondaki boşluk olmamalı');
    }
});
