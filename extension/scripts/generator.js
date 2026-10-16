const FakeDataGenerator = (() => {
    const COUNTRIES = [
        { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" }, { code: "AS", name: "American Samoa" },
        { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AI", name: "Anguilla" }, { code: "AQ", name: "Antarctica" },
        { code: "AG", name: "Antigua and Barbuda" }, { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AW", name: "Aruba" },
        { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
        { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" }, { code: "BY", name: "Belarus" },
        { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" }, { code: "BJ", name: "Benin" }, { code: "BM", name: "Bermuda" },
        { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" }, { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" },
        { code: "BR", name: "Brazil" }, { code: "IO", name: "British Indian Ocean Territory" }, { code: "VG", name: "British Virgin Islands" },
        { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" }, { code: "BI", name: "Burundi" },
        { code: "KH", name: "Cambodia" }, { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CV", name: "Cape Verde" },
        { code: "KY", name: "Cayman Islands" }, { code: "CF", name: "Central African Republic" }, { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" },
        { code: "CN", name: "China" }, { code: "CX", name: "Christmas Island" }, { code: "CC", name: "Cocos [Keeling] Islands" }, { code: "CO", name: "Colombia" },
        { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo - Brazzaville" }, { code: "CD", name: "Congo - Kinshasa" }, { code: "CK", name: "Cook Islands" },
        { code: "CR", name: "Costa Rica" }, { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" },
        { code: "CZ", name: "Czech Republic" }, { code: "CI", name: "Côte d’Ivoire" }, { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" },
        { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" },
        { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" },
        { code: "ET", name: "Ethiopia" }, { code: "FK", name: "Falkland Islands" }, { code: "FO", name: "Faroe Islands" }, { code: "FJ", name: "Fiji" },
        { code: "FI", name: "Finland" }, { code: "FR", name: "France" }, { code: "GF", name: "French Guiana" }, { code: "PF", name: "French Polynesia" },
        { code: "TF", name: "French Southern Territories" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" },
        { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" }, { code: "GI", name: "Gibraltar" }, { code: "GR", name: "Greece" },
        { code: "GL", name: "Greenland" }, { code: "GD", name: "Grenada" }, { code: "GP", name: "Guadeloupe" }, { code: "GU", name: "Guam" },
        { code: "GT", name: "Guatemala" }, { code: "GG", name: "Guernsey" }, { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" },
        { code: "GY", name: "Guyana" }, { code: "HT", name: "Haiti" }, { code: "HM", name: "Heard Island and McDonald Islands" }, { code: "HN", name: "Honduras" },
        { code: "HK", name: "Hong Kong SAR China" }, { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
        { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" },
        { code: "IM", name: "Isle of Man" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" },
        { code: "JP", name: "Japan" }, { code: "JE", name: "Jersey" }, { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" },
        { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" }, { code: "KW", name: "Kuwait" }, { code: "KG", name: "Kyrgyzstan" },
        { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" },
        { code: "LR", name: "Liberia" }, { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" },
        { code: "LU", name: "Luxembourg" }, { code: "MO", name: "Macau SAR China" }, { code: "MK", name: "Macedonia" }, { code: "MG", name: "Madagascar" },
        { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
        { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MQ", name: "Martinique" }, { code: "MR", name: "Mauritania" },
        { code: "MU", name: "Mauritius" }, { code: "YT", name: "Mayotte" }, { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" },
        { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" }, { code: "ME", name: "Montenegro" },
        { code: "MS", name: "Montserrat" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" }, { code: "MM", name: "Myanmar [Burma]" },
        { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" }, { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" },
        { code: "AN", name: "Netherlands Antilles" }, { code: "NC", name: "New Caledonia" }, { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" },
        { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" }, { code: "NU", name: "Niue" }, { code: "NF", name: "Norfolk Island" },
        { code: "KP", name: "North Korea" }, { code: "MP", name: "Northern Mariana Islands" }, { code: "NO", name: "Norway" }, { code: "OM", name: "Oman" },
        { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" }, { code: "PS", name: "Palestinian Territories" }, { code: "PA", name: "Panama" },
        { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" }, { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" },
        { code: "PN", name: "Pitcairn Islands" }, { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" }, { code: "PR", name: "Puerto Rico" },
        { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" }, { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" },
        { code: "RE", name: "Réunion" }, { code: "BL", name: "Saint Barthélemy" }, { code: "SH", name: "Saint Helena" }, { code: "KN", name: "Saint Kitts and Nevis" },
        { code: "LC", name: "Saint Lucia" }, { code: "MF", name: "Saint Martin" }, { code: "PM", name: "Saint Pierre and Miquelon" }, { code: "VC", name: "Saint Vincent and the Grenadines" },
        { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "São Tomé and Príncipe" }, { code: "SA", name: "Saudi Arabia" },
        { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" }, { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" },
        { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" },
        { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" }, { code: "GS", name: "South Georgia and the South Sandwich Islands" }, { code: "KR", name: "South Korea" },
        { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" }, { code: "SR", name: "Suriname" },
        { code: "SJ", name: "Svalbard and Jan Mayen" }, { code: "SZ", name: "Swaziland" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
        { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" }, { code: "TZ", name: "Tanzania" },
        { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TK", name: "Tokelau" },
        { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" },
        { code: "TM", name: "Turkmenistan" }, { code: "TC", name: "Turks and Calvert Islands" }, { code: "TV", name: "Tuvalu" }, { code: "UM", name: "U.S. Minor Outlying Islands" },
        { code: "VI", name: "U.S. Virgin Islands" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" },
        { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
        { code: "VU", name: "Vanuatu" }, { code: "VA", name: "Vatican City" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" },
        { code: "WF", name: "Wallis and Futuna" }, { code: "EH", name: "Western Sahara" }, { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" },
        { code: "ZW", name: "Zimbabwe" }
    ];

    // Veri ve kimlik kuralları: tarayıcıda global, Node'da require ile
    const LOCALE_DATA = (typeof FillHubLocaleData !== 'undefined') ? FillHubLocaleData : require('./locale-data.js');
    const ID_RULES = (typeof FillHubIdRules !== 'undefined') ? FillHubIdRules : require('./id-rules.js');
    const LANGS = LOCALE_DATA.languages;
    const PROFILES = LOCALE_DATA.countries;

    const COUNTRY_CODES = new Set(COUNTRIES.map(c => c.code.toUpperCase()));

    // Hedef dışı ülkelerin dili (seçici ve tarayıcı dili için). Dil havuzu yoksa İngilizce.
    const COUNTRY_LANGUAGE = {
        GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en', ZA: 'en', SG: 'en', PH: 'en', NG: 'en', KE: 'en', GH: 'en',
        AT: 'de', CH: 'de', LI: 'de', LU: 'de',
        BE: 'fr', MC: 'fr', CI: 'fr', SN: 'fr', CD: 'fr', CM: 'fr', MA: 'ar', DZ: 'ar', TN: 'ar', SA: 'ar', AE: 'ar',
        IQ: 'ar', JO: 'ar', LB: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', SY: 'ar', LY: 'ar', YE: 'ar',
        ES: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', CU: 'es', EC: 'es', BO: 'es', PY: 'es', UY: 'es',
        GT: 'es', HN: 'es', NI: 'es', SV: 'es', CR: 'es', PA: 'es', DO: 'es',
        PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
        IT: 'en', VA: 'en', SM: 'en', NL: 'en', SE: 'en', NO: 'en', DK: 'en', FI: 'en', PL: 'en', GR: 'en', IL: 'en',
        UA: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', UZ: 'ru', TJ: 'ru', TM: 'ru', AZ: 'ru', AM: 'ru', GE: 'ru',
        HK: 'zh', TW: 'zh', MO: 'zh',
        IN: 'hi', NP: 'hi', BD: 'bn', PK: 'ur', ID: 'id', VN: 'vi'
    };

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const digitsOf = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
    const pad2 = (n) => String(n).padStart(2, '0');
    // E-posta / kullanıcı adı yerel kısmı: aksanlar ve özel harfler açılır (ı→i, đ→d, ß→ss…)
    const slug = (value) => String(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd').replace(/ß/g, 'ss').replace(/ø/g, 'o').replace(/ł/g, 'l')
        .replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/ı/g, 'i').replace(/[^a-z0-9]/g, '');

    // Dil ve ülke kanonik biçimi: "xx-YY". Çıplak dil kodu dildir (ar → ar-EG); bölgeli değer bölgeyi korur.
    // Eski kayıtlardaki çıplak ülke kodları (us, tr, de…) ülke olarak çözülür.
    function languageOfCountry(cc) {
        const known = COUNTRY_LANGUAGE[cc];
        if (known && LANGS[known]) return known;
        const profile = PROFILES[cc];
        return profile ? profile.lang : 'en';
    }

    function canonicalLocale(input) {
        const raw = String(input || '').trim().replace(/_/g, '-');
        const parts = raw.split('-');
        const lang = (parts[0] || '').toLowerCase();
        const region = (parts[1] || '').toUpperCase();
        if (region.length === 2 && COUNTRY_CODES.has(region)) {
            return `${LANGS[lang] ? lang : languageOfCountry(region)}-${region}`;
        }
        if (LANGS[lang]) return `${lang}-${LANGS[lang].defaultCountry}`;
        const bare = lang.toUpperCase();
        if (COUNTRY_CODES.has(bare)) return `${languageOfCountry(bare)}-${bare}`;
        return 'en-US';
    }

    function resolveLocale(input) {
        const canon = canonicalLocale(input);
        const [lang, country] = canon.split('-');
        const pools = LANGS[lang] || LANGS.en;
        const profile = PROFILES[country] || PROFILES[pools.defaultCountry] || PROFILES.US;
        return { lang, country, pools, profile };
    }

    // Kişinin ülke profili (kişi kaydında profil referansı tutulmaz; ülke kodundan yeniden çözülür)
    function profileOf(person) {
        return resolveLocale(`${person.lang}-${person.country}`).profile;
    }

    // Yerel yazı tercihi: dil Latin ise her zaman Latin; değilse ctx.script, yoksa ülkenin varsayılanı
    function wantNative(r, ctx) {
        if (r.pools.script === 'Latin') return false;
        if (ctx.script === 'native') return true;
        if (ctx.script === 'latin') return false;
        return r.profile.defaultScript === 'native';
    }

    function feminizeRu(surname) {
        return /[бвгджзклмнпрстфхцчшщ]$/i.test(surname) ? surname + 'а' : surname;
    }

    // Ad seçimi: her kayıt {n: yerel, l: Latin}. Ad ile soyad aynı olamaz (R8).
    function pickName(pools, male) {
        for (let attempt = 0; attempt < 50; attempt++) {
            let first;
            let middle = null;
            let idx;
            if (pools.firstNamesM) {
                idx = randomInt(0, pools.firstNamesM.length - 1);
                first = male
                    ? { n: pools.firstNamesM[idx], l: pools.firstNamesMLatin[idx] }
                    : { n: pools.firstNamesF[randomInt(0, pools.firstNamesF.length - 1)], l: null };
                if (!male) {
                    const fi = pools.firstNamesF.indexOf(first.n);
                    first.l = pools.firstNamesFLatin[fi];
                }
                const patro = pools.patronymicsM[idx];
                middle = { n: male ? patro : patro.replace(/ович$/, 'овна').replace(/евич$/, 'евна'), l: null };
            } else {
                idx = randomInt(0, pools.firstNames.length - 1);
                const latin = pools.firstNamesLatin || pools.firstNames;
                first = { n: pools.firstNames[idx], l: latin[idx] };
                if (pools.middleNamesM) {
                    const m = random(male ? pools.middleNamesM : pools.middleNamesF);
                    middle = { n: m, l: m };
                }
            }
            const lIdx = randomInt(0, pools.lastNames.length - 1);
            const latinLast = pools.lastNamesLatin || pools.lastNames;
            let last = { n: pools.lastNames[lIdx], l: latinLast[lIdx] };
            if (pools.firstNamesM && !male) last = { n: feminizeRu(last.n), l: last.l + 'a' };
            // Karşılaştırma ASCII karşılıklarla da yapılır: "Tú" ve "Từ" ikisi de "Tu" olur (ad=soyad sayılır)
            if (first.n !== last.n && slug(first.l) !== slug(last.l)) return { first, last, middle };
        }
        return null;
    }

    // Ad sıralaması: aile önce (zh, ja, vi) ya da ad önce; Latin karşılıklar Batı sırasına uyar
    function joinName(pools, person, native) {
        const f = native ? person.first.n : person.first.l;
        const l = native ? person.last.n : person.last.l;
        const m = person.middle ? (native ? person.middle.n : person.middle.l) : null;
        if (pools.order === 'family-first' && native) {
            return [l, m, f].filter(Boolean).join(pools.joiner === '' ? '' : ' ');
        }
        if (pools.order === 'family-first' && !native && pools.script === 'Latin') {
            return [l, m, f].filter(Boolean).join(' ');
        }
        return [f, m, l].filter(Boolean).join(' ');
    }

    // Posta kodu: şehrin öneki + rastgele haneler; ayraç (ör. BR 01310-100, JP 100-0001)
    function buildPostal(profile, city) {
        const spec = profile.postal;
        const prefix = city.prefix || '';
        let code = prefix + digitsOf(Math.max(0, spec.length - prefix.length));
        if (spec.sep) code = code.slice(0, spec.sep.at) + spec.sep.char + code.slice(spec.sep.at);
        return code;
    }

    // Telefon (ulusal anlamlı kısım). Şablon: {p} önek, {area} alan kodu, {fill2} 2 hane, {fill} kalan hane
    function buildPhoneNsn(profile, city) {
        const spec = profile.phone;
        let s = spec.template || '{p}{fill}';
        const prefix = spec.prefixes ? random(spec.prefixes) : '';
        s = s.replace(/\{p\}/g, prefix).replace(/\{area\}/g, city && city.area ? city.area : '');
        s = s.replace(/\{fill2\}/g, digitsOf(2));
        const fillCount = spec.length - s.replace('{fill}', '').length;
        return s.replace('{fill}', digitsOf(Math.max(0, fillCount)));
    }

    // PII Safe telefonu: operatör öneki (veya alan kodu) + sıfırlar → TR: 5320000000
    function buildPiiPhoneNsn(profile, city) {
        const spec = profile.phone;
        const prefix = spec.prefixes ? random(spec.prefixes) : (city && city.area ? city.area : '');
        return (prefix + '0'.repeat(Math.max(0, spec.length - prefix.length))).slice(0, spec.length);
    }

    // Çıktı biçimi: "+" ile başlayan yer tutucu uluslararası; trunk ile başlayan yer tutucu yerel; varsayılan ülke kuralı
    function phoneOutput(profile, nsn, placeholder) {
        const spec = profile.phone;
        const hint = String(placeholder || '').trim();
        if (/^\+/.test(hint)) return `+${spec.cc}${nsn}`;
        const trunk = spec.trunk || '';
        if (trunk && hint.startsWith(trunk)) return trunk + nsn;
        if (trunk && spec.defaultTrunk) return trunk + nsn;
        return nsn;
    }

    const IBAN_BBAN = {
        DE: () => digitsOf(18),
        FR: () => digitsOf(23),
        TR: () => digitsOf(5) + '0' + digitsOf(16),
        EG: () => digitsOf(25),
        PK: () => Array.from({ length: 4 }, () => String.fromCharCode(65 + randomInt(0, 25))).join('') + digitsOf(16),
        BR: () => digitsOf(8) + digitsOf(5) + digitsOf(10) + random(['C', 'P']) + digitsOf(1)
    };

    // Kimlik üretimi: gerçekçi değerler ve PII Safe test değerleri birlikte döner (kişi sabit kalır)
    function buildIds(profile, cc, birthDate, male, d) {
        const idSpec = profile.ids || {};
        const gen = (key) => {
            const rule = ID_RULES[key];
            if (!rule) return '';
            if (key === 'curp') return rule.generate(birthDate, male, random(['DF', 'JC', 'NL', 'MC', 'VZ', 'JL', 'GT', 'CH']));
            if (['nir', 'cnId', 'cnic', 'nik', 'vnCccd', 'egId', 'rfc'].includes(key)) return rule.generate(birthDate, male);
            return rule.generate();
        };
        const sent = (key) => ID_RULES.sentinel(key, d, birthDate, male);
        const realIban = profile.iban && IBAN_BBAN[cc] ? ID_RULES.iban.build(cc, IBAN_BBAN[cc]()) : null;
        const piiIban = profile.iban ? ID_RULES.ibanSentinel(cc) : null;
        return {
            real: { person: gen(idSpec.person), tax: gen(idSpec.tax), iban: realIban },
            pii: { person: sent(idSpec.person), tax: sent(idSpec.tax), iban: piiIban }
        };
    }

    function buildAddress(profile, person, native) {
        const template = native && profile.address.native ? profile.address.native : profile.address.latin;
        const latinStreets = profile.streetsLatin || profile.streets;
        const latinDistricts = profile.districtsLatin || profile.districts || [''];
        const city = person.city;
        const tokens = {
            num: randomInt(1, 999),
            street: native ? random(profile.streets || ['']) : random(latinStreets || ['']),
            city: native ? city.name : (city.latin || city.name),
            region: city.region,
            zip: person.zip,
            // İlçe önce şehrin kendi listesinden (ör. TR), yoksa ülke listesinden seçilir
            district: random(city.districts || (native ? (profile.districts || ['']) : latinDistricts))
        };
        tokens.area = random((profile.areas || ['']));
        tokens.apt = randomInt(1, 400);
        tokens.st = randomInt(1, 20);
        tokens.rt = randomInt(1, 15);
        tokens.rw = randomInt(1, 15);
        tokens.chome = randomInt(1, 9);
        tokens.banchi = randomInt(1, 30);
        tokens.go = randomInt(1, 30);
        tokens.ward = profile.wards ? random(native ? profile.wards : (profile.wardsLatin || profile.wards)) : '';
        tokens.colonia = profile.colonias ? random(profile.colonias) : '';
        tokens.bairro = profile.bairros ? random(profile.bairros) : '';
        tokens.mahalle = profile.lang === 'tr' ? `${random(['Cumhuriyet', 'Yenişehir', 'Atatürk', 'Güzelyurt', 'Merkez'])} Mah.` : '';
        return template.replace(/\{(\w+)\}/g, (m, key) => (tokens[key] !== undefined && tokens[key] !== null ? String(tokens[key]) : m));
    }

    // PII Safe adresi: test sokağı + ayrılmış numara + posta kodu + şehir (ör. "Test Sokak No:42 34000 Kadıköy")
    function buildPiiAddress(profile, person, native, pools) {
        const city = person.city;
        const cityName = native ? city.name : (city.latin || city.name);
        return `${pools.testStreet} No:${randomInt(1, 99)} ${person.zip} ${cityName}`;
    }

    // Tek doldurmada tutarlı kişi. Düz, JSON'lanabilir bir kayıt döner (profil veya havuz referansı yok).
    // Kayıt iki kimlik kümesi taşır: gerçekçi (real) ve PII Safe test değerleri (pii).
    function createPerson(input, opts) {
        const r = resolveLocale(input);
        const male = Math.random() < 0.5;
        const d = randomInt(1, 9);
        const d0 = randomDateParts();
        const birthDate = `${d0.year}-${pad2(d0.month)}-${pad2(d0.day)}`;
        const name = pickName(r.pools, male) || pickName(r.pools, male);
        const city = { ...random(r.profile.cities) };
        const zip = buildPostal(r.profile, city);
        const ids = buildIds(r.profile, r.country, birthDate, male, d);
        const first = name.first;
        const last = name.last;
        const companyPool = r.profile.companies;
        const companyIdx = randomInt(0, companyPool.length - 1);
        const companyLatin = r.profile.companiesLatin ? r.profile.companiesLatin[companyIdx] : null;
        const emailLocal = `${slug(first.l)}.${slug(last.l)}${randomInt(10, 99)}`;
        const person = {
            tag: digitsOf(8),
            lang: r.lang,
            country: r.country,
            male,
            sentinel: d,
            birthDate,
            first,
            last,
            middle: name.middle,
            city,
            zip,
            phoneNsn: buildPhoneNsn(r.profile, city),
            phonePii: buildPiiPhoneNsn(r.profile, city),
            ids: ids.real,
            piiIds: ids.pii,
            company: companyPool[companyIdx],
            companyLatin: companyLatin || companyPool[companyIdx],
            position: random(r.pools.positionTypes),
            emailLocal,
            emailDomain: random(['example.com', 'test.com', 'mail.com', 'demo.org']),
            piiEmailDomain: random(['example.com', 'example.org', 'test.example.com']),
            username: `${slug(first.l)}${slug(last.l)}${randomInt(10, 999)}`
        };
        person.fullNative = joinName(r.pools, person, true);
        person.fullLatin = joinName(r.pools, person, false);
        return person;
    }

    // Etkin kimlik: sabit kimlik modundaki şablonun kişisi; yoksa null (çağıran rastgele üretir)
    function activeIdentity(settings) {
        const list = Array.isArray(settings && settings.profiles) ? settings.profiles : [];
        const p = list.find(x => x && x.id === (settings && settings.activeProfileId));
        return p && p.mode === 'fixed' && p.identity ? p.identity : null;
    }

    // Sabit değerler: aktif profilde kullanıcının belirlediği alanlar (boş olanlar yok sayılır). Her iki modda geçerlidir.
    const PIN_KEYS = ['firstName', 'lastName', 'email', 'phone', 'password'];
    function activeValues(settings) {
        const list = Array.isArray(settings && settings.profiles) ? settings.profiles : [];
        const p = list.find(x => x && x.id === (settings && settings.activeProfileId));
        const out = {};
        if (!p || !p.values || typeof p.values !== 'object') return out;
        for (const key of PIN_KEYS) {
            const v = p.values[key];
            if (typeof v === 'string' && v.trim()) out[key] = v.trim().slice(0, 200);
        }
        return out;
    }

    // Kişinin adını ve soyadını değiştirir; tam ad ve e-posta yerel kısmı bu adlarla tutarlı kalır
    function withNames(person, firstName, lastName) {
        const out = { ...person, first: { n: firstName, l: firstName }, last: { n: lastName, l: lastName } };
        out.fullNative = `${firstName} ${lastName}`;
        out.fullLatin = out.fullNative;
        const digits = /(\d{2})$/.exec(person.emailLocal || '');
        out.emailLocal = `${slugOf(firstName)}.${slugOf(lastName)}${digits ? digits[1] : randomInt(10, 99)}`;
        return out;
    }

    // Eski sürüm şablonlarını yeni modele taşır. "default" her zaman rastgele; eski dolu şablon sabit kimlik olur.
    function migrateProfiles(profiles, locale) {
        const list = Array.isArray(profiles) ? profiles : [];
        let changed = false;
        const out = list.map((p) => {
            if (!p || typeof p !== 'object') { changed = true; return null; }
            if (p.mode === 'fixed' && p.identity) return p;
            if (p.mode === 'random') return p;
            changed = true;
            if (p.id === 'default') return { id: 'default', name: 'Standard Persona', mode: 'random' };
            if (typeof p.firstName === 'string' && typeof p.lastName === 'string') {
                const identity = createPerson(locale, {});
                identity.first = { n: p.firstName, l: p.firstName };
                identity.last = { n: p.lastName, l: p.lastName };
                identity.fullNative = `${p.firstName} ${p.lastName}`;
                identity.fullLatin = identity.fullNative;
                identity.emailLocal = slugOf(p.firstName) + '.' + slugOf(p.lastName) + randomInt(10, 99);
                return { id: p.id, name: p.name || 'Persona', mode: 'fixed', identity };
            }
            return { id: p.id, name: p.name || 'Persona', mode: 'random' };
        }).filter(Boolean);
        if (!out.some(p => p.id === 'default')) {
            out.unshift({ id: 'default', name: 'Standard Persona', mode: 'random' });
            changed = true;
        }
        return { profiles: out, changed };
    }
    function slugOf(v) { return slug(v) || 'user'; }

    // Kişi özeti (ayar sayfası için): "Elif Kaplan · Kadıköy · 5320000000"
    function describePerson(person) {
        if (!person) return '';
        const name = `${person.first.l} ${person.last.l}`;
        return `${name} · ${person.city.name} · +${profileOf(person).phone.cc} ${person.phoneNsn}`;
    }

    // ---------- Metin/desen yardımcıları ----------
    const PATTERN_CLASSES = { 'd': '0123456789', 'w': 'abcdefghijklmnopqrstuvwxyz0123456789' };
    const PATTERN_CLASS_BODIES = {
        '0-9': '0123456789',
        'a-z': 'abcdefghijklmnopqrstuvwxyz',
        'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'a-zA-Z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'A-Za-z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '0-9a-zA-Z': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'a-zA-Z0-9': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    };

    // `pattern` alt kümesini (sınıflar, {n} niceleyicileri, kaçışlı ayraçlar) karşılayan değer üretir
    function generateFromPattern(pattern) {
        const source = String(pattern || '');
        if (!source || source.length > 120) return null;
        let out = '';
        let i = 0;
        while (i < source.length) {
            const ch = source[i];
            if ((ch === '^' && i === 0) || (ch === '$' && i === source.length - 1)) { i++; continue; }
            let pool = null;
            if (ch === '\\') {
                const next = source[i + 1];
                if (!next) return null;
                pool = PATTERN_CLASSES[next] || null;
                if (!pool && !/[a-zA-Z0-9]/.test(next)) { out += next; i += 2; continue; }
                if (!pool) return null;
                i += 2;
            } else if (ch === '[') {
                const close = source.indexOf(']', i + 1);
                if (close === -1) return null;
                pool = PATTERN_CLASS_BODIES[source.slice(i + 1, close)] || null;
                if (!pool) return null;
                i = close + 1;
            } else if ('*+?()|.{}[]'.includes(ch)) {
                return null;
            } else {
                out += ch;
                i++;
                continue;
            }
            let count = 1;
            if (source[i] === '{') {
                const close = source.indexOf('}', i);
                if (close === -1) return null;
                const spec = /^(\d{1,3})(?:,\d{0,3})?$/.exec(source.slice(i + 1, close));
                if (!spec) return null;
                count = Number(spec[1]);
                i = close + 1;
            }
            if (count < 1 || count > 32) return null;
            for (let n = 0; n < count; n++) out += pool[Math.floor(Math.random() * pool.length)];
            if (out.length > 64) return null;
        }
        if (!out) return null;
        try {
            if (!new RegExp('^(?:' + source + ')$').test(out)) return null;
        } catch (e) {
            return null;
        }
        return out;
    }

    // "2024/123" gibi örnek şablonu aynı biçimde doldurur (# ve rakamlar basamak yer tutucu)
    function fillFromShape(shape) {
        let out = '';
        let atRunStart = true;
        for (const ch of String(shape)) {
            if (ch === '#' || (ch >= '0' && ch <= '9')) {
                out += atRunStart ? String(randomInt(1, 9)) : String(randomInt(0, 9));
                atRunStart = false;
            } else {
                out += ch;
                atRunStart = true;
            }
        }
        return out;
    }

    // Tarih parçaları: yıl 2000 ile içinde bulunulan yıl arasından rastgele (hep bu yıl olmasın)
    // Metni en fazla max karakter olacak şekilde kırpar; mümkünse kelime sınırında keser (CJK için sert kesim)
    function trimToLength(text, max) {
        if (!(max > 0) || text.length <= max) return text;
        const cut = text.slice(0, max);
        const space = cut.lastIndexOf(' ');
        return (space > max / 2 ? cut.slice(0, space) : cut).trimEnd();
    }

    function randomDateParts() {
        const minYear = 2000;
        const maxYear = new Date().getFullYear();
        return {
            year: minYear + Math.floor(Math.random() * (maxYear - minYear + 1)),
            month: Math.floor(Math.random() * 12) + 1,
            day: Math.floor(Math.random() * 28) + 1
        };
    }

    const DOMAINS = ['example.com', 'test.com', 'mail.com', 'demo.org'];

    return {
        getLocales() { return Object.keys(LANGS); },
        getCountries() { return COUNTRIES; },
        canonicalLocale,
        // Ülke seçicisinin değeri: ülkenin dili + ülke kodu (ör. MX → es-MX)
        localeForCountry(cc) { return canonicalLocale(`${languageOfCountry(String(cc).toUpperCase())}-${String(cc).toUpperCase()}`); },
        resolveLocale,
        profileOf,
        createPerson,
        createIdentity: (input) => createPerson(input, {}),
        activeIdentity,
        activeValues,
        withNames,
        migrateProfiles,
        describePerson,
        getDataTypes() {
            return ["firstName", "lastName", "middleName", "fullName", "username", "email", "phone", "phoneCode", "address", "city", "state", "country", "zip", "company", "website", "text", "date", "datetime", "select", "password", "number", "url", "meeting", "organizer", "location", "agenda", "position", "idNumber", "taxId", "iban"];
        },
        generate(type, inputLocale = 'en', context = {}) {
            // CHAOS MODE / FUZZING LOGIC
            if (context.chaosMode) {
                const chaosVectors = [
                    "' OR '1'='1", // SQLi
                    "<script>alert(1)</script>", // XSS
                    "admin' --", // SQLi
                    "{{7*7}}", // SSTI
                    "A".repeat(1000), // Buffer Overflow / Length check
                    "test@example.com%00.jpg", // Null Byte
                    "NaN",
                    "undefined",
                    "null",
                    "1E+308" // Large Number
                ];

                // Return context-specific chaos or random vector
                switch (type) {
                    case 'email': return "not-an-email@" + "A".repeat(200) + ".com";
                    case 'number': return "-99999999999";
                    case 'date': return "9999-99-99";
                    case 'url': return "javascript:alert(1)";
                    case 'password': return "' OR '1'='1";
                    default: return chaosVectors[Math.floor(Math.random() * chaosVectors.length)];
                }
            }

            const r = resolveLocale(inputLocale);
            const person = context.person || createPerson(inputLocale, {});
            const profile = profileOf(person);
            const pools = r.pools;
            const native = wantNative(r, context);
            const pii = !!context.piiSafe;
            const pick = (list) => random(list);

            // Alanın HTML `pattern` kuralı desteklenen alt kümedeyse önce o karşılanır
            if (context.pattern) {
                const patternValue = generateFromPattern(context.pattern);
                if (patternValue) return patternValue;
            }

            switch (type) {
                case 'firstName': return native ? person.first.n : person.first.l;
                case 'lastName': return native ? person.last.n : person.last.l;
                case 'middleName': return person.middle ? (native ? person.middle.n : (person.middle.l || person.middle.n)) : pick(pools.firstNames || pools.firstNamesM);
                case 'fullName': return native ? person.fullNative : person.fullLatin;
                case 'username': return person.username;
                case 'email': {
                    // Aynı kişi aynı e-postayı verir (onay alanı eşleşir); akıllı bağlantı kapalıysa bağımsız
                    if (context.smartEmail === false) return `${slug(person.first.l)}${randomInt(10, 999)}@${pick(DOMAINS)}`;
                    return `${person.emailLocal}@${pii ? person.piiEmailDomain : person.emailDomain}`;
                }
                case 'phone': return phoneOutput(profile, pii ? person.phonePii : person.phoneNsn, context.placeholder);
                case 'phoneCode': return `+${profile.phone.cc}`;
                case 'address': return pii ? buildPiiAddress(profile, person, native, pools) : buildAddress(profile, person, native);
                case 'city': return native ? person.city.name : (person.city.latin || person.city.name);
                case 'state': return person.city.region;
                case 'country': {
                    const entry = COUNTRIES.find(c => c.code === person.country);
                    return entry ? entry.name : profile.name;
                }
                case 'zip': return person.zip;
                case 'company': {
                    if (pii) return `${pools.testCompany} ${randomInt(1000, 9999)}`;
                    return native ? person.company : person.companyLatin;
                }
                case 'website': {
                    if (pii) return 'https://www.example.org';
                    return `https://www.${slug(person.companyLatin || person.company)}.com`;
                }
                case 'idNumber': return pii ? person.piiIds.person : person.ids.person;
                case 'taxId': return pii ? person.piiIds.tax : person.ids.tax;
                case 'iban': return (pii ? person.piiIds.iban : person.ids.iban) || '';
                case 'url': {
                    // Yalnızca RFC 2606 ayrılmış alan adları: gerçek bir siteye yönlenmez
                    const domains = ['example.com', 'example.org', 'example.net'];
                    return `https://www.${pick(domains)}${pick(['', '/', '/test', '/demo', '/sample-page'])}`;
                }
                case 'meeting': return pools.meetingTypes ? pick(pools.meetingTypes) : "Project Sync";
                case 'organizer': return pools.organizerTypes ? pick(pools.organizerTypes) : "Admin";
                case 'location': return pools.locationTypes ? pick(pools.locationTypes) : "Room 101";
                case 'agenda': return pools.agendaTypes ? pick(pools.agendaTypes) : "1. Review\n2. Plan";
                case 'position': return pools.positionTypes ? pick(pools.positionTypes) : "Employee";
                case 'text': {
                    const fname = (context.fieldName || '').toLowerCase();
                    const shaped = context.valueShape ? fillFromShape(context.valueShape) : null;
                    if (shaped) return shaped;
                    if (fname.includes('agenda')) return "Agenda items...";
                    // Specific logic for QR Names based on what might be selected
                    if (fname.includes('qr_name') || fname.includes('kayıt ismi') || fname.includes('qrcode')) {
                        const types = ["Business Card", "Website Link", "Event Pass", "Wifi Access", "Portfolio"];
                        return types[Math.floor(Math.random() * types.length)] + " - " + new Date().getFullYear();
                    }
                    // Rich text: yalnız çok satırlı alanlarda HTML gövde
                    if (context.multiline && (fname.includes('text') || fname.includes('icerik') || fname.includes('content'))) {
                        return `<h2>${pick(pools.sampleShort)}</h2><p>${pick(pools.sampleLong)}</p><ul><li>${pick(pools.sampleShort)}</li><li>${pick(pools.sampleShort)}</li></ul>`;
                    }
                    // Yerel dilde örnek metin: çok satırlı alanlarda uzun, diğerlerinde kısa; maxlength'e uyar
                    const bank = context.multiline ? pools.sampleLong : pools.sampleShort;
                    return trimToLength(bank ? pick(bank) : 'Sample text.', context.maxLength);
                }
                case 'date': {
                    const d = randomDateParts();
                    return `${d.year}-${d.month.toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`;
                }
                case 'datetime': {
                    const d = randomDateParts();
                    const hour = Math.floor(Math.random() * 14) + 8; // 08:00 - 22:00
                    const minute = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
                    return `${d.year}-${d.month.toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                }
                case 'password': return "P@ssw0rd123!";
                case 'number': return Math.floor(Math.random() * 100).toString();
                case 'select': return null; // Handled in content script
                default:
                    return "Data " + Math.floor(Math.random() * 1000);
            }
        }
    };
})();

if (typeof module !== 'undefined') {
    module.exports = FakeDataGenerator;
}
