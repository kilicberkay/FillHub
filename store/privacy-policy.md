# FillHub privacy policy

Last updated: 2026-10-14

FillHub is an open-source Chrome extension that fills web forms with fake data. FillHub does not
collect, transmit, sell, or share any personal data.

- **No data collection.** No analytics, telemetry, crash reports, accounts, or advertising.
- **Local settings only.** Preferences are stored in `chrome.storage.local` in your browser profile.
- **Form values.** FillHub reads field labels and names on the page where you start a fill, and writes
  fake values into those fields. It keeps only the previous values needed for Undo, in memory for the
  current page.
- **No network requests.** The extension contains no remote code and makes no requests to any server.
- **Fake data.** Generated personal details are test values. PII Safe mode (on by default) uses
  obvious test values. Generated identity numbers may pass public checksum rules; do not use them for
  any real purpose.

Permissions: `storage` (local settings), `contextMenus` (right-click menu), and access to sites
(`<all_urls>`) so that forms can be filled where you ask.

Full policy with contact information: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md
