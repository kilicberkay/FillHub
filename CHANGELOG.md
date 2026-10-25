# Changelog

All notable changes to FillHub are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.4.2] - 2026-10-25

Store listing only; the extension code is unchanged.

### Changed
- The short description in Urdu now reads as realistic data, not as real data.

## [1.4.1] - 2026-10-21

### Fixed
- A fill never finished on a page with an `about:blank#…` iframe: script injection waited for that frame to
  become idle, which it never does. Scripts are now injected without waiting.
- The settings page wrote all of its settings on every change, so a country or profile changed elsewhere, and
  the last fill summary, were reset while the page was open. It now writes only the setting that changed and
  follows changes made elsewhere.
- Searching the country list on the settings page could clear or change the saved country.
- The settings page skipped its first-run setup (country and interface language from the browser) when FillHub
  had been used before the page was ever opened.
- Generated dates, including the birth date behind CURP, NIR and Chinese ID numbers, could be later than today.
- An invisible reCAPTCHA badge (v3 or invisible v2), or a captcha hidden with CSS, counted as a visible captcha:
  auto-submit never ran and the notice asked the user to complete a captcha that was not there.
- Auto-submit clicked the first submit button on the page, which could belong to another form such as a search
  box. It now submits the form that was filled.
- Submit buttons such as "Reset password" or "Geri bildirim gönder" were treated as destructive because a word in
  them matched part of the destructive list. Destructive words now match as whole words.
- Custom-styled checkboxes and radios that hide the real input behind a visible label were not filled, so
  required consent boxes stayed unchecked.
- The notice said "All fields filled" and offered Undo on pages with nothing to fill. It now says that no
  fillable fields were found. The counts come from every frame of the page.
- Undo in the notice restored only the top frame. It now restores every frame, same-origin iframes included.
- Radio groups were not counted, so a page with only radio buttons reported no fields and was not auto-submitted.
  Radios with the same name in different forms were treated as one group.
- "Fill this field" was sent to every frame and ignored a focused field inside a shadow root. It now goes to the
  frame that was right-clicked and finds the field inside shadow roots.
- Number inputs (`type="number"`) labelled as phone or postal code received a random number from 0 to 99. They
  now receive the digits of a phone number or postal code.
- The notice used the language of the data country instead of the interface language.
- Undo restored only the first selected option of a multi-select list.
- A second fill within three seconds left the first fill's watcher for new fields running.
- A new notice could be hidden early by the previous notice's timer.

### Changed
- Clicking the toolbar icon fills the form immediately. The toolbar popup is gone: there is no Fill button and
  no "cannot fill this page" message from a window that could not see the tab. Country and profile are changed
  on the settings page.
- Settings opens from **Settings** in the right-click menu, both on the page and on the toolbar icon.
- README, Turkish README, store listings and architecture notes describe pinned profile values, site
  exceptions, backup, diagnostics, the interface language and the field sources accurately. The Turkish store
  listing gains the missing `scripting` justification, and the custom rules screenshot caption is corrected.
- Browser tests run with the browser language set to `en-US`, so results do not depend on the machine's language.

### Removed
- The toolbar popup, including the "Test on this page" selector check. Custom rules are still added and edited
  on the settings page. The popup screenshots are removed from the README.

## [1.4.0] - 2026-10-19

This release also includes the fixes from 1.3.2, which was not published separately.

### Changed
- FillHub no longer asks for access to all websites. It uses the `activeTab` permission: it acts on the tab you
  are looking at, and only after you press a shortcut, the popup's Fill or Test button, or a context menu item.
  The install warning about reading and changing data on all sites no longer appears.
- The "Test on this page" selector check moved from the Custom Rules page to the toolbar popup, because only a
  toolbar action can reach the current tab under `activeTab`.

### Fixed
- Auto-submit no longer sends a form inside an iframe while a visible captcha is elsewhere on the page when the
  fill starts. The service worker checks every frame of the tab, and the captcha is outlined in whichever frame holds it.
- Chaos mode's suggested shortcut `Ctrl+Shift+D` was never assigned: Chrome reserves that key for "Bookmark all
  tabs" and drops the extension's request without a message. The shortcut is now `Ctrl+Shift+Y`, the settings page
  and README list it, and a browser test presses the key to prove the command runs.

## [1.3.2] - 2026-10-17

### Fixed
- The password field of a fixed profile is masked on the settings page (it was plain text), and the privacy
  policies say that fixed profile values, including the password, are stored unencrypted on the device.
- The "Star on GitHub" and "Report an issue" links in the settings page's Support section open the FillHub
  repository. They pointed to an old repository name.
- The README and FAQ no longer say that FillHub scrolls to a visible captcha. It outlines the captcha, shows a
  notice, and leaves focus and scroll position alone.
- The "Support" item in the settings sidebar had a contrast of about 4.1:1 in the light theme when it was active.
  Its label now uses the same colours as the other items; only the heart keeps the accent colour.
- The README describes the e-mail addresses generated with PII Safe off accurately: they look realistic and use
  generic domains.

### Changed
- The toolbar popup says when a page has no fields to fill, or when there is nothing to undo, instead of reporting
  "0 fields". The texts are available in all 15 interface languages.
- The About page describes what FillHub does, in all 15 languages, without superlatives.
- The browser tests run on every push and pull request. A manual run can still skip them.
- The notification element that FillHub adds to web pages is named `fillhub-toast` (it was `fake-filler-toast`).
- README and store screenshots are retaken from the current build, so the notification's undo button matches
  the extension language.

## [1.3.1] - 2026-10-16

### Added
- Identity profiles can pin values: first name, last name, email, phone and password. The pinned values are
  used every time the profile is active, so a profile can hold a fixed test account. Pinned names keep the
  generated email consistent with them.

### Fixed
- The popup's fill count was taken from the first frame that answered, so a frame without fields could show 0.
  The popup now adds up the counts of all frames, and the same applies to Undo.
- Dropdown lists (country, profile, interface language, data type) are readable in the dark theme.
- The toolbar popup follows the theme chosen on the settings page.
- Data types show readable names (for example "First name") in the rule selector and the rule list,
  instead of identifiers such as `firstName`.
- The active profile checkbox in the profile dialog is styled like the other checkboxes.
- The fill notification keeps its message on wider lines and its Undo button on one line.
- Markup: attributes that were joined without a space in the settings page and the popup are separated.

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
