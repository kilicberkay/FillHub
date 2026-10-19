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
        // Tema ayar sayfasıyla aynıdır: <html> üzerindeki .dark sınıfı ve data-theme
        const dark = state.theme !== 'light';
        document.documentElement.classList.toggle('dark', dark);
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
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

    // Popup'ın kendi sekme ve pencere kimlikleri: arka plan hedef sekmeyi bunları dışlayarak bulur.
    // Açılır pencere bir sekme olarak açılırsa getCurrent sekmeyi verir; pencere kimliği de sekmeden gelir.
    async function ownIds() {
        const self = await chrome.tabs.getCurrent().catch(() => null);
        const win = await chrome.windows.getCurrent().catch(() => null);
        return {
            popupTabId: self && Number.isInteger(self.id) ? self.id : -1,
            popupWindowId: win && Number.isInteger(win.id) ? win.id : -1
        };
    }

    // Arka plan etkin sekmeyi bulur ve içerik betiğinin yanıtını döner
    async function runAction(action) {
        fillBtn.disabled = true;
        undoBtn.disabled = true;
        const ids = await ownIds();
        const response = await chrome.runtime.sendMessage({ type: 'popup-action', action, ...ids }).catch(() => null);
        fillBtn.disabled = false;
        undoBtn.disabled = false;
        if (!response || response.status !== 'success') {
            showResult(text.popupNoPage);
            return;
        }
        if (action === 'undo') {
            showResult(response.restored === 0 ? text.popupNothingToUndo : `${text.popupUndone} ${response.restored}`);
        } else if (response.filled === 0) {
            showResult(text.popupNoFields);
        } else {
            showResult(`${text.popupFilled} ${response.filled}`);
        }
    }

    fillBtn.addEventListener('click', () => runAction('fill'));
    undoBtn.addEventListener('click', () => runAction('undo'));
    settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

    // Seçici testi: etkin sayfada seçicinin eşleştiği alan sayısı. Geçersiz seçici tarayıcıda reddedilir.
    const selectorInput = document.getElementById('popupSelector');
    const selectorTestBtn = document.getElementById('ruleTestBtn');
    const selectorResult = document.getElementById('popupSelectorResult');

    function isValidSelector(selector) {
        try {
            document.createDocumentFragment().querySelector(selector);
            return true;
        } catch (e) {
            return false;
        }
    }

    function showSelectorResult(message, isError) {
        selectorResult.textContent = message;
        selectorResult.classList.toggle('text-rose-600', isError);
        selectorResult.classList.toggle('dark:text-rose-400', isError);
        selectorResult.classList.toggle('text-soft', !isError);
        selectorResult.hidden = false;
    }

    selectorTestBtn.addEventListener('click', async () => {
        const selector = selectorInput.value.trim();
        if (!selector || !isValidSelector(selector)) {
            showSelectorResult(text.ruleSelectorError, true);
            return;
        }
        // Popup'ın kendi sekme kimliği: test ortamında popup sekme olarak açılır ve etkin sekme olabilir
        const ids = await ownIds();
        const response = await chrome.runtime.sendMessage({ type: 'selector-test', selector, ...ids }).catch(() => null);
        if (!response || response.status === 'no-page') {
            showSelectorResult(text.ruleNoPage, true);
        } else if (response.status === 'invalid') {
            showSelectorResult(text.ruleSelectorError, true);
        } else {
            showSelectorResult(response.matches === 0 ? text.ruleMatchNone : `${text.ruleMatchCount} ${response.matches}`, false);
        }
    });

    init();
})();
