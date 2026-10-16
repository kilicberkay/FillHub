// Tanılama raporu: hata bildirirken kullanıcının kendisinin paylaşabileceği özet. Tarayıcıda global, Node'da module.exports.
// Profil adları, kurallar, site adresleri, alan değerleri ve etiketler dışarıda bırakılır; yalnızca sayılar ve bayraklar yer alır.
const FillHubDiagnostics = (() => {
    const FORMAT = 'fillhub-diagnostics';
    const VERSION = 1;
    const FLAG_KEYS = ['piiSafe', 'autoSubmit', 'checkAllBoxes', 'consentBoxes', 'smartEmail', 'matchPasswords', 'onboardingComplete'];

    const count = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

    // Son doldurma özeti yalnızca beyan edilen alanlarla kopyalanır; beklenmeyen alanlar düşer
    function sanitizeFill(report) {
        const detected = {};
        if (report.detected && typeof report.detected === 'object') {
            for (const [type, n] of Object.entries(report.detected)) {
                if (/^[a-zA-Z]{1,40}$/.test(type)) detected[type] = count(n);
            }
        }
        return {
            at: typeof report.at === 'string' ? report.at : null,
            filled: count(report.filled),
            detected,
            captchaVisible: report.captchaVisible === true,
            siteExcluded: report.siteExcluded === true,
            submitRequested: report.submitRequested === true,
            durationMs: count(report.durationMs)
        };
    }

    function createReport({ state, lastFillReport, extensionVersion, userAgent, now = new Date() }) {
        const flags = Object.fromEntries(FLAG_KEYS.map((k) => [k, !!state[k]]));
        return {
            format: FORMAT,
            version: VERSION,
            generatedAt: now.toISOString(),
            extensionVersion: String(extensionVersion || ''),
            userAgent: String(userAgent || ''),
            settings: {
                preferredLocale: typeof state.preferredLocale === 'string' ? state.preferredLocale : null,
                uiLang: typeof state.uiLang === 'string' ? state.uiLang : null,
                ...flags,
                profileCount: Array.isArray(state.profiles) ? state.profiles.length : 0,
                ruleCount: Array.isArray(state.customRules) ? state.customRules.length : 0,
                excludedSiteCount: Array.isArray(state.noAutoSubmitSites) ? state.noAutoSubmitSites.length : 0
            },
            lastFill: lastFillReport && typeof lastFillReport === 'object' ? sanitizeFill(lastFillReport) : null
        };
    }

    return { createReport };
})();

if (typeof module !== 'undefined') {
    module.exports = FillHubDiagnostics;
}
