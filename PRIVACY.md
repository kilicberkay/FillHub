# Privacy policy

FillHub is an open-source Chrome extension that fills web forms with fake data. It is designed so
that your data stays on your device.

## What FillHub does with data

- **Collects nothing.** FillHub does not send any data to the author or to third parties. It has no
  analytics, telemetry, crash reporting, or accounts.
- **Stores settings locally.** Your preferences (country, language, PII Safe mode, custom rules,
  identity presets, auto-submit exceptions) are kept in `chrome.storage.local` in your browser profile.
  They never leave your device. The summary of the last fill (counts of detected field types and
  flags, never values or labels) is stored the same way and is only shared if you download a
  diagnostics report and send it yourself. Fixed profile values you enter (first name, last name, e-mail,
  phone and password) are stored there too, without encryption. Do not enter a real password; the field is
  for test accounts only.
- **Backups are files you control.** Exporting settings writes a JSON file to your computer; importing
  reads a file you choose. Nothing is uploaded.
- **Reads form fields only when you ask it to fill.** FillHub acts when you press a shortcut, use
  the context menu, or press Fill in the toolbar popup. It reads the labels and names of form fields on the
  page you are viewing in order to choose a fake value for each field, and writes values back to
  those fields.
- **Does not store the values it writes into form fields**, except the previous values that the Undo
  command needs to restore the page, which are kept in memory for the current page session. The fixed
  profile values described above are the only values you type that FillHub keeps.

## Permissions and why they are needed

| Permission | Why |
|---|---|
| `storage` | Saves your settings locally. |
| `contextMenus` | Adds the "Fill form with fake data", "Fill this field" and "Undo fake fill" items to the right-click menu. |
| `scripting` | Injects the fill scripts into a page only after you start a fill. Pages you do not fill run no FillHub code. |
| `<all_urls>` (host access) and content scripts in all frames | Fill forms on any website, including forms inside iframes. Content scripts run only on the page you act on. |

## Fake data

FillHub generates data that is **not meant to belong to real people**:

- In **PII Safe mode** (on by default), personal identifiers use obvious test values: example
  domains (`example.com`, `example.org`, `test.example.com`), placeholder phone numbers, sentinel
  identity numbers, and test street and company names.
- Identity numbers that have a checksum (for example the Turkish national ID or Brazilian CPF) are
  generated so that they pass the public checksum algorithm. A checksum pass does not mean the
  number belongs to anyone. Do not use generated numbers for any real purpose.

## Children

FillHub is not directed at children and does not collect personal information from anyone.

## Changes

Changes to this policy are published in this repository with the release notes in
[CHANGELOG.md](CHANGELOG.md).

## Contact

Questions about privacy: open a GitHub issue in this repository.
