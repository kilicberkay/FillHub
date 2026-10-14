# FillHub

[![CI](https://github.com/kilicberkay/FillHub/actions/workflows/ci.yml/badge.svg)](https://github.com/kilicberkay/FillHub/actions/workflows/ci.yml)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-blue.svg)](LICENSE)

FillHub, web formlarını **15 dilde** gerçekçi ve tutarlı sahte verilerle doldurur. Geliştiriciler ve
test uzmanları için tasarlandı: gerçek insanların bilgilerini kopyalamadan inandırıcı test verisi
gerekenler için.

- **15 dil, 15 ülke** (ABD, Çin, Hindistan, Meksika, Mısır, Fransa, Bangladeş, Brezilya, Rusya,
  Pakistan, Endonezya, Almanya, Japonya, Türkiye, Vietnam): ad, adres, telefon, şirket ve kimlik
  numaraları her ülkenin biçimini izler.
- **Tutarlı kişi:** her doldurma tek bir kişi üretir; ad, soyad, e-posta, e-posta tekrarı, kullanıcı
  adı ve telefon birbiriyle uyumludur.
- **Akıllı alan tespiti:** etiket, `name`/`id`, `autocomplete` ve giriş türü birlikte değerlendirilir.
  `Soyadınız`, `Cep telefonu` gibi etiketler doğru alana yazılır.
- **Güvenli mod (PII Safe)** varsayılan olarak açıktır: kişisel tanımlayıcılar belli belirsiz test
  değerleridir (`example.com` e-postaları, `5320000000` telefonları, geçerli test kimlik numaraları).
- **Sağlaması geçerli kimlik numaraları:** TC Kimlik, CPF/CNPJ, Çin, Rusya, Japonya, Hindistan,
  Meksika ve diğer biçimler (aşağıdaki güvenlik notuna bakın).
- **Geri al:** son doldurmayı, doldurmadan önceki haline döndürür.
- **Gizlilik:** veri toplanmaz, hiçbir yere gönderilmez, hesap yoktur. Bkz. [PRIVACY.md](PRIVACY.md).

## Kurulum

**Chrome Web Store:** yakında (mağaza materyalleri için `store/` klasörüne bakın).

**Kaynaktan (geliştirici modu):**

1. Depoyu klonlayın ya da en son sürüm zip dosyasını indirip açın.
2. `chrome://extensions` sayfasında **Geliştirici modu**nu açın.
3. **Paketlenmemiş öğe yükle** düğmesine tıklayın ve `manifest.json` dosyasının bulunduğu klasörü seçin.

## Kullanım

| İşlem | Kısayol / menü |
|---|---|
| Sayfadaki formu doldur | `Ctrl+Shift+F` (macOS: `Command+Shift+F`) ya da araç çubuğu simgesi |
| Kaos modu (rastgele değerler) | `Ctrl+Shift+D` |
| Son doldurmayı geri al | `Ctrl+Shift+U` |
| Tek alanı doldur | Alana sağ tıklayın, **Bu alanı doldur** |

Ülke, dil, güvenli mod ve özel kurallar ayar sayfasında düzenlenir (`chrome://extensions` → FillHub →
**Uzantı seçenekleri**).

## Güvenlik ve sorumlu kullanım

FillHub test ve geliştirme içindir. Üretilen kimlik numaraları genel sağlama algoritmalarından
geçebilir; yani bir numara gerçek bir kişiye denk gelebilir. **Üretilen verileri gerçek bir
başvuruda, satın almada ya da kimlik beyanında kullanmayın.** Doldurmanın site koşullarını ihlal
ettiği yerlerde FillHub'ı kullanmayın.

## Geliştirme

```bash
npm ci
npm test            # tüm denetimler, tarayıcı testleri dahil (Chromium gerekir)
npm run test:quick  # tarayıcısız denetimler
npm run build       # dist/fillhub-<sürüm>.zip
```

- `scripts/`: uzantının mantığı (derleme adımı yok, çalışma zamanı bağımlılığı yok).
- `options/`: ayar sayfası. CSS, `npm run build:css` ile üretilir (Tailwind CSS).
- `tests/`: birim testleri (`tests/unit`) ve uçtan uca testler (`tests/e2e`).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) parçaların nasıl çalıştığını anlatır.

Katkılar memnuniyetle karşılanır. [CONTRIBUTING.md](CONTRIBUTING.md) ve
[Davranış Kuralları](CODE_OF_CONDUCT.md) dosyalarını okuyun. Güvenlik sorunlarını
[SECURITY.md](SECURITY.md) içinde anlatıldığı gibi özel olarak bildirin.

English documentation: [README.md](README.md).

## Projeyi destekleyin

FillHub ücretsiz ve açık kaynaktır. Zamanınızı kazandırdıysa geliştirmeyi
[GitHub Sponsors](https://github.com/sponsors/kilicberkay) üzerinden destekleyebilirsiniz. Destek hiçbir
zaman zorunlu değildir.

## Lisans

[MIT](LICENSE) © 2025-2026 Berkay Kılıç. Üçüncü taraf bildirimleri: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
