// README için ekran görüntüleri: ayar sayfaları (dolu profil ve kurallarla), araç çubuğu açılır penceresi, doldurma ekranı.
// Gereksinim: Chromium (CHROME_BIN veya Playwright önbelleği) ve ImageMagick (magick).
// Çıktı: docs/images/{light,dark}/ (İngilizce) ve docs/images/tr/{light,dark}/ (Türkçe); fill-form.png her dilde.
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startEnv, setStorage, openForm, send, closeForm, ROOT } from '../tests/e2e/harness.mjs';
import { PageSession, wait } from './lib/browser.mjs';
import { HIDE_SCROLLBARS, frameImage } from './lib/capture.mjs';

const require = createRequire(import.meta.url);
const FakeDataGenerator = require(join(ROOT, 'extension', 'scripts', 'generator.js'));

const IMAGES = join(ROOT, 'docs', 'images');
const PAGES = [
    { name: 'settings-general', nav: 'nav-general' },
    { name: 'settings-profiles', nav: 'nav-profiles' },
    { name: 'settings-rules', nav: 'nav-rules' },
];
const LANGS = [
    { dir: IMAGES, uiLang: 'en', locale: 'en-US', fixture: 'en' },
    { dir: join(IMAGES, 'tr'), uiLang: 'tr', locale: 'tr-TR', fixture: 'tr' },
];

// Ayar sayfası ve açılır pencere dolu görünsün diye örnek profil ve kurallar; kimlikler üreticiden gelir
function seedState(lang, theme) {
    return {
        uiLang: lang.uiLang, theme, onboardingComplete: true, preferredLocale: lang.locale, piiSafe: true,
        profiles: [
            { id: 'default', name: 'Standard Persona', mode: 'random' },
            { id: 'test-account', name: lang.uiLang === 'tr' ? 'Test hesabı' : 'Test account', mode: 'fixed',
                identity: FakeDataGenerator.createIdentity(lang.locale) },
        ],
        activeProfileId: 'test-account',
        customRules: [
            { selector: 'input[name="email"]', type: 'email' },
            { selector: 'input[name="phone"]', type: 'phone' },
            { selector: 'input[name="city"]', type: 'city' },
        ],
    };
}

// Açılır pencere 320 px genişliktedir (w-80); 2× ölçekte, yalnızca gövde kadar alınır
async function popupShot(env, file) {
    const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/popup/popup.html`);
    try {
        await page.waitFor('document.getElementById("popupCountry").options.length > 0', 10000);
        await wait(300);
        const height = await page.eval('Math.ceil(document.body.getBoundingClientRect().height)');
        const { data } = await page.cdp.send('Page.captureScreenshot', {
            format: 'png', clip: { x: 0, y: 0, width: 320, height, scale: 2 },
        }, page.sid);
        writeFileSync(file, Buffer.from(data, 'base64'));
    } finally {
        await page.close();
    }
}

async function main() {
    // Önceki ayar ve açılır pencere görüntüleri (kaldırılan Destek sayfası dahil) silinir; yenileri üretilir
    for (const lang of LANGS) {
        for (const theme of ['light', 'dark']) rmSync(join(lang.dir, theme), { recursive: true, force: true });
    }

    const env = await startEnv();
    try {
        for (const lang of LANGS) {
            for (const theme of ['light', 'dark']) {
                const out = join(lang.dir, theme);
                mkdirSync(out, { recursive: true });
                await setStorage(env, seedState(lang, theme));
                const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
                try {
                    await page.waitFor('!!document.getElementById("nav-general")', 10000);
                    for (const p of PAGES) {
                        await page.eval(`document.getElementById("${p.nav}").click()`);
                        await wait(900);
                        const file = join(out, `${p.name}.png`);
                        await page.screenshot(file);
                        frameImage(file);
                    }
                } finally {
                    await page.close();
                }
                await setStorage(env, seedState(lang, theme));
                const popup = join(out, 'popup.png');
                await popupShot(env, popup);
                frameImage(popup);
            }

            // Doldurma ekranı (tema bağımsız); kaydırma çubuğu gizlenir
            await setStorage(env, { preferredLocale: lang.locale, piiSafe: true, uiLang: lang.uiLang, onboardingComplete: true });
            const form = await openForm(env, { lang: lang.fixture === 'en' ? 'en' : 'tr' });
            try {
                await form.page.eval(HIDE_SCROLLBARS);
                await send(env, form.tabId, { action: 'fill' });
                await wait(400);
                const file = join(lang.dir, 'fill-form.png');
                await form.page.screenshot(file);
                frameImage(file);
            } finally {
                await closeForm(form);
            }
            if (!existsSync(join(lang.dir, 'light', 'popup.png'))) throw new Error('açılır pencere görüntüsü oluşmadı');
        }
    } finally {
        await env.close();
    }
    console.log('README ekran görüntüleri hazır');
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
