# FillHub — Ajan Notları

## Proje Özeti
MV3 Chrome uzantısı (sürüm 1.2.0). Çalışma zamanında bağımlılık yok; kaynak dosyalar doğrudan
"unpacked extension" olarak yüklenir. Geliştirme araçları npm ile gelir: Tailwind CLI (`npm run build:css`),
testler (`npm test`, `npm run test:quick`) ve mağaza paketi (`npm run build` → `dist/fillhub-<sürüm>.zip`).
Doldurma mantığı sayfa bağlamında içerik betiği olarak çalışır.

## Dosya Yapısı
- `manifest.json` — MV3 tanımı. İçerik betikleri manifestte tanımlı değildir; `background.js` içindeki `CONTENT_FILES` listesi,
  kullanıcı doldurmayı başlattığında `chrome.scripting` ile her çerçeveye (eksik olanlara) enjekte edilir.
  İzinler `storage`, `contextMenus` ve `scripting` ile sınırlıdır.
- `scripts/locale-data.js` — `FillHubLocaleData`: 15 dilin havuzları (ad, soyad, Latin karşılıklar,
  UI havuzları) ve 15 ülkenin profilleri (şehir+posta öneki, telefon, adres şablonu, kimlik/IBAN belirtimi).
- `scripts/id-rules.js` — `FillHubIdRules`: kimlik/vergi algoritmaları (sağlama vs. biçim ayrımıyla).
- `scripts/field-detect.js` — `FillHubDetect`: alan sınıflandırması (`classify`), jeton eşleştirme, öncelikli
  kurallar; `input.type` ve `autocomplete` sinyalleri etiketten önce gelir. Korpus: `tests/unit/field-corpus.mjs`.
- `scripts/generator.js` — `FakeDataGenerator`: yerel çözümleme (`canonicalLocale`, `resolveLocale`),
  `createPerson` (doldurma başına tutarlı kişi), `generate(type, locale, context)`.
  Tarayıcıda global, Node'da `module.exports` olarak kullanılabilir. Yükleme sırası: locale-data → id-rules → field-detect → generator → content.
  Persona göçü (`migrateProfiles`) ve etkin kimlik (`activeIdentity`) burada; içerik betiği de bunları kullanır.
- `tools/verify-data.js` — bağımlılıksız denetim (`node tools/verify-data.js`): bilinen vektörler, harita
  bütünlüğü, 15 ülkede 300'er kişi, i18n anahtar eşleşmesi.
- `scripts/content.js` — doldurma motoru (captcha: yalnız vurgulama ve bildirim): alan tespiti (`identifyField`), değer yazma
  (`assignFieldValue`), dosya/select/radio/tarih-picker yolları, geri alma (`undoFill`),
  mesaj dinleyicisi.
- `scripts/background.js` — servis çalışanı: sağ tık menüleri (`chrome.i18n`), kısayollar, simge tıklaması.
- `options/` — ayar sayfası (`generator.js` betik olarak yüklenir); persona/şablon yönetimi burada.
  - `ui.src.css` — tasarım kaynağı: `@theme` tokenları (marka skalası, gölgeler), `@utility` yardımcıları,
    form taban kuralları, `@font-face`. `@source` ile yalnızca `options.html` ve `options.js` taranır.
  - `options.css` — **üretilmiş**, elle düzenlenmez: `npm run build:css` (Tailwind CLI 4.3.3, küçültülmüş).
    `ui.src.css`, `options.html` veya `options.js` sınıf içerdiğinde yeniden üretilmelidir.
  - `i18n.js` — ayar sayfası metinleri, 15 dil; her dilde aynı anahtar kümesi (`tools/verify-data.js` ve birim testi denetler).
  - `fonts/` — Geist ve Geist Mono `woff2` dosyaları (SIL OFL 1.1; lisans `fonts/OFL.txt`). Google Fonts bağlantısı yoktur.
  - Yeni bileşen eklerken mevcut sınıf sözleşmesini kullanın (`text-muted`, `text-soft`, `text-strong`, `meta`,
    `eyebrow`, `chip`, `chip-active`, `table-head`, `focus-ring`, `ui-checkbox`).
- `_locales/` — 15 dilde `extName`, `extDescription` (≤132 karakter), `actionTitle`, komut ve bağlam menüsü
  başlıkları. `manifest.json` bu anahtarları `__MSG_…__` ile kullanır; `background.js` menüleri `chrome.i18n` ile kurar.
- `icons/` — araç çubuğu/sayfa ikonları: `logo16/48/128.png`. Vektör kaynak `icons/logo.svg`;
  PNG'ler `rsvg-convert -w <boy> -h <boy> icons/logo.svg` ile üretilir (marka grafiği: pembe degrade
  `#fb7aa8 → #f74a87 → #c2185b` üstünde beyaz "F" ve merkez düğümü). Sürüm etiketi ayar sayfasında
  `manifest.json` sürümünden okunur, ayrıca yazılmaz.
- `tests/unit/` — `node --test` birim testleri (alan korpusu, kimlik vektörleri, üreteç, persona göçü, statik denetimler).
- `tests/e2e/` — gerçek Chromium'da uzantı testleri. `harness.mjs` yerel form sunucusu, `fixtures/form.html` (TR) ve
  `form-en.html` (EN) sağlar; uzantının servis çalışanı üzerinden komut gönderir.
- `tools/` — `check-syntax.js`, `run-tests.js`, `verify-data.js`, `build.js` (zip), `make-store-assets.mjs`
  (mağaza görselleri), `lib/browser.mjs` (CDP istemcisi).
- `store/` — Chrome Web Store materyali: ilan metinleri (EN/TR), izin gerekçeleri, görseller. Pakete girmez.
- `docs/ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `PRIVACY.md`, `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, `LICENSE` (MIT).
- `.github/` — CI (`ci.yml`), yayın (`release.yml`), şablonlar, `FUNDING.yml`.

## Değişmez Kurallar
- Değer yazımı tek noktadan yapılır: `setNativeValue` / `assignFieldValue`. Doğrudan
  `input.value = ...` ataması yapılmaz (React/Vue senkronizasyonu ve dosya alanı hataları).
  Zengin metin alanları (`contenteditable`, `isRichEditable`) da `assignFieldValue` içinden geçer ve
  `setRichText` ile yazılır: önce editörün `execCommand('insertText')` yolu, yoksa doğrudan metin.
  Geri alma bu alanlarda `snapshotField` içindeki `text` değerini kullanır.
- Dosya alanları `DataTransfer` + `File` ile doldurulur; `webkitdirectory` alanları atlanır.
  `multiple` alanlara iki dosya yazılır (`ad.pdf`, `ad-2.pdf`).
- Dosya alanlarında görünürlük kontrolü uygulanmaz (gizli dosya alanı standarttır).
- Üretilen tarihlerde yıl 2000 ile içinde bulunulan yıl arasından rastgele seçilir (`date`,
  `datetime`; dolayısıyla `month`/`week` alanları da); ay 1-12, gün 1-28 aralığındadır.
  Sabit "bu yıl" tekrarı yapılmaz.
- Geniş yıl aralığı aylık tıklama bütçesini aşar: uzak hedeflerde takvim önce yıl görünümüne
  atlanır (v3 klavye kısayolları `Shift+Ok` ±1 yıl, `Alt+Ok` ±10 yıl; v2'de başlıkla yıl
  görünümü + on yıl gezinmesi + yıl ve ay hücresi). Atlama başarısızsa ve hedef hâlâ
  `PICKER_NAV_LIMIT` ayından uzaksa hiç tıklama yapılmaz, doğrudan yazım yedeği devralır.
- Tarih alanlarında önce picker etkileşimi denenir (air-datepicker v2/v3 DOM sözleşmesi),
  başarısız olursa değer doğrudan yazılır. Picker konteyneri ilk açılışta oluştuğu için, sayfada
  henüz konteyner yoksa yazılabilir alanda açma denemesi yapılmaz; `readonly` alanda tek yol
  takvim olduğundan deneme sürdürülür ve takvim açılmazsa alan tümüyle atlanır.
- Maskeli tarih widget'ları (`x_date_display` görünen alan + `x` gizli alan): görünen alana
  placeholder/pattern'den tespit edilen yerel biçim (ör. `gg.aa.yyyy` → `15.07.2026`), gizli alana
  ISO yazılır. Sayfa betiği kendi olay işleyicisiyle gizli alanı doldurduysa değeri ezilmez.
- Uzun süren işler `pendingTasks` kuyruğuna eklenir ve `drainTasks()` ile seri çalıştırılır;
  mesaj yanıtı yalnız iş bittikten sonra gönderilir (`return true`).
- Taze kurulum varsayılanları içerik betiğinin mesaj dinleyicisinde normalize edilir: `piiSafe`
  hiç kaydedilmemişse `true`, `preferredLocale` yoksa `navigator.language`; ayarlarda açıkça
  `false` yazılmışsa korunur. Ayar sayfasının ilk kurulumu ülke ve arayüz dilini tarayıcıdan
  tespit edip kaydeder (`detectDefaultCountry` / `detectDefaultUiLang`). Tercih, ülke seçicisiyle aynı
  kanonik biçimde (`xx-YY`) saklanır; `detectDefaultCountry` tarayıcı dilini `canonicalLocale` ile çevirir.
- HTML5 kısıtları uygulanır: `pattern` desteklenen alt kümedeyse tip mantığından önce karşılanır
  (ör. `\d{11}` → `55555555555`), `min`/`max` `date`/`datetime-local`/`time`/`month`/`week`
  alanlarında sözlüksel olarak kırpılır, `minlength` altındaki metin `x` ile doldurulur.
- Metin alanlarında önce örnek şekil uyumu denenir (`generateFromPattern` /
  `fillFromShape`, ör. `Orn: 2024/123`, `inputmode="numeric"`); desteklenmeyen kalıpta Lorem'e
  düşülür. HTML gövde yalnızca çok satırlı (`textarea`) alanlara yazılır. Metin üretimi yerel dilin
  örnek cümlelerinden yapılır (`sampleShort` tek satır, `sampleLong` çok satır); `maxlength` kelime
  sınırında kırpılır (`trimToLength`). Lorem yerine İngilizce yedek yalnızca dil havuzu yoksa kullanılır.
- Telefon alanı tespiti kelime sınırı kullanır: `tel`, `tel_no`, `tel-no` eşleşir; `hotel`,
  `total` gibi kelimeler eşleşmez.
- Devre dışı denetimler doldurulmaz: `fillField` girişindeki `isControlDisabled` denetimi kendi
  `disabled` niteliğini ve `fieldset[disabled]` ebeveynini tek noktadan dışlar (input, textarea,
  select, checkbox/radio, radio grubu seçimi).
- `readonly` alanlara doğrudan değer yazılmaz; tek istisna takvim etkileşimiyle doldurulan tarih
  alanlarıdır (yerel tipli `date`/`datetime-local`/`time`/`month`/`week` alanları atlanır).
- Onay kutuları her doldurmada hedef duruma getirilir (üst üste doldurma birikmez). Karar sırası:
  `required` / `aria-required="true"` ve radio → işaretli; `checkAllBoxes` (varsayılan kapalı) → işaretli;
  pazarlama (`classifyCheckbox`: bülten, kampanya, newsletter, marketing…) → işaretsiz; gizlilik/şart/KVKK/
  açık rıza → işaretli, yalnız `consentBoxes` ayarı açıksa (varsayılan açık); diğerleri %50 çekilişle.
  Hedef durum zaten sağlanıyorsa kutuya hiç yazılmaz. `undo` dolum öncesi durumu geri yükler. Radio'da
  rastgelelik uygulanmaz (grup başına tek seçim). Sınıflandırıcı etiket metnine bakar; "robot/human/captcha"
  etiketleri bu politikanın dışında tutulmaz, genel kurala tabidir.
- Captcha'lara otomatik müdahale edilmez: içerik betiği captcha'ya tıklamaz, çözmez ve `grecaptcha` /
  `turnstile` / `hcaptcha` API'lerini çağırmaz. Yalnızca görünür bir captcha (`CAPTCHA_SELECTORS`) varsa öğe
  vurgulanır ve "captcha'yı kendiniz tamamlayın" bildirimi gösterilir; doğrulamayı kullanıcı tamamlar.
  Captcha kelimesi geçen etiketler dahil her onay kutusu genel onay kutusu politikasına tabidir; etiket
  tıklaması (`label.click()`) kutuyu geri aldığı için kullanılmaz.
- Otomatik gönderim yalnız gerçek gönderim kontrollerine basar (`button[type=submit]`,
  `input[type=submit]`, `input[type=image]`, form içi tipsiz `button`); `role="button"` gibi sahte
  butonlar ve yıkıcı/ikincil metinli kontroller (İptal, Sil, Temizle, Reset...) dışarıda kalır.
- Kullanıcıya görünen metinler ve kod yorumları Türkçe/İngilizce mevcut düzenle uyumlu tutulur.
- Yerel çözümleme (`canonicalLocale`): çıplak dil kodu dildir (`ar`→`ar-EG`, `es`→`es-MX`, `pt`→`pt-BR`,
  `vi`→`vi-VN`); bölgeli kod bölgeyi korur (`es-AR`); çıplak ülke kodu yalnız dil değilse ülkedir (`us`→`en-US`).
  `ar`, `es`, `pt` gibi kodlar hem dil hem ülke olduğu için eski kayıtlarda (seçici eski değerleri) dil olarak
  okunur; bu kayıtlar seçici yeniden seçilince düzelir. Hedef dışı ülkeler (ör. GB, ES, IT) kendi dillerinin
  varsayılan ülke profilini kullanır; ülkeye özgü veri yoktur.
- Kişi modeli: doldurma başına tek `createPerson` kaydı; ad, soyad, şehir, posta, telefon, kimlik ve IBAN
  birbiriyle tutarlıdır. Rusça soyadı cinsiyete göre çekimlenir; soyadı/baba adı `patronymicsM` ile eşlenir.
- Yazı tercihi: dil Latin ise Latin; değilse etiket yazısına (`detectFieldScript`) göre yerel veya Latin,
  etiket yoksa ülkenin `defaultScript`'i. E-posta yerel kısmı her zaman Latin karşılıktan (`person.first.l`)
  üretilir; `slug` ı/đ/ß/ø/ł harflerini de açar.
- Kimlik sağlaması yalnız bilinen test vektörleriyle doğrulanan algoritmalarda iddia edilir (TCKN, CPF, CNPJ,
  CN kimliği, Aadhaar/Verhoeff, SNILS, INN-10, My Number, NIR, CURP, IBAN). VKN, INN-12 ve diğer resmi
  numaralar yalnız biçimdir (`check: 'format'`/`'algorithm'`); geçerliliği iddia edilmez.
- Adres bileşenleri şehre bağlıdır: ilçe önce şehrin kendi listesinden (`city.districts`, şimdilik TR),
  şehre özgü olmayan bir parça (ilçe/semt/mahalle) yoksa adres şablonundan çıkarılır. Yeni şehir verisi
  eklenirken ilçe ve sokak da o şehre göre girilir.
- Alan tespiti sırası: `input.type` (email/tel/url/…) → `autocomplete` jetonu (`AUTOCOMPLETE_TYPES`) →
  `FIELD_PATTERNS` (her metin kaynağı ayrı denenir; etiket için `labelOwnText` kullanılır, `select` seçenek
  metinleri alan adına karışmaz). `taxId`, `idNumber`'dan önce denenir ("Vergi Kimlik No" → vergi).
- `preferredLocale` seçildiğinde `country` select'i ISO2 veya İngilizce/yerel ad ile eşleşen seçeneği seçer
  (`selectOptionMatches`); `state` ve `phoneCode` select'leri de aynı yolla.
- Ayar sayfasında tema `<html>` üzerindeki `.dark` sınıfıyla uygulanır; tercih `state.theme` olarak
  `chrome.storage.local`'de tutulur. `options.js` mantığı ve i18n tablosu HTML `id`'lerine bağlıdır:
  bir `id` değiştirilirse `options.js` ile birlikte güncellenir.
- Chrome, uzantı seçenek sayfasına katmansız bir `body { font-family: "Noto Sans"; font-size: 75% }`
  kuralı enjekte eder; bu kural `@layer` içindeki `font-sans` sınıfını geçer. Gövde yazı tipi ve
  boyutu bu yüzden `ui.src.css` içinde `html body` ile sabitlenir. Düz web sayfalarında görülmez.
- Ayar sayfasında kullanıcı girdisi (ör. CSS seçici) `innerHTML` ile yazılmaz; `textContent` kullanılır.
- Bildirim kartı (`showToast`) açık/koyu yüzeyini `settings.theme` ile seçer; sayfa stillerinden
  bağımsız, inline stil kullanır.

## Doğrulama
1. `npm run check` (her JS dosyasında `node --check`) ve `node tools/verify-data.js` (vektörler, harita bütünlüğü,
   15 ülkede 300'er kişi, i18n eşleşmesi).
2. `node --test tests/unit`: alan korpusu, kimlik vektörleri ve sağlama, üreteç çeşitliliği, PII Safe değerleri,
   persona göçü, manifest/yerelleştirme/gizlilik/ayar sayfası kimlik denetimleri.
3. `node --test tests/e2e`: gerçek Chromium'da uzantı yüklenir, form doldurulur ve değerler DOM'dan okunur.
   Chromium `CHROME_BIN` ile ya da Playwright önbelleğinden bulunur; yoksa atlanır. `npm test` hepsini koşturur.
4. Alan tespiti bir etiketi yanlış tanırsa önce `tests/unit/field-corpus.mjs` içine o etiketi ekleyin, sonra kuralı düzeltin.
5. Gerçek veri havuzu karşılaştırmalarında depolamaya açıkça `piiSafe: false` yazılır; taze kurulumda PII Safe açıktır.
6. Ayar sayfası görünümü değişince `npm run build:css`, ardından `node tools/make-store-assets.mjs` ile ekran
   görüntüleri yenilenir ve görsel olarak kontrol edilir.
7. Paket: `npm run build`; zip açılıp `manifest.json`'daki dosyaların hepsinin içinde olduğu doğrulanır.
8. Kimlik sağlaması yalnız bilinen vektörlerle doğrulanan algoritmalarda iddia edilir; biçim-only numaralara
   geçerlilik iddiası yazılmaz.
