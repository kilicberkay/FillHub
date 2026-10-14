// Mağaza görselleri: ekran görüntüleri (gerçek uzantıdan) ve tanıtım kutuları (store/assets/src şablonlarından).
// Gereksinim: Chromium (CHROME_BIN veya Playwright önbelleği). Simge için rsvg-convert ve ImageMagick (isteğe bağlı).
// Kullanım: node tools/make-store-assets.mjs
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { startEnv, setStorage, openForm, send, closeForm, ROOT } from '../tests/e2e/harness.mjs';
import { PageSession, wait } from './lib/browser.mjs';

const OUT = join(ROOT, 'store', 'assets');
const SHOTS = join(OUT, 'screenshots');

// Simge: 128 px tuval, 96 px sanat + 16 px şeffaf kenar (Chrome Web Store kuralı)
function makeIcon() {
    const svg = join(ROOT, 'icons', 'logo.svg');
    if (!existsSync(svg)) return 'icons/logo.svg yok';
    const art = join(OUT, 'store-icon-art.png');
    const icon = join(OUT, 'store-icon-128.png');
    try {
        execFileSync('rsvg-convert', ['-w', '96', '-h', '96', '-o', art, svg]);
        execFileSync('magick', [art, '-background', 'none', '-gravity', 'center', '-extent', '128x128', icon]);
        rmSync(art);
        return 'store-icon-128.png';
    } catch (e) {
        return `simge atlandı (rsvg-convert/magick gerekli): ${e.message.split('\n')[0]}`;
    }
}

// Ekran görüntüleri: demo form (doldurulmuş + bildirim), ayar sayfası sekmeleri
const SHOT_PLAN = [
    { file: '01-fill.png', kind: 'fill' },
    { file: '02-general.png', nav: 'nav-general', theme: 'dark' },
    { file: '03-profiles.png', nav: 'nav-profiles', theme: 'light' },
    { file: '04-rules.png', nav: 'nav-rules', theme: 'dark' },
    { file: '05-support.png', nav: 'nav-support', theme: 'light' },
];

async function captureScreenshots(env, uiLang) {
    const dir = join(SHOTS, uiLang === 'tr' ? 'tr' : 'en');
    mkdirSync(dir, { recursive: true });
    const done = [];
    for (const shot of SHOT_PLAN) {
        if (shot.kind === 'fill') {
            await setStorage(env, { preferredLocale: uiLang === 'tr' ? 'tr-TR' : 'en-US', piiSafe: true, uiLang, onboardingComplete: true });
            const form = await openForm(env, { lang: uiLang === 'tr' ? 'tr' : 'en' });
            try {
                await send(env, form.tabId, { action: 'fill' });
                await wait(400);
                done.push(await form.page.screenshot(join(dir, shot.file)));
            } finally {
                await closeForm(form);
            }
            continue;
        }
        await setStorage(env, { uiLang, theme: shot.theme, onboardingComplete: true, preferredLocale: uiLang === 'tr' ? 'tr-TR' : 'en-US' });
        const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
        try {
            await page.waitFor('!!document.getElementById("nav-general")', 10000);
            await page.eval(`document.getElementById("${shot.nav}").click()`);
            await wait(900);
            done.push(await page.screenshot(join(dir, shot.file)));
        } finally {
            await page.close();
        }
    }
    return done;
}

// Tanıtım kutuları: SVG şablonuna simge gömülür, rsvg-convert ile PNG'ye çevrilir (tarayıcı gerektirmez)
function renderTile(src, out, width, height) {
    const icon = `data:image/png;base64,${readFileSync(join(ROOT, 'icons', 'logo128.png')).toString('base64')}`;
    const svg = readFileSync(join(OUT, 'src', src), 'utf8').replace('ICON_HREF', icon);
    const tmp = join(OUT, 'src', src.replace('.svg', '.generated.svg'));
    writeFileSync(tmp, svg);
    const target = join(OUT, out);
    execFileSync('rsvg-convert', ['-w', String(width), '-h', String(height), '-o', target, tmp]);
    rmSync(tmp);
    return target;
}

// CDP çağrısını zaman aşımına bağlar: takılan bir adım sessizce kaybolmasın
const withTimeout = (p, ms, label) => Promise.race([
    p,
    wait(ms).then(() => { throw new Error(`zaman aşımı: ${label}`); }),
]);

async function main() {
    console.log('simge:', makeIcon());

    const tiles = [
        renderTile('promo-small.svg', 'promo-small-440x280.png', 440, 280),
        renderTile('promo-marquee.svg', 'promo-marquee-1400x560.png', 1400, 560),
        renderTile('promo-social.svg', 'social-preview-1280x640.png', 1280, 640),
    ];
    console.log('tanıtım:', tiles.map((p) => p.split('/').pop()).join(', '));

    const env = await startEnv();
    try {
        for (const uiLang of ['en', 'tr']) {
            const shots = await withTimeout(captureScreenshots(env, uiLang), 240000, `ekran görüntüleri ${uiLang}`);
            console.log(`ekran görüntüleri (${uiLang}):`, shots.map((p) => p.split('/').pop()).join(', '));
        }
    } finally {
        await env.close();
    }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
