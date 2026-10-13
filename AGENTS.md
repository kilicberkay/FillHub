# Filler Max — Ajan Notları

## Proje Özeti
MV3 Chrome uzantısı. Derleme adımı, paket yöneticisi ve test altyapısı yok; kaynak dosyalar
doğrudan "unpacked extension" olarak yüklenir. Doldurma mantığı sayfa bağlamında içerik betiği
olarak çalışır.

## Dosya Yapısı
- `manifest.json` — MV3 tanımı. İçerik betiği `all_frames: true` ile her çerçevede çalışır;
  izinler `storage` ve `contextMenus` ile sınırlıdır.
- `scripts/generator.js` — `FakeDataGenerator` (locale havuzları, `generate(type, locale, context)`).
  Tarayıcıda global, Node'da `module.exports` olarak kullanılabilir.
- `scripts/content.js` — doldurma motoru: alan tespiti (`identifyField`), değer yazma
  (`assignFieldValue`), dosya/select/radio/tarih-picker yolları, geri alma (`undoFill`),
  mesaj dinleyicisi.
- `scripts/background.js` — servis çalışanı: sağ tık menüleri, kısayollar, simge tıklaması.
- `options/` — ayar sayfası (`generator.js` betik olarak yüklenir); persona/şablon yönetimi burada.
- `icons/` — araç çubuğu/sayfa ikonları: `logo16/48/128.png`. Vektör kaynak `icons/logo.svg`;
  PNG'ler bu SVG'den üretilir (marka grafiği: indigo degrade + beyaz şimşek). Sürüm etiketi ayar
  sayfasında `manifest.json` sürümünden okunur, ayrıca yazılmaz.

## Değişmez Kurallar
- Değer yazımı tek noktadan yapılır: `setNativeValue` / `assignFieldValue`. Doğrudan
  `input.value = ...` ataması yapılmaz (React/Vue senkronizasyonu ve dosya alanı hataları).
- Dosya alanları `DataTransfer` + `File` ile doldurulur; `webkitdirectory` alanları atlanır.
  `multiple` alanlara iki dosya yazılır (`ad.pdf`, `ad-2.pdf`).
- Dosya alanlarında görünürlük kontrolü uygulanmaz (gizli dosya alanı standarttır).
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
  tespit edip kaydeder (`detectDefaultCountry` / `detectDefaultUiLang`); `getCountryForLanguage`
  önce ülke kodu, sonra dil eşlemesi arar.
- HTML5 kısıtları uygulanır: `pattern` desteklenen alt kümedeyse tip mantığından önce karşılanır
  (ör. `\d{11}` → `55555555555`), `min`/`max` `date`/`datetime-local`/`time`/`month`/`week`
  alanlarında sözlüksel olarak kırpılır, `minlength` altındaki metin `x` ile doldurulur.
- Metin alanlarında önce örnek şekil uyumu denenir (`generateFromPattern` /
  `fillFromShape`, ör. `Orn: 2024/123`, `inputmode="numeric"`); desteklenmeyen kalıpta Lorem'e
  düşülür. HTML gövde yalnızca çok satırlı (`textarea`) alanlara yazılır.
- Telefon alanı tespiti kelime sınırı kullanır: `tel`, `tel_no`, `tel-no` eşleşir; `hotel`,
  `total` gibi kelimeler eşleşmez.
- Devre dışı denetimler doldurulmaz: `fillField` girişindeki `isControlDisabled` denetimi kendi
  `disabled` niteliğini ve `fieldset[disabled]` ebeveynini tek noktadan dışlar (input, textarea,
  select, checkbox/radio, radio grubu seçimi).
- `readonly` alanlara doğrudan değer yazılmaz; tek istisna takvim etkileşimiyle doldurulan tarih
  alanlarıdır (yerel tipli `date`/`datetime-local`/`time`/`month`/`week` alanları atlanır).
- Onay kutuları varsayılan olarak %50 olasılıkla işaretlenir; `required` ve
  `aria-required="true"` kutular her zaman işaretlenir. `checkAllBoxes` ayarı (varsayılan kapalı)
  rastgeleliği kapatıp tüm kutuları işaretler. Rastgele mod yalnız "işaretle" kararı verir;
  hâlihazırda işaretli kutuyu boşaltmaz. Radio davranışı değişmez (grup başına tek seçim).
- Captcha bypass'ı yalnız gerçek widget'ları hedefler: `grecaptcha.execute` / `turnstile.execute`
  çağrıları ve reCAPTCHA/Turnstile iframe'lerine odaklanma + `#recaptcha-anchor` tıklaması.
  Etiket metnine ("robot"/"human"/"captcha") bakıp DOM checkbox'ı zorlamak yoktur; sayfadaki her
  onay kutusu — captcha kelimesi geçen etiketler dahil — tek politikaya tabidir. Etiket tıklaması
  (`label.click()`) kutuyu geri aldığı için captcha yolunda da kullanılmaz.
- Otomatik gönderim yalnız gerçek gönderim kontrollerine basar (`button[type=submit]`,
  `input[type=submit]`, `input[type=image]`, form içi tipsiz `button`); `role="button"` gibi sahte
  butonlar ve yıkıcı/ikincil metinli kontroller (İptal, Sil, Temizle, Reset...) dışarıda kalır.
- Kullanıcıya görünen metinler ve kod yorumları Türkçe/İngilizce mevcut düzenle uyumlu tutulur.

## Doğrulama
1. Sözdizimi: değişen her dosya için `node --check <dosya>`.
2. Uçtan uca: unpacked uzantı gerçek Chromium'da yüklenir, örnek bir sayfada doldurma/geri alma
   tetiklenir ve alan değerleri DOM üzerinden okunur. Chrome (markalı) sürümleri
   `--load-extension` bayrağını reddettiği için Chrome for Testing ya da Chromium kullanılmalıdır.
3. Dosya değerleri `input.files[0].name/type`; picker değerleri hem input hem kütüphane durumu
   (`selectedDates`) üzerinden doğrulanır.
4. İçerik betiği ayrı bir "isolated world" içinde çalışır: sayfanın `Math.random` gibi global
   yamaları içerik betiğini etkilemez. Deterministik test için pinleme işlemi içerik betiğinin
   kendi dünya kimliği (CDP execution context) üzerinden yapılmalıdır.
5. Pencere odaklı değilken (headless/arka plan sekmesi) `focus()`/`blur()` gerçek olay üretmez;
   picker gibi etkileşimler bu yüzden sentetik `focus`/`blur` olayı da yayınlar.
6. Uçtan uca senaryolarda gerçek veri havuzu karşılaştırmaları için depolamaya açıkça
   `piiSafe: false` yazılmalı; aksi hâlde taze kurulum varsayılanı (PII Safe açık) devreye girer.
   Dile bağlı davranışlar tarayıcı dili sabitlenerek doğrulanır (ör. `FFP_LANG=en-US`).
7. Alan koruma (readonly/disabled), readonly tarih carve-out'u ve rastgele onay kutusu modu
   `guards` senaryosuyla; HTML5 kısıtları `patterns` senaryosuyla koşulur. Onay kutusu modu
   ayarının varsayılanı ve kalıcılığı options sayfası üzerinden (`usability`) doğrulanır.
   Etiket metni robot/human/captcha olan kutuların da rastgele politikadan sapmadığı
   `captchalabels` senaryosuyla (`%TEMP%\ffp-fixture\captcha.html`) doğrulanır.
