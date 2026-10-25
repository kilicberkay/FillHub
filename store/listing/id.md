# Chrome Web Store listing: FillHub (Bahasa Indonesia)

**Name:** FillHub

**Summary (132 characters max):**
Mengisi formulir web dengan data palsu yang realistis dan konsisten dalam 15 bahasa. Mode aman, batalkan; tanpa pengumpulan data.

## Description

FillHub mengisi formulir web dengan data palsu yang realistis dan konsisten. Pengembang dan penguji dapat menguji alur pendaftaran, checkout, dan entri data tanpa mengetik nilai uji secara manual dan tanpa memakai data orang sungguhan.

Sorotan

- 15 bahasa dan 15 profil negara. Nama, alamat, nomor telepon, nama perusahaan, dan nomor identitas mengikuti format setiap negara.
- Data orang yang konsisten. Satu pengisian membuat satu orang. Karena itu, nama depan, nama belakang, e-mail, kolom "Ulangi e-mail", nama pengguna, dan nomor telepon saling cocok.
- Deteksi kolom cerdas. FillHub menggabungkan label, nama kolom, petunjuk autocomplete, dan jenis input untuk mengenali setiap kolom. Label dalam bahasa lain juga dikenali. Misalnya, kolom berbahasa Turki dengan label "Cep telefonu" (telepon seluler) menerima nomor telepon, dan kolom dengan label "Soyadınız" (nama belakang Anda) menerima nama belakang.
- Mode PII Safe (aktif secara default). Pengenal pribadi memakai nilai uji yang jelas: alamat e-mail example.com, nomor telepon placeholder, dan nomor identitas uji yang tidak dimaksudkan untuk penggunaan sungguhan.
- Profil identitas. Gunakan orang acak baru di setiap pengisian, atau pertahankan satu orang tetap. Profil dapat mengunci nama depan, nama belakang, e-mail, nomor telepon, dan kata sandi, sehingga akun uji yang sama dapat dipakai di setiap pengisian.
- Aturan kustom. Petakan selektor CSS ke jenis data jika deteksi bawaan tidak mengenali sebuah kolom. Aturan diedit di halaman pengaturan.
- Kotak centang persetujuan (ketentuan penggunaan, kebijakan privasi, dan persetujuan KVKK menurut undang-undang perlindungan data Turki) dicentang. Kotak centang pemasaran tetap tidak dicentang.
- Kolom teks menerima kalimat contoh dalam bahasa negara tersebut, dipendekkan sesuai panjang maksimum kolom.
- Kolom file menerima file kecil yang dibuat otomatis dan sesuai dengan jenis file yang diterima.
- Kirim otomatis (opsional, nonaktif secara default) mengklik tombol kirim yang sebenarnya pada formulir yang diisi. Tombol destruktif seperti Batal atau Hapus tidak pernah diklik. Situs tertentu dapat dikecualikan dari kirim otomatis.
- Captcha tidak pernah diklik atau dipecahkan. Captcha yang terlihat diberi bingkai agar Anda dapat menyelesaikannya sendiri. Dalam hal ini, formulir tidak dikirim secara otomatis.
- Mode kacau mengisi kolom dengan nilai yang tidak biasa untuk pengujian gaya fuzz.
- Fitur batalkan mengembalikan formulir ke keadaan sebelum pengisian terakhir.
- Pengaturan dapat dicadangkan ke berkas JSON lokal. Laporan diagnostik untuk pelaporan bug berisi jumlah dan pengaturan dasar, tetapi tidak berisi nama, nilai kolom, atau alamat situs.
- Berfungsi di iframe dengan asal yang sama dan menjaga nilai tetap sinkron dengan framework JavaScript. Iframe lintas asal berada di luar izin activeTab dan tidak diisi.

Cara menggunakan

1. Buka halaman yang memiliki formulir.
2. Tekan Ctrl+Shift+F (Command+Shift+F di macOS), atau klik ikon FillHub di toolbar. Formulir langsung terisi.
3. Tekan Ctrl+Shift+U (Command+Shift+U di macOS) untuk membatalkan pengisian.
4. Tekan Ctrl+Shift+Y (Command+Shift+Y di macOS) untuk mengisi formulir dalam mode kacau dengan nilai yang tidak biasa untuk pengujian fuzz.

Pintasan dapat diubah di chrome://extensions/shortcuts. Untuk mengisi satu kolom saja, klik kanan kolom tersebut dan pilih "Isi kolom ini".

Privasi

FillHub tidak mengumpulkan data dan tidak membuat permintaan jaringan. Pengaturan hanya disimpan di browser Anda. Ekstensi tidak mengirim apa pun kepada penulis atau pihak ketiga. Kebijakan privasi: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Sumber terbuka

FillHub gratis dan bersumber terbuka di bawah lisensi MIT. Kode sumber, laporan masalah, dan kontribusi: https://github.com/kilicberkay/FillHub

Dukungan

FillHub gratis. Jika FillHub bermanfaat bagi pekerjaan Anda, Anda dapat mendukung pengembangannya melalui GitHub Sponsors: https://github.com/sponsors/kilicberkay

Penggunaan yang bertanggung jawab

FillHub ditujukan untuk pengujian dan pengembangan. Nomor identitas yang dihasilkan dapat lolos validasi checksum publik. Jangan gunakan data yang dihasilkan untuk pengajuan sungguhan, pembelian, atau verifikasi identitas.
