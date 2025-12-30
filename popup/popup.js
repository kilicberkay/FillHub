document.addEventListener('DOMContentLoaded', () => {
    const fillBtn = document.getElementById('fillBtn');
    const localeSelect = document.getElementById('localeSelect');
    const countrySearch = document.getElementById('countrySearch');
    const settingsBtn = document.getElementById('settingsBtn');
    const systemLangNotice = document.getElementById('systemLangNotice');

    // Load all countries
    const countries = FakeDataGenerator.getCountries();

    function populateCountries(filter = "") {
        const currentValue = localeSelect.value;
        localeSelect.innerHTML = "";
        countries.forEach(c => {
            if (c.name.toLowerCase().includes(filter.toLowerCase()) || c.code.toLowerCase().includes(filter.toLowerCase())) {
                const opt = document.createElement('option');
                opt.value = c.code.toLowerCase();
                opt.innerText = c.name;
                localeSelect.appendChild(opt);
            }
        });
        if (localeSelect.querySelector(`option[value="${currentValue}"]`)) {
            localeSelect.value = currentValue;
        }
    }

    populateCountries();

    // Multi-language system detection
    const systemLang = (navigator.language || navigator.userLanguage).split('-')[0];
    const systemCountry = (navigator.language || navigator.userLanguage).split('-')[1] || systemLang.toUpperCase();
    const defaultLocale = systemCountry.toLowerCase();

    // Load saved preference or use system default
    chrome.storage.local.get(['preferredLocale'], (result) => {
        if (result.preferredLocale) {
            localeSelect.value = result.preferredLocale;
        } else {
            localeSelect.value = defaultLocale;
            chrome.storage.local.set({ preferredLocale: defaultLocale });
            systemLangNotice.innerText = `Auto-detected: ${systemCountry}`;
        }
    });

    // Search logic
    countrySearch.addEventListener('input', (e) => {
        populateCountries(e.target.value);
    });

    // Save preference on change
    localeSelect.addEventListener('change', () => {
        chrome.storage.local.set({ preferredLocale: localeSelect.value });
        systemLangNotice.innerText = "";
    });

    fillBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]) return;

            chrome.tabs.sendMessage(tabs[0].id, {
                action: "fill",
                locale: localeSelect.value
            }, (response) => {
                if (chrome.runtime.lastError) {
                    alert("Please refresh the page before filling.");
                    return;
                }

                fillBtn.innerHTML = `
          <svg class="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Success!
        `;
                fillBtn.classList.remove('btn-gradient');
                fillBtn.classList.add('bg-green-600');

                setTimeout(() => {
                    fillBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            Fill All Form Fields
          `;
                    fillBtn.classList.add('btn-gradient');
                    fillBtn.classList.remove('bg-green-600');
                }, 2000);
            });
        });
    });

    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
