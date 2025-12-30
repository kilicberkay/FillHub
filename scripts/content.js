const fieldPatterns = {
    firstName: /first.?name|given.?name|adınız|isminiz|^ad$|vorname|prénom|nombre|nome|primeiro.?nome|имя|名|名字|الاسم الأول/i,
    lastName: /last.?name|family.?name|surname|soyadınız|soyad|nachname|nom|apellido|cognome|sobrenome|família|фамилия|姓|姓氏|اسم العائلة/i,
    fullName: /full.?name|name|ad.?soyad|isim|tam.?ad|ganzer.?name|nom.?complet|nombre.?completo|nome.?completo|фио|полное.?имя|姓名|氏名|الاسم الكامل/i,
    email: /email|e-mail|mail|eposta|e-posta|courriel|correo|correio|электронная.?почта|邮件|メール|البريد الإلكتروني/i,
    phone: /phone|tel|gsm|mobile|cep|telefon|handy|téléphone|teléfono|teleforne|celular|телефон|电话|電話|الهاتف/i,
    address: /address|street|adres|cadde|sokak|straße|adresse|dirección|endereço|morada|адрес|地址|住所|العنوان/i,
    city: /city|town|şehir|sehir|ilçe|vilayet|stadt|ville|ciudad|cidade|город|城市|市|المدينة/i,
    zip: /zip|postal|post.?code|posta.?kodu|plz|code.?postal|código.?postal|cep|почтовый.?индекс|邮编|郵便番号|الرمز البريدي/i,
    company: /company|organization|firm|business|şirket|firma|kurum|unternehmen|société|empresa|companhia|компания|公司|会社|الشركة/i,
    password: /pass|secret|şifre|parola|kennwort|mot.?de.?passe|contraseña|senha|пароль|密码|パスワード|كلمة المرour/i,
    date: /date|birth|dob|tarih|doğum|datum|fecha|data|дата|日期|日付|التاريخ/i,
    number: /number|count|quantity|amount|sayı|miktar|nummer|numéro|número|количество|数量|数|العدد/i,
    url: /url|link|href|website|web|site|bağlantı|web.?sitesi|webseite|sitio|sítio|ссылка|链接|リンク|الرابط/i,
    meeting: /meeting|conference|toplantı|görüşme|sitzung|réunion|reunión|reunião|встреча|会议|会議|اجتماع/i,
    organizer: /organizer|host|arranger|düzenleyen|organizatör|veranstalter|organisateur|organizador|организатор|组织者|主催者|المنظم/i,
    location: /location|venue|place|yer|mekan|konum|ort|lieu|lugar|local|место|地点|場所|الموقع/i,
    agenda: /agenda|schedule|plan|gündem|program|tagesordnung|ordre.?du.?jour|agendamento|pauta|повестка|议程|アジェンダ|جدول أعمال/i,
    position: /position|role|title|job|unvan|pozisyon|görev|rol|titel|poste|cargo|dolžnost|должность|职位|役職|المنصب/i,
    website: /website|domain|web|site|web.?sitesi|internet|siteweb|sitio.?web|sítio.?web|веб-сайт|网站|ウェブサイト|الموقع الإلكتروني/i
};

// State for the current fill session
let sessionData = {
    firstName: null,
    lastName: null,
    password: null
};

function identifyField(input, customRules = []) {
    // 1. Check Custom Rules first
    for (const rule of customRules) {
        try {
            if (input.matches?.(rule.selector)) return rule.type;
        } catch (e) { }
    }

    // 2. Standard identification
    const name = input.name || "";
    const id = input.id || "";
    const placeholder = input.placeholder || "";
    const labelText = input.labels?.[0]?.innerText || "";
    const text = (name + " " + id + " " + placeholder + " " + labelText).toLowerCase();

    if (input.type === 'email') return 'email';
    if (input.type === 'tel') return 'phone';
    if (input.type === 'url') return 'url';
    if (input.type === 'number') return 'number';
    if (input.type === 'password') return 'password';
    if (input.type === 'date') return 'date';
    if (input.type === 'datetime-local') return 'datetime'; // Separate type for time support

    for (const [key, pattern] of Object.entries(fieldPatterns)) {
        if (pattern.test(text)) return key;
    }

    // 3. Smart Fallback for unknown types - analyze input characteristics
    if (input.tagName === 'INPUT') {
        if (['text', 'search'].includes(input.type)) {
            // For text inputs, try to guess based on name/id patterns
            const lowerText = text.toLowerCase();

            // Common patterns that might not be in fieldPatterns
            if (lowerText.includes('qr') || lowerText.includes('code')) return 'text';
            if (lowerText.includes('token') || lowerText.includes('key')) return 'text';
            if (lowerText.includes('description') || lowerText.includes('aciklama')) return 'text';
            if (lowerText.includes('title') || lowerText.includes('baslik')) return 'text';
            if (lowerText.includes('subject') || lowerText.includes('konu')) return 'text';
            if (lowerText.includes('comment') || lowerText.includes('yorum')) return 'text';
            if (lowerText.includes('message') || lowerText.includes('mesaj')) return 'text';
            if (lowerText.includes('note') || lowerText.includes('not')) return 'text';

            return 'text'; // Default fallback for text inputs
        }
        if (input.type === 'number') return 'number';
        if (input.type === 'url') return 'url';
    }
    if (input.tagName === 'TEXTAREA') return 'text';
    if (input.tagName === 'SELECT') return 'select';

    return 'text'; // Universal fallback
}

function fillFieldsInContainer(container, settings) {
    // Reset session data for this fill operation to ensure fresh synchronization (e.g., name-email linking)
    sessionData = {
        firstName: '',
        lastName: '',
        password: null // Keep password in session data for potential re-use if matchPasswords is enabled
    };

    const inputs = Array.from(container.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));

    // Pre-scan for names to support Smart Email Linking
    inputs.forEach(input => {
        const type = identifyField(input, settings.customRules);
        if (type === 'firstName' || type === 'lastName') {
            const val = FakeDataGenerator.generate(type, settings.preferredLocale, sessionData);
            input.value = val;
            if (type === 'firstName') sessionData.firstName = val;
            if (type === 'lastName') sessionData.lastName = val;
            ['input', 'change', 'blur'].forEach(evtName => input.dispatchEvent(new Event(evtName, { bubbles: true })));
        }
    });

    inputs.forEach(input => {
        // Strict visibility check to handle Tabs and Hidden sections
        if (!isElementVisible(input)) return;

        const type = identifyField(input, settings.customRules);
        if (!type) return;

        // Overwrite existing values to ensure re-fills stay in sync (logic requested by user)
        // Skip radio/checkbox since they are handled separately below
        // Also skip firstName/lastName here as they were pre-scanned and filled above
        if (input.type !== 'radio' && input.type !== 'checkbox' && (type === 'firstName' || type === 'lastName')) return;

        // Smart Password Matching
        if (type === 'password' && settings.matchPasswords && sessionData.password) {
            input.value = sessionData.password;
        } else {
            const val = FakeDataGenerator.generate(type, settings.preferredLocale, {
                ...sessionData,
                fieldName: input.name || input.id || '',
                chaosMode: settings.chaosMode,
                piiSafe: settings.piiSafe
            });

            // Cache values for smart linking (password is cached here if not matched)
            if (type === 'password') sessionData.password = val;

            if (input.tagName === 'SELECT') {
                const options = input.querySelectorAll('option');
                if (options.length > 1) {
                    // Try to select a meaningful option, not just random
                    const selectedIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
                    input.selectedIndex = selectedIndex;
                }
            } else if (input.type === 'checkbox') {
                input.checked = true; // User requested all checkboxes to be checked
            } else if (input.type === 'radio') {
                input.checked = Math.random() > 0.5;
            } else {
                input.value = val;
            }
        }

        // Trigger events for reactive frameworks (React, Vue, etc.)
        ['input', 'change', 'blur'].forEach(evtName => {
            input.dispatchEvent(new Event(evtName, { bubbles: true }));
        });
    });

    // Attempt to click Captcha checkboxes (reCAPTCHA, Turnstile)
    tryToClickCaptchas();

    // Handle Shadow DOM Recursively
    const allElements = container.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.shadowRoot) {
            fillFieldsInContainer(el.shadowRoot, settings);
        }
    });

    // Handle Iframes (if same-origin)
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                fillFieldsInContainer(iframeDoc, settings);
            }
        } catch (e) {
            // Cross-origin iframe restricted by browser
        }
    });
}

function isElementVisible(el) {
    if (!el) return false;

    // Check basic style properties
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }

    // Check ancestors for hidden state (like tabs)
    let parent = el.parentElement;
    while (parent) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
            return false;
        }
        parent = parent.parentElement;
    }

    // Check dimensions
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function tryToClickCaptchas() {
    // 1. Aggressive Script Injection to bypass isolated world restrictions
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            try {
                // Handle reCAPTCHA v2/v3
                if (window.grecaptcha) {
                    const widgets = document.querySelectorAll('[data-sitekey]');
                    widgets.forEach((w, i) => {
                        try {
                            // Try to execute or get response to trigger the check
                            if (window.grecaptcha.execute) window.grecaptcha.execute(i);
                        } catch (e) {}
                    });
                }
                // Handle Turnstile
                if (window.turnstile) {
                    const tsElements = document.querySelectorAll('.cf-turnstile');
                    tsElements.forEach(el => {
                        try {
                            window.turnstile.execute(el);
                        } catch (e) {}
                    });
                }
            } catch (e) {}
        })();
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();

    // 2. DOM-based clicking for same-origin or visible elements
    const captchaSelectors = [
        'iframe[title*="reCAPTCHA"]',
        'iframe[src*="recaptcha"]',
        'iframe[src*="challenges.cloudflare.com"]',
        '.g-recaptcha',
        '#recaptcha-anchor',
        '.cf-turnstile'
    ];

    captchaSelectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            el.focus();
            // Try to trigger click on common anchor IDs if we can reach them
            const anchor = el.shadowRoot ? el.shadowRoot.querySelector('#recaptcha-anchor') : null;
            if (anchor) anchor.click();
        }
    });

    // 3. Label-based generic bypass (for custom "I am human" boxes)
    document.querySelectorAll('label').forEach(lb => {
        const text = lb.innerText.toLowerCase();
        if (text.includes('robot') || text.includes('human') || text.includes('captcha')) {
            const cb = lb.querySelector('input[type="checkbox"]');
            if (cb) cb.checked = true;
            lb.click();
        }
    });
}

function autoSubmitForm(container) {
    // Common submit buttons patterns
    const submitBtn = container.querySelector('button[type="submit"], input[type="submit"], button.submit, button.btn-primary, [role="button"]');
    if (submitBtn) {
        setTimeout(() => {
            submitBtn.click();
        }, 500);
    }
}

function showToast(message) {
    let toast = document.getElementById('fake-filler-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fake-filler-toast';
        Object.assign(toast.style, {
            position: 'fixed', bottom: '30px', right: '30px',
            padding: '16px 28px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            color: 'white', borderRadius: '16px', zIndex: '2147483647',
            fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: 'translateY(100px)', opacity: '0'
        });
        document.body.appendChild(toast);
    }
    toast.innerText = "✨ " + message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fill" || request.action === "fill_chaos") {
        const isChaos = request.action === "fill_chaos";

        // Reset session data for new fill
        sessionData = { firstName: null, lastName: null, password: null };

        chrome.storage.local.get(null, (settings) => {
            // Override settings for chaos mode if triggered via hotkey
            if (isChaos) {
                settings.chaosMode = true;
                showToast("🔥 CHAOS MODE ACTIVATED 🔥");
            }

            fillFieldsInContainer(document, settings);

            if (!isChaos) {
                showToast(getLocalizedMessage(settings.preferredLocale));
            }

            if (settings.autoSubmit && !isChaos) {
                autoSubmitForm(document);
            }
        });

        sendResponse({ status: "success" });
    }
});

function getLocalizedMessage(localeLiteral) {
    const locale = localeLiteral || 'tr';
    const messages = {
        'tr': 'Tüm alanlar hassasiyetle dolduruldu.',
        'en': 'All fields filled with precision.',
        'es': 'Todos los campos llenados con precisión.',
        'fr': 'Tous les champs remplis avec précision.',
        'de': 'Alle Felder präzise ausgefüllt.',
        'pt': 'Todos os campos preenchidos com precisão.',
        'ru': 'Все поля заполнены с точностью.',
        'zh': '所有字段均已精确填写。',
        'ja': 'すべてのフィールドが正確に入力されました。',
        'ar': 'تم ملء جميع الحقول بدقة.'
    };
    return messages[locale.split('-')[0]] || messages['en'];
}
