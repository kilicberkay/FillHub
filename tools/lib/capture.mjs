// Ekran görüntüsü yardımcıları: kaydırma çubuğunu gizleme ve README için yuvarlak köşeli çerçeve (ImageMagick).
import { execFileSync } from 'node:child_process';

// Kaydırma çubuğu kareye girmesin; yalnızca kayıt ve ekran görüntüsü sayfalarına eklenir
export const HIDE_SCROLLBARS = `(() => {
    const s = document.createElement('style');
    s.textContent = 'html{scrollbar-width:none}::-webkit-scrollbar{display:none}';
    document.head.appendChild(s);
})()`;

// PNG'nin köşelerini yuvarlar ve ince bir kenarlık ekler; dosyayı yerinde değiştirir
export function frameImage(file, radius = 14) {
    const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', file]).toString().trim().split(' ').map(Number);
    const rect = (x1, y1, x2, y2) => `roundrectangle ${x1},${y1} ${x2},${y2} ${radius},${radius}`;
    execFileSync('magick', [file,
        '-fill', 'none', '-stroke', '#d4d4d8', '-strokewidth', '2', '-draw', rect(1, 1, w - 2, h - 2),
        '(', '+clone', '-fill', 'black', '-colorize', '100', '-fill', 'white', '-draw', rect(0, 0, w - 1, h - 1), ')',
        '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', file]);
}
