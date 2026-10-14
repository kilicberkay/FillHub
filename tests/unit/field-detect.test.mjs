// Alan tespiti: etiket korpusu, öznitelik adları, otomatik tamamlama ve input.type sinyalleri
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { LABEL_CORPUS } from './field-corpus.mjs';

const require = createRequire(import.meta.url);
const D = require('../../scripts/field-detect.js');

test('etiket korpusu: her etiket beklenen türe düşer', () => {
    const failures = [];
    for (const [label, expected] of LABEL_CORPUS) {
        const got = D.classify([label], {});
        const ok = expected.startsWith('NOT:') ? got !== expected.slice(4) : got === expected;
        if (!ok) failures.push(`${label} → ${got} (beklenen ${expected})`);
    }
    assert.deepEqual(failures, []);
});

test('korpus en az 100 etiket içerir ve 15 dil temsil edilir', () => {
    assert.ok(LABEL_CORPUS.length >= 100, `korpus boyutu ${LABEL_CORPUS.length}`);
});

test('input.type sinyali etiketten önce gelir', () => {
    assert.equal(D.classify(['Bilinmeyen'], { inputType: 'email' }), 'email');
    assert.equal(D.classify(['Bilinmeyen'], { inputType: 'tel' }), 'phone');
    assert.equal(D.classify(['Bilinmeyen'], { inputType: 'password' }), 'password');
});

test('autocomplete jetonu etiketten önce gelir (son jeton kullanılır)', () => {
    assert.equal(D.classify(['Metin'], { autocomplete: 'section-billing email' }), 'email');
    assert.equal(D.classify(['Metin'], { autocomplete: 'given-name' }), 'firstName');
    assert.equal(D.classify(['Metin'], { autocomplete: 'family-name' }), 'lastName');
});

test('"Soyadınız" ad alanı sayılmaz; "Adınız" soyad alanı sayılmaz (R2)', () => {
    assert.equal(D.classify(['Soyadınız'], {}), 'lastName');
    assert.notEqual(D.classify(['Soyadınız'], {}), 'firstName');
    assert.equal(D.classify(['Adınız'], {}), 'firstName');
    assert.notEqual(D.classify(['Adınız'], {}), 'lastName');
});

test('telefon kelime sınırı: hotel ve total telefon olmaz', () => {
    assert.notEqual(D.classify(['Hotel'], {}), 'phone');
    assert.notEqual(D.classify(['Total'], {}), 'phone');
    assert.equal(D.classify(['tel'], {}), 'phone');
});

test('fold: aksan ve Türkçe harfler sadeleşir', () => {
    assert.equal(D.fold('Soyadınız'), 'soyadiniz');
    assert.equal(D.fold('E-posta'), 'e posta');
    assert.equal(D.fold('txtAdSoyad'), 'txt ad soyad');
    assert.equal(D.fold('Đ ß'), 'd ss');
});

test('bilinmeyen etiket null döner', () => {
    assert.equal(D.classify(['Zzzqqq'], {}), null);
    assert.equal(D.classify([], {}), null);
});
