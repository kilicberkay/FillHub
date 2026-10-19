# Chrome Web Store listing: FillHub (English)

**Name:** FillHub

**Summary (132 characters max):**
Fill web forms with realistic, consistent fake data in 15 languages. Privacy-safe mode, undo, and no data collection.

**Category:** Developer Tools

**Language:** English (default); localized name and short description in 14 more languages

**Single purpose:** Fill the form fields on the current web page with fake test data.

## Description

FillHub fills web forms with realistic, consistent fake data, so developers and testers can test
sign-up, checkout, and data-entry flows without typing test values by hand or using real people's
details.

Highlights

- 15 languages and 15 country profiles. Names, addresses, phone numbers, company names, and identity
  numbers follow each country's format.
- Consistent people. One fill creates one person, so the first name, last name, e-mail, the
  "e-mail again" field, the username, and the phone number agree with each other.
- Smart field detection. Labels, names, autocomplete hints, and input types are combined, so a field
  labelled "Cep telefonu" or "Soyadınız" receives the right value.
- PII Safe mode (on by default). Personal identifiers use obvious test values: example.com e-mail
  addresses, placeholder phone numbers, and test identity numbers that are never meant for real use.
- Consent checkboxes (terms, privacy, KVKK) are checked; marketing checkboxes stay unchecked.
- Text fields receive sample sentences in the country's language, cut to the field's maximum length.
- Chaos mode for fuzz-style testing of unusual inputs.
- Undo restores the form to the state it had before the last fill.
- Works in same-origin iframes, reads labels in the page's own language, and keeps values in sync with
  JavaScript frameworks. Cross-origin iframes are outside the activeTab grant and are left untouched.

How to use

1. Open a page with a form.
2. Press Ctrl+Shift+F (Command+Shift+F on macOS), or click the FillHub icon and press Fill in the popup.
3. Press Ctrl+Shift+U to undo.
Right-click a single field and choose "Fill this field" to fill only that field.

Privacy

FillHub collects no data. Settings stay in your browser. The extension sends nothing to the author or
to any third party. See the privacy policy: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Open source

FillHub is free and open source under the MIT license. Source code, issues, and contributions:
https://github.com/kilicberkay/FillHub

Support

FillHub is free. If it helps your work, you can support development on GitHub Sponsors:
https://github.com/sponsors/kilicberkay

Responsible use

FillHub is for testing and development. Generated identity numbers may pass public checksum rules, so
do not use generated data for real applications, purchases, or identity claims.

## Permission justifications

- **storage:** saves the user's settings (country, language, PII Safe mode, custom rules, identity
  presets) locally in the browser. Nothing is synced or sent out.
- **contextMenus:** adds "Fill form with fake data", "Fill this field", and "Undo fake fill" to the right-click menu.
- **scripting:** injects the fill scripts into the page you are filling, only after you start a fill (shortcut, toolbar icon, or menu). No FillHub code runs on pages you do not fill.
- **activeTab:** FillHub reads and fills only the tab the user is looking at, and only after the user
  presses a shortcut, presses Fill or Test in the toolbar popup, or uses the context menu. The permission is
  granted for that tab only, and it ends when the user leaves the tab. FillHub has no host access to
  all sites and does not read pages in the background. Content scripts inject into the frames of that tab
  (including forms inside same-origin iframes) only after the user's action.

Remote code: none. The extension ships all its code in the package and makes no network requests.
Data collection: none.

## Screenshots

Captions (in order):

1. A sample sign-up form filled by FillHub in one click.
2. General settings: default country, smart features, PII Safe mode.
3. Profiles: random or fixed identity modes.
4. Custom rules: map field names to values.
5. Support section with the GitHub Sponsors link.

## Assets

- Icon: `store/assets/store-icon-128.png`
- Small promo tile: `store/assets/promo-small-440x280.png`
- Marquee: `store/assets/promo-marquee-1400x560.png`
- GitHub social preview: `store/assets/social-preview-1280x640.png`
- Screenshots (1280×800): `store/assets/screenshots/en/`
