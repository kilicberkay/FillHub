// Yayın bütünlüğü: yerelleştirme dosyaları, belge bağlantıları, mağaza görsel boyutları ve paket içeriği
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
// Eklenti dosyaları (manifest, _locales, options, scripts, icons) extension/ altındadır
const EXT = join(ROOT, 'extension');
const readExt = (p) => readFileSync(join(EXT, p), 'utf8');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(readExt('manifest.json'));
const { contentFiles } = require('../../tools/lib/content-files.js');
const LOCALE_KEYS = ['extName', 'extDescription', 'actionTitle', 'cmdFill', 'cmdChaos', 'cmdUndo', 'menuFillForm', 'menuFillField', 'menuUndo', 'menuSettings'];

test('_locales: 15 dil, her birinde aynı anahtarlar, açıklama ≤132 karakter', () => {
    const dirs = readdirSync(join(EXT, '_locales')).sort();
    assert.equal(dirs.length, 15, `dil klasörü sayısı: ${dirs.length}`);
    const en = JSON.parse(readExt('_locales/en/messages.json'));
    for (const d of dirs) {
        const msgs = JSON.parse(readExt(`_locales/${d}/messages.json`));
        assert.deepEqual(Object.keys(msgs).sort(), [...LOCALE_KEYS].sort(), `${d}: anahtarlar`);
        for (const k of LOCALE_KEYS) assert.ok(msgs[k].message.trim().length > 0, `${d}.${k} boş`);
        assert.ok(msgs.extDescription.message.length <= 132, `${d}: açıklama ${msgs.extDescription.message.length} karakter`);
        assert.deepEqual(Object.keys(msgs), Object.keys(en));
    }
});

test('manifest: her __MSG_ referansı varsayılan dilde tanımlı', () => {
    const en = JSON.parse(readExt('_locales/en/messages.json'));
    const refs = JSON.stringify(manifest).match(/__MSG_(\w+?)__/g) || [];
    assert.ok(refs.length >= 5, `yerelleştirilmiş alan sayısı: ${refs.length}`);
    for (const r of refs) {
        const key = r.slice(6, -2);
        assert.ok(en[key], `varsayılan dilde eksik: ${key}`);
    }
});

test('manifest: default_locale, sürüm ve minimum Chrome sürümü', () => {
    assert.equal(manifest.default_locale, 'en');
    assert.equal(manifest.version, JSON.parse(read('package.json')).version);
    assert.ok(Number(manifest.minimum_chrome_version) >= 116);
});

test('bağıl Markdown bağlantıları var olan dosyalara gider', () => {
    const docs = ['README.md', 'README.tr.md', '.github/CONTRIBUTING.md', '.github/SECURITY.md', 'PRIVACY.md', 'CHANGELOG.md',
        'docs/THIRD_PARTY_NOTICES.md', '.github/CODE_OF_CONDUCT.md', 'docs/ARCHITECTURE.md', 'store/README.md', 'store/privacy-policy.md'];
    for (const doc of docs) {
        assert.ok(existsSync(join(ROOT, doc)), `belge yok: ${doc}`);
        const links = [...read(doc).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
        for (const link of links) {
            if (/^(https?:|mailto:|#)/.test(link)) continue;
            const target = resolve(dirname(join(ROOT, doc)), link.split('#')[0]);
            assert.ok(existsSync(target), `${doc}: kırık bağlantı ${link}`);
        }
    }
});

test('belgeler: CoC iletişim yer tutucusu kalmadı; zorunlu dosyalar mevcut', () => {
    assert.ok(!/\[INSERT/.test(read('.github/CODE_OF_CONDUCT.md')), 'CoC yer tutucusu');
    for (const f of ['LICENSE', 'README.md', 'README.tr.md', '.github/CONTRIBUTING.md', '.github/CODE_OF_CONDUCT.md', '.github/SECURITY.md',
        'PRIVACY.md', 'CHANGELOG.md', 'docs/THIRD_PARTY_NOTICES.md', '.github/FUNDING.yml', 'extension/options/fonts/OFL.txt']) {
        assert.ok(existsSync(join(ROOT, f)), `eksik: ${f}`);
    }
    assert.match(read('LICENSE'), /MIT License/);
    assert.match(read('LICENSE'), /Berkay Kılıç/);
});

test('CI ve yayın iş akışları ayrıştırılabilir YAML anahtarlarını taşır', () => {
    for (const f of ['.github/workflows/ci.yml', '.github/workflows/release.yml']) {
        const src = read(f);
        assert.match(src, /^name: /m, `${f}: name`);
        assert.match(src, /^on:/m, `${f}: on`);
        assert.match(src, /^jobs:/m, `${f}: jobs`);
        assert.ok(!/\t/.test(src), `${f}: sekme karakteri YAML'da geçersiz`);
    }
});

// PNG başlığından genişlik ve yükseklik okunur (IHDR bloğu 16. bayttan başlar)
function pngSize(path) {
    const b = readFileSync(path);
    assert.equal(b.readUInt32BE(0), 0x89504e47, `${path}: PNG imzası`);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

test('mağaza görselleri doğru boyutta', () => {
    const expect = [
        ['store/assets/store-icon-128.png', 128, 128],
        ['store/assets/promo-small-440x280.png', 440, 280],
        ['store/assets/promo-marquee-1400x560.png', 1400, 560],
        ['store/assets/social-preview-1280x640.png', 1280, 640],
    ];
    for (const [f, w, h] of expect) {
        assert.ok(existsSync(join(ROOT, f)), `eksik görsel: ${f}`);
        assert.deepEqual(pngSize(join(ROOT, f)), { w, h }, f);
    }
    for (const lang of ['en', 'tr']) {
        const dir = join(ROOT, 'store/assets/screenshots', lang);
        const shots = readdirSync(dir).filter((f) => f.endsWith('.png'));
        assert.ok(shots.length >= 1 && shots.length <= 5, `${lang}: ekran görüntüsü sayısı ${shots.length}`);
        for (const s of shots) assert.deepEqual(pngSize(join(dir, s)), { w: 1280, h: 800 }, `${lang}/${s}`);
    }
});

test('paket içeriği: çalışma zamanı dosyaları var, geliştirme dosyaları yok', () => {
    const { collect } = require('../../tools/build.js');
    const files = collect();
    for (const f of Object.values(manifest.icons)) assert.ok(files.includes(f), `pakette ikon yok: ${f}`);
    assert.ok(files.includes('manifest.json'));
    assert.ok(files.includes(manifest.options_page));
    assert.ok(files.includes(manifest.background.service_worker));
    for (const f of contentFiles()) assert.ok(files.includes(f), `pakette betik yok: ${f}`);
    for (const f of files) {
        assert.ok(!/^(tools|tests|store|docs|\.github|node_modules|dist)\//.test(f), `geliştirme dosyası pakette: ${f}`);
        assert.ok(!/^(AGENTS\.md|package|README|CHANGELOG|CONTRIBUTING)/.test(f), `belge pakette: ${f}`);
        assert.ok(!f.endsWith('ui.src.css'), 'tasarım kaynağı pakette');
    }
});

test('paket: ayar sayfasının yerel img/link/script referansları pakette var', () => {
    const { collect } = require('../../tools/build.js');
    const files = new Set(collect());
    for (const page of ['options/options.html']) {
        const html = readExt(page);
        const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((s) => !/^(https?:|data:|#|mailto:)/.test(s));
        assert.ok(refs.length >= 3, `${page}: yerel başvuru sayısı ${refs.length}`);
        for (const r of refs) {
            const rel = posix.normalize(posix.join(posix.dirname(page), r));
            assert.ok(files.has(rel), `${page} ${r} referansı pakette yok: ${rel}`);
        }
    }
});

test('build: zip yazıcısı geçerli bir zip üretir (merkezi dizin ve CRC)', () => {
    const { buildZip, crc32 } = require('../../tools/build.js');
    assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926, 'CRC-32 test vektörü');
    const data = Buffer.from('merhaba FillHub '.repeat(50));
    const zip = buildZip([{ name: 'a/b.txt', data }]);
    assert.equal(zip.readUInt32LE(0), 0x04034b50, 'yerel başlık imzası');
    const eocd = zip.length - 22;
    assert.equal(zip.readUInt32LE(eocd), 0x06054b50, 'EOCD imzası');
    assert.equal(zip.readUInt16LE(eocd + 10), 1, 'kayıt sayısı');
    const cdOffset = zip.readUInt32LE(eocd + 16);
    assert.equal(zip.readUInt32LE(cdOffset), 0x02014b50, 'merkezi dizin imzası');
    assert.equal(zip.readUInt32LE(cdOffset + 16), crc32(data), 'CRC');
    assert.equal(zip.readUInt32LE(cdOffset + 42), 0, 'yerel başlık konumu');
});

test('dosya boyutları: içerik betikleri ve ayar sayfası makul sınırda', () => {
    for (const f of ['scripts/content.js', 'scripts/generator.js', 'scripts/locale-data.js', 'options/options.html']) {
        assert.ok(statSync(join(EXT, f)).size < 400000, `${f} çok büyük`);
    }
});

test('README görselleri (HTML img ve Markdown) diskte var', () => {
    for (const doc of ['README.md', 'README.tr.md']) {
        const html = [...read(doc).matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
        const md = [...read(doc).matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
        const srcset = [...read(doc).matchAll(/srcset="([^"]+)"/g)].map((m) => m[1]);
        const srcs = [...html, ...md, ...srcset].filter((s) => !/^https?:/.test(s));
        // Banner, demo, doldurma ekranı ve üç ayar sayfası görselinin açık/koyu kopyaları
        assert.ok(srcs.length >= 9, `${doc}: en az 9 görsel bekleniyor, bulunan ${srcs.length}`);
        for (const s of srcs) assert.ok(existsSync(join(ROOT, s)), `${doc}: eksik görsel ${s}`);
    }
});

test('yayın notu: CHANGELOG bölümü çıkarılır ve sonraki sürüme taşmaz', () => {
    const { execFileSync } = require('node:child_process');
    const out = execFileSync(process.execPath, [join(ROOT, 'tools', 'changelog-section.js'), '1.2.0'], { encoding: 'utf8' });
    assert.match(out, /### Added/);
    assert.ok(!out.includes('## [1.1.0]'), 'önceki sürüm bölümü taşmamalı');
});

test('CHANGELOG: manifest sürümü için bölüm var', () => {
    const version = manifest.version.replace(/\./g, '\\.');
    assert.match(read('CHANGELOG.md'), new RegExp(`^## \\[${version}\\]`, 'm'));
});

test('CHANGELOG: güncel sürüm bölümü boş değil', () => {
    const { execFileSync } = require('node:child_process');
    const current = execFileSync(process.execPath, [join(ROOT, 'tools', 'changelog-section.js'), manifest.version], { encoding: 'utf8' });
    assert.ok(current.trim().length > 0, 'güncel sürüm bölümü boş');
});

test('yayın iş akışı: release varsa günceller, yoksa oluşturur; sağlama toplamı üretir', () => {
    const wf = read('.github/workflows/release.yml');
    assert.match(wf, /gh release view/);
    assert.match(wf, /gh release upload[^\n]*--clobber/);
    assert.match(wf, /gh release create/);
    assert.match(wf, /sha256sum fillhub-\*\.zip/);
});
