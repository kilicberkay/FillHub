// Alan tespiti korpusu: [kaynak metin, beklenen tür]. Etiketler 15 dilden ve gerçek formlardan derlenmiştir.
// Beklenen değer null ise yalnızca "bu tür DEĞİL" denetlenir (negatif örnek).
// Sayı alanları (input type="number"): rakamla yazılabilen türler etiketten tanınır, diğerleri sayı kalır
export const NUMBER_INPUT_CORPUS = [
    ['Telefon', 'phone'], ['Phone number', 'phone'], ['Posta kodu', 'zip'], ['Zip code', 'zip'],
    ['T.C. Kimlik No', 'idNumber'], ['Vergi Kimlik No', 'taxId'], ['Adet', 'number'], ['Quantity', 'number'],
    ['Adınız', 'number'], ['Bilinmeyen', 'number'],
];

export const LABEL_CORPUS = [
    // Türkçe
    ['Adınız', 'firstName'], ['Adı', 'firstName'], ['Soyadınız', 'lastName'], ['Soyisminiz', 'lastName'],
    ['Soyadı', 'lastName'], ['E-posta', 'email'], ['E-posta adresiniz', 'email'], ['Cep telefonu', 'phone'],
    ['Cep telefon numarası', 'phone'], ['T.C. Kimlik No', 'idNumber'], ['Şirket', 'company'], ['Web sitesi', 'website'],
    ['Vergi Kimlik No', 'taxId'], ['IBAN', 'iban'], ['Kullanıcı adı', 'username'], ['Doğum tarihi', 'date'],
    ['Şifre', 'password'], ['Posta kodu', 'zip'], ['Ülke', 'country'], ['Adres', 'address'], ['Şehir', 'city'],
    // English
    ['First name', 'firstName'], ['Last name', 'lastName'], ['Surname', 'lastName'], ['Family name', 'lastName'],
    ['Full name', 'fullName'], ['Email address', 'email'], ['Phone', 'phone'], ['Mobile number', 'phone'],
    ['Company', 'company'], ['Website', 'website'], ['Username', 'username'], ['Password', 'password'],
    ['Zip code', 'zip'], ['Postal code', 'zip'], ['Address', 'address'], ['City', 'city'], ['Country', 'country'],
    ['State', 'state'], ['Date of birth', 'date'], ['Birthday', 'date'], ['SSN', 'idNumber'],
    // Español
    ['Nombre', 'firstName'], ['Apellido', 'lastName'], ['Correo electrónico', 'email'], ['Teléfono', 'phone'],
    ['Dirección', 'address'], ['Ciudad', 'city'], ['Código postal', 'zip'], ['Empresa', 'company'],
    // Français
    ['Prénom', 'firstName'], ['Nom de famille', 'lastName'], ['Courriel', 'email'], ['Téléphone', 'phone'],
    ['Ville', 'city'], ['Code postal', 'zip'],
    // Deutsch
    ['Vorname', 'firstName'], ['Nachname', 'lastName'], ['E-Mail-Adresse', 'email'], ['Telefonnummer', 'phone'],
    ['Straße', 'address'], ['PLZ', 'zip'], ['Passwort', 'password'], ['Firma', 'company'],
    // Português
    ['Primeiro nome', 'firstName'], ['Sobrenome', 'lastName'], ['E-mail', 'email'], ['Telefone', 'phone'],
    ['Cidade', 'city'], ['CEP', 'zip'],
    // Русский
    ['Имя', 'firstName'], ['Фамилия', 'lastName'], ['Электронная почта', 'email'], ['Телефон', 'phone'], ['Город', 'city'],
    // 中文
    ['名', 'firstName'], ['姓', 'lastName'], ['手机号', 'phone'], ['邮箱', 'email'], ['城市', 'city'],
    // 日本語
    ['電話番号', 'phone'], ['メールアドレス', 'email'], ['市区町村', 'city'],
    // العربية
    ['الاسم الأول', 'firstName'], ['البريد الإلكتروني', 'email'], ['الهاتف', 'phone'],
    // हिन्दी
    ['पहला नाम', 'firstName'], ['ईमेल', 'email'], ['फ़ोन नंबर', 'phone'], ['पिन कोड', 'zip'],
    // Bahasa Indonesia
    ['Nama depan', 'firstName'], ['Nama belakang', 'lastName'], ['Nomor telepon', 'phone'],
    // Tiếng Việt
    ['Tên', 'firstName'], ['Số điện thoại', 'phone'],
    // Öznitelik adları (name/id)
    ['txtAdSoyad', 'fullName'], ['user[first_name]', 'firstName'], ['billing-address-line1', 'address'],
    ['ctl00$TcKimlikNo', 'idNumber'], ['tel', 'phone'], ['tel_no', 'phone'], ['tel-no', 'phone'],
    // Negatifler: bu etiketler yanlış türe düşmemeli
    ['Passport number', 'NOT:email'], ['Metadata', 'NOT:date'], ['Organizer', 'NOT:company'],
    ['Hotel', 'NOT:phone'], ['Total', 'NOT:phone'], ['Kullanıcı adı', 'NOT:email']
];
