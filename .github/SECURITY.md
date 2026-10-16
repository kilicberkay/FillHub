# Security policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Use GitHub's private vulnerability
reporting instead: go to the repository's **Security** tab and choose **Report a vulnerability**.

Include:

- the FillHub version (see `extension/manifest.json` or the settings page footer),
- the browser version and operating system,
- steps to reproduce, and the impact you expect.

You will get an acknowledgement as soon as the maintainer sees the report. Fixes are released as a
new version, and the advisory is published once users can update.

## Scope

In scope: the extension's code in this repository, its handling of page content, storage, and
messages between the extension parts.

Out of scope: vulnerabilities in the websites you fill, in Chromium itself, or in third-party
services. Generated data is fake by design; reports that a generated number passes a checksum are
expected behavior for the algorithms listed in [PRIVACY.md](../PRIVACY.md).

## Supported versions

Only the latest released version receives security fixes.
