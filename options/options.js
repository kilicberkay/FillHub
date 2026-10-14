document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const themeToggle = document.getElementById('themeToggle');
    const onboardingModal = document.getElementById('onboardingModal');
    const closeOnboarding = document.getElementById('closeOnboarding');

    const defaultLocale = document.getElementById('defaultLocale');
    const countrySearch = document.getElementById('countrySearch');
    const smartEmail = document.getElementById('smartEmail');
    const matchPasswords = document.getElementById('matchPasswords');
    const checkAllBoxes = document.getElementById('checkAllBoxes');
    const piiSafe = document.getElementById('piiSafe');
    const autoSubmit = document.getElementById('autoSubmit');

    const profilesList = document.getElementById('profilesList');
    const newProfileBtn = document.getElementById('newProfileBtn');
    const profileEditor = document.getElementById('profileEditor');
    const editProfileName = document.getElementById('editProfileName');
    const currentProfileNameText = document.getElementById('currentProfileName');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    const profileDataSummary = document.getElementById('profileDataSummary');

    const ruleSelectorInput = document.getElementById('ruleSelector');
    const ruleTypeSelect = document.getElementById('ruleType');
    const addRuleBtn = document.getElementById('addRuleBtn');
    const rulesList = document.getElementById('rulesList');
    const noRulesState = document.getElementById('noRulesState');

    const uiLangSelector = document.getElementById('uiLangSelector');

    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const menuToggle = document.getElementById('menuToggle');

    // Sürüm etiketi manifest'ten okunur; sabit metin sürümle birlikte kaymaz
    const versionLabel = document.getElementById('versionLabel');
    if (versionLabel) versionLabel.innerText = 'v' + chrome.runtime.getManifest().version;

    let state = {
        theme: 'dark',
        preferredLocale: 'tr',
        uiLang: 'en',
        smartEmail: true,
        matchPasswords: true,
        checkAllBoxes: false,
        piiSafe: true,
        autoSubmit: false,
        profiles: [{ id: 'default', name: 'Standard Persona', mode: 'random' }],
        activeProfileId: 'default',
        customRules: [],
        onboardingComplete: false
    };

    // 1. Theme Management: tema `.dark` sınıfıyla uygulanır (blog ile aynı sözleşme)
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(state.theme);
        saveState();
    });

    // Mobil kenar çubuğu (lg altı): açma/kapama sınıfları blog kenar çubuğuyla aynı
    const SIDEBAR_OPEN = ['translate-x-0', 'visible'];
    const SIDEBAR_CLOSED = ['-translate-x-full', 'invisible'];

    function setSidebar(open) {
        sidebar.classList.remove(...(open ? SIDEBAR_CLOSED : SIDEBAR_OPEN));
        sidebar.classList.add(...(open ? SIDEBAR_OPEN : SIDEBAR_CLOSED));
        sidebarBackdrop.classList.toggle('hidden', !open);
        menuToggle.setAttribute('aria-expanded', String(open));
    }

    menuToggle.addEventListener('click', () => setSidebar(true));
    sidebarBackdrop.addEventListener('click', () => setSidebar(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setSidebar(false);
    });

    // 2. Localization
    const i18n = I18N;

    function updateUILanguage(lang) {
        const text = i18n[lang] || i18n.en;
        // Dil ve yön: Arapça ve Urduca sağdan sola (metin yönü; kenar çubuğu düzeni ayrıca ele alınmamıştır)
        document.documentElement.lang = i18n[lang] ? lang : 'en';
        document.documentElement.dir = (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr';

        // Process all elements with matching IDs in the i18n object
        Object.keys(text).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'INPUT' && el.type === 'text') {
                    el.placeholder = text[id];
                } else {
                    el.innerText = text[id];
                }
            }
        });

        // Handle Nav links specifically if they are part of the sidebar
        if (text.navTextGeneral) document.getElementById('navTextGeneral').innerText = text.navTextGeneral;
        if (text.navTextProfiles) document.getElementById('navTextProfiles').innerText = text.navTextProfiles;
        if (text.navTextRules) document.getElementById('navTextRules').innerText = text.navTextRules;
        if (text.navTextAbout) document.getElementById('navTextAbout').innerText = text.navTextAbout;
    }

    uiLangSelector.addEventListener('change', () => {
        state.uiLang = uiLangSelector.value;
        updateUILanguage(state.uiLang);
        saveState();
    });

    // 3. Profiles Logic: rastgele mod (her doldurmada yeni kişi) ya da sabit kimlik (şablondaki kişi)
    const personaModeRandom = document.getElementById('personaModeRandom');
    const personaModeFixed = document.getElementById('personaModeFixed');
    const personaRefresh = document.getElementById('personaRefresh');
    const personaIdentity = document.getElementById('personaIdentity');
    const personaLocked = document.getElementById('personaLocked');

    function renderProfiles() {
        profilesList.innerHTML = "";
        state.profiles.forEach(p => {
            const isActive = state.activeProfileId === p.id;
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = isActive ? 'chip-active' : 'chip';
            pill.setAttribute('aria-pressed', String(isActive));
            pill.innerText = p.name;
            pill.onclick = () => {
                state.activeProfileId = p.id;
                openProfileEditor(p);
                renderProfiles();
                saveState();
            };
            profilesList.appendChild(pill);
        });
    }

    // Kimlik özeti: sabit kimlikte gerçekçi değerler; PII Safe test değerleri ayrı satırda gösterilmez
    function identityLines(identity) {
        const real = identity.ids || {};
        return [
            'name: ' + identity.first.n + ' ' + identity.last.n,
            'email: ' + identity.emailLocal + '@' + identity.emailDomain,
            'city: ' + identity.city.name + ', ' + identity.zip,
            'phone: +' + identity.phoneNsn,
            'id: ' + (real.person || '-'),
            'tax: ' + (real.tax || '-'),
            'iban: ' + (real.iban || '-')
        ].join('\n');
    }

    function openProfileEditor(p) {
        profileEditor.style.display = "block";
        currentProfileNameText.innerText = p.name;
        editProfileName.value = p.name;
        const isDefault = p.id === 'default';
        const fixed = p.mode === 'fixed' && !!p.identity;
        editProfileName.disabled = isDefault;
        personaModeRandom.disabled = isDefault;
        personaModeFixed.disabled = isDefault;
        personaModeRandom.checked = !fixed;
        personaModeFixed.checked = fixed;
        deleteProfileBtn.hidden = isDefault;
        personaLocked.hidden = !isDefault;
        personaRefresh.hidden = !fixed || isDefault;
        personaIdentity.innerText = fixed ? FakeDataGenerator.describePerson(p.identity) : "";
        profileDataSummary.innerText = fixed ? identityLines(p.identity) : "";
    }

    // Eski sürüm şablonları yeni modele taşınır; varsayılan şablon her zaman rastgele olur
    function ensurePersonaData() {
        const res = FakeDataGenerator.migrateProfiles(state.profiles, state.preferredLocale);
        state.profiles = res.profiles;
        if (!state.profiles.some(p => p.id === state.activeProfileId)) state.activeProfileId = 'default';
        if (res.changed) chrome.storage.local.set(state);
    }

    newProfileBtn.onclick = () => {
        const id = Date.now().toString();
        const newP = { id, name: 'New Persona', mode: 'fixed', identity: FakeDataGenerator.createIdentity(state.preferredLocale) };
        state.profiles.push(newP);
        state.activeProfileId = id;
        renderProfiles();
        openProfileEditor(newP);
        saveState();
    };

    saveProfileBtn.onclick = () => {
        const p = state.profiles.find(x => x.id === state.activeProfileId);
        if (!p) return;
        if (p.id !== 'default') {
            const name = editProfileName.value.trim();
            if (name) p.name = name;
            p.mode = personaModeFixed.checked ? 'fixed' : 'random';
            if (p.mode === 'fixed' && !p.identity) p.identity = FakeDataGenerator.createIdentity(state.preferredLocale);
            if (p.mode === 'random') delete p.identity;
        }
        renderProfiles();
        openProfileEditor(p);
        saveState();
    };

    personaRefresh.onclick = () => {
        const p = state.profiles.find(x => x.id === state.activeProfileId);
        if (!p || p.id === 'default') return;
        p.identity = FakeDataGenerator.createIdentity(state.preferredLocale);
        openProfileEditor(p);
        saveState();
    };

    deleteProfileBtn.onclick = () => {
        const p = state.profiles.find(x => x.id === state.activeProfileId);
        if (!p || p.id === 'default') return;
        state.profiles = state.profiles.filter(x => x.id !== p.id);
        state.activeProfileId = 'default';
        profileEditor.style.display = "none";
        renderProfiles();
        saveState();
    };

    // 4. Custom Rules Logic
    function renderRules() {
        rulesList.innerHTML = "";
        if (state.customRules.length === 0) {
            noRulesState.style.display = "block";
            return;
        }
        noRulesState.style.display = "none";
        state.customRules.forEach((rule, idx) => {
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between gap-3 py-2.5';

            // Seçici kullanıcı girdisidir: metin olarak eklenir (innerHTML yok)
            const desc = document.createElement('div');
            desc.className = 'min-w-0 truncate text-[13px] text-zinc-700 dark:text-zinc-300';
            const code = document.createElement('code');
            code.className = 'font-mono text-[12px] font-semibold text-brand-700 dark:text-brand-300';
            code.textContent = rule.selector;
            desc.append(code, ` → ${rule.type}`);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'inline-flex h-7 shrink-0 cursor-pointer select-none items-center justify-center rounded-lg px-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-ring dark:text-rose-400 dark:hover:bg-rose-500/10';
            removeBtn.textContent = 'Remove';

            row.append(desc, removeBtn);
            removeBtn.onclick = () => {
                state.customRules.splice(idx, 1);
                renderRules();
                saveState();
            };
            rulesList.appendChild(row);
        });
    }

    // 5. Populate Data
    const countries = FakeDataGenerator.getCountries();
    const dataTypes = FakeDataGenerator.getDataTypes();

    // Tarayıcı dili kanonik yerele çevrilir: "ar" → ar-EG, "en-GB" → en-GB (değer ülke seçicisiyle aynı biçimde)
    function detectDefaultCountry() {
        return FakeDataGenerator.canonicalLocale(navigator.language || 'en');
    }

    function detectDefaultUiLang() {
        const base = (navigator.language || 'en').toLowerCase().split('-')[0];
        return i18n[base] ? base : 'en';
    }

    function populateCountries(filter = "") {
        defaultLocale.innerHTML = "";
        countries.filter(c => c.name.toLowerCase().includes(filter.toLowerCase())).forEach(c => {
            const opt = document.createElement('option');
            opt.value = FakeDataGenerator.localeForCountry(c.code);
            opt.innerText = c.name;
            defaultLocale.appendChild(opt);
        });
        defaultLocale.value = state.preferredLocale;
    }

    populateCountries();
    dataTypes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.innerText = t.charAt(0).toUpperCase() + t.slice(1);
        ruleTypeSelect.appendChild(opt);
    });

    // 6. State Lifecycle
    function saveState() {
        state.preferredLocale = defaultLocale.value;
        state.smartEmail = smartEmail.checked;
        state.matchPasswords = matchPasswords.checked;
        state.checkAllBoxes = checkAllBoxes.checked;
        state.piiSafe = piiSafe.checked;
        state.autoSubmit = autoSubmit.checked;
        chrome.storage.local.set(state);
    }

    function loadState() {
        chrome.storage.local.get(null, (res) => {
            const hasState = Object.keys(res).length > 0;
            if (hasState) state = { ...state, ...res };
            // Eski kayıtlar çıplak ülke kodu (ör. "us", "tr") saklamış olabilir: kanonik biçime çevrilir
            if (hasState) state.preferredLocale = FakeDataGenerator.canonicalLocale(state.preferredLocale || navigator.language);
            if (!Array.isArray(state.profiles)) state.profiles = [{ id: 'default', name: 'Standard Persona', mode: 'random' }];
            if (!hasState) {
                // İlk kurulum: ülke ve arayüz dili tarayıcıdan gelir
                state.preferredLocale = detectDefaultCountry();
                state.uiLang = detectDefaultUiLang();
            }
            ensurePersonaData();

            if (hasState) {
                applyTheme(state.theme);
                defaultLocale.value = state.preferredLocale;
                smartEmail.checked = state.smartEmail;
                matchPasswords.checked = state.matchPasswords;
                checkAllBoxes.checked = !!state.checkAllBoxes;
                piiSafe.checked = !!state.piiSafe;
                autoSubmit.checked = state.autoSubmit;
                uiLangSelector.value = state.uiLang || 'en';
                updateUILanguage(state.uiLang || 'en');
                renderProfiles();
                renderRules();

                if (!state.onboardingComplete) {
                    onboardingModal.style.display = "flex";
                }
            } else {
                // First run
                chrome.storage.local.set(state);
                populateCountries();
                piiSafe.checked = state.piiSafe;
                checkAllBoxes.checked = state.checkAllBoxes;
                uiLangSelector.value = state.uiLang;
                updateUILanguage(state.uiLang);
                renderProfiles();
                onboardingModal.style.display = "flex";
            }
        });
    }

    // Events
    countrySearch.oninput = (e) => populateCountries(e.target.value);
    defaultLocale.onchange = saveState;
    smartEmail.onchange = saveState;
    matchPasswords.onchange = saveState;
    checkAllBoxes.onchange = saveState;
    piiSafe.onchange = saveState;
    autoSubmit.onchange = saveState;

    addRuleBtn.onclick = () => {
        if (!ruleSelectorInput.value) return;
        state.customRules.push({ selector: ruleSelectorInput.value, type: ruleTypeSelect.value });
        ruleSelectorInput.value = "";
        renderRules();
        saveState();
    };

    closeOnboarding.onclick = () => {
        state.onboardingComplete = true;
        onboardingModal.style.display = "none";
        saveState();
    };

    // Nav Switcher
    const NAV_ACTIVE = 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300';
    const NAV_IDLE = 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.05] dark:hover:text-white';

    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            document.querySelectorAll('.nav-link').forEach(l => {
                const isCurrent = l === link;
                l.classList.remove(...(isCurrent ? NAV_IDLE : NAV_ACTIVE).split(' '));
                l.classList.add(...(isCurrent ? NAV_ACTIVE : NAV_IDLE).split(' '));
                if (isCurrent) l.setAttribute('aria-current', 'page');
                else l.removeAttribute('aria-current');
            });
            setSidebar(false);
        };
    });

    loadState();
});
