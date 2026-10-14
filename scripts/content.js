// Etiketin yalnızca kendi metni: içindeki select/option metinleri (ör. ülke listesi) alan adına karışmaz
function labelOwnText(label) {
    const clone = label.cloneNode(true);
    clone.querySelectorAll('select, input, textarea, option, button, script, style').forEach(n => n.remove());
    return clone.textContent || '';
}

// Alanın metin kaynakları (küçük harf, Türkçe noktasız i dahil sadeleştirilmiş)
function fieldTexts(input) {
    const doc = input.ownerDocument || document;
    const raw = [input.name, input.id, input.placeholder, input.title, input.getAttribute("aria-label")];
    if (input.labels) for (const label of input.labels) raw.push(labelOwnText(label));
    const labelledby = input.getAttribute("aria-labelledby");
    if (labelledby) {
        for (const id of labelledby.split(/\s+/)) {
            const el = doc.getElementById(id);
            if (el) raw.push(el.textContent);
        }
    }
    const pair = findPairedHiddenInput(input);
    if (pair) raw.push(pair.name, pair.id);
    return raw.map(v => String(v || "").trim()).filter(Boolean);
}

// Etiket/placeholder yazısı: Latin dışı harf varsa yerel yazı, yalnız Latin harf varsa Latin tercih edilir
function detectFieldScript(input) {
    const texts = fieldTexts(input).join(' ');
    if (/[^\u0000-ɏḀ-ỿ\s\d\p{P}\p{S}]/u.test(texts)) return 'native';
    if (/[a-z]/i.test(texts)) return 'latin';
    return undefined;
}

// State for the current fill session
let sessionData = {
    firstName: null,
    lastName: null,
    password: null,
    person: null
};

// Snapshot of every field touched by the last fill, used by the undo action
let fillSnapshot = new Map();
let filledCount = 0;

// Async work queue (date-picker interaction); drained serially so fills stay deterministic
let pendingTasks = [];
let taskRunning = false;

async function drainTasks() {
    if (taskRunning) return;
    taskRunning = true;
    try {
        while (pendingTasks.length) {
            const task = pendingTasks.shift();
            try {
                await task();
            } catch (e) {
                console.debug('[FillHub] görev atlandı:', e);
            }
        }
    } finally {
        taskRunning = false;
    }
}

const NATIVE_EVENTS = ['input', 'change', 'blur'];
const NATIVE_DATE_TYPES = new Set(['date', 'datetime-local', 'time', 'month', 'week']);
const NATIVE_TYPED_INPUTS = new Set([...NATIVE_DATE_TYPES, 'color', 'range']);
const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'tel', 'url', 'password']);
const FIELD_SELECTOR = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select';

function setNativeValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
        : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, value); else el.value = value;
}

function setNativeChecked(el, checked) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
    if (setter) setter.call(el, checked); else el.checked = checked;
}

function dispatchFieldEvents(el, events = NATIVE_EVENTS) {
    events.forEach(name => el.dispatchEvent(new Event(name, { bubbles: true, composed: true })));
}

function snapshotField(el) {
    if (fillSnapshot.has(el)) return;
    fillSnapshot.set(el, {
        value: el.value,
        checked: el.checked,
        selectedIndex: el.selectedIndex,
        files: el.files ? Array.from(el.files) : null
    });
}

function clampTextValue(input, value) {
    const isTextLike = input.tagName === 'TEXTAREA' || (input.tagName === 'INPUT' && TEXT_INPUT_TYPES.has(input.type));
    if (!isTextLike) return value;
    let out = String(value);
    const max = input.maxLength;
    if (typeof max === 'number' && max > 0) out = out.slice(0, max);
    if (input.minLength > 0 && out.length < input.minLength) out = out.padEnd(input.minLength, 'x');
    return out;
}

function clampNumberValue(input, value) {
    let num = Number(value);
    if (!Number.isFinite(num)) num = 0;
    const min = input.min === '' ? null : Number(input.min);
    const max = input.max === '' ? null : Number(input.max);
    const stepAttr = Number(input.step);
    const step = Number.isFinite(stepAttr) && stepAttr > 0 ? stepAttr : 1;
    const base = Number.isFinite(min) ? min : 0;
    num = base + Math.round((num - base) / step) * step;
    if (Number.isFinite(min)) num = Math.max(num, min);
    if (Number.isFinite(max)) num = Math.min(num, max);
    return String(Math.round(num * 1e6) / 1e6);
}

function clampIsoValue(input, value) {
    let out = String(value);
    if (input.min && out < input.min) out = input.min;
    if (input.max && out > input.max) out = input.max;
    return out;
}

function isoWeekParts(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
    const week = Math.ceil((((d.getTime() - yearStart) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week };
}

// Single write path for value-bearing fields: snapshot, clamp, assign natively, notify, count
function assignFieldValue(input, value) {
    try {
        snapshotField(input);
        let out = value;
        if (input.tagName === 'INPUT' && (input.type === 'number' || input.type === 'range')) {
            out = clampNumberValue(input, out);
        } else if (input.tagName === 'INPUT' && (input.type === 'date' || input.type === 'datetime-local'
            || input.type === 'time' || input.type === 'month' || input.type === 'week')) {
            out = clampIsoValue(input, out);
        } else {
            out = clampTextValue(input, out);
        }
        setNativeValue(input, out);
        dispatchFieldEvents(input);
        filledCount++;
        return true;
    } catch (e) {
        console.debug('[FillHub] alan atlandı:', input, e);
        return false;
    }
}

function fillNativeTypedInput(input, settings) {
    const locale = settings.preferredLocale;
    const context = { chaosMode: settings.chaosMode, piiSafe: settings.piiSafe };
    switch (input.type) {
        case 'date':
            return assignFieldValue(input, FakeDataGenerator.generate('date', locale, context));
        case 'datetime-local':
            return assignFieldValue(input, FakeDataGenerator.generate('datetime', locale, context));
        case 'time':
            return assignFieldValue(input, FakeDataGenerator.generate('datetime', locale, context).split('T')[1]);
        case 'month':
            return assignFieldValue(input, FakeDataGenerator.generate('date', locale).slice(0, 7));
        case 'week': {
            const [y, m, d] = FakeDataGenerator.generate('date', locale).split('-').map(Number);
            const parts = isoWeekParts(new Date(y, m - 1, d));
            return assignFieldValue(input, `${parts.year}-W${String(parts.week).padStart(2, '0')}`);
        }
        case 'color': {
            const value = settings.chaosMode
                ? '#000000'
                : '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
            return assignFieldValue(input, value);
        }
        case 'range': {
            const min = input.min === '' ? 0 : Number(input.min);
            const max = input.max === '' ? 100 : Number(input.max);
            const stepAttr = Number(input.step);
            const step = Number.isFinite(stepAttr) && stepAttr > 0 ? stepAttr : 1;
            const steps = Math.max(1, Math.floor((max - min) / step) + 1);
            return assignFieldValue(input, String(min + Math.floor(Math.random() * steps) * step));
        }
        default:
            return false;
    }
}

// Fake payloads used to satisfy client-side accept/MIME/size checks on file inputs
const FILE_TYPES = {
    pdf: { mime: 'application/pdf', text: '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n' },
    docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', text: 'FillHub test belgesi.' },
    doc: { mime: 'application/msword', text: 'FillHub test belgesi.' },
    xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', text: 'FillHub test tablosu.' },
    txt: { mime: 'text/plain', text: 'FillHub test metni.' },
    csv: { mime: 'text/csv', text: 'ad,soyad\nTest,Kullanici\n' },
    zip: { mime: 'application/zip', text: 'FillHub test arsivi.' },
    png: { mime: 'image/png', base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    jpg: { mime: 'image/jpeg', base64: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==' }
};
const MIME_TO_EXT = {
    'application/pdf': 'pdf', 'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx', 'application/vnd.ms-excel': 'xlsx',
    'text/plain': 'txt', 'text/csv': 'csv', 'application/zip': 'zip', 'application/x-zip-compressed': 'zip',
    'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg'
};
const GENERIC_MIME_EXT = { text: 'txt', image: 'png', application: 'pdf' };
const FILE_KEYWORD_EXT = [[/photo|image|avatar|resim|foto/i, 'png']];

function pickFileType(input) {
    const tokens = (input.getAttribute('accept') || '').split(',').map(t => t.trim()).filter(Boolean);
    for (const token of tokens) {
        if (token.startsWith('.')) {
            const ext = token.slice(1).toLowerCase().replace('jpeg', 'jpg');
            if (FILE_TYPES[ext]) return ext;
            continue;
        }
        if (token === '*/*') return 'pdf';
        if (token.endsWith('/*')) {
            const generic = GENERIC_MIME_EXT[token.slice(0, -2)];
            if (generic) return generic;
            continue;
        }
        const ext = MIME_TO_EXT[token.toLowerCase()];
        if (ext) return ext;
    }
    const haystack = `${input.name || ''} ${input.id || ''} ${input.placeholder || ''}`;
    for (const [pattern, ext] of FILE_KEYWORD_EXT) {
        if (pattern.test(haystack)) return ext;
    }
    return 'pdf';
}

function slugifyName(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function buildFileName(ext, sessionData) {
    const person = sessionData.person;
    const first = slugifyName(person ? person.first.l : sessionData.firstName);
    const last = slugifyName(person ? person.last.l : sessionData.lastName);
    return first && last ? `${first}.${last}.${ext}` : `fake-file.${ext}`;
}

function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

// File inputs cannot take a `value`; the only supported path is a DataTransfer-backed FileList
function fillFileInput(input, sessionData) {
    if (input.webkitdirectory === true) return false;
    try {
        const ext = pickFileType(input);
        const spec = FILE_TYPES[ext] || FILE_TYPES.pdf;
        const bytes = spec.base64 ? base64ToBytes(spec.base64) : new TextEncoder().encode(spec.text);
        const fileName = buildFileName(ext, sessionData);
        snapshotField(input);
        const transfer = new DataTransfer();
        const count = input.multiple ? 2 : 1;
        for (let i = 0; i < count; i++) {
            const name = i === 0 ? fileName : fileName.replace(/(\.[^.]+)$/, `-${i + 1}$1`);
            transfer.items.add(new File([bytes], name, { type: spec.mime, lastModified: Date.now() }));
        }
        input.files = transfer.files;
        dispatchFieldEvents(input, ['input', 'change']);
        filledCount++;
        return true;
    } catch (e) {
        console.debug('[FillHub] alan atlandı:', input, e);
        return false;
    }
}

const PICKER_PROBE_TRIES = 8;        // × 50 ms waiting for the calendar to open
const PICKER_CLICK_WAIT_TRIES = 5;   // × 50 ms waiting for the click to land in the input
const PICKER_NAV_LIMIT = 60;         // navigation safety valve (months)
const PICKER_MIN_YEAR = 1900;
const PICKER_MAX_YEAR_OFFSET = 10;
const CAL_ACTIVE_SEL = '.air-datepicker.-active-, .datepicker.active';
const CAL_ANY_SEL = '.air-datepicker, .datepicker';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function parseIsoDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return Number.isNaN(d.getTime()) ? null : d;
}

function rectDistance(el, box) {
    const a = el.getBoundingClientRect();
    const dx = (a.left + a.right) / 2 - (box.left + box.right) / 2;
    const dy = (a.top + a.bottom) / 2 - (box.top + box.bottom) / 2;
    return dx * dx + dy * dy;
}

function nearestEnabledDayCell(cal, y, m0, day) {
    const cells = [...cal.querySelectorAll(`[data-year="${y}"][data-month="${m0}"][data-date]`)]
        .filter(c => !c.className.includes('-disabled-'));
    if (!cells.length) return null;
    return cells.reduce((best, c) =>
        Math.abs(+c.getAttribute('data-date') - day) < Math.abs(+best.getAttribute('data-date') - day) ? c : best);
}

// Aylık tıklama bütçesi geniş yıl aralığına yetmez: takvim yıl görünümüne/kısayollarına atlanır.
// v3: klavye kısayolları (Shift+Ok ±1 yıl, Alt+Ok ±10 yıl). v2: başlıkla yıl görünümü, on yıl
// gezinmesi, yıl ve ay hücresi.
async function jumpCalendarToYear(input, cal, year, month0) {
    const shownYear = () => {
        const cell = cal.querySelector('[data-year][data-month]');
        return cell ? +cell.getAttribute('data-year') : null;
    };

    if (cal.querySelector('.air-datepicker-nav--title')) {
        const press = async (modifier, arrow) => {
            const prevYear = shownYear();
            const opts = { bubbles: true, cancelable: true };
            input.dispatchEvent(new KeyboardEvent('keydown', { key: modifier, ...opts }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: arrow, altKey: modifier === 'Alt', shiftKey: modifier === 'Shift', ...opts }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: modifier, ...opts }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: arrow, ...opts }));
            // Görünüm oturana kadar bekle (kısayol devre dışıysa sayaçlar sınırlar)
            for (let i = 0; i < 5 && shownYear() === prevYear; i++) await sleep(40);
        };
        for (let i = 0; i < 4 && Math.abs(year - (shownYear() ?? year)) >= 10; i++) {
            await press('Alt', year < shownYear() ? 'ArrowDown' : 'ArrowUp');
        }
        for (let i = 0; i < 12 && shownYear() !== year; i++) {
            await press('Shift', year < shownYear() ? 'ArrowDown' : 'ArrowUp');
        }
        return shownYear() === year;
    }

    // v2: nav her tıklamada yeniden kurulur, elemanlar her adımda yeniden sorgulanır
    const title = () => cal.querySelector('.datepicker--nav-title');
    if (!title()) return false;
    const yearCell = () => [...cal.querySelectorAll('.datepicker--cell-year')].find(c => +c.getAttribute('data-year') === year);
    title().click();
    await sleep(100);
    title().click();
    await sleep(100);
    for (let i = 0; i < 6 && !yearCell(); i++) {
        const years = [...cal.querySelectorAll('.datepicker--cell-year')].map(c => +c.getAttribute('data-year'));
        if (!years.length) return false;
        const btn = cal.querySelector(`[data-action="${year < Math.min(...years) ? 'prev' : 'next'}"]`);
        if (!btn) return false;
        btn.click();
        await sleep(100);
    }
    const targetYear = yearCell();
    if (!targetYear) return false;
    targetYear.click();
    await sleep(100);
    const targetMonth = [...cal.querySelectorAll('.datepicker--cell-month')].find(c => +c.getAttribute('data-month') === month0);
    if (!targetMonth) return false;
    targetMonth.click();
    // Ay seçimi sonrası gün hücreleri hedef aya geçene kadar bekle
    for (let i = 0; i < 10 && !cal.querySelector(`[data-year="${year}"][data-month="${month0}"][data-date]`); i++) {
        await sleep(60);
    }
    return true;
}

// Walks the calendar to the target month, then clicks the day cell
async function selectDateInCalendar(cal, target, input) {
    const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    const y = target.getFullYear(), m0 = target.getMonth(), day = target.getDate();
    const firstShown = cal.querySelector('[data-year][data-month]');
    if (firstShown
        && Math.abs(+firstShown.getAttribute('data-year') * 12 + +firstShown.getAttribute('data-month') - (y * 12 + m0)) > PICKER_NAV_LIMIT) {
        await jumpCalendarToYear(input, cal, y, m0);
    }
    let lastMonthKey = '';
    for (let i = 0; i < PICKER_NAV_LIMIT; i++) {
        let cell = cal.querySelector(`[data-iso-date="${iso}"]`)
            || cal.querySelector(`[data-year="${y}"][data-month="${m0}"][data-date="${day}"]`);
        if (!cell) {
            const shown = cal.querySelector('[data-year][data-month]:not(.-other-month-)')
                || cal.querySelector('[data-year][data-month]');
            if (!shown) return false;
            const sy = +shown.getAttribute('data-year'), sm0 = +shown.getAttribute('data-month');
            // Ulaşılamayacak hedefte boşa tıklanmaz (fallback yolu devralır)
            if (Math.abs(sy * 12 + sm0 - (y * 12 + m0)) > PICKER_NAV_LIMIT) return false;
            const key = `${sy}-${sm0}`;
            if (key === lastMonthKey) return false; // navigation made no progress
            lastMonthKey = key;
            const btn = cal.querySelector(`[data-action="${(sy * 12 + sm0) < (y * 12 + m0) ? 'next' : 'prev'}"]`);
            if (!btn) return false;
            btn.click();
            await sleep(60);
            continue;
        }
        if (cell.className.includes('-disabled-')) {
            cell = nearestEnabledDayCell(cal, y, m0, day);
            if (!cell) return false;
        }
        const prev = input.value;
        // Full click sequence: the libraries track mousedown/mouseup to know the interaction
        // started inside the calendar (keeps their blur handler from leaving the picker open)
        cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
        cell.click();
        for (let w = 0; w < PICKER_CLICK_WAIT_TRIES; w++) {
            await sleep(50);
            if (input.value && input.value !== prev) return true;
        }
        return false;
    }
    return false;
}

// air-datepicker (v2/v3) writes its own formatted value and internal state on cell click
async function tryFillViaDatePicker(input, isoDate) {
    const doc = input.ownerDocument;
    const target = parseIsoDate(isoDate);
    if (!target) return false;
    const year = target.getFullYear();
    if (year < PICKER_MIN_YEAR || year > new Date().getFullYear() + PICKER_MAX_YEAR_OFFSET) return false;
    // Yazılabilir alanda doğrudan yazım yedeği var: henüz konteyneri oluşmamış picker için
    // açma denemesi yapılmaz. readonly alanda tek yol takvim olduğu için deneme sürdürülür.
    if (!input.readOnly && !doc.querySelector(CAL_ANY_SEL)) return false;
    const before = new Set(doc.querySelectorAll(CAL_ACTIVE_SEL));
    const inputBox = input.getBoundingClientRect();
    input.focus();
    // air-datepicker opens on the focus event (showEvent: 'focus'); a real focus() only fires
    // that event while the window itself is focused, so a synthetic event covers background tabs
    input.dispatchEvent(new FocusEvent('focus'));
    let candidates = [];
    for (let i = 0; i < PICKER_PROBE_TRIES && !candidates.length; i++) {
        await sleep(50);
        const all = [...doc.querySelectorAll(CAL_ACTIVE_SEL)];
        const fresh = all.filter(el => !before.has(el));
        candidates = (fresh.length ? fresh : all).sort((a, b) => rectDistance(a, inputBox) - rectDistance(b, inputBox));
    }
    for (const cal of candidates) {
        if (await selectDateInCalendar(cal, target, input)) {
            dispatchFieldEvents(input);
            input.blur();
            return true;
        }
    }
    // Nothing selected: still release the calendar we opened
    input.dispatchEvent(new FocusEvent('blur'));
    input.blur();
    return false;
}

// Date text formats from placeholders/patterns, e.g. "gg.aa.yyyy" (Turkish day/month tokens)
function detectDateFormat(input) {
    const hints = [
        input.placeholder,
        input.getAttribute('data-format'),
        input.getAttribute('data-date-format'),
        input.getAttribute('pattern')
    ].filter(Boolean).join(' ');
    if (!hints) return null;
    // Yerel jetonlar: yıl (yyyy/aaaa/jjjj/гггг), gün (gg/dd/jj/дд), ay (aa/mm/мм); Latin dışı harfler için \p{L} sınırı
    const normalized = hints
        .replace(/(?<!\p{L})(yyyy|aaaa|jjjj|гггг|yy)(?!\p{L})/giu, 'yyyy')
        .replace(/(?<!\p{L})(gg|dd|jj|дд)(?!\p{L})/giu, 'dd')
        .replace(/(?<!\p{L})(aa|mm|мм)(?!\p{L})/giu, 'mm')
        .toLowerCase();
    const match = /(yyyy|dd|mm)([.\-/\s])(yyyy|dd|mm)\2(yyyy|dd|mm)/.exec(normalized);
    if (!match) return null;
    const order = [match[1], match[3], match[4]];
    if (new Set(order).size !== 3 || !order.includes('yyyy')) return null;
    return { order, separator: match[2] };
}

function formatDateValue(iso, format) {
    if (!format) return iso;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return iso;
    const parts = { yyyy: m[1], mm: m[2], dd: m[3] };
    return format.order.map(token => parts[token]).join(format.separator);
}

// Placeholder'lar genelde örnek değer gösterir ("Orn: 2024/123"): aynı şekilde değer üretilir
function detectValueShape(input) {
    if ((input.getAttribute('inputmode') || '').toLowerCase() === 'numeric') return '####';
    const match = /[0-9][0-9\s/,.()\-]*$/.exec(input.placeholder || '');
    if (!match) return null;
    const shape = match[0].trim();
    return shape.length >= 2 && shape.length <= 24 ? shape : null;
}

// Hidden input paired with a visible display field ("x_date_display" <-> "x")
const HIDDEN_PAIR_SUFFIXES = ['_date_display', '_display', '_hidden'];

function findPairedHiddenInput(input) {
    if (!input.id) return null;
    const doc = input.ownerDocument;
    for (const suffix of HIDDEN_PAIR_SUFFIXES) {
        if (!input.id.endsWith(suffix)) continue;
        const paired = doc.getElementById(input.id.slice(0, -suffix.length));
        if (paired && paired !== input && paired.tagName === 'INPUT' && paired.type === 'hidden') return paired;
    }
    return null;
}

// The hidden input is what the form submits; the visible field only carries the localized text
function fillPairedHiddenInput(hidden, value) {
    try {
        snapshotField(hidden);
        setNativeValue(hidden, value);
        dispatchFieldEvents(hidden, ['input', 'change']);
        filledCount++;
        return true;
    } catch (e) {
        console.debug('[FillHub] alan atlandı:', hidden, e);
        return false;
    }
}

function identifyField(input, customRules = []) {
    // 1. Check Custom Rules first
    for (const rule of customRules) {
        try {
            if (input.matches?.(rule.selector)) return rule.type;
        } catch (e) { }
    }

    // 2. Standard identification: tür sinyali, autocomplete ve metin kaynakları (field-detect.js)
    const texts = fieldTexts(input);
    const text = texts.join(" ").toLowerCase();
    const detected = FillHubDetect.classify(texts, {
        inputType: input.type,
        autocomplete: input.getAttribute("autocomplete")
    });
    if (detected) return detected;

    // A date-shaped placeholder (e.g. "gg.aa.yyyy") is itself a reliable date signal
    if (detectDateFormat(input)) return 'date';

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

function queryFields(root, selector) {
    const own = root.nodeType === 1 && root.matches?.(selector) ? [root] : [];
    return [...own, ...root.querySelectorAll(selector)];
}

function collectFields(container, settings) {
    const inputs = queryFields(container, FIELD_SELECTOR);

    // Pre-scan for names to support Smart Email Linking
    const handledNames = new Set();
    inputs.forEach(input => {
        const type = identifyField(input, settings.customRules);
        if (type !== 'firstName' && type !== 'lastName') return;
        if (!isElementVisible(input)) return;
        handledNames.add(input);
        fillField(input, settings);
    });

    // Radio groups are resolved as a whole: exactly one enabled radio per group
    const radioGroups = new Map();
    queryFields(container, 'input[type="radio"][name]').forEach(r => {
        if (!radioGroups.has(r.name)) radioGroups.set(r.name, []);
        radioGroups.get(r.name).push(r);
    });
    radioGroups.forEach(list => {
        const enabled = list.filter(r => !isControlDisabled(r) && isElementVisible(r));
        if (!enabled.length) return;
        const pick = enabled[Math.floor(Math.random() * enabled.length)];
        list.forEach(r => {
            if (r.checked !== (r === pick)) {
                snapshotField(r);
                setNativeChecked(r, r === pick);
                dispatchFieldEvents(r);
            }
        });
    });

    inputs.forEach(input => {
        // Names were filled by the pre-scan pass so e-mails can link to them
        if (handledNames.has(input)) return;
        // Radio groups are resolved as a whole group, not per input
        if (input.type === 'radio') return;
        fillField(input, settings);
    });

    // Handle Shadow DOM Recursively
    const allElements = container.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.shadowRoot) {
            collectFields(el.shadowRoot, settings);
        }
    });
}

// Seçenek, kişinin ülke/il/telefon kodu ile eşleşiyor mu? (ISO kodu, İngilizce veya yerel ad)
function selectOptionMatches(option, type, person) {
    if (!person) return false;
    const text = (option.textContent || '').trim().toLowerCase();
    const value = (option.value || '').trim().toLowerCase();
    if (type === 'country') {
        const entry = FakeDataGenerator.getCountries().find(c => c.code === person.country);
        const names = [person.country, entry && entry.name].filter(Boolean).map(s => s.toLowerCase());
        return names.includes(value) || names.includes(text);
    }
    if (type === 'state') {
        const region = String(person.city.region).toLowerCase();
        return text === region || value === region;
    }
    if (type === 'phoneCode') {
        const cc = FakeDataGenerator.profileOf(person).phone.cc;
        return value === `+${cc}` || value === cc || text.includes(`+${cc}`);
    }
    return false;
}

// Selects valid options only: no disabled, hidden or empty placeholder options
function fillSelect(input, type, person) {
    try {
        const candidates = [...input.options].filter(o => !o.disabled && !o.hidden && o.value !== '');
        if (!candidates.length) return false;
        snapshotField(input);
        const matched = ['country', 'state', 'phoneCode'].includes(type) ? candidates.filter(o => selectOptionMatches(o, type, person)) : [];
        if (input.multiple) {
            const count = Math.min(candidates.length, Math.random() > 0.5 ? 2 : 1);
            const picks = [...candidates].sort(() => Math.random() - 0.5).slice(0, count);
            for (const option of input.options) option.selected = picks.includes(option);
        } else {
            const pool = matched.length ? matched : candidates;
            const pick = pool[Math.floor(Math.random() * pool.length)];
            setNativeValue(input, pick.value);
        }
        dispatchFieldEvents(input);
        filledCount++;
        return true;
    } catch (e) {
        console.debug('[FillHub] alan atlandı:', input, e);
        return false;
    }
}

// Active persona from settings; only used when it actually carries persona data
// Yeni oturum: sabit kimlik modundaki şablonun kişisi ya da her çağrıda taze bir kişi (rastgele mod)
function startSession(settings) {
    sessionData = {
        firstName: '',
        lastName: '',
        password: null,
        person: FakeDataGenerator.activeIdentity(settings) || FakeDataGenerator.createPerson(settings.preferredLocale)
    };
}

// Fills a single field; returns true when a value was written (async picker work included)
function fillField(input, settings, checkVisibility = true) {
    if (isControlDisabled(input)) return false;

    if (input.type === 'file') {
        return fillFileInput(input, sessionData);
    }

    if (checkVisibility && !isElementVisible(input)) return false;

    if (input.type === 'radio' || input.type === 'checkbox') {
        // Her doldurma temiz sayfa: kutu hedef duruma getirilir (birikme yok). Karar sırası:
        // radio ve required → checkAllBoxes → pazarlama (işaretsiz) → gizlilik/şart/KVKK onayı (işaretli) → rastgele
        const kind = input.type === 'checkbox' ? FillHubDetect.classifyCheckbox(fieldTexts(input)) : 'other';
        const shouldCheck = input.type === 'radio' || input.required || input.getAttribute('aria-required') === 'true'
            || settings.checkAllBoxes ? true
            : kind === 'marketing' ? false
            : kind === 'consent' && settings.consentBoxes !== false ? true
            : Math.random() >= 0.5;
        if (input.checked === shouldCheck) return false;
        snapshotField(input);
        setNativeChecked(input, shouldCheck);
        dispatchFieldEvents(input);
        filledCount++;
        return true;
    }

    const type = identifyField(input, settings.customRules);
    if (!type) return false;

    if (input.tagName === 'SELECT') {
        return fillSelect(input, type, sessionData.person);
    }

    if (input.tagName === 'INPUT' && NATIVE_TYPED_INPUTS.has(input.type)) {
        if (input.readOnly) return false; // readonly native tarih/saat/renk alanlarına yazılmaz
        fillNativeTypedInput(input, settings);
        return true;
    }

    // Tarih alanları (yerel veya maskeli) takvim etkileşimiyle doldurulur
    if (input.tagName === 'INPUT' && !NATIVE_TYPED_INPUTS.has(input.type)
        && (type === 'date' || type === 'datetime')) {
        const iso = FakeDataGenerator.generate('date', settings.preferredLocale, {
            chaosMode: settings.chaosMode,
            piiSafe: settings.piiSafe
        });
        const isoDate = String(iso).slice(0, 10);
        // Masked text fields (e.g. "gg.aa.yyyy") need the localized shape, not ISO
        const displayValue = formatDateValue(isoDate, detectDateFormat(input));
        snapshotField(input);
        pendingTasks.push(async () => {
            const hidden = findPairedHiddenInput(input);
            const hiddenBefore = hidden ? hidden.value : null;
            if (await tryFillViaDatePicker(input, isoDate)) {
                filledCount++;
            } else if (input.readOnly) {
                return; // readonly: yalnız takvim etkileşimi kabul edilir
            } else {
                assignFieldValue(input, displayValue); // safe fallback: write the value directly
            }
            if (hidden && hidden.value === hiddenBefore) fillPairedHiddenInput(hidden, isoDate);
        });
        return true;
    }

    // Readonly alanlara doğrudan değer yazılmaz
    if (input.readOnly) return false;

    // Eşleşen parola alanları aynı değeri alır; diğer değerler oturumdaki kişiden üretilir
    let val;
    if (type === 'password' && settings.matchPasswords && sessionData.password) {
        val = sessionData.password;
    } else {
        val = FakeDataGenerator.generate(type, settings.preferredLocale, {
            ...sessionData,
            fieldName: input.name || input.id || '',
            pattern: input.getAttribute('pattern') || '',
            valueShape: detectValueShape(input),
            multiline: input.tagName === 'TEXTAREA',
            maxLength: input.maxLength > 0 ? input.maxLength : 0,
            placeholder: input.placeholder || '',
            script: detectFieldScript(input),
            chaosMode: settings.chaosMode,
            piiSafe: settings.piiSafe,
            smartEmail: settings.smartEmail !== false
        });

        // Cache values for smart linking (password is cached here if not matched)
        if (type === 'password') sessionData.password = val;
    }

    assignFieldValue(input, val);
    return true;
}

// Fills fields that frameworks render shortly after the initial fill pass
const DYNAMIC_SCAN_WINDOW_MS = 3000;

function observeDynamicFields(settings) {
    if (!document.body) return;
    const observer = new MutationObserver(records => {
        records.forEach(record => record.addedNodes.forEach(node => {
            if (node.nodeType === 1) collectFields(node, settings);
        }));
        drainTasks();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), DYNAMIC_SCAN_WINDOW_MS);
}

// Fill entry point: resets per-run state, collects fields, then drains async picker work
async function fillPage(settings) {
    pendingTasks = [];
    filledCount = 0;
    fillSnapshot = new Map();
    startSession(settings);
    // Watch for fields rendered while this fill is still running (async picker work included)
    observeDynamicFields(settings);
    collectFields(document, settings);
    await drainTasks();
}

// Restores every field touched by the last fill; returns the number of restored fields
function undoFill() {
    let restored = 0;
    fillSnapshot.forEach((snap, el) => {
        try {
            if (el.tagName === 'INPUT' && el.type === 'file') {
                const transfer = new DataTransfer();
                (snap.files || []).forEach(file => transfer.items.add(file));
                el.files = transfer.files;
            } else if (el.tagName === 'SELECT') {
                el.selectedIndex = typeof snap.selectedIndex === 'number' ? snap.selectedIndex : -1;
            } else if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
                setNativeChecked(el, !!snap.checked);
            } else {
                setNativeValue(el, snap.value);
            }
            dispatchFieldEvents(el);
            restored++;
        } catch (e) {
            console.debug('[FillHub] alan atlandı:', el, e);
        }
    });
    fillSnapshot = new Map();
    return restored;
}

// Devre dışı denetim: kendi disabled niteliği ya da disabled fieldset ebeveyni
function isControlDisabled(el) {
    return el.disabled === true || !!el.closest('fieldset[disabled]');
}

function isElementVisible(el) {
    if (!el) return false;

    let node = el;
    while (node && node.nodeType === 1) {
        if (node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('inert')) {
            return false;
        }
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
            return false;
        }
        // Walk across shadow boundaries as well as up the light DOM
        node = node.parentElement || node.getRootNode()?.host || null;
    }

    // Check dimensions
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

// Otomatik gönderim yalnız gerçek gönderim kontrollerine basar: rol tabanlı sahte butonlar ve
// yıkıcı/ikincil eylemler (İptal, Sil, Temizle...) dışarıda kalır
const SUBMIT_BUTTON_SELECTOR = 'button[type="submit"], input[type="submit"], input[type="image"], form button:not([type])';
const DESTRUCTIVE_BUTTON_TEXT = /cancel|iptal|delete|remove|discard|reset|sil|temizle|vazgeç|vazgec|abort|kapat|geri|close/i;

function autoSubmitLabel(control) {
    const text = control.tagName === 'INPUT'
        ? (control.value || '')
        : (control.innerText || control.textContent || '');
    return `${text} ${control.getAttribute('aria-label') || ''} ${control.getAttribute('title') || ''}`;
}

function autoSubmitForm(container) {
    const usable = [...container.querySelectorAll(SUBMIT_BUTTON_SELECTOR)]
        .filter(el => !el.disabled && !DESTRUCTIVE_BUTTON_TEXT.test(autoSubmitLabel(el)));
    const submitBtn = usable.find(el => (el.getAttribute('type') || 'submit').toLowerCase() === 'submit') || usable[0];
    if (submitBtn) {
        setTimeout(() => {
            submitBtn.click();
        }, 500);
    }
}

// Bildirim kartı: blog toast'unun açık/koyu yüzeyi (sayfa stillerinden bağımsız, inline)
const TOAST_THEMES = {
    dark: { background: 'rgba(24, 24, 27, 0.9)', color: '#f4f4f5', border: '1px solid rgba(255, 255, 255, 0.1)', shadow: '0 24px 48px -32px rgba(0, 0, 0, 0.9)' },
    light: { background: 'rgba(255, 255, 255, 0.95)', color: '#18181b', border: '1px solid #e4e4e7', shadow: '0 18px 40px -24px rgba(24, 24, 27, 0.35)' }
};

function showToast(message, theme) {
    let toast = document.getElementById('fake-filler-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fake-filler-toast';
        Object.assign(toast.style, {
            position: 'fixed', right: '20px', bottom: '20px', zIndex: '2147483647',
            display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '360px',
            padding: '14px 18px', borderRadius: '16px', boxSizing: 'border-box',
            fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif", fontSize: '13px', fontWeight: '500',
            transition: 'transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.4s cubic-bezier(0.2, 0.7, 0.2, 1)',
            transform: 'translateY(100px)', opacity: '0'
        });
        toast.innerHTML = '<span aria-hidden="true" style="flex-shrink: 0; width: 8px; height: 8px; border-radius: 999px; background: #f74a87; box-shadow: 0 0 0 3px rgba(247, 74, 135, 0.22);"></span><span></span>';
        document.body.appendChild(toast);
    }
    const palette = TOAST_THEMES[theme === 'light' ? 'light' : 'dark'];
    Object.assign(toast.style, { background: palette.background, color: palette.color, border: palette.border, boxShadow: palette.shadow });
    toast.lastElementChild.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Captcha yalnızca gösterilir: içerik betiği captcha'ya tıklamaz, çözmez ve API'lerini çağırmaz.
// Görünür bir captcha bulunursa kullanıcı doğrulamayı kendisi tamamlar.
const CAPTCHA_SELECTORS = [
    '.g-recaptcha', '.h-captcha', '.cf-turnstile',
    'iframe[src*="recaptcha"]', 'iframe[src*="hcaptcha"]', 'iframe[src*="challenges.cloudflare.com"]'
];

function findVisibleCaptcha() {
    for (const selector of CAPTCHA_SELECTORS) {
        for (const el of document.querySelectorAll(selector)) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return el;
        }
    }
    return null;
}

function highlightCaptcha(el) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const previous = el.style.outline;
    const previousOffset = el.style.outlineOffset;
    el.style.outline = '3px solid #f74a87';
    el.style.outlineOffset = '4px';
    setTimeout(() => {
        el.style.outline = previous;
        el.style.outlineOffset = previousOffset;
    }, 8000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!['fill', 'fill_chaos', 'fill_field', 'undo'].includes(request.action)) return;

    let responded = false;
    const respond = (payload) => {
        if (responded) return;
        responded = true;
        sendResponse(payload);
    };

    (async () => {
        const settings = await chrome.storage.local.get(null);
        // Yeni kurulum varsayılanları: gizlilik öncelikli + tarayıcı dili
        if (settings.piiSafe === undefined) settings.piiSafe = true;
        if (!settings.preferredLocale) settings.preferredLocale = FakeDataGenerator.canonicalLocale(navigator.language);
        if (request.locale) settings.preferredLocale = request.locale;
        // Eski şablon kayıtları ayar sayfası açılmadan da yeni modele taşınır (dolu eski şablon sabit kimlik olur)
        settings.profiles = FakeDataGenerator.migrateProfiles(settings.profiles, settings.preferredLocale).profiles;

        if (request.action === 'fill_chaos') settings.chaosMode = true;

        if (request.action === 'undo') {
            respond({ status: 'success', restored: undoFill() });
            return;
        }

        if (request.action === 'fill_field') {
            const target = document.activeElement;
            if (!target || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                respond({ status: 'skipped' });
                return;
            }
            pendingTasks = [];
            filledCount = 0;
            fillSnapshot = new Map();
            startSession(settings);
            fillField(target, settings, false);
            await drainTasks();
            respond({ status: 'success', filled: filledCount });
            return;
        }

        await fillPage(settings);
        if (window.top === window) {
            // Görünür captcha varsa doğrulamayı kullanıcı tamamlar: öğe vurgulanır, otomatik işlem yapılmaz
            const captcha = findVisibleCaptcha();
            if (captcha) {
                highlightCaptcha(captcha);
                showToast(getLocalizedMessage(settings.preferredLocale, 'captcha'), settings.theme);
            } else {
                showToast(getLocalizedMessage(settings.preferredLocale, request.action === 'fill_chaos' ? 'chaos' : 'filled'), settings.theme);
            }
        }
        if (settings.autoSubmit && request.action === 'fill') {
            autoSubmitForm(document);
        }
        respond({ status: 'success', filled: filledCount });
    })().catch((e) => {
        console.debug('[FillHub] doldurma hatası:', e);
        respond({ status: 'error' });
    });

    return true; // keep the message channel open until the async fill resolves
});

function getLocalizedMessage(localeLiteral, key = 'filled') {
    const locale = localeLiteral || navigator.language || 'en';
    const messages = {
        filled: {
            'tr': 'Tüm alanlar hassasiyetle dolduruldu.',
            'en': 'All fields filled with precision.',
            'es': 'Todos los campos llenados con precisión.',
            'fr': 'Tous les champs remplis avec précision.',
            'de': 'Alle Felder präzise ausgefüllt.',
            'pt': 'Todos os campos preenchidos com precisão.',
            'ru': 'Все поля заполнены с точностью.',
            'zh': '所有字段均已精确填写。',
            'ja': 'すべてのフィールドが正確に入力されました。',
            'ar': 'تم ملء جميع الحقول بدقة.',
            'hi': 'सभी फ़ील्ड सटीकता से भर दिए गए।',
            'bn': 'সব ঘর সঠিকভাবে পূরণ করা হয়েছে।',
            'ur': 'تمام فیلڈز درستگی سے بھر دیے گئے۔',
            'id': 'Semua kolom diisi dengan tepat.',
            'vi': 'Đã điền tất cả các trường một cách chính xác.'
        },
        chaos: {
            'tr': 'CHAOS MODE',
            'en': 'CHAOS MODE'
        },
        undo: {
            'tr': 'Form eski haline getirildi.',
            'en': 'Form restored.',
            'es': 'Formulario restaurado.',
            'fr': 'Formulaire restauré.',
            'de': 'Formular wiederhergestellt.',
            'pt': 'Formulário restaurado.',
            'ru': 'Форма восстановлена.',
            'zh': '表单已恢复。',
            'ja': 'フォームを元に戻しました。',
            'ar': 'تمت استعادة النموذج.',
            'hi': 'फ़ॉर्म पहले जैसा कर दिया गया।',
            'bn': 'ফর্ম আগের অবস্থায় ফিরিয়ে আনা হয়েছে।',
            'ur': 'فارم پہلے جیسا کر دیا گیا۔',
            'id': 'Formulir dikembalikan ke keadaan semula.',
            'vi': 'Đã khôi phục biểu mẫu.'
        },
        captcha: {
            "tr": "Doğrulama gerekiyor: captcha'yı kendiniz tamamlayın.",
            "en": "Verification needed: please complete the captcha yourself.",
            "es": "Se requiere verificación: complete el captcha usted mismo.",
            "fr": "Vérification requise : résolvez le captcha vous-même.",
            "de": "Bestätigung erforderlich: Bitte lösen Sie das Captcha selbst.",
            "pt": "Verificação necessária: conclua o captcha você mesmo.",
            "ru": "Нужна проверка: пройдите капчу самостоятельно.",
            "zh": "需要验证：请自行完成验证码。",
            "ja": "認証が必要です。キャプチャはご自身で完了してください。",
            "ar": "مطلوب التحقق: يرجى إكمال الكابتشا بنفسك.",
            "hi": "सत्यापन आवश्यक है: कैप्चा स्वयं पूरा करें।",
            "bn": "যাচাই প্রয়োজন: ক্যাপচা নিজে সম্পন্ন করুন।",
            "ur": "تصدیق درکار ہے: کیپچا خود مکمل کریں۔",
            "id": "Verifikasi diperlukan: selesaikan captcha sendiri.",
            "vi": "Cần xác minh: vui lòng tự hoàn thành captcha."
        }
    };
    const table = messages[key] || messages.filled;
    return table[locale.split('-')[0]] || table.en;
}
