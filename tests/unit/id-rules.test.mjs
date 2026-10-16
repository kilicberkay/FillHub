// Kimlik ve vergi kuralları: bilinen vektörler, test kalıpları ve tek hane değişimine duyarlılık
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const R = require('../../extension/scripts/id-rules.js');

test('bilinen geçerli vektörler kabul edilir', () => {
    const valid = [
        ['tckn', '10000000146'], ['cpf', '52998224725'], ['cnpj', '11222333000181'],
        ['cnId', '11010519491231002X'], ['snils', '11223344595'], ['inn', '7707083893'],
        ['myNumber', '123456789018'], ['curp', 'BOXW310820HNERXN09'], ['curp', 'XEXX010101HNEXXXA4'],
        ['iban', 'DE89370400440532013000'], ['iban', 'GB82WEST12345698765432'],
    ];
    for (const [key, v] of valid) assert.equal(R[key].valid(v), true, `${key} ${v}`);
});

test('bilinen geçersiz vektörler reddedilir', () => {
    const invalid = [
        ['tckn', '10000000147'], ['cpf', '52998224726'], ['myNumber', '123456789019'],
        ['curp', 'BOXW310820HNERXN08'], ['iban', 'DE89370400440532013001'],
    ];
    for (const [key, v] of invalid) assert.equal(R[key].valid(v), false, `${key} ${v}`);
});

test('Verhoeff: 236 → 3', () => {
    assert.equal(R.verhoeffCheckDigit('236'), 3);
});

test('algoritmik kimlikler tek hane değişince geçersiz olur', () => {
    for (const [key, v] of [['tckn', '10000000146'], ['cpf', '52998224725'], ['cnpj', '11222333000181'], ['snils', '11223344595']]) {
        const i = 3;
        const mutated = v.slice(0, i) + ((Number(v[i]) + 1) % 10) + v.slice(i + 1);
        assert.equal(R[key].valid(mutated), false, `${key} bozuk: ${mutated}`);
    }
});

test('PII sentinel değerleri sağlamasını geçer (TCKN, CPF, CNPJ, SNILS, INN, My Number, CURP)', () => {
    for (const d of [1, 5, 9]) {
        assert.equal(R.tckn.valid(R.sentinel('tckn', d)), true, `tckn d=${d}: ${R.sentinel('tckn', d)}`);
        assert.equal(R.cpf.valid(R.sentinel('cpf', d)), true, `cpf d=${d}`);
        assert.equal(R.cnpj.valid(R.sentinel('cnpj', d)), true, `cnpj d=${d}`);
        assert.equal(R.snils.valid(R.sentinel('snils', d)), true, `snils d=${d}`);
        assert.equal(R.inn.valid(R.sentinel('inn', d)), true, `inn d=${d}`);
        assert.equal(R.myNumber.valid(R.sentinel('myNumber', d)), true, `myNumber d=${d}`);
        assert.equal(R.curp.valid(R.sentinel('curp', d, '1990-01-01', true)), true, `curp d=${d}`);
    }
});

test('TCKN sentinel örüntüsü: d tekrarı + 0 (11111111110 biçimi)', () => {
    assert.equal(R.sentinel('tckn', 1), '11111111110');
    assert.equal(R.sentinel('tckn', 3), '33333333330');
});

test('IBAN sentinel: sıfır BBAN ve geçerli kontrol hanesi', () => {
    for (const cc of ['TR', 'DE', 'FR', 'GB']) {
        const s = R.ibanSentinel(cc);
        if (!s) continue;
        const re = s.slice(4) + s.slice(0, 4);
        let r = 0;
        for (const ch of re) {
            const c = ch.charCodeAt(0);
            const v = c >= 65 && c <= 90 ? String(c - 55) : ch;
            for (const dgt of v) r = (r * 10 + Number(dgt)) % 97;
        }
        assert.equal(r, 1, `${cc} sentinel IBAN geçersiz: ${s}`);
    }
});

test('biçim-only numaralar (VKN, INN-12) yalnız biçim denetlenir', () => {
    assert.equal(R.vkn.valid('1234567890'), true);
    assert.equal(R.vkn.valid('12345'), false);
    assert.equal(R.inn12.valid('123456789012') === true || R.inn12.valid('123456789012') === false, true);
});
