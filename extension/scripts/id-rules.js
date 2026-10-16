// Ülkeye özgü kimlik, vergi ve IBAN kuralları.
// Her algoritma, bilinen geçerli bir örnekle (test vektörü) sınanabildiyse "sağlama" olarak anılır;
// yalnızca biçimi bilinenler "biçim" olarak üretilir ve geçerliliği iddia edilmez.
// Tarayıcıda global (FillHubIdRules), Node'da module.exports olarak kullanılır.
const FillHubIdRules = (() => {
    const rndInt = (n) => Math.floor(Math.random() * n);
    const randDigits = (n) => Array.from({ length: n }, () => rndInt(10)).join('');
    const digitsOf = (s) => String(s).split('').map(Number);
    const pad = (n, width) => String(n).padStart(width, '0');

    // ---------- TR: TCKN (sağlama doğrulandı: 10000000146) ----------
    function tcknGenerate() {
        const d = [1 + rndInt(9), ...digitsOf(randDigits(8))];
        const odd = d[0] + d[2] + d[4] + d[6] + d[8];
        const even = d[1] + d[3] + d[5] + d[7];
        const d10 = (((odd * 7 - even) % 10) + 10) % 10;
        d.push(d10);
        const d11 = d.reduce((a, b) => a + b, 0) % 10;
        d.push(d11);
        return d.join('');
    }
    function tcknValid(s) {
        if (!/^\d{11}$/.test(s) || s[0] === '0') return false;
        const d = digitsOf(s);
        const odd = d[0] + d[2] + d[4] + d[6] + d[8];
        const even = d[1] + d[3] + d[5] + d[7];
        if ((((odd * 7 - even) % 10) + 10) % 10 !== d[9]) return false;
        return d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === d[10];
    }

    // ---------- TR: VKN (biçim: 10 hane; sağlama algoritması tek vektörle doğrulanamadı) ----------
    function vknGenerate() {
        return String(1 + rndInt(9)) + randDigits(9);
    }
    function vknValid(s) {
        return /^\d{10}$/.test(s);
    }

    // ---------- BR: CPF (sağlama doğrulandı: 529.982.247-25) ----------
    function cpfCheck(base9) {
        const d = digitsOf(base9);
        const calc = (len) => {
            let sum = 0;
            for (let i = 0; i < len; i++) sum += d[i] * (len + 1 - i);
            const r = sum % 11;
            return r < 2 ? 0 : 11 - r;
        };
        const d10 = calc(9);
        const d11 = (() => {
            const all = [...d, d10];
            let sum = 0;
            for (let i = 0; i < 10; i++) sum += all[i] * (11 - i);
            const r = sum % 11;
            return r < 2 ? 0 : 11 - r;
        })();
        return `${d10}${d11}`;
    }
    function cpfGenerate() {
        let base;
        do { base = randDigits(9); } while (/^(\d)\1{8}$/.test(base));
        return base + cpfCheck(base);
    }
    function cpfValid(s) {
        if (!/^\d{11}$/.test(s) || /^(\d)\1{10}$/.test(s)) return false;
        return cpfCheck(s.slice(0, 9)) === s.slice(9);
    }

    // ---------- BR: CNPJ (sağlama doğrulandı: 11.222.333/0001-81) ----------
    const CNPJ_W1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const CNPJ_W2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    function cnpjCheck(base12) {
        const d = digitsOf(base12);
        const dv = (w, arr) => {
            const sum = arr.reduce((a, v, i) => a + v * w[i], 0);
            const r = sum % 11;
            return r < 2 ? 0 : 11 - r;
        };
        const c1 = dv(CNPJ_W1, d);
        const c2 = dv(CNPJ_W2, [...d, c1]);
        return `${c1}${c2}`;
    }
    function cnpjGenerate() {
        const base = randDigits(8) + '0001';
        return base + cnpjCheck(base);
    }
    function cnpjValid(s) {
        return /^\d{14}$/.test(s) && cnpjCheck(s.slice(0, 12)) === s.slice(12);
    }

    // ---------- CN: 18 haneli kimlik (sağlama: MOD 11-2, "11010519491231002X") ----------
    const CN_W = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const CN_MAP = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    function cnCheck(base17) {
        const d = digitsOf(base17);
        const sum = d.reduce((a, v, i) => a + v * CN_W[i], 0);
        return CN_MAP[sum % 11];
    }
    // birthDate: "YYYY-MM-DD"; male: true → erkek (tek sıra no), false → kadın (çift)
    function cnGenerate(birthDate, male) {
        const region = pad(110000 + rndInt(550000), 6);
        const ymd = birthDate.replace(/-/g, '');
        let seq = pad(rndInt(999), 3);
        const last = Number(seq[2]);
        const want = male ? last % 2 === 1 : last % 2 === 0;
        if (!want) seq = seq.slice(0, 2) + String(last === 9 ? 8 : last + 1);
        const base = region + ymd + seq;
        return base + cnCheck(base);
    }
    function cnValid(s) {
        return /^\d{17}[\dX]$/.test(s) && cnCheck(s.slice(0, 17)) === s[17];
    }

    // ---------- IN: Aadhaar (Verhoeff; "2363" → kontrol 3) ----------
    const VD = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    const VP = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];
    const VINV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
    // Verhoeff kontrol hanesi: taşıyıcı numaranın sağdan sola dizisi
    function verhoeffCheckDigit(num) {
        const d = digitsOf(num).reverse();
        let c = 0;
        for (let i = 0; i < d.length; i++) c = VD[c][VP[(i + 1) % 8][d[i]]];
        return VINV[c];
    }
    function verhoeffValid(full) {
        const d = digitsOf(full).reverse();
        let c = 0;
        for (let i = 0; i < d.length; i++) c = VD[c][VP[i % 8][d[i]]];
        return c === 0;
    }
    function aadhaarGenerate() {
        const base = String(2 + rndInt(8)) + randDigits(10);
        return base + verhoeffCheckDigit(base);
    }
    function aadhaarValid(s) {
        return /^[2-9]\d{11}$/.test(s) && verhoeffValid(s);
    }

    // ---------- RU: SNILS (sağlama: "112-233-445 95" → 11223344595) ----------
    function snilsCheck(base9) {
        const d = digitsOf(base9);
        const sum = d.reduce((a, v, i) => a + v * (9 - i), 0);
        if (sum < 100) return pad(sum, 2);
        if (sum === 100 || sum === 101) return '00';
        return pad(sum % 101 === 100 ? 0 : sum % 101, 2);
    }
    function snilsGenerate() {
        const base = randDigits(9);
        return base + snilsCheck(base);
    }
    function snilsValid(s) {
        return /^\d{11}$/.test(s) && snilsCheck(s.slice(0, 9)) === s.slice(9);
    }

    // ---------- RU: INN (sağlama: 10 hane "7707083893" doğrulandı; 12 hane biçim+algoritma, vektörsüz) ----------
    const INN10_W = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    const INN11_W = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const INN12_W = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    function innGenerate() {
        const base = String(1 + rndInt(9)) + randDigits(8);
        const c = digitsOf(base).reduce((a, v, i) => a + v * INN10_W[i], 0) % 11 % 10;
        return base + c;
    }
    function innValid(s) {
        if (!/^\d{10}$/.test(s)) return false;
        const d = digitsOf(s);
        return d.slice(0, 9).reduce((a, v, i) => a + v * INN10_W[i], 0) % 11 % 10 === d[9];
    }

    // ---------- JP: マイナンバー (sağlama: 123456789018 vektörüyle sınanır) ----------
    function myNumberCheck(base11) {
        const d = digitsOf(base11);
        // n sağdan sayılır: en sağdaki hane n=1
        const sum = d.reduce((a, v, i) => {
            const n = 11 - i;
            const q = n <= 6 ? n + 1 : n - 5;
            return a + v * q;
        }, 0);
        const r = sum % 11;
        return r <= 1 ? 0 : 11 - r;
    }
    function myNumberGenerate() {
        const base = randDigits(11);
        return base + myNumberCheck(base);
    }
    function myNumberValid(s) {
        return /^\d{12}$/.test(s) && myNumberCheck(s.slice(0, 11)) === Number(s[11]);
    }

    // ---------- FR: NIR (anahtar = 97 − (ilk 13 hane mod 97)) ----------
    // birthDate: "YYYY-MM-DD"; male: erkek → 1, kadın → 2
    function nirGenerate(birthDate, male) {
        const sex = male ? 1 : 2;
        const yy = birthDate ? birthDate.slice(2, 4) : pad(rndInt(100), 2);
        const mm = birthDate ? birthDate.slice(5, 7) : pad(1 + rndInt(12), 2);
        const dept = pad(1 + rndInt(95), 2);
        const commune = pad(rndInt(1000), 3);
        const order = pad(1 + rndInt(999), 3);
        const base = `${sex}${yy}${mm}${dept}${commune}${order}`;
        const key = 97 - (Number(base) % 97);
        return base + pad(key, 2);
    }
    function nirValid(s) {
        if (!/^\d{15}$/.test(s)) return false;
        return 97 - (Number(s.slice(0, 13)) % 97) === Number(s.slice(13));
    }

    // ---------- MX: CURP (sağlama: Ñ, A=10…N=23, Ñ=24, O=25…; vektörler: BOXW310820HNERXN09) ----------
    const CURP_DICT = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    function curpCheck(base17) {
        let sum = 0;
        for (let i = 0; i < 17; i++) sum += CURP_DICT.indexOf(base17[i]) * (18 - i);
        return (10 - (sum % 10)) % 10;
    }
    function curpGenerate(birthDate, male, stateCode) {
        const letters = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const ymd = birthDate.slice(2, 4) + birthDate.slice(5, 7) + birthDate.slice(8, 10);
        const pick = (s) => s[rndInt(s.length)];
        const base = pick(letters) + pick('AEIOU') + pick(letters) + pick(letters) + ymd
            + (male ? 'H' : 'M') + stateCode + pick(consonants) + pick(consonants) + pick(consonants)
            + pick('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        return base + curpCheck(base);
    }
    function curpValid(s) {
        return /^[A-ZÑ]{4}\d{6}[HM][A-ZÑ]{5}[A-Z0-9Ñ]\d$/.test(s) && curpCheck(s.slice(0, 17)) === Number(s[17]);
    }

    // ---------- IBAN (mod 97; sağlama: DE89370400440532013000, GB82WEST12345698765432) ----------
    function ibanMod97(s) {
        let r = 0;
        for (const ch of s) {
            const v = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
            for (const d of v) r = (r * 10 + Number(d)) % 97;
        }
        return r;
    }
    function ibanBuild(cc, bban) {
        const check = 98 - ibanMod97(bban + cc + '00');
        return cc + pad(check, 2) + bban;
    }
    function ibanValid(iban) {
        const s = String(iban).replace(/\s/g, '').toUpperCase();
        if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s)) return false;
        return ibanMod97(s.slice(4) + s.slice(0, 4)) === 1;
    }

    // ---------- Biçim-only üretimler (sağlama iddia edilmez) ----------
    const alnum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randAlnum = (n) => Array.from({ length: n }, () => alnum[rndInt(alnum.length)]).join('');
    const randLetters = (n) => Array.from({ length: n }, () => letters[rndInt(letters.length)]).join('');
    const yymmdd = (iso) => iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10);
    const ddmmyy = (iso) => iso.slice(8, 10) + iso.slice(5, 7) + iso.slice(2, 4);

    // IN PAN: AAAPA1234A (dördüncü harf P = bireysel)
    const panGenerate = () => `${randLetters(3)}P${randLetters(1)}${randDigits(4)}${randLetters(1)}`;
    // MX RFC: 4 harf + YYMMDD + 3 homoklav karakteri
    const rfcGenerate = (birthDate) => `${randLetters(4)}${yymmdd(birthDate)}${randAlnum(3)}`;
    // CN birleşik sosyal kredi kodu: 18 karakter, dışlanmış harfler (I O S U Z V) yok
    const usccChars = '0123456789ABCDEFGHJKLMNPQRTUWXY';
    const usccGenerate = () => Array.from({ length: 18 }, () => usccChars[rndInt(usccChars.length)]).join('');
    // EG kimlik: yüzyıl (2|3) + YYMMDD + yönetim kodu (2) + sıra (4) + kontrol (1)
    const egIdGenerate = (birthDate) => {
        const century = birthDate.slice(0, 4) < '2000' ? '2' : '3';
        return `${century}${yymmdd(birthDate)}${pad(1 + rndInt(35), 2)}${randDigits(5)}`;
    };
    // PK CNIC: 13 hane; son hane cinsiyet paritesi (tek erkek, çift kadın)
    function cnicGenerate(birthDate, male) {
        const base = randDigits(12);
        const last = male ? [1, 3, 5, 7, 9][rndInt(5)] : [0, 2, 4, 6, 8][rndInt(5)];
        return base + last;
    }
    // BD NID: 10 hane
    // ID NIK: 6 hane bölge + DDMMYY (kadında gün +40) + 4 hane sıra
    function nikGenerate(birthDate, male) {
        const day = Number(birthDate.slice(8, 10)) + (male ? 0 : 40);
        return `${randDigits(6)}${pad(day, 2)}${birthDate.slice(5, 7)}${birthDate.slice(2, 4)}${randDigits(4)}`;
    }
    // VN CCCD: 3 hane il + cinsiyet/yüzyıl (erkek çift, kadın tek) + YY + 6 hane sıra
    function vnCccdGenerate(birthDate, male) {
        const century = Number(birthDate.slice(0, 4)) >= 2000 ? 2 : 0;
        const genderDigit = century + (male ? 0 : 1);
        return `${randDigits(3)}${genderDigit}${birthDate.slice(2, 4)}${randDigits(6)}`;
    }
    // DE Steuer-ID: 11 hane (biçim: ilk hane 1-9)
    const deSteuerGenerate = () => String(1 + rndInt(9)) + randDigits(10);
    // Biçim üreticileri (ülke vergi/kimlik numaraları; sağlama algoritması kullanılmaz)
    const formats = {
        pan: { generate: panGenerate, check: 'format' },
        rfc: { generate: rfcGenerate, check: 'format' },
        uscc: { generate: usccGenerate, check: 'format' },
        egId: { generate: egIdGenerate, check: 'format' },
        egTax: { generate: () => randDigits(9), check: 'format' },
        siren13: { generate: () => randDigits(13), check: 'format' },
        bdNid: { generate: () => randDigits(10), check: 'format' },
        bdTin: { generate: () => randDigits(12), check: 'format' },
        cnic: { generate: cnicGenerate, check: 'format' },
        ntn: { generate: () => randDigits(7), check: 'format' },
        nik: { generate: nikGenerate, check: 'format' },
        npwp: { generate: () => randDigits(15), check: 'format' },
        deId: { generate: () => randAlnum(9), check: 'format' },
        deSteuer: { generate: deSteuerGenerate, check: 'format' },
        hojin: { generate: () => randDigits(13), check: 'format' },
        vnCccd: { generate: vnCccdGenerate, check: 'format' },
        vnMst: { generate: () => randDigits(10), check: 'format' }
    };

    // ---------- PII Safe: test değerleri ----------
    // d: 1-9 arası kişiye sabit tekrar rakamı. Sağlaması olan türler doğrulayıcıdan geçer;
    // birthDate/male gerektiren türler doğum tarihi ve cinsiyetle tutarlı üretilir.
    const ddmmyyOf = (iso, male) => pad(Number(iso.slice(8, 10)) + (male ? 0 : 40), 2) + iso.slice(5, 7) + iso.slice(2, 4);
    const SENTINEL = {
        tckn: (d) => `${d}`.repeat(10) + '0',
        vkn: (d) => `${d}`.repeat(10),
        cpf: (d) => { const b = `${d}`.repeat(8) + '0'; return b + cpfCheck(b); },
        cnpj: (d) => { const b = `${d}`.repeat(8) + '0001'; return b + cnpjCheck(b); },
        cnId: (d, iso, male) => { const b = '110101' + iso.replace(/-/g, '') + (male ? '001' : '002'); return b + cnCheck(b); },
        aadhaar: (d) => { const b = String(2 + (d % 8)) + `${d}`.repeat(10); return b + verhoeffCheckDigit(b); },
        snils: (d) => { const b = `${d}`.repeat(9); return b + snilsCheck(b); },
        inn: (d) => { const b = `${d}`.repeat(9); return b + (digitsOf(b).reduce((a, v, i) => a + v * INN10_W[i], 0) % 11 % 10); },
        myNumber: (d) => { const b = `${d}`.repeat(11); return b + myNumberCheck(b); },
        nir: (d, iso, male) => { const b = (male ? '1' : '2') + iso.slice(2, 4) + iso.slice(5, 7) + '75001001'; return b + pad(97 - (Number(b) % 97), 2); },
        curp: () => 'XEXX010101HNEXXXA4',
        ssn: () => '123-45-6789',
        ein: () => '12-3456789',
        pan: (d) => 'ABCPA' + `${d}`.repeat(4) + 'E',
        rfc: () => 'XAXX010101000',
        bdNid: (d) => `${d}`.repeat(10),
        bdTin: (d) => `${d}`.repeat(12),
        egId: (d) => '2000101' + '01' + `${d}`.repeat(5),
        egTax: (d) => `${d}`.repeat(9),
        siren13: (d) => `${d}`.repeat(13),
        cnic: (d, iso, male) => `${d}`.repeat(12) + (male ? '1' : '2'),
        ntn: (d) => `${d}`.repeat(7),
        nik: (d, iso, male) => '350101' + ddmmyyOf(iso, male) + '0001',
        npwp: (d) => `${d}`.repeat(15),
        deId: (d) => 'T' + `${d}`.repeat(8),
        deSteuer: (d) => `${d}`.repeat(11),
        hojin: (d) => `${d}`.repeat(13),
        vnCccd: (d) => '001' + '0' + '00' + `${d}`.repeat(6),
        vnMst: (d) => `${d}`.repeat(10),
        uscc: (d) => '9' + `${d}`.repeat(17),
        inn12: (d) => { const b10 = `${d}`.repeat(10); const n11 = digitsOf(b10).reduce((a, v, i) => a + v * INN11_W[i], 0) % 11 % 10; const b11 = b10 + n11; return b11 + (digitsOf(b11).reduce((a, v, i) => a + v * INN12_W[i], 0) % 11 % 10); }
    };
    // IBAN PII: sıfır BBAN + geçerli kontrol hanesi (ülkeye göre BBAN biçimi)
    const IBAN_ZERO_BBAN = {
        DE: '0'.repeat(18), FR: '0'.repeat(23), TR: '0'.repeat(22), EG: '0'.repeat(25),
        PK: 'ABCD' + '0'.repeat(16), BR: '0'.repeat(24) + 'C'
    };
    function sentinel(key, d, birthDate, male) {
        const fn = SENTINEL[key];
        return fn ? fn(d, birthDate || '1990-01-01', male !== false) : '';
    }
    function ibanSentinel(cc) {
        return IBAN_ZERO_BBAN[cc] ? ibanBuild(cc, IBAN_ZERO_BBAN[cc]) : null;
    }

    return {
        ...formats,
        inn12: {
            // Algoritma standart (ağırlıklar); bilinen bir 12 haneli vektörle sınanmadı
            generate() {
                const first10 = randDigits(10);
                const n11 = digitsOf(first10).reduce((a, v, i) => a + v * INN11_W[i], 0) % 11 % 10;
                const base = first10 + n11;
                const n12 = digitsOf(base).reduce((a, v, i) => a + v * INN12_W[i], 0) % 11 % 10;
                return base + n12;
            },
            valid(s) {
                if (!/^\d{12}$/.test(s)) return false;
                const d = digitsOf(s);
                const n11 = d.slice(0, 10).reduce((a, v, i) => a + v * INN11_W[i], 0) % 11 % 10;
                const n12 = d.slice(0, 11).reduce((a, v, i) => a + v * INN12_W[i], 0) % 11 % 10;
                return n11 === d[10] && n12 === d[11];
            },
            check: 'algorithm'
        },
        tckn: { generate: tcknGenerate, valid: tcknValid, check: 'checksum' },
        vkn: { generate: vknGenerate, valid: vknValid, check: 'format' },
        cpf: { generate: cpfGenerate, valid: cpfValid, check: 'checksum' },
        cnpj: { generate: cnpjGenerate, valid: cnpjValid, check: 'checksum' },
        cnId: { generate: cnGenerate, valid: cnValid, check: 'checksum' },
        aadhaar: { generate: aadhaarGenerate, valid: aadhaarValid, check: 'checksum' },
        snils: { generate: snilsGenerate, valid: snilsValid, check: 'checksum' },
        inn: { generate: innGenerate, valid: innValid, check: 'checksum' },
        myNumber: { generate: myNumberGenerate, valid: myNumberValid, check: 'checksum' },
        nir: { generate: nirGenerate, valid: nirValid, check: 'checksum' },
        curp: { generate: curpGenerate, valid: curpValid, check: 'checksum' },
        iban: { build: ibanBuild, valid: ibanValid, check: 'checksum' },
        ssn: {
            generate() {
                let area;
                do { area = 100 + rndInt(800); } while (area === 666);
                return `${area}-${pad(1 + rndInt(99), 2)}-${pad(1 + rndInt(9999), 4)}`;
            },
            check: 'format'
        },
        ein: { generate: () => `${pad(10 + rndInt(90), 2)}-${randDigits(7)}`, check: 'format' },
        sentinel,
        ibanSentinel,
        randDigits,
        randAlnum,
        pad,
        rndInt,
        verhoeffCheckDigit
    };
})();

if (typeof module !== 'undefined') {
    module.exports = FillHubIdRules;
}
