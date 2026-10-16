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
    const consentBoxes = document.getElementById('consentBoxes');
    const piiSafe = document.getElementById('piiSafe');
    const autoSubmit = document.getElementById('autoSubmit');

    const profilesList = document.getElementById('profilesList');
    const newProfileBtn = document.getElementById('newProfileBtn');

    const ruleSelectorInput = document.getElementById('ruleSelector');
    const ruleSelectorError = document.getElementById('ruleSelectorError');
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
        consentBoxes: true,
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
    // Etkin dilin metinleri; updateUILanguage günceller, dinamik öğeler buradan okur
    let currentText = i18n.en;

    function updateUILanguage(lang) {
        const text = i18n[lang] || i18n.en;
        currentText = text;
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
        // Dinamik profil kartları yeni dilde yeniden çizilir
        if (typeof renderProfiles === 'function') renderProfiles();
    }

    uiLangSelector.addEventListener('change', () => {
        state.uiLang = uiLangSelector.value;
        updateUILanguage(state.uiLang);
        saveState();
    });

    // 3. Kimlik profilleri. Varsayılan profil her zaman rastgele ve değiştirilemez. Diğer profiller
    // rastgele (her doldurmada yeni kişi) ya da sabit (kaydedilmiş kişi) olabilir. Kayıt yalnızca
    // "Kaydet" ile yapılır; vazgeçilen yeni profil oluşmaz.
    const activeAvatar = document.getElementById('activeAvatar');
    const activeProfileName = document.getElementById('activeProfileName');
    const activeProfileMeta = document.getElementById('activeProfileMeta');
    const activeProfileBadge = document.getElementById('activeProfileBadge');
    const profileDialog = document.getElementById('profileDialog');
    const profileForm = document.getElementById('profileForm');
    const profileDlgTitle = document.getElementById('profileDlgTitle');
    const profileName = document.getElementById('profileName');
    const profileNameError = document.getElementById('profileNameError');
    const profileModeRandom = document.getElementById('profileModeRandom');
    const profileModeFixed = document.getElementById('profileModeFixed');
    const profilePreview = document.getElementById('profilePreview');
    const profilePreviewName = document.getElementById('profilePreviewName');
    const profilePreviewEmail = document.getElementById('profilePreviewEmail');
    const profileRefreshBtn = document.getElementById('profileRefreshBtn');
    const profileActivateRow = document.getElementById('profileActivateRow');
    const profileActivate = document.getElementById('profileActivate');
    const profileDeleteBtn = document.getElementById('profileDeleteBtn');
    const profileCancelBtn = document.getElementById('profileCancelBtn');

    const BTN_SECONDARY = 'inline-flex h-8 cursor-pointer select-none items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-ring dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06]';
    const BTN_GHOST = 'inline-flex h-8 cursor-pointer select-none items-center justify-center rounded-lg px-3 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 focus-ring dark:text-brand-300 dark:hover:bg-brand-500/10';
    const TAG_ACTIVE = 'shrink-0 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400';

    let dialogProfileId = null;   // null: yeni profil
    let dialogDraft = null;       // sabit modda düzenlenen kişi (kaydedilene kadar taslak)
    let dialogTrigger = null;     // diyaloğu açan öğe; kapanınca odak oraya döner
    let deleteArmed = false;      // silme iki adımlı: ilk tıklama onay ister

    function profileMode(p) {
        if (p.id === 'default') return 'default';
        return p.mode === 'fixed' && p.identity ? 'fixed' : 'random';
    }

    function profileBadge(p) {
        const mode = profileMode(p);
        if (mode === 'default') return currentText.profileBadgeDefault;
        return mode === 'fixed' ? currentText.profileBadgeFixed : currentText.profileBadgeRandom;
    }

    // Gösterilen kişi, doldurmanın kullanacağı biçimde: PII Safe açıkken telefon ve e-posta test değerleridir
    function shownPerson(identity) {
        if (!state.piiSafe) return identity;
        return { ...identity, phoneNsn: identity.phonePii || identity.phoneNsn, emailDomain: identity.piiEmailDomain || identity.emailDomain };
    }

    function profileMeta(p) {
        const mode = profileMode(p);
        if (mode === 'default') return currentText.profileMetaDefault;
        return mode === 'fixed' ? FakeDataGenerator.describePerson(shownPerson(p.identity)) : currentText.profileMetaRandom;
    }

    function initialsOf(name) {
        const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);
        return parts.map(w => w.charAt(0).toUpperCase()).join('') || '?';
    }

    function avatarClass(mode) {
        return mode === 'fixed'
            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white shadow-sm'
            : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-sm font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200';
    }

    function actionButton(label, className, onClick) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = className;
        b.textContent = label;
        b.addEventListener('click', onClick);
        return b;
    }

    function profileCard(p, isActive) {
        const li = document.createElement('li');
        li.className = 'flex flex-col rounded-xl border bg-white p-4 shadow-card transition-[box-shadow,border-color] duration-300 hover:shadow-card-hover dark:bg-zinc-900/60 dark:shadow-card-dark dark:hover:shadow-card-dark-hover '
            + (isActive ? 'border-brand-600/40 ring-1 ring-brand-600/15' : 'border-zinc-200/80 dark:border-white/[0.07]');

        const head = document.createElement('div');
        head.className = 'flex items-start gap-3';
        const avatar = document.createElement('span');
        avatar.className = avatarClass(profileMode(p));
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = initialsOf(p.name);
        const body = document.createElement('div');
        body.className = 'min-w-0 flex-1';
        const name = document.createElement('p');
        name.className = 'truncate text-sm font-semibold text-strong';
        name.textContent = p.name;
        const badge = document.createElement('p');
        badge.className = 'meta-xs mt-0.5';
        badge.textContent = profileBadge(p);
        const meta = document.createElement('p');
        meta.className = 'mt-2 truncate text-xs text-soft';
        meta.textContent = profileMeta(p);
        body.append(name, badge, meta);
        head.append(avatar, body);
        if (isActive) {
            const tag = document.createElement('span');
            tag.className = TAG_ACTIVE;
            tag.textContent = currentText.profileActiveBadge;
            head.append(tag);
        }

        const actions = document.createElement('div');
        actions.className = 'mt-4 flex gap-2';
        if (!isActive) {
            actions.append(actionButton(currentText.profileUseBtn, BTN_SECONDARY, () => {
                state.activeProfileId = p.id;
                saveState();
                renderProfiles();
            }));
        }
        if (profileMode(p) !== 'default') {
            actions.append(actionButton(currentText.profileEditBtn, BTN_GHOST, (e) => openProfileDialog(p, e.currentTarget)));
        }
        li.append(head, actions);
        return li;
    }

    function renderProfiles() {
        const active = state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0];
        activeAvatar.className = avatarClass(profileMode(active));
        activeAvatar.textContent = initialsOf(active.name);
        activeProfileName.textContent = active.name;
        activeProfileMeta.textContent = profileMeta(active);
        activeProfileBadge.textContent = profileBadge(active);
        profilesList.innerHTML = '';
        state.profiles.forEach(p => profilesList.appendChild(profileCard(p, p.id === active.id)));
    }

    function renderDialogPreview() {
        const fixed = profileModeFixed.checked;
        if (fixed && !dialogDraft) dialogDraft = FakeDataGenerator.createIdentity(state.preferredLocale);
        profilePreview.hidden = !fixed;
        if (fixed) {
            const shown = shownPerson(dialogDraft);
            profilePreviewName.textContent = FakeDataGenerator.describePerson(shown);
            profilePreviewEmail.textContent = shown.emailLocal + '@' + shown.emailDomain;
        }
    }

    function openProfileDialog(p, trigger) {
        dialogProfileId = p ? p.id : null;
        dialogTrigger = trigger || null;
        dialogDraft = p && p.identity ? structuredClone(p.identity) : null;
        deleteArmed = false;
        profileDlgTitle.textContent = p ? currentText.profileDlgEdit : currentText.profileDlgNew;
        profileName.value = p ? p.name : '';
        profileNameError.hidden = true;
        const fixed = !!p && profileMode(p) === 'fixed';
        profileModeRandom.checked = !fixed;
        profileModeFixed.checked = fixed;
        // Yeni profil kaydedilince aktif olur; zaten aktif olan profilde seçenek gösterilmez
        profileActivate.checked = !p;
        profileActivateRow.hidden = !!p && p.id === state.activeProfileId;
        profileDeleteBtn.hidden = !p;
        profileDeleteBtn.textContent = currentText.profileDeleteBtn;
        renderDialogPreview();
        profileDialog.hidden = false;
        profileName.focus();
    }

    function closeProfileDialog() {
        profileDialog.hidden = true;
        const back = dialogTrigger && dialogTrigger.isConnected ? dialogTrigger : newProfileBtn;
        dialogTrigger = null;
        back.focus();
    }

    newProfileBtn.addEventListener('click', (e) => openProfileDialog(null, e.currentTarget));
    profileModeRandom.addEventListener('change', renderDialogPreview);
    profileModeFixed.addEventListener('change', renderDialogPreview);
    profileRefreshBtn.addEventListener('click', () => {
        dialogDraft = FakeDataGenerator.createIdentity(state.preferredLocale);
        renderDialogPreview();
    });
    profileName.addEventListener('input', () => { profileNameError.hidden = true; });
    profileCancelBtn.addEventListener('click', closeProfileDialog);
    profileDialog.addEventListener('click', (e) => { if (e.target === profileDialog) closeProfileDialog(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !profileDialog.hidden) closeProfileDialog();
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = profileName.value.trim();
        if (!name) {
            profileNameError.textContent = currentText.profileNameError;
            profileNameError.hidden = false;
            profileName.focus();
            return;
        }
        const fixed = profileModeFixed.checked;
        if (fixed && !dialogDraft) dialogDraft = FakeDataGenerator.createIdentity(state.preferredLocale);
        let p = state.profiles.find(x => x.id === dialogProfileId);
        if (!p) {
            p = { id: Date.now().toString() };
            state.profiles.push(p);
        }
        p.name = name;
        p.mode = fixed ? 'fixed' : 'random';
        if (fixed) p.identity = dialogDraft;
        else delete p.identity;
        if (profileActivate.checked) state.activeProfileId = p.id;
        saveState();
        renderProfiles();
        closeProfileDialog();
    });

    profileDeleteBtn.addEventListener('click', () => {
        if (!dialogProfileId) return;
        if (!deleteArmed) {
            deleteArmed = true;
            profileDeleteBtn.textContent = currentText.profileDeleteConfirm;
            return;
        }
        state.profiles = state.profiles.filter(x => x.id !== dialogProfileId);
        if (state.activeProfileId === dialogProfileId) state.activeProfileId = 'default';
        saveState();
        renderProfiles();
        closeProfileDialog();
    });

    // Eski sürüm şablonları yeni modele taşınır; varsayılan şablon her zaman rastgele olur
    function ensurePersonaData() {
        const res = FakeDataGenerator.migrateProfiles(state.profiles, state.preferredLocale);
        state.profiles = res.profiles;
        if (!state.profiles.some(p => p.id === state.activeProfileId)) state.activeProfileId = 'default';
        if (res.changed) chrome.storage.local.set(state);
    }

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
            removeBtn.textContent = currentText.removeRuleBtn;

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
        state.consentBoxes = consentBoxes.checked;
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
                consentBoxes.checked = state.consentBoxes !== false;
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
                consentBoxes.checked = state.consentBoxes !== false;
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
    consentBoxes.onchange = saveState;
    piiSafe.onchange = saveState;
    autoSubmit.onchange = saveState;

    // Sözdizimi, sayfaya dokunmadan boş bir belge parçasında denenir; geçersiz seçici kuralı reddedilir
    function isValidSelector(selector) {
        try {
            document.createDocumentFragment().querySelector(selector);
            return true;
        } catch (e) {
            return false;
        }
    }

    ruleSelectorInput.addEventListener('input', () => { ruleSelectorError.hidden = true; });

    addRuleBtn.onclick = () => {
        const selector = ruleSelectorInput.value.trim();
        if (!selector) return;
        if (!isValidSelector(selector)) {
            ruleSelectorError.textContent = currentText.ruleSelectorError;
            ruleSelectorError.hidden = false;
            return;
        }
        state.customRules.push({ selector, type: ruleTypeSelect.value });
        ruleSelectorInput.value = "";
        ruleSelectorError.hidden = true;
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
