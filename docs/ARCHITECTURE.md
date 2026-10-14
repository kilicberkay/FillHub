# Architecture

FillHub is a Manifest V3 Chrome extension. It has no runtime dependencies and no build step for
the extension code: the files in the repository are loaded as they are.

## Parts

```
manifest.json            MV3 manifest, content script order, commands
scripts/
  locale-data.js         Data: languages, name pools, country profiles (FillHubLocaleData)
  id-rules.js            Identity algorithms and format rules (FillHubIdRules)
  field-detect.js        Field classification from labels, names, autocomplete (FillHubDetect)
  generator.js           Persons, locales, values per field type (FakeDataGenerator)
  content.js             Fill engine running in each frame of the page
  background.js          Service worker: context menus, shortcuts, toolbar click
options/
  options.html / .js     Settings page (profiles, rules, countries, sponsor section)
  i18n.js                Settings page strings, 15 languages
  ui.src.css             Design tokens and component classes (Tailwind input)
  options.css            Generated from ui.src.css + options.html (do not edit by hand)
  fonts/                 Geist and Geist Mono (SIL OFL 1.1)
icons/                   Toolbar and store icons
_locales/                Localized extension name, description, shortcut and menu titles
```

Content script load order (see `manifest.json`): locale data → identity rules → field detection →
generator → content script. Each file exports to `module.exports` as well, so the unit tests can
load them in Node.

## Fill flow

1. The user presses a shortcut, clicks the toolbar icon, or uses the context menu. The service worker
   sends a message to the active tab (`fill`, `fill_chaos`, `fill_field`, or `undo`).
2. The content script reads the settings from `chrome.storage.local`. Legacy persona presets are
   migrated in memory (`FakeDataGenerator.migrateProfiles`).
3. For each fill a new person is created (`createPerson`) unless a fixed identity is active. The person
   is a plain JSON record: names, city, phone, identity numbers, company, and e-mail local part.
4. Each field is classified (`FillHubDetect.classify`) and the generator returns a value for its type.
   The value is written with `setNativeValue`, the single write path that also notifies frameworks.
5. Fields are skipped when disabled, read-only (except date pickers), or hidden in ways that a user
   would not fill. Checkboxes are set to a target state (required ones checked). Undo restores the
   state captured before the fill.

## Persons and PII Safe

- Realistic mode: random persons. The phone, identity numbers, and address follow the country profile.
- PII Safe mode (default): the same person model, but the personal identifiers use test values:
  example domains, a phone with an operator prefix and zeros, sentinel identity numbers with a valid
  checksum, and test street and company names.
- Fixed identity presets store one person as JSON; PII Safe still applies to the identifiers.

## Settings page

The page is a set of sections switched by the sidebar. Its CSS is compiled with Tailwind CSS 4 from
`options/ui.src.css`; the design tokens and component classes follow the same conventions as the
FillHub brand. Text is never written with `innerHTML` from user input.

## Tests

- `tests/unit`: pure logic (Node test runner): field corpus, identity vectors, generator behavior,
  persona migration, static checks (manifest, translations, network-free code, element ids).
- `tests/e2e`: real Chromium with the extension loaded. The harness serves a local form page and
  drives the extension through the service worker.
- `tools/verify-data.js`: known vectors, map integrity, and 300 persons per country.
