// README için tanıtım animasyonu: boş form → doldurma → bildirim → geri alma.
// Gereksinim: Chromium (CHROME_BIN veya Playwright önbelleği) ve ffmpeg. (ImageMagick çok kareli GIF yazmada
// kareleri birleştirdiği için kullanılmaz.)
// Kullanım: node tools/make-demo-gif.mjs [en|tr]   → docs/images/demo.gif veya docs/images/tr/demo.gif
import { mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { startEnv, setStorage, openForm, send, readForm, closeForm, ROOT } from '../tests/e2e/harness.mjs';
import { wait } from './lib/browser.mjs';

const lang = process.argv[2] === 'tr' ? 'tr' : 'en';
const outFile = join(ROOT, 'docs', 'images', lang === 'tr' ? 'tr' : '', 'demo.gif');
const W = 960;
const H = 600;

// Kareler: [dosya, gösterim süresi (1/100 sn)]
const frameDelays = [['0', 150], ['1', 260], ['2', 120]];

async function main() {
    const dir = mkdtempSync(join(tmpdir(), 'fillhub-gif-'));
    const env = await startEnv();
    try {
        await setStorage(env, { preferredLocale: lang === 'tr' ? 'tr-TR' : 'en-US', piiSafe: true, onboardingComplete: true });
        const form = await openForm(env, { lang: lang === 'tr' ? 'tr' : 'en' });
        try {
            await wait(300);
            await form.page.screenshot(join(dir, '0.png'), { width: W, height: H });
            await send(env, form.tabId, { action: 'fill' });
            await wait(600);
            await form.page.screenshot(join(dir, '1.png'), { width: W, height: H });
            await send(env, form.tabId, { action: 'undo' });
            await wait(3500); // doldurma bildirimi (3 sn) kaybolsun
            await form.page.screenshot(join(dir, '2.png'), { width: W, height: H });
            const values = await readForm(form.page);
            if (values.ad !== '') console.log('uyarı: geri alma sonrası ad alanı dolu kaldı');
        } finally {
            await closeForm(form);
        }
    } finally {
        await env.close();
    }
    // concat listesi: her karenin süresi (saniye); son kare iki kez yazılır ki süresi uygulansın
    const list = frameDelays.map(([file, delay]) => `file '${join(dir, `${file}.png`)}'\nduration ${(delay / 100).toFixed(2)}`).join('\n');
    const last = join(dir, `${frameDelays[frameDelays.length - 1][0]}.png`);
    writeFileSync(join(dir, 'frames.txt'), `${list}\nfile '${last}'\n`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(dir, 'frames.txt'),
        '-filter_complex', '[0:v] split [a][b];[a] palettegen=max_colors=128 [p];[b][p] paletteuse=dither=bayer',
        '-fps_mode', 'vfr', '-loop', '0', outFile]);
    rmSync(dir, { recursive: true, force: true });
    console.log(`${outFile}: ${(statSync(outFile).size / 1024).toFixed(0)} KB`);
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
