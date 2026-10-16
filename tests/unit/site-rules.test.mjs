// Site istisnaları: serbest metin kanonik alan adına çevrilir; alan adı ve alt alan adları eşleşir, benzer adlar eşleşmez
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXT = join(ROOT, 'extension');
const require = createRequire(import.meta.url);
const { normalizeHost, isValidHost, matchesSite } = require(join(EXT, 'scripts', 'site-rules.js'));

test('normalizeHost: URL, www ve büyük harf kanonik biçime çevrilir', () => {
    assert.equal(normalizeHost('Bank.com'), 'bank.com');
    assert.equal(normalizeHost('https://www.bank.com/giris?x=1'), 'bank.com');
    assert.equal(normalizeHost('  bank.com:8443  '), 'bank.com');
    assert.equal(normalizeHost('bank.com.'), 'bank.com');
    assert.equal(normalizeHost('secure.bank.com'), 'secure.bank.com');
});

test('normalizeHost: geçersiz girişler null döner', () => {
    assert.equal(normalizeHost(''), null);
    assert.equal(normalizeHost('   '), null);
    assert.equal(normalizeHost(undefined), null);
    assert.equal(normalizeHost('localhost'), null, 'nokta içermeyen ad');
    assert.equal(normalizeHost('bu olmaz'), null, 'boşluk');
    assert.equal(normalizeHost('127.0.0.1'), null, 'IP adresi biçimi desteklenmez');
});

test('normalizeHost: uluslararası alan adı punycode’a çevrilir', () => {
    assert.equal(normalizeHost('örnek.com.tr'), 'xn--rnek-4qa.com.tr');
});

test('isValidHost: yalnız kanonik biçimi kabul eder', () => {
    assert.equal(isValidHost('bank.com'), true);
    assert.equal(isValidHost('a.b.example.org'), true);
    assert.equal(isValidHost('Bank.com'), false);
    assert.equal(isValidHost('bank'), false);
    assert.equal(isValidHost(''), false);
    assert.equal(isValidHost(null), false);
});

test('matchesSite: alan adı ve alt alan adları eşleşir, benzer adlar eşleşmez', () => {
    const list = ['bank.com'];
    assert.equal(matchesSite('bank.com', list), true);
    assert.equal(matchesSite('secure.bank.com', list), true);
    assert.equal(matchesSite('www.bank.com', list), true);
    assert.equal(matchesSite('notbank.com', list), false, 'sonek eşleşmesi nokta sınırı gerektirir');
    assert.equal(matchesSite('bank.com.evil.net', list), false);
    assert.equal(matchesSite('shop.com', list), false);
});

test('matchesSite: boş ya da geçersiz liste ve sayfa adı güvenli biçimde false döner', () => {
    assert.equal(matchesSite('bank.com', []), false);
    assert.equal(matchesSite('bank.com', undefined), false);
    assert.equal(matchesSite('', ['bank.com']), false);
    assert.equal(matchesSite(undefined, ['bank.com']), false);
});
