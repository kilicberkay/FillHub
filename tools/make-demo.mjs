// README için tanıtım videosu: boş form → doldurma → kaydırma → geri alma. Kareler gerçek uzantıdan (Chromium, CDP) alınır.
// Çıktılar: docs/videos/demo-<dil>.mp4 (tam kalite, 1280×800, 30 kare/sn) ve docs/images/[tr/]demo.gif (README'de
// otomatik oynayan önizleme, 960 px, 12 kare/sn).
// Gereksinim: Chromium (CHROME_BIN veya Playwright önbelleği) ve ffmpeg.
// Kullanım: LANG=en_US.UTF-8 node tools/make-demo.mjs en   (İngilizce kayıt için tarayıcı dili İngilizce olmalı:
// bildirimdeki geri al düğmesi etiketi chrome.i18n ile tarayıcı dilinden gelir.)
//           node tools/make-demo.mjs tr
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { startEnv, setStorage, openForm, send, ROOT } from '../tests/e2e/harness.mjs';
import { wait } from './lib/browser.mjs';

const lang = process.argv[2] === 'tr' ? 'tr' : 'en';
const gifFile = join(ROOT, 'docs', 'images', lang === 'tr' ? 'tr' : '', 'demo.gif');
const mp4File = join(ROOT, 'docs', 'videos', `demo-${lang}.mp4`);

// Kaydırma çubuğu kareye girmesin; yalnızca kayıt sayfasına eklenir
const HIDE_SCROLLBARS = `(() => {
    const s = document.createElement('style');
    s.textContent = 'html{scrollbar-width:none}::-webkit-scrollbar{display:none}';
    document.head.appendChild(s);
})()`;

// Kareleri arka planda alır; her kare kendi zaman damgasıyla saklanır (kare hızı CDP'ye bağlıdır)
function startRecording(page, dir) {
    const frames = [];
    let running = true;
    const started = performance.now();
    const loop = (async () => {
        while (running) {
            const { data } = await page.cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95 }, page.sid);
            const file = join(dir, `${String(frames.length).padStart(5, '0')}.jpg`);
            writeFileSync(file, Buffer.from(data, 'base64'));
            frames.push({ file, at: (performance.now() - started) / 1000 });
        }
    })();
    return async () => {
        running = false;
        await loop;
        return frames;
    };
}

// ffmpeg concat listesi: her kare, bir sonraki karenin başlangıcına kadar gösterilir
function concatList(frames) {
    const lines = frames.map((f, i) => {
        const end = i + 1 < frames.length ? frames[i + 1].at : f.at + 0.1;
        return `file '${f.file}'\nduration ${(end - f.at).toFixed(3)}`;
    });
    // Son kare süresinin uygulanması için dosya bir kez daha yazılır
    lines.push(`file '${frames.at(-1).file}'`);
    return `${lines.join('\n')}\n`;
}

async function main() {
    const dir = mkdtempSync(join(tmpdir(), 'fillhub-demo-'));
    const env = await startEnv();
    try {
        await setStorage(env, {
            preferredLocale: lang === 'tr' ? 'tr-TR' : 'en-US', uiLang: lang, piiSafe: true, onboardingComplete: true,
        });
        const form = await openForm(env, { lang: lang === 'tr' ? 'tr' : 'en' });
        try {
            // Görüntü alanı 1280×800'e sabitlenir; pencere ölçüsü kareleri değiştirmesin
            await form.page.cdp.send('Emulation.setDeviceMetricsOverride',
                { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, form.page.sid);
            await form.page.eval(HIDE_SCROLLBARS);
            await wait(300);
            const stop = startRecording(form.page, dir);
            await wait(1500); // boş form
            await send(env, form.tabId, { action: 'fill' });
            await wait(1200); // doldurma ve bildirim
            await form.page.eval("window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })");
            await wait(1800);
            await form.page.eval("window.scrollTo({ top: 0, behavior: 'smooth' })");
            await wait(1000);
            await send(env, form.tabId, { action: 'undo' });
            await wait(2000); // geri alma sonucu
            const frames = await stop();

            const list = join(dir, 'frames.txt');
            writeFileSync(list, concatList(frames));
            mkdirSync(dirname(mp4File), { recursive: true });
            mkdirSync(dirname(gifFile), { recursive: true });

            // Tam kalite MP4: sabit 30 kare/sn, H.264 (boyutlar çift olmalı), web için faststart
            execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
                '-vf', 'fps=30,pad=ceil(iw/2)*2:ceil(ih/2)*2,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
                '-movflags', '+faststart', mp4File]);
            // GIF önizleme: 960 px genişlik, 12 kare/sn, kare farkına göre palet
            execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
                '-filter_complex', '[0:v]fps=12,scale=960:-2:flags=lanczos,split[a][b];'
                + '[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
                '-loop', '0', gifFile]);
            console.log(`${frames.length} kare kaydedildi`);
        } finally {
            await form.page.close();
        }
    } finally {
        await env.close();
        rmSync(dir, { recursive: true, force: true });
    }
    console.log(`${mp4File}: ${(statSync(mp4File).size / 1024).toFixed(0)} KB`);
    console.log(`${gifFile}: ${(statSync(gifFile).size / 1024).toFixed(0)} KB`);
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
