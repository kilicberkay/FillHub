// Profil sabit değerleri: aktif profilin alanları seçilir; ad değişince kişi (tam ad, e-posta) tutarlı kalır
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXT = join(ROOT, 'extension');
const require = createRequire(import.meta.url);
const G = require(join(EXT, 'scripts', 'generator.js'));

const settings = (values, activeProfileId = 'p1') => ({
    activeProfileId,
    profiles: [
        { id: 'default', name: 'Standard Persona', mode: 'random' },
        { id: 'p1', name: 'QA hesabı', mode: 'random', values },
    ],
});

test('sabit değerler: aktif profilin boş olmayan alanları, kırpılmış olarak döner', () => {
    const v = G.activeValues(settings({ email: '  qa@test.example.com  ', password: '', phone: '5551112233', unknown: 'x' }));
    assert.deepEqual(v, { email: 'qa@test.example.com', phone: '5551112233' }, 'boş ve bilinmeyen alanlar yok sayılır');
});

test('sabit değerler: aktif profil değilse ya da değer yoksa boş nesne döner', () => {
    assert.deepEqual(G.activeValues(settings({ email: 'a@b.co' }, 'default')), {}, 'varsayılan profilde sabit değer yok');
    assert.deepEqual(G.activeValues({ profiles: [{ id: 'p1', name: 'x', mode: 'random' }], activeProfileId: 'p1' }), {});
    assert.deepEqual(G.activeValues({}), {});
});

test('withNames: sabit ad ve soyad tam ad ve e-posta yerel kısmına yansır', () => {
    const person = G.createPerson('tr-TR');
    const p = G.withNames(person, 'Ayşe', 'Demir');
    assert.equal(p.first.n, 'Ayşe');
    assert.equal(p.last.n, 'Demir');
    assert.equal(p.fullNative, 'Ayşe Demir');
    assert.match(p.emailLocal, /^ayse\.demir\d{2}$/, `e-posta yerel kısmı adla tutarlı olmalı: ${p.emailLocal}`);
    assert.equal(person.first.n === 'Ayşe', false, 'özgün kişi değişmez');
});

test('withNames: e-posta yerel kısmının iki haneli eki korunur', () => {
    const person = { ...G.createPerson('en-US'), emailLocal: 'john.doe42' };
    assert.equal(G.withNames(person, 'Mary', 'Ann').emailLocal, 'mary.ann42');
});
