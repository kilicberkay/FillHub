# Chrome Web Store listing: FillHub (Bahasa Indonesia)

**Name:** FillHub

**Summary (132 characters max):**
Mengisi formulir web dengan data palsu yang realistis dan konsisten dalam 15 bahasa. Mode aman, batalkan; tanpa pengumpulan data.

## Description

FillHub mengisi formulir web dengan data palsu yang realistis dan konsisten, sehingga pengembang dan penguji dapat menguji alur pendaftaran, checkout, dan entri data tanpa mengetik nilai uji secara manual atau memakai data orang sungguhan.

Sorotan

- 15 bahasa dan 15 profil negara. Nama, alamat, nomor telepon, nama perusahaan, dan nomor identitas mengikuti format setiap negara.
- Orang yang konsisten. Satu pengisian membuat satu orang, sehingga nama depan, nama belakang, e-mail, kolom "ulangi e-mail", nama pengguna, dan nomor telepon saling cocok.
- Deteksi kolom cerdas. Label, nama, petunjuk autocomplete, dan jenis input digabungkan, sehingga kolom berlabel "Cep telefonu" atau "Soyadınız" menerima nilai yang tepat.
- Mode PII Safe (aktif secara default). Pengenal pribadi memakai nilai uji yang jelas: alamat e-mail example.com, nomor telepon placeholder, dan nomor identitas uji yang tidak pernah dimaksudkan untuk penggunaan sungguhan.
- Profil identitas. Gunakan orang acak baru di setiap pengisian, atau pertahankan satu orang tetap. Profil dapat mengunci nama depan, nama belakang, e-mail, telepon, dan kata sandi, sehingga dapat menyimpan akun uji tetap.
- Aturan kustom. Petakan selektor CSS ke jenis data saat deteksi bawaan melewatkan sebuah kolom. Aturan diedit di halaman pengaturan.
- Kotak centang persetujuan (ketentuan, privasi, KVKK) dicentang; kotak centang pemasaran tetap tidak dicentang.
- Kolom teks menerima kalimat contoh dalam bahasa negara tersebut, dipotong sesuai panjang maksimum kolom.
- Kolom file menerima file kecil yang dibuat otomatis dan sesuai dengan jenis yang diterima.
- Kirim otomatis opsional (nonaktif secara default) mengklik tombol kirim asli dari formulir yang diisi. Tombol yang bersifat merusak seperti Batal atau Hapus tidak pernah diklik, dan situs dapat dikecualikan.
- Captcha tidak pernah diklik atau dipecahkan. Captcha yang terlihat diberi garis tepi, Anda menyelesaikannya sendiri, dan formulir tidak dikirim otomatis.
- Mode chaos untuk pengujian gaya fuzz dengan nilai yang tidak biasa.
- Batalkan mengembalikan formulir ke keadaan sebelum pengisian terakhir.
- Cadangan pengaturan ke berkas JSON lokal, dan laporan diagnostik yang hanya berisi jumlah.
- Berfungsi di iframe dengan asal yang sama, membaca label dalam bahasa halaman itu sendiri, dan menjaga nilai tetap sinkron dengan framework JavaScript. Iframe lintas asal berada di luar izin activeTab dan tidak disentuh.

Cara menggunakan

1. Buka halaman yang memiliki formulir.
2. Tekan Ctrl+Shift+F (Command+Shift+F di macOS), atau klik ikon FillHub di toolbar. Formulir langsung terisi.
3. Tekan Ctrl+Shift+U untuk membatalkan.
4. Tekan Ctrl+Shift+Y untuk mode chaos (nilai tidak biasa untuk pengujian fuzz).

Pintasan dapat diubah di chrome://extensions/shortcuts. Klik kanan pada satu kolom dan pilih "Isi kolom ini" untuk hanya mengisi kolom tersebut.

Privasi

FillHub tidak mengumpulkan data. Pengaturan tetap berada di browser Anda. Ekstensi tidak mengirim apa pun kepada penulis atau pihak ketiga. Lihat kebijakan privasi: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Sumber terbuka

FillHub gratis dan bersumber terbuka di bawah lisensi MIT. Kode sumber, isu, dan kontribusi: https://github.com/kilicberkay/FillHub

Dukungan

FillHub gratis. Jika membantu pekerjaan Anda, Anda dapat mendukung pengembangannya melalui GitHub Sponsors: https://github.com/sponsors/kilicberkay

Penggunaan yang bertanggung jawab

FillHub untuk pengujian dan pengembangan. Nomor identitas yang dihasilkan dapat lolos aturan checksum publik, jadi jangan gunakan data yang dihasilkan untuk aplikasi sungguhan, pembelian, atau klaim identitas.
