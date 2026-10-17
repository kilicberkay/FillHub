// README için tanıtım videosu: dört dilde doldurma (ABD, Türkiye, Japonya, Mısır) ve son sahnede geri alma.
// Kareler gerçek uzantıdan (Chromium, CDP) alınır; sahne değişiminde yeni sekme açılır, kayıt aynı akışta sürer.
// Çıktılar: docs/videos/demo-<dil>.mp4 (tam kalite, 1280×800, 30 kare/sn) ve docs/images/[tr/]demo.gif
// (README'de otomatik oynayan önizleme, 960 px, 12 kare/sn). Alt yazılar video dilinde yazılır.
// Gereksinim: Chromium (CHROME_BIN veya Playwright önbelleği) ve ffmpeg.
// Kullanım: node tools/make-demo.mjs [en|tr]
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { startEnv, setStorage, openForm, closeForm, send, ROOT } from '../tests/e2e/harness.mjs';
import { wait } from './lib/browser.mjs';
import { HIDE_SCROLLBARS } from './lib/capture.mjs';

const lang = process.argv[2] === 'tr' ? 'tr' : 'en';
const gifFile = join(ROOT, 'docs', 'images', lang === 'tr' ? 'tr' : '', 'demo.gif');
const mp4File = join(ROOT, 'docs', 'videos', `demo-${lang}.mp4`);

// Sahneler: açılacak form (harness fikstürü), tarayıcı yerel ayarı ve video dilinde alt yazı.
// Japonya ve Mısır sahneleri İngilizce etiketli formu kullanır: uzantı etiketin dilinden bağımsız olarak seçilen
// ülkenin verisini yazar. (ja/ar fikstürleri stilsizdir, ekranda kullanılmaz.)
const SCENES = [
    { open: { lang: 'en' }, locale: 'en-US', caption: { en: 'United States · en-US', tr: 'Amerika Birleşik Devletleri · en-US' } },
    { open: { lang: 'tr' }, locale: 'tr-TR', caption: { en: 'Türkiye · tr-TR', tr: 'Türkiye · tr-TR' } },
    { open: { lang: 'en' }, locale: 'ja-JP', caption: { en: 'Japan · ja-JP', tr: 'Japonya · ja-JP' } },
    { open: { lang: 'en' }, locale: 'ar-EG', caption: { en: 'Egypt · ar-EG', tr: 'Mısır · ar-EG' } },
];

// Sayfanın alt köşesinde kısa açıklama; yalnızca kayıt sırasında eklenir
function captionScript(text) {
    return `(() => {
        let el = document.getElementById('fillhub-demo-caption');
        if (!el) {
            el = document.createElement('div');
            el.id = 'fillhub-demo-caption';
            el.style.cssText = 'position:fixed;left:24px;bottom:24px;z-index:2147483647;padding:9px 16px;border-radius:10px;'
                + 'background:rgba(24,24,27,.84);color:#fafafa;font:600 15px/1.3 system-ui,sans-serif;direction:ltr;pointer-events:none';
            document.documentElement.appendChild(el);
        }
        el.textContent = ${JSON.stringify(text)};
    })()`;
}

// Kareleri arka planda alır; açık sayfa sahne geçişinde değişir (stage.page), her kare kendi zaman damgasıyla saklanır
function startRecording(stage, dir) {
    const frames = [];
    let running = true;
    const started = performance.now();
    const loop = (async () => {
        while (running) {
            try {
                const { page } = stage;
                const { data } = await page.cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95 }, page.sid);
                const file = join(dir, `${String(frames.length).padStart(5, '0')}.jpg`);
                writeFileSync(file, Buffer.from(data, 'base64'));
                frames.push({ file, at: (performance.now() - started) / 1000 });
            } catch {
                await wait(30); // sayfa geçişi sırasında kısa süre kare alınamayabilir
            }
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
    let current = null;
    try {
        const stage = { page: null };
        let stop = null;
        for (const scene of SCENES) {
            await setStorage(env, { preferredLocale: scene.locale, uiLang: lang, piiSafe: true, onboardingComplete: true });
            const next = await openForm(env, scene.open);
            // Görüntü alanı 1280×800'e sabitlenir; pencere ölçüsü kareleri değiştirmesin
            await next.page.cdp.send('Emulation.setDeviceMetricsOverride',
                { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, next.page.sid);
            await next.page.eval(HIDE_SCROLLBARS);
            await next.page.eval(captionScript(scene.caption[lang]));
            stage.page = next.page;
            if (!stop) stop = startRecording(stage, dir);
            if (current) {
                // Yakalama sürmekte olan eski sayfadan bitene kadar beklenir, sonra kapatılır
                await wait(150);
                await closeForm(current);
            }
            current = next;
            await wait(900); // boş form
            await send(env, next.tabId, { action: 'fill' });
            await wait(2000); // doldurma ve bildirim
        }
        await send(env, current.tabId, { action: 'undo' });
        await wait(1800); // geri alma sonucu
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
        if (current) await closeForm(current).catch(() => {});
        await env.close();
        rmSync(dir, { recursive: true, force: true });
    }
    console.log(`${mp4File}: ${(statSync(mp4File).size / 1024).toFixed(0)} KB`);
    console.log(`${gifFile}: ${(statSync(gifFile).size / 1024).toFixed(0)} KB`);
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
