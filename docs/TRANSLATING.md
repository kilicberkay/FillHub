# Translating FillHub

FillHub's settings page and the messages shown on forms are translated into 15 languages. Translations are a
great first contribution, and this guide explains how the strings are organized.

## Where the strings live

| What | File |
|---|---|
| Settings page text | `extension/options/i18n.js` (one object per language, identical key sets) |
| Messages shown on the page after a fill (toast) | `extension/scripts/content.js` (`getLocalizedMessage`) |
| Extension name, description, shortcut and menu titles | `extension/_locales/<language>/messages.json` |
| Sample sentences used in text fields | `extension/scripts/locale-data.js` (`sampleShort`, `sampleLong`) |

## How the settings page strings work

Each key in `extension/options/i18n.js` matches the `id` of an element in `extension/options/options.html`. When the language
changes, the page sets each element's text to the matching value. A key with no matching element is ignored,
and an element without a key keeps its English text, so a missing key is visible in the page.

## Checks

```bash
npm run test:quick
```

The data verification checks that every language has exactly the same keys as English and that no value is
empty. Unit tests check the key sets again. Please do not add or remove a key in one language only.

## Guidelines

- Keep the meaning and the tone. Short labels stay short; the settings descriptions can be a full sentence.
- Keep product and technical names unchanged: FillHub, PII Safe, Ctrl+Shift+F, GitHub Sponsors, KVKK, and
  code-like words such as `example.com`.
- Keep placeholders such as `5320000000` or `example.com` as they are; they are sample values.
- Right-to-left languages (Arabic and Urdu) are already set up; check that the text reads naturally.
- Native speakers review the strings best. If you are not sure, say so in the pull request.

## How to submit a translation

1. Open an issue with the **Translation** form, or go straight to a pull request.
2. Change only the values in `extension/options/i18n.js` (or the other files listed above).
3. Run `npm run test:quick`.
4. Open a pull request with a before-and-after screenshot of the settings page in that language if you can.
