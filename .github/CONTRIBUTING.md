# Contributing to FillHub

Thanks for helping! FillHub is a small Chrome extension (Manifest V3) with no build step for the
extension itself. Contributions of all sizes are welcome: bug reports, field-detection cases from
real sites, locale data fixes, translations, and code.

## Ground rules

- Be kind. Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Keep the extension dependency-free at runtime. Development tools (Tailwind CLI) are the only
  npm dependencies.
- Do not add network requests, remote scripts, analytics, or new permissions without an issue
  first. Privacy is a core promise (see [PRIVACY.md](../PRIVACY.md)).
- Generated test data must stay obviously fake. Identity numbers must never be presented as valid
  for real people.

## Setup

```bash
npm ci
npm test            # syntax, data verification, unit tests, end-to-end (needs Chromium)
npm run test:quick  # everything except the browser tests
npm run build       # dist/fillhub-<version>.zip for the Chrome Web Store
```

Load the extension unpacked from the `extension/` folder at `chrome://extensions` (Developer mode).

End-to-end tests start a real Chromium with the extension loaded. Set `CHROME_BIN` to a Chrome or
Chromium binary if it is not found automatically. Without a browser, the e2e suite is skipped.

## Working on detection, data, or identity rules

- Field detection rules live in `extension/scripts/field-detect.js`; add labels to
  `tests/unit/field-corpus.mjs` together with the change.
- Identity algorithms (`extension/scripts/id-rules.js`) must be checked against published test vectors before
  a check digit is claimed. Formats without a verified algorithm are format-only.
- Locale data lives in `extension/scripts/locale-data.js`. Every language needs matching Latin companions for
  its name pools.
- UI strings are in `extension/options/i18n.js` (15 languages, identical key sets; `npm test` enforces it).

## Pull requests

1. Open an issue first for larger changes.
2. Create a branch from `main` and keep commits focused.
3. Add or update tests. `npm run test:quick` must pass; run `npm test` when you touched content
   scripts or the settings page.
4. Use the pull request template and describe what you verified in a real browser.

Commit messages: short imperative summary in English, body optional.
