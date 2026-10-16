# Changelog

All notable changes to FillHub are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.3.0] - 2026-10-16

### Added
- The notification after a fill has an Undo button when the form was not submitted. It does not take focus.
- Custom rules can be reordered (first match wins), edited, and tested: "Test on this page" shows how
  many fields on the current web page match the selector. Only the count is read.
- The settings page lists the keyboard shortcuts and where to change them.
- Diagnostics report: the settings page can download a summary for bug reports. It contains counts and
  settings flags only (no names, field values, labels, profile names or site addresses).
- Rich text fields (`contenteditable` editors) are filled, and Undo restores their previous text.
- Toolbar popup: choose the default country and profile, then Fill or Undo from the popup. Your choices are saved.
- Settings backup: export profiles, custom rules and settings to a JSON file, and import one back. Importing
  replaces the current settings after you confirm. Imported files are checked field by field and nothing is sent anywhere.
- Auto-submit exceptions: a list of sites where FillHub fills the fields but never clicks submit. An entry
  also covers its subdomains.

### Fixed
- The settings page controls without visible labels (country search, country list, auto-submit exception
  input, profile mode options, active profile checkbox) now have accessible names.
- Showing a captcha no longer scrolls the page to it or moves focus there; the element is only outlined.
- Auto-submit no longer clicks a submit-like button labelled as a captcha check (e.g. "I am not a robot").

### Changed
- Repository layout: the extension files now live in `extension/`. To load it unpacked, select that folder.
  The package is the same as before.
- Clicking the toolbar icon opens the popup instead of filling the page. The keyboard shortcut and the
  context menu still fill immediately.

## [1.2.1] - 2026-10-16

### Changed
- Lower memory use: content scripts are no longer injected into every page. FillHub injects its scripts
  only when you start a fill (shortcut, toolbar icon, or menu), into the frames that need them.
- Added the `scripting` permission for that injection. No new host access was added.

### Fixed
- The settings page logo was missing in the store package: `icons/logo.svg` was excluded from the zip.
- Auto-submit no longer clicks the submit button when a visible captcha is on the page, or in frames
  where no field was filled.
- Invalid CSS selectors in custom rules are rejected with a message instead of being saved silently.

## [1.2.0] - 2026-10-14

### Fixed
- Every fill now generates a fresh identity. The default persona no longer freezes the same name,
  e-mail and phone (`Murat` / `murat.kara2@example.com` / `5320478545`). Legacy presets are migrated
  when the extension runs, even if the settings page was never opened.
- PII Safe values are now varied and realistic-looking: mixed names, e-mail addresses that match the
  name and end with an example domain, phone numbers such as `5320000000`, and valid test national
  IDs such as `11111111110`. With PII Safe off, values are realistic (`5320478545`).
- `Soyadınız` (surname) is recognised as a last-name field; it was wrongly detected as a first name.
- Turkish phone numbers are generated with 10 digits (no leading zero).
- Single-field fill (`fill_field`) creates a new person on every call.
- The "E-mail repeat" field receives the same value as the e-mail field.
- Context menu titles are localized.

### Added
- 15-language locale model with 15 country profiles (US, CN, IN, MX, EG, FR, BD, BR, RU, PK, ID, DE,
  JP, TR, VN) and checksum-verified identity algorithms (TCKN, CPF, CNPJ, Chinese ID, SNILS, INN-10,
  My Number, CURP, Aadhaar, IBAN, and others).
- Field detection rewrite with a priority-ordered rule set, a 100+ label corpus across 15 languages,
  and autocomplete / input-type signals.
- Identity presets with random or fixed modes, and a "refresh identity" action.
- Support section in the settings page with a GitHub Sponsors link (also reachable from the top bar).
- Unit tests, end-to-end tests in real Chromium, CI workflows, and a Chrome Web Store package build.
- Open-source release files: MIT license, contribution guide, code of conduct, security policy, privacy
  policy, architecture notes.

### Changed
- Removed the automatic interaction with reCAPTCHA and Turnstile widgets that ran on every fill in 1.1.0.
  FillHub never clicks or executes CAPTCHA challenges. When a visible CAPTCHA is on the page, FillHub
  highlights it and asks you to complete it yourself.
- Consent checkboxes (terms, privacy, KVKK) are checked on fill; marketing checkboxes stay unchecked. New
  setting "Check consent boxes" (on by default).
- URL fields receive reserved example domains only (previously some were not reserved names).
- Text fields receive localized sample sentences instead of English Lorem ipsum, and respect maxlength.
- Onboarding text, page title, and the "Remove" rule button are translated; the onboarding text now describes
  the current behavior.
- Demo animation, FAQ, translation guide, and GitHub issue forms for field detection and translation.
- README rewritten with screenshots for each feature, a supported-identity table, and an architecture diagram.
- The PII Safe description now matches what the mode does (test values instead of generic "User 1" values).
- The settings sidebar subtitle is translated in every language.
- Identity profiles redesigned: a clear active-profile banner, profile cards with Use / Edit actions, and a
  dialog for creating or editing a profile. Nothing is saved until you press Save profile; cancelled profiles
  are not created, and deleting asks for a second click.
- Renamed from "Filler Max" to FillHub.
- Settings page rebuilt with a new visual design and a Tailwind CSS build step (`npm run build:css`).

## [1.1.0]

- Earlier development version under the previous name.
