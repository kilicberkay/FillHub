// README için ekran görüntüleri: ayar sayfalarının açık ve koyu temada kopyaları, doldurma ekranı.
// Gereksinim: Chromium (CHROME_BIN veya Playwright önbelleği).
// Çıktı: docs/images/{light,dark}/ (İngilizce) ve docs/images/tr/{light,dark}/ (Türkçe), fill-form.png her dilde.
import { mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { startEnv, setStorage, openForm, send, closeForm, ROOT } from '../tests/e2e/harness.mjs';
import { PageSession, wait } from './lib/browser.mjs';

const IMAGES = join(ROOT, 'docs', 'images');
const PAGES = [
    { name: 'settings-general', nav: 'nav-general' },
    { name: 'settings-profiles', nav: 'nav-profiles' },
    { name: 'settings-rules', nav: 'nav-rules' },
    { name: 'settings-support', nav: 'nav-support' },
];
const LANGS = [
    { code: 'en', dir: IMAGES, uiLang: 'en', locale: 'en-US', fixture: 'en' },
    { code: 'tr', dir: join(IMAGES, 'tr'), uiLang: 'tr', locale: 'tr-TR', fixture: 'tr' },
];

async function main() {
    // Eski karışık temalı görüntüleri temizle; README yeni yapıyı kullanır
    for (const lang of LANGS) {
        for (const f of readdirSync(lang.dir)) {
            if (f.startsWith('settings-') && f.endsWith('.png')) rmSync(join(lang.dir, f));
        }
        for (const theme of ['light', 'dark']) rmSync(join(lang.dir, theme), { recursive: true, force: true });
    }

    const env = await startEnv();
    try {
        for (const lang of LANGS) {
            for (const theme of ['light', 'dark']) {
                const out = join(lang.dir, theme);
                mkdirSync(out, { recursive: true });
                await setStorage(env, { uiLang: lang.uiLang, theme, onboardingComplete: true, preferredLocale: lang.locale, piiSafe: true });
                const page = await PageSession.open(env.cdp, `chrome-extension://${env.extId}/options/options.html`);
                try {
                    await page.waitFor('!!document.getElementById("nav-general")', 10000);
                    for (const p of PAGES) {
                        await page.eval(`document.getElementById("${p.nav}").click()`);
                        await wait(900);
                        await page.screenshot(join(out, `${p.name}.png`));
                    }
                } finally {
                    await page.close();
                }
            }

            // Doldurma ekranı (tema bağımsız)
            await setStorage(env, { preferredLocale: lang.locale, piiSafe: true, uiLang: lang.uiLang, onboardingComplete: true });
            const form = await openForm(env, { lang: lang.fixture === 'en' ? 'en' : 'tr' });
            try {
                await send(env, form.tabId, { action: 'fill' });
                await wait(400);
                await form.page.screenshot(join(lang.dir, 'fill-form.png'));
            } finally {
                await closeForm(form);
            }
            if (!existsSync(join(lang.dir, 'light'))) throw new Error('light klasörü oluşmadı');
        }
    } finally {
        await env.close();
    }
    console.log('README ekran görüntüleri hazır');
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
