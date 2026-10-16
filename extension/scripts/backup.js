// Yedekleme: ayarlar, profiller ve özel kurallar tek bir JSON dosyasında. Tarayıcıda global, Node'da module.exports.
// İçe aktarılan dosya dışarıdan gelir; her alan burada doğrulanır ve yalnızca bilinen biçimde kopyalanır.
const FillHubBackup = (() => {
    const FORMAT = 'fillhub-backup';
    const VERSION = 1;
    const MAX_BYTES = 1000000;
    const MAX_PROFILES = 50;
    const MAX_RULES = 200;
    const MAX_SITES = 200;
    const MAX_DEPTH = 6;
    const BOOL_KEYS = ['smartEmail', 'matchPasswords', 'checkAllBoxes', 'consentBoxes', 'piiSafe', 'autoSubmit', 'onboardingComplete'];
    const LOCALE_RE = /^[a-z]{2}-[A-Z]{2}$/;
    const UI_LANG_RE = /^[a-z]{2}$/;
    const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
    const PIN_KEYS = new Set(['firstName', 'lastName', 'email', 'phone', 'password']);

    // Profilin sabit değerleri: yalnızca bilinen alanlar, boş olmayan kısa metinler
    function isPinnedValues(v) {
        if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
        return Object.keys(v).every((k) => PIN_KEYS.has(k) && typeof v[k] === 'string' && v[k].trim().length > 0 && v[k].length <= 200);
    }

    function createBackup(state, now = new Date()) {
        return {
            format: FORMAT,
            version: VERSION,
            exportedAt: now.toISOString(),
            data: {
                theme: state.theme,
                preferredLocale: state.preferredLocale,
                uiLang: state.uiLang,
                ...Object.fromEntries(BOOL_KEYS.map((k) => [k, !!state[k]])),
                activeProfileId: state.activeProfileId,
                profiles: state.profiles.map((p) => copyData(p)),
                customRules: state.customRules.map((r) => ({ selector: r.selector, type: r.type })),
                noAutoSubmitSites: (state.noAutoSubmitSites || []).slice()
            }
        };
    }

    // Düz veri ağacı: dizgi, sonlu sayı, boolean, null, dizi ve sınırlı derinlikte nesne (kimlik kaydı bunları içerir)
    function isPlainData(v, depth = 0) {
        if (depth > MAX_DEPTH) return false;
        if (v === null || typeof v === 'boolean') return true;
        if (typeof v === 'number') return Number.isFinite(v);
        if (typeof v === 'string') return v.length <= 500;
        if (Array.isArray(v)) return v.length <= 100 && v.every((x) => isPlainData(x, depth + 1));
        if (typeof v === 'object') {
            const keys = Object.keys(v);
            return keys.length <= 100 && keys.every((k) => !UNSAFE_KEYS.has(k) && k.length <= 64 && isPlainData(v[k], depth + 1));
        }
        return false;
    }

    // Kopya JSON üzerinden alınır: yalnızca düz veri kalır, nesne bağlantıları taşınmaz
    function copyData(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function fail(field) {
        return { ok: false, reason: 'field', field };
    }

    // Dönüş: { ok: true, data } ya da { ok: false, reason: 'format' | 'field', field? }
    // isValidSelector: CSS seçicinin sözdizimini denetler (tarayıcıda document, testlerde basit bir sınama)
    // isValidHost: site istisnası alan adlarını denetler; verilmezse hiçbir alan adı kabul edilmez
    function validateBackup(input, { isValidSelector = () => true, knownTypes = [], isValidHost = () => false } = {}) {
        if (!input || typeof input !== 'object' || input.format !== FORMAT || input.version !== VERSION) {
            return { ok: false, reason: 'format' };
        }
        const d = input.data;
        if (!d || typeof d !== 'object' || Array.isArray(d)) return { ok: false, reason: 'format' };

        const out = {};
        if (d.theme !== undefined) {
            if (d.theme !== 'dark' && d.theme !== 'light') return fail('theme');
            out.theme = d.theme;
        }
        if (d.preferredLocale !== undefined) {
            if (typeof d.preferredLocale !== 'string' || !LOCALE_RE.test(d.preferredLocale)) return fail('preferredLocale');
            out.preferredLocale = d.preferredLocale;
        }
        if (d.uiLang !== undefined) {
            if (typeof d.uiLang !== 'string' || !UI_LANG_RE.test(d.uiLang)) return fail('uiLang');
            out.uiLang = d.uiLang;
        }
        for (const k of BOOL_KEYS) {
            if (d[k] === undefined) continue;
            if (typeof d[k] !== 'boolean') return fail(k);
            out[k] = d[k];
        }
        if (d.activeProfileId !== undefined) {
            if (typeof d.activeProfileId !== 'string' || !d.activeProfileId || d.activeProfileId.length > 64) return fail('activeProfileId');
            out.activeProfileId = d.activeProfileId;
        }
        if (d.profiles !== undefined) {
            if (!Array.isArray(d.profiles) || d.profiles.length === 0 || d.profiles.length > MAX_PROFILES) return fail('profiles');
            const seen = new Set();
            out.profiles = d.profiles.map((p) => {
                if (!p || typeof p !== 'object' || typeof p.id !== 'string' || !p.id || p.id.length > 64 || seen.has(p.id)) return null;
                if (typeof p.name !== 'string' || !p.name.trim() || p.name.length > 60) return null;
                if (p.mode !== 'random' && p.mode !== 'fixed') return null;
                seen.add(p.id);
                const item = { id: p.id, name: p.name.trim(), mode: p.mode };
                if (p.mode === 'fixed') {
                    if (!p.identity || typeof p.identity !== 'object' || Array.isArray(p.identity) || !isPlainData(p.identity)) return null;
                    item.identity = copyData(p.identity);
                }
                if (p.values !== undefined) {
                    if (!isPinnedValues(p.values)) return null;
                    item.values = copyData(p.values);
                }
                return item;
            });
            if (out.profiles.includes(null)) return fail('profiles');
        }
        if (d.customRules !== undefined) {
            if (!Array.isArray(d.customRules) || d.customRules.length > MAX_RULES) return fail('customRules');
            out.customRules = d.customRules.map((r) => {
                if (!r || typeof r !== 'object' || typeof r.selector !== 'string') return null;
                const selector = r.selector.trim();
                if (!selector || selector.length > 300 || !isValidSelector(selector)) return null;
                if (typeof r.type !== 'string' || (knownTypes.length && !knownTypes.includes(r.type))) return null;
                return { selector, type: r.type };
            });
            if (out.customRules.includes(null)) return fail('customRules');
        }
        if (d.noAutoSubmitSites !== undefined) {
            if (!Array.isArray(d.noAutoSubmitSites) || d.noAutoSubmitSites.length > MAX_SITES) return fail('noAutoSubmitSites');
            const sites = d.noAutoSubmitSites.map((h) => (typeof h === 'string' && isValidHost(h) ? h : null));
            if (sites.includes(null)) return fail('noAutoSubmitSites');
            out.noAutoSubmitSites = [...new Set(sites)];
        }
        return { ok: true, data: out };
    }

    return { FORMAT, VERSION, MAX_BYTES, createBackup, validateBackup };
})();

if (typeof module !== 'undefined') {
    module.exports = FillHubBackup;
}
