# Chrome Web Store package

Everything needed to publish FillHub to the Chrome Web Store. Nothing in this folder is included in
the extension package itself (see `tools/build.js`).

## Contents

| Path | Purpose |
|---|---|
| `listing/<locale>.md` (15 languages, one file per `extension/_locales/` folder) | Store summary and description per language |
| `listing/en.md`, `listing/tr.md` | Also the single purpose and permission justifications (English and Turkish) |
| `privacy-policy.md` | Privacy policy text for the store form (also in `PRIVACY.md`) |
| `assets/store-icon-128.png` | Store icon (96 px artwork with 16 px transparent padding); the same for every language |
| `assets/promo/<locale>/promo-small-440x280.png` | Small promotional tile, one per language |
| `assets/promo/<locale>/promo-marquee-1400x560.png` | Marquee promotional image, one per language |
| `assets/social-preview-1280x640.png` | GitHub social preview image in English (upload in repository settings) |
| `assets/screenshots/<locale>/` | 1280×800 screenshots, five per language |
| `assets/src/*.svg` | Templates for the promotional images; `@L1@`, `@L2@`, `@FOOTER@`, `@TAGLINE@`, `@FEATURES@` are replaced per language |

`<locale>` is one of the folders in `extension/_locales/`. Regenerate the images after UI changes:

```bash
node tools/make-store-assets.mjs              # all 15 languages
node tools/make-store-assets.mjs ja zh_CN     # only the given languages
```

The generator needs Chromium and `rsvg-convert`. ImageMagick (`magick`) is optional and only rebuilds the icon. The
machine needs fonts for every script the languages use (CJK, Arabic, Devanagari, Bengali).

## Publishing steps

1. Build the package: `npm run build`. The archive is `dist/fillhub-<version>.zip`.
2. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and
   open the existing item. Upload the zip.
3. Fill in the listing from `listing/en.md` (default language). For each other language, paste the description
   from `listing/<locale>.md`. The summary comes from the extension's `extDescription`, which must match the
   summary in every listing file.
4. Upload the icon from `assets/store-icon-128.png`. For each language, upload the promotional tiles from
   `assets/promo/<locale>/` and the screenshots from `assets/screenshots/<locale>/` in that language's listing.
   The social preview is for the GitHub repository settings, not for the store.
5. In **Privacy practices**, declare: no data collected, no data sold or transferred, no remote code.
   Give the permission justifications from the listing. Use the privacy policy URL
   `https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md`.
6. Submit for review. The package uses `activeTab` (no host access to all sites); keep the `activeTab`
   justification from the listing handy.

## Before each submission

- `npm test` passes.
- `npm run build` passes, then unpack `dist/fillhub-<version>.zip` and run the browser tests against the
  archive: `FILLHUB_EXT_DIR=<unpacked folder> npm run test:e2e`. CI and the release workflow test the
  packaged archive, not the source tree. On PowerShell set `$env:FILLHUB_EXT_DIR` first.
- The store privacy policy URL is `https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md` and it
  returns 200 (a `release/*` branch URL breaks as soon as the branch is removed).
- `extension/manifest.json` version is higher than the published version.
- The screenshots match the current UI.
- The store description and the README describe the same features.
- The summary in every `listing/<locale>.md` equals `extDescription` in `extension/_locales/<locale>/messages.json`.
