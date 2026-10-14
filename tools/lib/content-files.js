// Doldurma betiklerinin yükleme sırası. Tek kaynağı scripts/background.js içindeki CONTENT_FILES dizisidir;
// testler ve paket derleyici bu dosyadan okur.
const fs = require('fs');
const path = require('path');

function contentFiles(root = path.join(__dirname, '..', '..')) {
    const src = fs.readFileSync(path.join(root, 'scripts', 'background.js'), 'utf8');
    const match = src.match(/const CONTENT_FILES = (\[[^\]]*\]);/);
    if (!match) throw new Error('scripts/background.js içinde CONTENT_FILES bulunamadı');
    return JSON.parse(match[1].replace(/'/g, '"'));
}

module.exports = { contentFiles };
