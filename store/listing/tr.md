# Chrome Web Store ilanı: FillHub (Türkçe)

**Ad:** FillHub

**Özet (en fazla 132 karakter):**
15 dilde gerçekçi ve tutarlı sahte verilerle web formlarını doldurun. Güvenli mod, geri alma; veri toplama yok.

**Kategori:** Geliştirici Araçları

**Dil:** Türkçe (ad ve özet 14 dilde ayrıca yerelleştirilmiştir)

**Tek amaç:** Geçerli web sayfasındaki form alanlarını sahte test verisiyle doldurmak.

## Açıklama

FillHub, web formlarını gerçekçi ve tutarlı sahte verilerle doldurur. Geliştiriciler ve test uzmanları
kayıt, ödeme ve veri girişi akışlarını elle test değeri yazmadan, gerçek insanların bilgilerini
kullanmadan deneyebilir.

Öne çıkanlar

- 15 dil ve 15 ülke profili. Ad, adres, telefon, şirket ve kimlik numaraları her ülkenin biçimini izler.
- Tutarlı kişi. Her doldurma tek bir kişi üretir; ad, soyad, e-posta, e-posta tekrarı, kullanıcı adı
  ve telefon birbiriyle uyumludur.
- Akıllı alan tespiti. Etiket, ad, autocomplete ipuçları ve giriş türleri birlikte değerlendirilir;
  "Cep telefonu" ya da "Soyadınız" etiketli alan doğru değeri alır.
- Güvenli mod (varsayılan olarak açık). Kişisel tanımlayıcılar belli belirsiz test değerleridir:
  example.com e-postaları, yer tutucu telefonlar ve gerçek kullanım için tasarlanmamış test kimlik numaraları.
- Uç durumları denemek için kaos modu.
- Geri al: son doldurmayı, doldurmadan önceki haline döndürür.
- iframe içindeki formlarda çalışır; JavaScript çerçeveleriyle değer senkronizasyonunu korur.

Nasıl kullanılır

1. Formu içeren bir sayfayı açın.
2. Ctrl+Shift+F (macOS'ta Command+Shift+F) tuşlarına basın ya da FillHub simgesine tıklayın.
3. Geri almak için Ctrl+Shift+U tuşlarına basın.
Tek bir alanı doldurmak için alana sağ tıklayıp "Bu alanı doldur" seçeneğini kullanın.

Gizlilik

FillHub veri toplamaz. Ayarlar tarayıcınızda kalır; uzantı hiçbir veriyi geliştiriciye ya da üçüncü
taraflara göndermez. Gizlilik politikası: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Açık kaynak

FillHub, MIT lisansıyla ücretsiz ve açık kaynaklıdır. Kaynak kod, sorunlar ve katkılar:
https://github.com/kilicberkay/FillHub

Destek

FillHub ücretsizdir. İşinize yardımcı oluyorsa geliştirmeyi GitHub Sponsors üzerinden destekleyebilirsiniz:
https://github.com/sponsors/kilicberkay

Sorumlu kullanım

FillHub test ve geliştirme içindir. Üretilen kimlik numaraları genel sağlama kurallarından geçebilir;
bu nedenle üretilen verileri gerçek başvurularda, satın almalarda ya da kimlik beyanlarında kullanmayın.

## İzin gerekçeleri

- **storage:** kullanıcının ayarlarını (ülke, dil, güvenli mod, özel kurallar, kimlik şablonları) tarayıcıda
  yerel olarak saklar. Hiçbir şey eşitlenmez ya da dışarı gönderilmez.
- **contextMenus:** sağ tık menüsüne "Formu doldur", "Bu alanı doldur" ve "Sahte doldurmayı geri al"
  öğelerini ekler.
- **Tüm sitelere erişim (`<all_urls>`) ve tüm çerçevelerde içerik betikleri:** FillHub, kullanıcının
  doldurmayı seçtiği her sitede (iframe içindeki formlar dahil) çalışır. Yalnızca kullanıcı bir kısayola
  basınca, simgeye tıklayınca ya da bağlam menüsünü kullanınca işlem yapar; arka planda sayfa okumaz.

Uzaktan kod: yok. Uzantı tüm kodunu paketin içinde taşır ve ağ isteği yapmaz. Veri toplama: yok.

## Ekran görüntüleri

Açıklamalar (sırayla):

1. FillHub'ın tek tıkla doldurduğu örnek bir kayıt formu.
2. Genel ayarlar: varsayılan ülke, akıllı özellikler, güvenli mod.
3. Kimlikler: rastgele ya da sabit kimlik modları.
4. Özel kurallar: alan adlarını değerlere eşleyin.
5. GitHub Sponsors bağlantısının bulunduğu destek bölümü.

## Varlıklar

- Simge: `store/assets/store-icon-128.png`
- Küçük tanıtım kutusu: `store/assets/promo-small-440x280.png`
- Marquee: `store/assets/promo-marquee-1400x560.png`
- GitHub sosyal önizleme: `store/assets/social-preview-1280x640.png`
- Ekran görüntüleri (1280×800): `store/assets/screenshots/tr/`
