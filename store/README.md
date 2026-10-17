# Chrome Web Store package

Everything needed to publish FillHub to the Chrome Web Store. Nothing in this folder is included in
the extension package itself (see `tools/build.js`).

## Contents

| Path | Purpose |
|---|---|
| `listing/en.md`, `listing/tr.md` | Store name, summary, description, single purpose, permission justifications |
| `privacy-policy.md` | Privacy policy text for the store form (also in `PRIVACY.md`) |
| `assets/store-icon-128.png` | Store icon (96 px artwork with 16 px transparent padding) |
| `assets/promo-small-440x280.png` | Small promotional tile |
| `assets/promo-marquee-1400x560.png` | Marquee promotional image |
| `assets/social-preview-1280x640.png` | GitHub social preview image (upload in repository settings) |
| `assets/screenshots/en`, `assets/screenshots/tr` | 1280×800 screenshots, one set per language |
| `assets/src/*.svg` | Templates for the promotional images |

Regenerate the images after UI changes:

```bash
node tools/make-store-assets.mjs   # needs Chromium, rsvg-convert, and ImageMagick (magick)
```

## Publishing steps

1. Build the package: `npm run build`. The archive is `dist/fillhub-<version>.zip`.
2. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and
   create a new item. Upload the zip.
3. Fill in the listing from `listing/en.md` (default language) and `listing/tr.md` (Turkish).
4. Upload the icon, promotional tiles, and screenshots from `assets/`.
5. In **Privacy practices**, declare: no data collected, no data sold or transferred, no remote code.
   Give the permission justifications from the listing. Use the privacy policy URL
   `https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md`.
6. Submit for review. Broad host access (`<all_urls>`) can lengthen the review; keep the justification
   text handy.

## Before each submission

- `npm test` passes.
- `extension/manifest.json` version is higher than the published version.
- The screenshots match the current UI.
- The store description and the README describe the same features.
