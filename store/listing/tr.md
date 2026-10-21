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
- Güvenli mod (varsayılan olarak açık). Kişisel tanımlayıcılar, test verisi olduğu açıkça belli değerlerdir:
  example.com e-postaları, yer tutucu telefonlar ve gerçek kullanım için tasarlanmamış test kimlik numaraları.
- Kimlik profilleri. Her doldurmada yeni bir rastgele kişi ya da sabit bir kişi kullanılır. Bir profil ad, soyad,
  e-posta, telefon ve şifreyi sabitleyebilir; böylece sabit bir test hesabını tutabilir.
- Özel kurallar. Yerleşik tanıma bir alanı kaçırırsa bir CSS seçicisi bir veri türüne eşlenir. Kurallar
  ayar sayfasında düzenlenir.
- Onay kutuları (şartlar, gizlilik, KVKK) işaretlenir; pazarlama kutuları işaretsiz kalır.
- Metin alanları, ülkenin dilinde örnek cümleler alır ve alanın en fazla uzunluğuna göre kırpılır.
- Dosya alanları, kabul edilen türe uyan küçük bir üretilmiş dosya alır.
- İsteğe bağlı otomatik gönderim (varsayılan olarak kapalı), doldurulan formun gerçek gönderim düğmesine basar.
  İptal, Sil gibi yıkıcı düğmelere hiç basılmaz; siteler istisna listesine eklenebilir.
- Captcha'lara asla tıklanmaz ve çözülmez. Görünür captcha işaretlenir, doğrulamayı siz tamamlarsınız ve form
  otomatik gönderilmez.
- Uç durumları denemek için kaos modu.
- Geri al: son doldurmayı, doldurmadan önceki haline döndürür.
- Ayarların yerel bir JSON dosyasına yedeklenmesi ve yalnızca sayı içeren tanılama raporu.
- Aynı kökenli iframe içindeki formlarda çalışır; JavaScript çerçeveleriyle değer senkronizasyonunu korur. Çapraz kökenli iframe'ler activeTab izninin dışındadır ve doldurulmaz.

Nasıl kullanılır

1. Formu içeren bir sayfayı açın.
2. Ctrl+Shift+F (macOS'ta Command+Shift+F) tuşlarına basın ya da araç çubuğundaki FillHub simgesine tıklayın. Form hemen doldurulur.
3. Geri almak için Ctrl+Shift+U tuşlarına basın.
4. Kaos modu (uç değerlerle test) için Ctrl+Shift+Y tuşlarına basın.
Kısayollar chrome://extensions/shortcuts adresinden değiştirilebilir.
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
- **contextMenus:** sağ tık menüsüne "Formu sahte verilerle doldur", "Bu alanı doldur", "Sahte doldurmayı geri al"
  ve "Ayarlar" öğelerini ekler. Aynı öğeler araç çubuğu simgesine sağ tıklandığında da görünür.
- **scripting:** doldurma betiklerini yalnızca kullanıcı doldurmayı başlattığında (kısayol, araç çubuğu simgesi ya da
  menü) doldurulan sayfaya enjekte eder. Kullanılmayan sayfalarda FillHub kodu çalışmaz.
- **activeTab:** FillHub yalnızca kullanıcının baktığı sekmede çalışır ve yalnızca kullanıcı araç çubuğu
  simgesine tıkladığında, bir kısayola bastığında ya da bağlam menüsünü kullandığında işlem yapar. İzin
  yalnızca o sekme için verilir ve kullanıcı sekmeden ayrıldığında biter. Tüm sitelere erişim izni yoktur;
  arka planda sayfa okumaz. İzin ana çerçevenin kökenini kapsar; aynı kökenli iframe'ler doldurulur,
  çapraz kökenli iframe'ler doldurulmaz.

Uzaktan kod: yok. Uzantı tüm kodunu paketin içinde taşır ve ağ isteği yapmaz. Veri toplama: yok.

## Ekran görüntüleri

Açıklamalar (sırayla):

1. FillHub'ın tek tıkla doldurduğu örnek bir kayıt formu.
2. Genel ayarlar: varsayılan ülke, akıllı özellikler, güvenli mod.
3. Kimlikler: rastgele ya da sabit kimlik modları.
4. Özel kurallar: CSS seçicilerini veri türlerine eşleyin.
5. GitHub Sponsors bağlantısının bulunduğu destek bölümü.

## Varlıklar

- Simge: `store/assets/store-icon-128.png`
- Küçük tanıtım kutusu: `store/assets/promo-small-440x280.png`
- Marquee: `store/assets/promo-marquee-1400x560.png`
- GitHub sosyal önizleme: `store/assets/social-preview-1280x640.png`
- Ekran görüntüleri (1280×800): `store/assets/screenshots/tr/`
