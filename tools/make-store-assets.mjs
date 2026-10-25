// Mağaza görselleri: her arayüz dili için tanıtım kutuları (440×280, 1400×560) ve 1280×800 ekran görüntüleri
// (gerçek uzantıdan), ayrıca dil bağımsız simge ve sosyal önizleme. Dil adları extension/_locales ile aynıdır.
// Gereksinim: Chromium (CHROME_BIN veya Playwright önbelleği), rsvg-convert. Simge için ImageMagick (isteğe bağlı).
// Kullanım: node tools/make-store-assets.mjs            (15 dilin tümü)
//           node tools/make-store-assets.mjs ja zh_CN   (yalnız verilen diller; kesilen üretimi sürdürmek için)
import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { startEnv, setStorage, openForm, send, closeForm, ROOT } from '../tests/e2e/harness.mjs';
import { PageSession, wait } from './lib/browser.mjs';

const OUT = join(ROOT, 'store', 'assets');
const SHOTS = join(OUT, 'screenshots');
const PROMO = join(OUT, 'promo');
const LOCALES = readdirSync(join(ROOT, 'extension', '_locales')).sort();

// Simge: 128 px tuval, 96 px sanat + 16 px şeffaf kenar (Chrome Web Store kuralı)
function makeIcon() {
    const svg = join(ROOT, 'extension', 'icons', 'logo.svg');
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

// Dil adı → tarayıcı yerel ayarı (ülke ve dil profili için). Arayüz dili kodu (uiLang) farklıdır: pt_BR → pt, zh_CN → zh.
const LOCALE_OF = { en: 'en-US', tr: 'tr-TR', es: 'es-MX', fr: 'fr-FR', de: 'de-DE', pt_BR: 'pt-BR', ru: 'ru-RU', zh_CN: 'zh-CN',
    ja: 'ja-JP', ar: 'ar-EG', hi: 'hi-IN', bn: 'bn-BD', ur: 'ur-PK', id: 'id-ID', vi: 'vi-VN' };
const UI_CODE = { pt_BR: 'pt', zh_CN: 'zh' };
// Demo formu: tr ve en yerleşik fixture'lardır; diğer diller tests/e2e/fixtures/form-<kod>.html kullanır
const FORM_CODE = { ar: 'ar', bn: 'bn', de: 'de', es: 'es', fr: 'fr', hi: 'hi', id: 'id', ja: 'ja', pt_BR: 'pt', ru: 'ru',
    ur: 'ur', vi: 'vi', zh_CN: 'zh' };

// Her dil için tanıtım kutusu metinleri (kısa satırlar: kutu genişliğine sığmalı). Marka adı çevrilmez.
const TEXT = {
    ar: { l1: 'بيانات وهمية واقعية ومتسقة', l2: 'لنماذج الويب بـ 15 لغة.', footer: 'مفتوح المصدر · MIT · وضع آمن', tagline: 'املأ نماذج الويب ببيانات وهمية واقعية ومتسقة بـ 15 لغة.', features: 'وضع آمن · تراجع · بلا جمع بيانات' },
    bn: { l1: 'বাস্তবসম্মত ও সামঞ্জস্যপূর্ণ নকল ডেটা', l2: 'ওয়েব ফর্মের জন্য, ১৫ ভাষায়।', footer: 'ওপেন সোর্স · MIT · নিরাপদ মোড', tagline: '১৫ ভাষায় বাস্তবসম্মত নকল ডেটা দিয়ে ওয়েব ফর্ম পূরণ করুন।', features: 'নিরাপদ মোড · পূর্বাবস্থায় ফেরান · কোনো ডেটা সংগ্রহ নেই' },
    de: { l1: 'Realistische, konsistente Testdaten', l2: 'für Webformulare in 15 Sprachen.', footer: 'OPEN SOURCE · MIT · DATENSCHUTZMODUS', tagline: 'Webformulare mit realistischen Testdaten in 15 Sprachen füllen.', features: 'DATENSCHUTZMODUS · RÜCKGÄNGIG · KEINE DATENERHEBUNG' },
    en: { l1: 'Realistic, consistent fake data for', l2: 'web forms in 15 languages.', footer: 'OPEN SOURCE · MIT · PRIVACY-SAFE MODE', tagline: 'Fill web forms with realistic, consistent fake data in 15 languages.', features: 'PRIVACY-SAFE MODE · UNDO · NO DATA COLLECTION' },
    es: { l1: 'Datos ficticios realistas y coherentes', l2: 'para formularios web en 15 idiomas.', footer: 'CÓDIGO ABIERTO · MIT · MODO SEGURO', tagline: 'Rellena formularios web con datos ficticios realistas en 15 idiomas.', features: 'MODO SEGURO · DESHACER · SIN RECOPILAR DATOS' },
    fr: { l1: 'Données fictives réalistes et', l2: 'cohérentes en 15 langues.', footer: 'OPEN SOURCE · MIT · MODE SÛR', tagline: 'Remplissez des formulaires web avec des données fictives réalistes.', features: 'MODE SÛR · ANNULER · AUCUNE COLLECTE DE DONNÉES' },
    hi: { l1: 'यथार्थवादी और सुसंगत नकली डेटा', l2: 'वेब फ़ॉर्म के लिए, 15 भाषाओं में।', footer: 'ओपन सोर्स · MIT · सुरक्षित मोड', tagline: '15 भाषाओं में यथार्थवादी नकली डेटा से वेब फ़ॉर्म भरें।', features: 'सुरक्षित मोड · पूर्ववत करें · कोई डेटा संग्रह नहीं' },
    id: { l1: 'Data palsu yang realistis dan', l2: 'konsisten untuk formulir web.', footer: 'SUMBER TERBUKA · MIT · MODE AMAN', tagline: 'Isi formulir web dengan data palsu yang realistis dalam 15 bahasa.', features: 'MODE AMAN · BATALKAN · TANPA PENGUMPULAN DATA' },
    ja: { l1: '現実的で一貫した架空データで', l2: 'ウェブフォームを入力します。', footer: 'オープンソース · MIT · 安全モード', tagline: '15言語で、現実的で一貫した架空データを使ってウェブフォームを入力。', features: '安全モード · 元に戻す · データ収集なし' },
    pt_BR: { l1: 'Dados fictícios realistas e', l2: 'consistentes em 15 idiomas.', footer: 'CÓDIGO ABERTO · MIT · MODO SEGURO', tagline: 'Preencha formulários web com dados fictícios realistas em 15 idiomas.', features: 'MODO SEGURO · DESFAZER · SEM COLETA DE DADOS' },
    ru: { l1: 'Реалистичные и согласованные', l2: 'тестовые данные для веб-форм.', footer: 'ОТКРЫТЫЙ КОД · MIT · БЕЗОПАСНО', tagline: 'Заполняйте веб-формы реалистичными тестовыми данными на 15 языках.', features: 'БЕЗОПАСНЫЙ РЕЖИМ · ОТМЕНА · БЕЗ СБОРА ДАННЫХ' },
    tr: { l1: '15 dilde gerçekçi ve tutarlı', l2: 'sahte verilerle web formları.', footer: 'AÇIK KAYNAK · MIT · GÜVENLİ MOD', tagline: '15 dilde gerçekçi ve tutarlı sahte verilerle web formlarını doldurun.', features: 'GÜVENLİ MOD · GERİ AL · VERİ TOPLAMA YOK' },
    ur: { l1: 'حقیقی اور ہم آہنگ جعلی ڈیٹا', l2: 'ویب فارمز کے لیے، 15 زبانوں میں۔', footer: 'اوپن سورس · MIT · محفوظ موڈ', tagline: '15 زبانوں میں حقیقی جعلی ڈیٹا سے ویب فارم بھریں۔', features: 'محفوظ موڈ · واپس کریں · کوئی ڈیٹا جمع نہیں' },
    vi: { l1: 'Dữ liệu giả thực tế, nhất quán', l2: 'cho biểu mẫu web trong 15 ngôn ngữ.', footer: 'MÃ NGUỒN MỞ · MIT · AN TOÀN', tagline: 'Điền biểu mẫu web bằng dữ liệu giả thực tế và nhất quán.', features: 'CHẾ ĐỘ AN TOÀN · HOÀN TÁC · KHÔNG THU THẬP DỮ LIỆU' },
    zh_CN: { l1: '以真实且一致的虚构数据', l2: '填写网页表单，支持 15 种语言。', footer: '开源 · MIT · 安全模式', tagline: '以 15 种语言的真实且一致虚构数据填写网页表单。', features: '安全模式 · 撤销 · 不收集任何数据' },
};

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Tanıtım kutuları: SVG şablonundaki @YER_TUTUCU@ alanları dile göre doldurulur ve simge gömülür;
// rsvg-convert ile PNG'ye çevrilir (tarayıcı gerektirmez). Yazı tipi seçimi için fontconfig ortamı yeterlidir.
function renderTile(src, out, fields) {
    const icon = `data:image/png;base64,${readFileSync(join(ROOT, 'extension', 'icons', 'logo128.png')).toString('base64')}`;
    let svg = readFileSync(join(OUT, 'src', src), 'utf8').replace('ICON_HREF', icon);
    for (const [key, value] of Object.entries(fields)) svg = svg.split(`@${key}@`).join(xml(value));
    const tmp = join(OUT, 'src', src.replace('.svg', '.generated.svg'));
    writeFileSync(tmp, svg);
    const { width, height } = svg.match(/width="(?<width>\d+)" height="(?<height>\d+)"/).groups;
    execFileSync('rsvg-convert', ['-w', width, '-h', height, '-o', out, tmp]);
    rmSync(tmp);
    return out;
}

function tilesFor(locale) {
    const t = TEXT[locale];
    const dir = join(PROMO, locale);
    mkdirSync(dir, { recursive: true });
    return [
        renderTile('promo-small.svg', join(dir, 'promo-small-440x280.png'), { L1: t.l1, L2: t.l2, FOOTER: t.footer }),
        renderTile('promo-marquee.svg', join(dir, 'promo-marquee-1400x560.png'), { TAGLINE: t.tagline, FEATURES: t.features }),
    ];
}

async function captureScreenshots(env, locale, dir) {
    mkdirSync(dir, { recursive: true });
    const uiLang = UI_CODE[locale] || locale;
    const done = [];
    for (const shot of SHOT_PLAN) {
        if (shot.kind === 'fill') {
            await setStorage(env, { preferredLocale: LOCALE_OF[locale], piiSafe: true, uiLang, onboardingComplete: true });
            const form = await openForm(env, locale === 'tr' ? { lang: 'tr' } : locale === 'en' ? { lang: 'en' } : { fixture: FORM_CODE[locale] });
            try {
                await send(env, form.tabId, { action: 'fill' });
                await wait(400);
                done.push(await form.page.screenshot(join(dir, shot.file)));
            } finally {
                await closeForm(form);
            }
            continue;
        }
        await setStorage(env, { uiLang, theme: shot.theme, onboardingComplete: true, preferredLocale: LOCALE_OF[locale] });
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

// CDP çağrısını zaman aşımına bağlar: takılan bir adım sessizce kaybolmasın
const withTimeout = (p, ms, label) => Promise.race([
    p,
    wait(ms).then(() => { throw new Error(`zaman aşımı: ${label}`); }),
]);

async function withRetry(label, run) {
    for (let attempt = 1; ; attempt++) {
        try {
            return await run();
        } catch (e) {
            if (attempt >= 2) throw e;
            console.log(`yeniden deneniyor (${label}): ${e.message.split('\n')[0]}`);
        }
    }
}

async function main() {
    console.log('simge:', makeIcon());
    const only = process.argv.slice(2);
    const locales = only.length ? LOCALES.filter((l) => only.includes(l)) : LOCALES;

    // Sosyal önizleme dil bağımsızdır (GitHub depo ayarında kullanılır); İngilizce metinle üretilir
    const social = renderTile('promo-social.svg', join(OUT, 'social-preview-1280x640.png'), {});
    console.log('sosyal önizleme:', social.split('/').pop());

    for (const locale of locales) {
        console.log(`tanıtım kutuları (${locale}):`, tilesFor(locale).map((p) => p.split('/').pop()).join(', '));
    }

    const env = await startEnv();
    try {
        for (const locale of locales) {
            const dir = join(SHOTS, locale);
            const shots = await withRetry(locale, () => withTimeout(captureScreenshots(env, locale, dir), 240000, `ekran görüntüleri ${locale}`));
            console.log(`ekran görüntüleri (${locale}):`, shots.map((p) => p.split('/').pop()).join(', '));
        }
    } finally {
        await env.close();
    }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
