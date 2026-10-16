// Site istisnaları: otomatik gönderimin kapalı olduğu alan adları. Tarayıcıda global, Node'da module.exports.
// Bir girdi (ör. "bank.com") o alan adını ve tüm alt alan adlarını (secure.bank.com) kapsar.
const FillHubSiteRules = (() => {
    const HOST_RE = /^(?=.{1,253}$)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

    // Serbest metni (URL, "www." ya da büyük harf içeren giriş dahil) kanonik alan adına çevirir; geçersizse null
    function normalizeHost(input) {
        const raw = String(input || '').trim().toLowerCase();
        if (!raw) return null;
        try {
            const withScheme = /^[a-z][a-z0-9+.-]*:\/\//.test(raw) ? raw : `http://${raw}`;
            const host = new URL(withScheme).hostname.replace(/\.$/, '');
            return HOST_RE.test(host) ? host.replace(/^www\./, '') : null;
        } catch (e) {
            return null;
        }
    }

    function isValidHost(host) {
        return typeof host === 'string' && HOST_RE.test(host);
    }

    // pageHost: sayfanın (üst düzey) alan adı; listedeki bir girdiyle eşleşirse true
    function matchesSite(pageHost, list) {
        const host = normalizeHost(pageHost);
        if (!host || !Array.isArray(list)) return false;
        return list.some((entry) => host === entry || host.endsWith(`.${entry}`));
    }

    return { normalizeHost, isValidHost, matchesSite };
})();

if (typeof module !== 'undefined') {
    module.exports = FillHubSiteRules;
}
