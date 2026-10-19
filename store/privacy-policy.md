# FillHub privacy policy

Last updated: 2026-10-17

FillHub is an open-source Chrome extension that fills web forms with fake data. FillHub does not
collect, transmit, sell, or share any personal data.

- **No data collection.** No analytics, telemetry, crash reports, accounts, or advertising.
- **Local settings only.** Preferences, custom rules, auto-submit exceptions and profiles are stored in
  `chrome.storage.local` in your browser profile. Fixed profile values you enter (first name, last name,
  e-mail, phone and password) are stored there too, without encryption, so do not enter a real password.
  A summary of the last fill (counts of detected field types and flags, never values) is stored the same way. Backup files you export or import are saved
  to and read from your computer only when you choose. None of this leaves your device.
- **Form values.** FillHub reads field labels and names on the page where you start a fill, and writes
  fake values into those fields. It keeps only the previous values needed for Undo, in memory for the
  current page.
- **No network requests.** The extension contains no remote code and makes no requests to any server.
- **Fake data.** Generated personal details are test values. PII Safe mode (on by default) uses
  obvious test values. Generated identity numbers may pass public checksum rules; do not use them for
  any real purpose.

Permissions: `storage` (local settings), `contextMenus` (right-click menu), `scripting` (injects the fill scripts only when you start a fill), and `activeTab` (access to the tab you are looking at, granted only when you press a shortcut, the popup's button, or the context menu, and only for that tab).

Full policy with contact information: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md
