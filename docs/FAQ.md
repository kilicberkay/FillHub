# FAQ

## A field was not filled. Why?

FillHub skips fields that are disabled, read-only (except date fields it can set through the picker),
hidden, or that it could not classify. To fill one field by hand, click into it and choose
**Fill this field** from the right-click menu. If a site uses unusual labels, add a
[custom rule](../README.md#custom-rules) that maps the field's CSS selector to a data type.
If a field is classified wrongly, please open a **Field not detected** issue with the label text and the
field's `name`, `id`, and `autocomplete` (no personal data).

## Why does FillHub not solve captchas?

By design. FillHub never clicks, solves, or calls reCAPTCHA, hCaptcha, or Turnstile. A captcha is a check that
a person is present, so FillHub leaves it to you. When a visible captcha is on the page, FillHub outlines it and
shows a notice. It does not scroll to the captcha or move focus there.

## Does it work with React, Vue, and other frameworks?

Yes. FillHub writes values through the element's native setter and then fires the `input` and `change`
events, so framework state updates the same way it does for typed text.

## Does it work inside iframes?

Yes, for same-origin iframes. The `activeTab` permission covers the tab's main frame origin, so the
content script is injected into the top page and its same-origin frames; they use the same settings and
the same person. Cross-origin iframes are outside that grant and are left untouched.

## What does PII Safe mode do?

PII Safe is on by default. Personal identifiers use values that are obviously test data: example domains
(`example.com`, `example.org`, `test.example.com`), phone numbers with an operator prefix followed by zeros,
identity numbers with sentinel digits that still pass the checksum, and test street and company names.
Turn it off in **General** to get realistic-looking values instead.

## Are the generated identity numbers real?

No. A number can pass the public checksum of its country without belonging to anyone. Do not use generated
numbers for a real application, purchase, or identity claim. See the verification table in the README.

## Why are consent boxes checked when I want them unchecked?

FillHub checks terms, privacy, and consent boxes (for example KVKK) and leaves marketing boxes unchecked. Turn
off **Check consent boxes** in **General** to use the random policy for those boxes, or turn on **Check all
checkboxes** to check everything. Required boxes are always checked.

## Why are dates between 2000 and today?

Dates are spread across that range so that tests do not depend on a single year. Months are 1-12 and days
1-28, which keeps every date valid for every month.

## Does FillHub submit the form?

Only if **Auto-Submit Form** is on (it is off by default). Even then, FillHub clicks only real submit
controls. Buttons such as Cancel, Delete, or Reset are never clicked.

## Why does FillHub say it cannot fill this page?

Chrome does not let extensions run on its own pages, such as `chrome://` pages, the Chrome Web Store, and the
new tab page. Open a regular web page with a form and try again.

## Does it work in Firefox or Safari?

FillHub is built for Chromium-based browsers: Chrome 116 or newer, and other Chromium browsers that support
Manifest V3. It has not been tested in Firefox or Safari.

## Where is my data stored?

Settings and profiles are stored in `chrome.storage.local` in your browser profile. Nothing is sent to a
server, and the extension has no analytics. Undo keeps the previous values of the last fill in memory for the
current page.

## A shortcut does not work.

Another extension or the operating system may already use it. Change it at `chrome://extensions/shortcuts`.
You can always use the toolbar popup or the right-click menu instead.

## How do I reset the settings?

Remove FillHub from `chrome://extensions` and install it again, or clear the extension's storage. The default
profile is always random and cannot be deleted.
