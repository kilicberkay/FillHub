# Architecture

FillHub is a Manifest V3 Chrome extension. Its runtime has no dependencies and no build step: the
files in the repository are loaded as they are. npm is used only for development tools.

## Components

| Part | Files | Responsibility |
|---|---|---|
| Manifest | `manifest.json` | Name and description via `__MSG_…__`, permissions (`storage`, `contextMenus`, `scripting`), shortcuts; no content scripts are declared |
| Service worker | `scripts/background.js` | Context menus (localized with `chrome.i18n`), shortcut commands, requests from the toolbar popup; forwards `fill`, `fill_field`, `undo` to the active tab together with its host (used by site exceptions) |
| Toolbar popup | `popup/popup.html`, `popup/popup.js` | Default country and profile selection (saved to settings), Fill and Undo buttons; shares `options/options.css` and `options/i18n.js` |
| Backup | `scripts/backup.js` (`FillHubBackup`) | Builds the export file and validates imported files field by field; the options page writes the result to storage |
| Site exceptions | `scripts/site-rules.js` (`FillHubSiteRules`) | Normalizes host names and matches a page against the list of sites where auto-submit is off (subdomains included) |
| Locale data | `scripts/locale-data.js` (`FillHubLocaleData`) | 15 language pools with Latin counterparts, 15 country profiles (cities, postal formats, phone rules, address templates, identity and IBAN specs) |
| Identity rules | `scripts/id-rules.js` (`FillHubIdRules`) | Generators and validators for identity numbers; test vectors; PII sentinel values |
| Field detection | `scripts/field-detect.js` (`FillHubDetect`) | Classifies a field from `autocomplete`, `type`, label, `name`/`id`, placeholder; priority-ordered rules; Turkish, Latin and non-Latin token matching |
| Generator | `scripts/generator.js` (`FakeDataGenerator`) | Locale resolution, `createPerson`, value per field type, PII Safe values, persona migration |
| Content script | `scripts/content.js` | Walks each frame and shadow root, fills fields, handles checkboxes, radios, selects, dates, files, undo, toast, captcha notice |
| Settings page | `options/options.html`, `options/options.js`, `options/i18n.js` | Profiles, custom rules, general settings, about, support; 15 interface languages |
| Styles | `options/ui.src.css` → `options/options.css` | Tailwind CSS 4 build (`npm run build:css`); generated file is not edited by hand |

Load order (`CONTENT_FILES` in `scripts/background.js`; the service worker injects them on demand): locale data → identity rules → field detection →
generator → site rules → content script. Every file also exports to `module.exports`, so the unit tests load the
same code in Node.

## Fill flow

```mermaid
sequenceDiagram
    participant U as User
    participant SW as Service worker
    participant CS as Content script (per frame)
    participant G as Generator
    participant P as Page
    U->>SW: shortcut, toolbar popup or menu
    SW->>CS: fill / fill_field / undo (tabs.sendMessage)
    CS->>CS: read settings, migrate legacy profiles
    CS->>G: createPerson (or fixed profile identity)
    loop each field
        CS->>CS: classify field (field-detect)
        CS->>G: generate value for the type
        CS->>P: setNativeValue + input/change events
    end
    CS->>P: show toast; highlight a visible captcha if present
```

1. The service worker forwards the action to the active tab; `fill_field` targets the focused field.
2. The content script reads settings from `chrome.storage.local`. Legacy persona presets are migrated
   in memory, so the first fill after an update already behaves correctly.
3. For a full fill, one person is created per fill unless a fixed profile is active. The person is a
   plain JSON record, so it can be stored in a profile and reused.
4. Each field is classified and given a value. Writes go through one function, `setNativeValue`,
   which also notifies framework listeners.
5. Undo restores the values captured before the fill.

## Persons and PII Safe

- **Realistic mode**: names, city, postal code, phone and identity numbers follow the country profile.
- **PII Safe mode** (default): the same person model, but personal identifiers use test values: example
  domains (`example.com`, `example.org`, `test.example.com`), phones with an operator prefix and zeros,
  sentinel identity numbers with a valid checksum, and test street and company names.
- **Fixed profiles** store one person as JSON. PII Safe still applies to the identifiers when filling.

## Captchas

The content script never clicks, solves, or calls reCAPTCHA, hCaptcha, or Turnstile APIs. It only looks
for visible captcha elements after a fill, scrolls to the first one, outlines it, and shows a notice.

## Settings and storage

- Settings and profiles live in `chrome.storage.local`. Nothing is synced or sent anywhere.
- Profile edits are saved only when the user presses **Save profile**.
- Interface strings: `options/i18n.js` (identical key sets in all 15 languages; checked by tests).
  Element ids in `options.html` must match the keys, or the text is not applied.

## Tests

| Layer | Location | What it checks |
|---|---|---|
| Data verification | `tools/verify-data.js` | Known identity vectors, map integrity, 300 persons per country, translation parity |
| Unit | `tests/unit` | Field-detection corpus, generator diversity and PII values, persona migration, manifest, locales, privacy and captcha rules, release integrity |
| Browser | `tests/e2e` | Real Chromium with the extension loaded: fills, undo, PII modes, persona migration, profile dialog, captcha notice, settings page |

The browser tests also run against the unpacked store archive (`FILLHUB_EXT_DIR=…`), so the package
that gets published is the one that is tested.
