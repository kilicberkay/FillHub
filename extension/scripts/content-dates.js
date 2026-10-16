// Tarih alanlarını air-datepicker takvimiyle doldurma (v2/v3 DOM sözleşmesi).
// Takvim açılmazsa ya da hedef ulaşılamazsa çağıran taraf (content.js) doğrudan yazım yedeğine geçer.
// Yükleme sırası: content.js'den önce (CONTENT_FILES, scripts/background.js).

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
