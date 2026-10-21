// Alan tespiti: metin kaynaklarından (ad, id, placeholder, etiket, aria-label, title, ilişkili etiket)
// alan türünü belirler. Her kaynak ayrı jetonlanır; eşleşme kelime sınırlıdır: "soyadınız" içinde
// "adınız" eşleşmez, "telefonunuz" "telefon" ile eşleşir (5+ harfli öbekte önek). DOM'a bağımlı değildir.
// Tarayıcıda global (FillHubDetect), Node'da module.exports olarak kullanılır.
const FillHubDetect = (() => {
    const CJK = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+$/u;
    const LETTER_MAP = { 'ı': 'i', 'đ': 'd', 'ß': 'ss', 'ø': 'o', 'ł': 'l', 'æ': 'ae', 'œ': 'oe' };

    // Karşılaştırma biçimi: camelCase ayrılır, küçük harf, aksan ve birleştirici işaretler (Latin) silinir,
    // Devanagari/Bengal işaretleri korunur, harf-rakam dışı her şey boşluk olur.
    function fold(value) {
        let s = String(value || '').replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2');
        s = s.toLowerCase().replace(/̇/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '');
        s = s.replace(/[ıđßøłæœ]/g, (c) => LETTER_MAP[c]);
        return s.replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ').trim().replace(/\s+/g, ' ');
    }

    function tokenize(value) {
        const folded = fold(value);
        return folded ? folded.split(' ') : [];
    }

    // Öbek jetonu → metin jetonu. Kısa (≤4 harf) öbekler tam eşleşir; 5+ harfte önek (ek) kabul edilir.
    // CJK öbeklerinde (≥2 karakter) alt dizi yeterlidir; tek karakter yalnız tam eşleşir (名, 姓).
    function tokenMatch(phrase, token) {
        if (token === phrase) return true;
        if (CJK.test(phrase)) return phrase.length >= 2 && token.includes(phrase);
        return phrase.length >= 5 && token.startsWith(phrase);
    }

    function matchesPhrase(tokens, phrase) {
        const n = phrase.length;
        for (let i = 0; i + n <= tokens.length; i++) {
            let ok = true;
            for (let j = 0; j < n && ok; j++) ok = tokenMatch(phrase[j], tokens[i + j]);
            if (ok) return true;
        }
        return false;
    }

    // Öncelik sırası: özel türler genel olanlardan önce. "Firma adı" → company, "Kullanıcı adı" → username,
    // "Ad Soyad" → fullName (güçlü), "Name" → fullName (zayıf, ad/soyaddan sonra).
    const RULE_DEFS = [
        ['iban', ['iban']],
        ['taxId', ['vergi', 'vkn', 'vergi no', 'vergi numarasi', 'vergi kimlik', 'tax id', 'tax no', 'tax number', 'tax code', 'vat number', 'ein', 'tin', 'itn', 'cnpj', 'inn', 'npwp', 'pan', 'ntn', 'rfc', 'steuer', 'steuernummer', 'steuer id', 'mst', 'nit', 'ИНН', 'инн', '税号', '税务登记号', '法人番号', '统一社会信用代码', '納税者番号', 'mã số thuế']],
        ['idNumber', ['tc kimlik', 'tc kimlik no', 'tckn', 'tc no', 'kimlik', 'kimlik no', 'kimlik numarasi', 'identity number', 'id number', 'national id', 'identification number', 'ssn', 'social security', 'social security number', 'cpf', 'rg', 'curp', 'nik', 'aadhaar', 'aadhar', 'cnic', 'ktp', 'cccd', 'cmnd', 'nid', 'dni', 'personalausweis', 'ausweis', 'snils', 'nir', 'my number', 'マイナンバー', '個人番号', '身份证', '身份证号', 'رقم الهوية', 'আধার', 'número de identidad', 'numero de identidad', 'sécurité sociale', 'securite sociale', 'seguridad social']],
        ['username', ['username', 'user name', 'kullanici adi', 'kullanici', 'benutzername', 'nombre de usuario', 'nome de usuario', 'nom d utilisateur', 'identifiant', 'имя пользователя', '用户名', 'ユーザー名', 'اسم المستخدم', 'nama pengguna', 'tên người dùng', 'उपयोगकर्ता नाम', 'ব্যবহারকারীর নাম', 'صارف نام']],
        ['email', ['email', 'e mail', 'eposta', 'e posta', 'mail', 'courriel', 'correo', 'correo electronico', 'email address', 'e mail address', 'correio eletronico', 'mail adresi', 'email adresi', 'alamat email', 'surel', 'электронная почта', 'почта', '邮箱', '邮件', '电子邮件', 'メール', 'メールアドレス', 'البريد الالكتروني', 'البريد', 'ईमेल', 'ইমেইল', 'ای میل', 'địa chỉ email', 'thư điện tử']],
        ['phoneCode', ['phone code', 'dial code', 'calling code', 'country code', 'ulke kodu', 'telefon kodu', 'vorwahl', 'kode negara', 'ma vung', 'mã vùng', 'codigo de pais', 'código de país', 'indicatif', 'codigo do pais', '国际区号', 'کد کشور']],
        ['phone', ['phone', 'telephone', 'tel', 'telefon', 'telefonu', 'telefon numarasi', 'telefon no', 'tel no', 'tel numarasi', 'tel', 'cep telefonu', 'cep tel', 'cep no', 'cep numarasi', 'gsm', 'mobile', 'mobil', 'mobile phone', 'handy', 'hp', 'no hp', 'nomor hp', 'nomor telepon', 'telepon', 'telefono', 'telefono movil', 'téléphone', 'telefone', 'celular', 'numero de telefono', 'número de teléfono', 'numero de celular', 'телефон', 'номер телефона', '电话', '手机', '手机号', '手机号码', '电话号码', '電話', '電話番号', '휴대폰', 'الهاتف', 'رقم الهاتف', 'رقم الجوال', 'موبايل', 'فون', 'فون نمبر', 'ponsel', 'nomor ponsel', 'số điện thoại', 'điện thoại', 'फ़ोन', 'फोन', 'फ़ोन नंबर', 'मोबाइल', 'मोबाइल नंबर', 'মোবাইল', 'মোবাইল নম্বর', 'ফোন', 'موبائل نمبر']],
        ['company', ['company', 'company name', 'firma', 'firma adi', 'sirket', 'sirket adi', 'kurum', 'kurum adi', 'unternehmen', 'firmenname', 'societe', 'entreprise', 'nom de la societe', 'empresa', 'nombre de la empresa', 'companhia', 'organization', 'organisation', 'компания', 'организация', '公司', '公司名称', '会社', '会社名', 'الشركة', 'اسم الشركة', 'कंपनी', 'संगठन', 'কোম্পানি', 'কোম্পানির নাম', 'کمپنی', 'perusahaan', 'nama perusahaan', 'công ty', 'tên công ty', 'employer', 'işveren']],
        ['fullName', ['full name', 'fullname', 'complete name', 'name and surname', 'ad soyad', 'adsoyad', 'ad ve soyad', 'adi soyadi', 'adiniz soyadiniz', 'isim soyisim', 'isim soyad', 'tam ad', 'nombre completo', 'nombre y apellido', 'nombre y apellidos', 'nome completo', 'nom complet', 'nom et prenom', 'vollstandiger name', 'ganzer name', 'полное имя', 'фио', 'ф и о', '姓名', '全名', '氏名', 'フルネーム', 'الاسم الكامل', 'الاسم الرباعي', 'पूरा नाम', 'পূর্ণ নাম', 'পুরো নাম', 'پورا نام', 'نام کامل', 'nama lengkap', 'họ và tên', 'họ tên']],
        ['middleName', ['middle name', 'second name', 'middle initial', 'orta ad', 'ikinci ad', 'mittelname', 'segundo nombre', 'nome do meio', 'отчество', '中间名', 'ミドルネーム', 'tên đệm', 'đệm', 'মধ্য নাম', 'मध्य नाम', 'درمیانی نام', 'nama tengah']],
        ['firstName', ['first name', 'firstname', 'given name', 'forename', 'fname', 'f name', 'first', 'ad', 'adi', 'adiniz', 'isim', 'isminiz', 'isiminiz', 'vorname', 'prenom', 'primer nombre', 'nombre de pila', 'primeiro nome', 'имя', '名字', '名', '名前', 'お名前', 'nombre', 'nome', 'nama depan', 'tên', 'पहला नाम', 'नाम', 'প্রথম নাম', 'নাম', 'پہلا نام', 'نام', 'الاسم الاول', 'الاسم الأول', 'الاسم', 'الاسم الشخصي']],
        ['lastName', ['last name', 'lastname', 'surname', 'family name', 'soyad', 'soyadi', 'soyadiniz', 'soyisim', 'soyisminiz', 'nachname', 'apellido', 'apellidos', 'sobrenome', 'cognome', 'nom de famille', 'nom', 'фамилия', '姓', '苗字', '姓氏', 'اسم العائلة', 'الكنية', 'उपनाम', 'পদবি', 'শেষ নাম', 'آخری نام', 'خاندانی نام', 'nama belakang', 'nama keluarga', 'họ']],
        ['fullName', ['name']],
        ['address', ['address', 'addr', 'street', 'street address', 'address line', 'address line 1', 'adres', 'adresi', 'cadde', 'sokak', 'mahalle', 'addresse', 'adresse', 'direccion', 'dirección', 'endereco', 'endereço', 'morada', 'indirizzo', 'strasse', 'straße', 'anschrift', 'адрес', 'адресс', '地址', '住所', 'العنوان', 'عنوان', 'alamat', 'địa chỉ', 'dia chi', 'ঠিকানা', 'पता', 'پتہ', 'پتا', '番地']],
        ['city', ['city', 'town', 'sehir', 'ilce', 'kent', 'stadt', 'ville', 'ciudad', 'cidade', 'citta', 'город', 'населенный пункт', '城市', '市', '市区町村', 'المدينة', 'مدينة', 'kota', 'thanh pho', 'tp', 'শহর', 'शहर', 'شہر', 'ciudad de residencia']],
        ['state', ['state', 'province', 'region', 'county', 'il', 'eyalet', 'bundesland', 'etat', 'estado', 'provincia', 'oblast', 'область', '省', '省份', '都道府県', '州', 'الولاية', 'ولاية', 'محافظة', 'provinsi', 'tinh', 'tỉnh', 'صوبہ', 'राज्य', 'রাজ্য']],
        ['country', ['country', 'country name', 'ulke', 'pays', 'pais', 'land', 'nation', 'страна', '国', '国家', '国名', '国/地域', 'دولة', 'البلد', 'negara', 'quoc gia', 'quốc gia', 'देश', 'দেশ', 'ملک', 'کنٹری']],
        ['zip', ['zip', 'zip code', 'zipcode', 'postal code', 'postcode', 'post code', 'postal', 'posta kodu', 'posta kod', 'postakodu', 'plz', 'postleitzahl', 'code postal', 'codigo postal', 'cep', 'cep kodu', 'cep kod', 'pin', 'pin code', 'pincode', 'индекс', 'почтовый индекс', '邮编', '邮政编码', '郵便番号', 'الرمز البريدي', 'الرمز', 'kode pos', 'mã bưu chính', 'mã bưu điện', 'पिन कोड', 'पिनकोड', 'डाक कोड', 'পোস্টাল কোড', 'পিন কোড', 'پوسٹل کوڈ', 'پن کوڈ', 'زپ کوڈ']],
        ['password', ['password', 'passwd', 'passcode', 'pwd', 'pass word', 'sifre', 'sifresi', 'parola', 'kennwort', 'passwort', 'mot de passe', 'contrasena', 'contraseña', 'senha', 'пароль', '密码', 'パスワード', 'كلمة المرور', 'كلمة السر', 'kata sandi', 'mat khau', 'mật khẩu', 'पासवर्ड', 'পাসওয়ার্ড', 'پاس ورڈ', 'پاسورڈ']],
        ['date', ['date', 'birth date', 'birthdate', 'birthday', 'dob', 'date of birth', 'tarih', 'dogum tarihi', 'dogum', 'dogum gunu', 'datum', 'geburtsdatum', 'fecha', 'fecha de nacimiento', 'data', 'data de nascimento', 'date de naissance', 'дата', 'дата рождения', '日期', '日付', '生年月日', 'تاريخ', 'تاريخ الميلاد', 'ميلاد', 'tanggal', 'tanggal lahir', 'ngay', 'ngày', 'ngày sinh', 'तारीख', 'जन्म तिथि', 'তারিখ', 'জন্ম তারিখ', 'تاریخ پیدائش']],
        ['number', ['number', 'numero', 'número', 'nummer', 'numéro', 'quantity', 'amount', 'count', 'sayi', 'sayı', 'miktar', 'anzahl', 'количество', '数量', '数字', 'العدد', 'jumlah', 'so luong', 'số lượng', 'संख्या', 'সংখ্যা', 'تعداد']],
        ['url', ['url', 'link', 'href', 'bağlantı', 'baglanti', 'enlace', 'lien', 'ссылка', '链接', 'リンク', 'الرابط', 'tautan', 'liên kết', 'lien url']],
        ['website', ['website', 'web site', 'web sitesi', 'webseite', 'sitio web', 'homepage', 'domain', 'domain name', 'internet sitesi', 'siteweb', 'веб сайт', 'сайт', '网站', 'ウェブサイト', 'サイト', 'موقع إلكتروني', 'الموقع الإلكتروني', 'situs web', 'trang web', 'वेबसाइट', 'ওয়েবসাইট', 'ویب سائٹ']],
        ['meeting', ['meeting', 'meeting title', 'toplanti', 'gorusme', 'besprechung', 'reunion', 'réunion', 'reunión', 'reunião', 'встреча', '会议', '会議', 'اجتماع', 'rapat', 'họp', 'बैठक', 'সভা', 'میٹنگ', 'sitzung']],
        ['organizer', ['organizer', 'organiser', 'host', 'arranger', 'duzenleyen', 'organizator', 'organisateur', 'organizador', 'veranstalter', 'организатор', '组织者', '主催者', 'المنظم', 'penyelenggara', 'người tổ chức', 'आयोजक', 'আয়োজক']],
        ['location', ['location', 'venue', 'place', 'yer', 'mekan', 'konum', 'ort', 'lieu', 'lugar', 'local', 'место', '地点', '場所', 'الموقع', 'lokasi', 'địa điểm', 'स्थान', 'স্থান', 'مقام']],
        ['agenda', ['agenda', 'schedule', 'gundem', 'program', 'tagesordnung', 'ordre du jour', 'agendamento', 'pauta', 'повестка', '议程', 'アジェンダ', 'جدول الأعمال', 'جدول', 'agenda rapat', 'chuong trinh', 'chương trình', 'एजेंडा', 'এজেন্ডা', 'ایجنڈا']],
        ['position', ['position', 'job title', 'title', 'role', 'job', 'unvan', 'pozisyon', 'gorev', 'titel', 'poste', 'cargo', 'должность', '职位', '役職', 'المنصب', 'jabatan', 'chức vụ', 'पद', 'পদবি', 'عہدہ', 'pekerjaan']]
    ];

    const RULES = RULE_DEFS.map(([type, phrases]) => ({
        type,
        phrases: phrases.map(p => tokenize(p)).filter(t => t.length > 0)
    }));

    // Otomatik tamamlama (autocomplete) belirteçleri: en güvenilir sinyal, önce bunlara bakılır
    const AUTOCOMPLETE_TYPES = {
        'given-name': 'firstName', 'additional-name': 'middleName', 'family-name': 'lastName', 'name': 'fullName',
        'email': 'email', 'tel': 'phone', 'tel-national': 'phone', 'street-address': 'address',
        'address-line1': 'address', 'address-line2': 'address', 'address-line3': 'address',
        'address-level1': 'state', 'address-level2': 'city', 'postal-code': 'zip',
        'country': 'country', 'country-name': 'country', 'organization': 'company',
        'organization-title': 'position', 'bday': 'date', 'new-password': 'password',
        'current-password': 'password', 'url': 'url', 'username': 'username'
    };

    // input.type sinyalleri: metin tabanlı kurallardan önce gelir
    const TYPE_SIGNALS = {
        email: 'email', tel: 'phone', url: 'url', password: 'password',
        date: 'date', 'datetime-local': 'datetime'
    };

    // Sayı alanına (type="number") yalnız rakamla yazılabilen türler: telefon, posta kodu ve kimlik numaraları
    // etiketten tanınır; diğer her şey sayı olarak kalır
    const NUMERIC_TYPES = new Set(['phone', 'zip', 'idNumber', 'taxId', 'number']);

    // autocomplete jetonu, sonra metin kaynakları (öncelik sırasıyla)
    function classifyByText(sources, autocomplete) {
        const ac = String(autocomplete || '').trim().split(/\s+/).pop().toLowerCase();
        if (AUTOCOMPLETE_TYPES[ac]) return AUTOCOMPLETE_TYPES[ac];
        const tokenSets = (sources || []).map(tokenize).filter(t => t.length > 0);
        for (const rule of RULES) {
            for (const phrase of rule.phrases) {
                for (const tokens of tokenSets) {
                    if (matchesPhrase(tokens, phrase)) return rule.type;
                }
            }
        }
        return null;
    }

    // Alan türü: önce input.type, sonra autocomplete, sonra metin kaynakları (öncelik sırasıyla).
    // Tanınmazsa null döner; çağıran select/text/date gibi yapısal yedekleri uygular.
    function classify(sources, meta) {
        const info = meta || {};
        if (TYPE_SIGNALS[info.inputType]) return TYPE_SIGNALS[info.inputType];
        const detected = classifyByText(sources, info.autocomplete);
        if (info.inputType === 'number') return NUMERIC_TYPES.has(detected) ? detected : 'number';
        return detected;
    }

    // Onay kutusu sınıfı: 'marketing' (bülten, tanıtım), 'consent' (şartlar, gizlilik, KVKK, açık rıza) ya da 'other'.
    // Pazarlama önce denetlenir: bir kutu hem gizlilik hem bülten diyorsa işaretlenmez.
    const MARKETING_WORDS = ['newsletter', 'bülten', 'kampanya', 'promosyon', 'pazarlama', 'reklam', 'marketing', 'promo',
        'boletín', 'publicidad', 'promoción', 'lettre d\'information', 'prospection', 'werbung', 'boletim', 'рассылк',
        'реклам', '营销', '广告', 'マーケティング', 'ニュースレター', 'النشرة', 'تسويق', 'विपणन', 'প্রচার', 'মার্কেটিং',
        'خبرنامہ', 'مارکیٹنگ', 'pemasaran', 'buletin', 'tiếp thị', 'quảng cáo', 'bản tin'];
    const CONSENT_WORDS = ['kabul', 'onay', 'beyan', 'açık rıza', 'aydınlatma', 'kvkk', 'şart', 'koşul', 'okudum',
        'accept', 'agree', 'terms', 'privacy', 'consent', 'gdpr', 'acepto', 'términos', 'condiciones', 'accepte',
        'conditions', 'vie privée', 'akzeptiere', 'datenschutz', 'einwilligung', 'aceito', 'termos', 'privacidade',
        'согласен', 'принимаю', 'условия', 'конфиденциальн', '同意', '利用規約', 'プライバシー', 'أوافق', 'الشروط',
        'الخصوصية', 'सहमत', 'शर्त', 'गोपनीयता', 'সম্মত', 'শর্ত', 'গোপনীয়তা', 'متفق', 'رضامند', 'شرائط', 'setuju',
        'syarat', 'privasi', 'đồng ý', 'điều khoản', 'quyền riêng tư'];
    function containsWord(text, word) {
        // ASCII anahtarlar kelime başında eşleşir ("promo" ↔ "promotional", "agree" ↔ "disagree" değil)
        if (/^[\x00-\x7f]+$/.test(word)) return new RegExp('(^|[^a-z])' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(text);
        return text.includes(word);
    }
    function classifyCheckbox(sources) {
        const text = (sources || []).join(' ').toLocaleLowerCase('tr').replace(/i̇/g, 'i');
        if (MARKETING_WORDS.some(w => containsWord(text, w))) return 'marketing';
        if (CONSENT_WORDS.some(w => containsWord(text, w))) return 'consent';
        return 'other';
    }

    return { fold, tokenize, classify, classifyCheckbox, RULES, AUTOCOMPLETE_TYPES };
})();

if (typeof module !== 'undefined') {
    module.exports = FillHubDetect;
}
