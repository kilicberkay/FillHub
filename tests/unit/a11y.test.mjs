// Erişilebilirlik (statik): ayar sayfasında her girişin etiketi, her düğmenin metni ve her diyalogun başlığı var
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXT = join(ROOT, 'extension');
const read = (p) => readFileSync(join(EXT, p), 'utf8');
const PAGES = ['options/options.html'];

// Gizli ya da dosya girdileri kullanıcıya görünmez; etiket zorunluluğu yalnızca görünen denetimler için
const isVisibleControl = (tag) => !/type="(hidden|file)"/.test(tag);

function hasLabel(html, tag) {
    if (/\baria-label(ledby)?="/.test(tag)) return true;
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    return Boolean(id) && new RegExp(`<label[^>]*\\bfor="${id}"`).test(html);
}

for (const page of PAGES) {
    test(`erişilebilirlik ${page}: görünen her giriş ve seçim bir etiketle adlandırılır`, () => {
        const html = read(page);
        const controls = [...html.matchAll(/<(input|select|textarea)\b[^>]*>/g)].map((m) => m[0]).filter(isVisibleControl);
        assert.ok(controls.length >= 1, `denetlenecek denetim sayısı: ${controls.length}`);
        for (const tag of controls) {
            assert.ok(hasLabel(html, tag), `${page}: etiketsiz denetim: ${tag.slice(0, 120)}`);
        }
    });

    test(`erişilebilirlik ${page}: her düğmenin görünen metni ya da erişilebilir adı var`, () => {
        const html = read(page);
        const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
        assert.ok(buttons.length >= 1, `düğme sayısı: ${buttons.length}`);
        for (const [, attrs, inner] of buttons) {
            const text = inner.replace(/<[^>]+>/g, '').trim();
            const named = /\baria-label(ledby)?="/.test(attrs) || /\btitle="/.test(attrs);
            assert.ok(text.length > 0 || named, `${page}: adsız düğme: ${attrs.trim().slice(0, 100)}`);
        }
    });

    test(`erişilebilirlik ${page}: diyaloglar başlıklı ve modal işaretli`, () => {
        const html = read(page);
        const dialogs = [...html.matchAll(/<[a-z]+\b[^>]*role="dialog"[^>]*>/g)].map((m) => m[0]);
        for (const tag of dialogs) {
            assert.match(tag, /aria-modal="true"/, `${page}: modal işareti eksik: ${tag.slice(0, 100)}`);
            assert.match(tag, /aria-labelledby="[^"]+"/, `${page}: başlık bağlantısı eksik: ${tag.slice(0, 100)}`);
        }
    });

    test(`biçim ${page}: öznitelikler arasında boşluk var (ör. id="a"class="b" olmamalı)`, () => {
        const html = read(page);
        const glued = html.match(/"[a-zA-Z-]+="/g) || [];
        assert.deepEqual(glued, [], `${page}: boşluksuz öznitelik`);
    });
}
