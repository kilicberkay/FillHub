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
- Dosya alanlarında görünürlük kontrolü uygulanmaz (gizli dosya alanı standarttır).
- Tarih alanlarında önce picker etkileşimi denenir (air-datepicker v2/v3 DOM sözleşmesi),
  başarısız olursa değer doğrudan yazılır.
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
- Metin alanlarında önce `pattern`/örnek şekil uyumu denenir (`generateFromPattern` /
  `fillFromShape`, ör. `Orn: 2024/123`, `inputmode="numeric"`); desteklenmeyen kalıpta Lorem'e
  düşülür. HTML gövde yalnızca çok satırlı (`textarea`) alanlara yazılır.
- Telefon alanı tespiti kelime sınırı kullanır: `tel`, `tel_no`, `tel-no` eşleşir; `hotel`,
  `total` gibi kelimeler eşleşmez.
- Devre dışı denetimler doldurulmaz: checkbox/radio dalı `disabled` niteliğini ve
  `fieldset[disabled]` ebeveynini dışlar (radio grubu ve select filtreleriyle aynı kural).
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
