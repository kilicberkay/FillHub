# Chrome Web Store ilanı: FillHub (Türkçe)

**Ad:** FillHub

**Özet (en fazla 132 karakter):**
15 dilde gerçekçi ve tutarlı sahte verilerle web formlarını doldurun. Güvenli mod, geri alma; veri toplama yok.

**Kategori:** Geliştirici Araçları

**Dil:** Türkçe (ad, özet ve açıklama 14 dilde ayrıca yerelleştirilmiştir)

**Tek amaç:** Geçerli web sayfasındaki form alanlarını sahte test verisiyle doldurmak.

## Açıklama

FillHub, web formlarını gerçekçi ve tutarlı sahte test verileriyle doldurur. Geliştiriciler ve test
uzmanları kayıt, ödeme ve veri girişi akışlarını elle test değeri yazmadan ve gerçek kişilerin
bilgilerini kullanmadan test edebilir.

Öne çıkanlar

- 15 dil ve 15 ülke profili. Ad, adres, telefon numarası, şirket adı ve kimlik numaraları her ülkenin
  biçimine uyar.
- Tutarlı kişi verisi. Her doldurma tek bir kişi üretir. Bu nedenle ad, soyad, e-posta, "e-posta
  tekrarı" alanı, kullanıcı adı ve telefon numarası birbiriyle uyumludur.
- Akıllı alan tespiti. FillHub her alanı tanımak için etiketi, alan adını, autocomplete ipuçlarını ve
  giriş türünü birlikte değerlendirir. Etiketler yalnızca İngilizce değil, sayfanın dilinde de tanınır.
  Örneğin "Cep telefonu" etiketli alana bir telefon numarası, "Soyadınız" etiketli alana bir soyadı
  yazılır.
- PII Safe modu (varsayılan olarak açık). Kişisel tanımlayıcılarda test verisi olduğu açıkça belli olan
  değerler kullanılır: example.com e-posta adresleri, yer tutucu telefon numaraları ve gerçek kullanım
  için tasarlanmamış test kimlik numaraları.
- Kimlik profilleri. Her doldurmada yeni bir rastgele kişi ya da sabit bir kişi kullanılabilir. Bir
  profil ad, soyad, e-posta, telefon numarası ve şifreyi sabitleyebilir; böylece her doldurmada aynı
  test hesabı kullanılır.
- Özel kurallar. Yerleşik tespit bir alanı tanımadığında bir CSS seçicisi bir veri türüyle
  eşleştirilebilir. Kurallar ayar sayfasında düzenlenir.
- Onay kutuları (kullanım şartları, gizlilik politikası ve KVKK onayı) işaretlenir. Pazarlama onay
  kutuları işaretsiz kalır.
- Metin alanlarına ülkenin dilinde örnek cümleler yazılır. Metin, alanın izin verdiği en fazla uzunluğa
  göre kısaltılır.
- Dosya alanlarına, kabul edilen dosya türüne uygun küçük bir dosya üretilip eklenir.
- Otomatik gönderim (isteğe bağlı, varsayılan olarak kapalı) doldurulan formun gerçek gönderim
  düğmesine tıklar. İptal veya Sil gibi yıkıcı düğmelere hiçbir zaman tıklanmaz. Belirli siteler
  otomatik gönderimin dışında tutulabilir.
- Captcha'lara hiçbir zaman tıklanmaz ve captcha'lar çözülmez. Görünür bir captcha çerçeveyle
  işaretlenir ve doğrulamayı siz tamamlarsınız. Bu durumda form otomatik olarak gönderilmez.
- Kaos modu, fuzz tarzı testler için alanlara olağan dışı değerler yazar.
- Geri alma, formu son doldurmadan önceki durumuna döndürür.
- Ayarlar yerel bir JSON dosyasına yedeklenebilir. Hata bildirimleri için hazırlanan tanılama raporu
  sayıları ve temel ayarları içerir; ad, alan değeri veya site adresi içermez.
- Aynı kökenli iframe'lerde çalışır ve değerleri JavaScript framework'leriyle senkronize tutar. Farklı
  kökenli iframe'ler activeTab izninin kapsamı dışındadır ve doldurulmaz.

Nasıl kullanılır

1. Form içeren bir sayfa açın.
2. Ctrl+Shift+F (macOS'ta Command+Shift+F) tuşlarına basın ya da araç çubuğundaki FillHub simgesine tıklayın. Form hemen doldurulur.
3. Doldurmayı geri almak için Ctrl+Shift+U (macOS'ta Command+Shift+U) tuşlarına basın.
4. Formu kaos modunda, fuzz testleri için olağan dışı değerlerle doldurmak üzere Ctrl+Shift+Y (macOS'ta Command+Shift+Y) tuşlarına basın.

Kısayollar chrome://extensions/shortcuts adresinden değiştirilebilir.
Tek bir alanı doldurmak için alana sağ tıklayın ve "Bu alanı doldur" seçeneğini seçin.

Gizlilik

FillHub veri toplamaz ve ağ isteği yapmaz. Ayarlar yalnızca tarayıcınızda saklanır. Uzantı geliştiriciye
veya üçüncü taraflara hiçbir veri göndermez. Gizlilik politikası:
https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Açık kaynak

FillHub, MIT lisansıyla ücretsiz ve açık kaynaklıdır. Kaynak kod, hata kayıtları ve katkılar:
https://github.com/kilicberkay/FillHub

Destek

FillHub ücretsizdir. FillHub işinizde faydalı oluyorsa geliştirilmesini GitHub Sponsors üzerinden
destekleyebilirsiniz: https://github.com/sponsors/kilicberkay

Sorumlu kullanım

FillHub test ve geliştirme amaçlıdır. Üretilen kimlik numaraları herkese açık sağlama (checksum)
kurallarından geçebilir. Üretilen verileri gerçek başvurularda, satın almalarda veya kimlik doğrulamada
kullanmayın.

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
