// Statik denetimler: manifest, dosya varlığı, arayüz kimlikleri, çeviri paritesi, gizlilik (ağ/kod enjeksiyonu yok)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXT = join(ROOT, 'extension');
const read = (p) => readFileSync(join(EXT, p), 'utf8');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(read('manifest.json'));
const { contentFiles } = require('../../tools/lib/content-files.js');

test('manifest: MV3, izinler storage, contextMenus ve scripting; host <all_urls>', () => {
    assert.equal(manifest.manifest_version, 3);
    assert.deepEqual(manifest.permissions.slice().sort(), ['contextMenus', 'scripting', 'storage']);
    assert.equal(manifest.content_scripts, undefined, 'içerik betikleri otomatik enjekte edilmemeli');
    assert.deepEqual(manifest.host_permissions, ['<all_urls>']);
});

test('manifest: sürüm biçimi ve ad yerelleştirmesi (varsayılan dilde FillHub)', () => {
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
    assert.equal(manifest.name, '__MSG_extName__');
    const en = JSON.parse(read('_locales/en/messages.json'));
    assert.equal(en.extName.message, 'FillHub');
});

test('manifest: içerik betiklerinin tümü, ikonlar ve ayar sayfası diskte var', () => {
    for (const f of contentFiles()) assert.ok(existsSync(join(EXT, f)), `eksik: ${f}`);
    for (const size of Object.values(manifest.icons)) assert.ok(existsSync(join(EXT, size)), `eksik ikon: ${size}`);
    assert.ok(existsSync(join(EXT, manifest.options_page)), 'ayar sayfası yok');
    assert.ok(existsSync(join(EXT, manifest.background.service_worker)), 'servis çalışanı yok');
});

test('manifest: içerik betiği yükleme sırası (veri → kimlik → tespit → üreteç → içerik)', () => {
    const js = contentFiles();
    const order = ['locale-data', 'id-rules', 'field-detect', 'generator', 'content'];
    const idx = order.map((n) => js.findIndex((f) => f.includes(n)));
    assert.ok(idx.every((i) => i >= 0), 'her betik listede olmalı');
    assert.deepEqual(idx.slice().sort((a, b) => a - b), idx, 'sıra bozuk');
});

test('manifest: üç komut tanımlı', () => {
    assert.deepEqual(Object.keys(manifest.commands).sort(), ['fill_chaos', 'fill_form', 'undo_fill']);
});

test('i18n: 15 dil ve her dilde İngilizce ile aynı anahtarlar', () => {
    const I = require(join(EXT, 'options/i18n.js'));
    const langs = Object.keys(I);
    assert.equal(langs.length, 15);
    const enKeys = Object.keys(I.en).sort();
    assert.ok(enKeys.length >= 60);
    for (const l of langs) assert.deepEqual(Object.keys(I[l]).sort(), enKeys, `${l} anahtar kümesi`);
});

test('options.js her getElementById çağrısı options.html içinde bir id bulur', () => {
    const js = read('options/options.js');
    const html = read('options/options.html');
    const ids = [...js.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]);
    assert.ok(ids.length > 20, `beklenenden az id: ${ids.length}`);
    const missing = [...new Set(ids)].filter((id) => !html.includes(`id="${id}"`));
    assert.deepEqual(missing, []);
});

test('ayar sayfası: yalnızca yerel betik yüklenir (uzak kod yok)', () => {
    const html = read('options/options.html');
    const srcs = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)].map((m) => m[1]);
    assert.ok(srcs.length > 0);
    assert.ok(srcs.every((s) => !/^https?:/.test(s)), `uzak betik: ${srcs}`);
});

test('sponsor bağlantıları doğru adrese gider ve güvenli açılır', () => {
    const html = read('options/options.html');
    const anchors = [...html.matchAll(/<a\b[^>]*href="https:\/\/github\.com\/sponsors\/kilicberkay"[^>]*>/g)].map((m) => m[0]);
    assert.ok(anchors.length >= 2, `sponsor bağlantısı sayısı: ${anchors.length}`);
    for (const a of anchors) {
        assert.match(a, /target="_blank"/);
        assert.match(a, /rel="noopener noreferrer"/);
    }
});

test('gizlilik: içerik betikleri ağ isteği, dinamik kod veya uzak kaynak kullanmaz', () => {
    const files = ['scripts/locale-data.js', 'scripts/id-rules.js', 'scripts/field-detect.js', 'scripts/generator.js', 'scripts/content.js', 'scripts/background.js'];
    const banned = [/\bfetch\s*\(/, /XMLHttpRequest/, /new\s+WebSocket\s*\(/, /\beval\s*\(/, /new\s+Function\s*\(/, /sendBeacon/, /importScripts\s*\(/];
    for (const f of files) {
        const src = read(f);
        for (const re of banned) assert.ok(!re.test(src), `${f}: yasak desen ${re}`);
    }
});

test('gizlilik: ayar sayfası dış bağlantı dışında uzak kaynak yüklemez', () => {
    const html = read('options/options.html');
    assert.ok(!/<link[^>]+href=["']https?:/.test(html), 'uzak stil yok');
    assert.ok(!/@import\s+url\(\s*['"]?https?:/.test(read('options/options.css')), 'uzak @import yok');
});

test('ayar sayfası stil dosyası üretilmiş ve Tailwind sürümünü taşır', () => {
    const css = read('options/options.css');
    assert.match(css, /tailwindcss v4\.3\.3/);
    assert.ok(css.length > 20000);
});

test('captcha: içerik betiği captcha\'ya tıklamaz, çözmez ve doğrulama API\'lerini çağırmaz', () => {
    const src = read('scripts/content.js');
    const banned = [
        /(grecaptcha|turnstile|hcaptcha)\.(execute|render|reset|getResponse)/i,
        /recaptcha-anchor/,
        /captcha[^\n]*\.click\(/i,
        /\.click\(\)[^\n]*captcha/i,
    ];
    for (const re of banned) assert.ok(!re.test(src), `captcha etkileşimi var: ${re}`);
});

test('toast: geri al düğmesi etiketi tarayıcı dilinden değil, ayarlardaki dilden gelir; 15 dilde menuUndo ile aynı', () => {
    const src = read('scripts/content.js');
    assert.ok(!/chrome\.i18n\.getMessage\('menuUndo'\)/.test(src), 'düğme etiketi tarayıcı dilinden alınıyor');
    assert.match(src, /getLocalizedMessage\(settings\.preferredLocale, 'undoLabel'\)/);
    const dirs = readdirSync(join(EXT, '_locales'));
    assert.equal(dirs.length, 15);
    for (const dir of dirs) {
        const msg = JSON.parse(read(`_locales/${dir}/messages.json`)).menuUndo.message;
        const lang = dir.split('_')[0];
        assert.ok(src.includes(`'${lang}': '${msg}'`), `${dir}: undoLabel çevirisi content.js içinde yok`);
    }
});

test('bağlantılar: GitHub depo bağlantılarının tümü FillHub deposunu gösterir (eski depo adı kalmaz)', () => {
    const offenders = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
            const full = join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (/\.(md|html|js|mjs|json)$/.test(entry.name)) {
                for (const m of readFileSync(full, 'utf8').matchAll(/github\.com\/kilicberkay\/([\w.-]+)/g)) {
                    if (m[1] !== 'FillHub') offenders.push(`${relative(ROOT, full)}: ${m[0]}`);
                }
            }
        }
    };
    walk(ROOT);
    assert.deepEqual(offenders, []);
});
