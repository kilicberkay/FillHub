// Araç çubuğu açılır penceresi: ülke ve profil seçimi, doldur ve geri al. Seçimler ayarlara kalıcı olarak yazılır.
(() => {
    const countrySelect = document.getElementById('popupCountry');
    const profileSelect = document.getElementById('popupProfile');
    const fillBtn = document.getElementById('popupFillBtn');
    const undoBtn = document.getElementById('popupUndoBtn');
    const settingsBtn = document.getElementById('popupSettingsBtn');
    const result = document.getElementById('popupResult');

    let text = I18N.en;

    // Metinler ayar sayfasıyla aynı tablodan okunur; kimliği eşleşen her öğe çevrilir
    function applyText(strings) {
        Object.keys(strings).forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.innerText = strings[id];
        });
    }

    function showResult(message) {
        result.textContent = message;
        result.hidden = false;
    }

    function fillCountries(preferredLocale) {
        countrySelect.innerHTML = '';
        FakeDataGenerator.getCountries().forEach((c) => {
            const opt = document.createElement('option');
            opt.value = FakeDataGenerator.localeForCountry(c.code);
            opt.textContent = c.name;
            countrySelect.appendChild(opt);
        });
        countrySelect.value = preferredLocale;
    }

    function fillProfiles(profiles, activeProfileId) {
        profileSelect.innerHTML = '';
        (profiles || []).forEach((p) => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            profileSelect.appendChild(opt);
        });
        profileSelect.value = activeProfileId;
    }

    async function init() {
        const state = await chrome.storage.local.get(null);
        const lang = I18N[state.uiLang] ? state.uiLang : 'en';
        text = I18N[lang];
        applyText(text);
        document.documentElement.lang = lang;
        fillCountries(state.preferredLocale || FakeDataGenerator.canonicalLocale(navigator.language));
        fillProfiles(state.profiles, state.activeProfileId || 'default');
    }

    countrySelect.addEventListener('change', () => {
        chrome.storage.local.set({ preferredLocale: countrySelect.value });
        result.hidden = true;
    });

    profileSelect.addEventListener('change', () => {
        chrome.storage.local.set({ activeProfileId: profileSelect.value });
        result.hidden = true;
    });

    // Arka plan etkin sekmeyi bulur ve içerik betiğinin yanıtını döner
    async function runAction(action) {
        fillBtn.disabled = true;
        undoBtn.disabled = true;
        const response = await chrome.runtime.sendMessage({ type: 'popup-action', action }).catch(() => null);
        fillBtn.disabled = false;
        undoBtn.disabled = false;
        if (!response || response.status !== 'success') {
            showResult(text.popupNoPage);
            return;
        }
        showResult(action === 'undo' ? `${text.popupUndone} ${response.restored}` : `${text.popupFilled} ${response.filled}`);
    }

    fillBtn.addEventListener('click', () => runAction('fill'));
    undoBtn.addEventListener('click', () => runAction('undo'));
    settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

    init();
})();
