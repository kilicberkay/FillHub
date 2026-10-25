// Ekran görüntüsü yardımcıları: kaydırma çubuğunu gizleme ve README için yuvarlak köşeli çerçeve (Chromium ile).
import { readFileSync, writeFileSync } from 'node:fs';
import { PageSession, wait } from './browser.mjs';

// Kaydırma çubuğu kareye girmesin; yalnızca kayıt ve ekran görüntüsü sayfalarına eklenir
export const HIDE_SCROLLBARS = `(() => {
    const s = document.createElement('style');
    s.textContent = 'html{scrollbar-width:none}::-webkit-scrollbar{display:none}';
    document.head.appendChild(s);
})()`;

// PNG boyutu (IHDR); çerçeve ve ekran görüntüsü ölçüleri için
export function pngSize(file) {
    const b = readFileSync(file);
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

// Sayfada tek kullanımlık HTML çizer ve PNG kaydeder (ImageMagick gerekmez; CaptureHub ile aynı yöntem)
export async function renderHtml(cdp, html, file, { width, height, transparent = false }) {
    const page = await PageSession.open(cdp, 'about:blank');
    try {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, page.sid);
        if (transparent) await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }, page.sid);
        const { frameTree } = await cdp.send('Page.getFrameTree', {}, page.sid);
        await cdp.send('Page.setDocumentContent', { frameId: frameTree.frame.id, html }, page.sid);
        await page.waitFor('document.fonts.status === "loaded" && [...document.images].every((i) => i.complete)', 10000);
        await wait(150);
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, page.sid);
        writeFileSync(file, Buffer.from(data, 'base64'));
        return file;
    } finally {
        await page.close();
    }
}

// PNG'nin köşelerini yuvarlar ve ince bir kenarlık ekler; dosyayı yerinde değiştirir
export async function frameImage(cdp, file, { width, height, dark = false, radius = 14 }) {
    const data = readFileSync(file).toString('base64');
    const border = dark ? '#3f3f46' : '#d4d4d8';
    const html = `<style>html,body{margin:0;background:transparent}img{display:block;width:${width}px;height:${height}px;`
        + `border-radius:${radius}px;outline:2px solid ${border};outline-offset:-2px}</style>`
        + `<img src="data:image/png;base64,${data}">`;
    return renderHtml(cdp, html, file, { width, height, transparent: true });
}
