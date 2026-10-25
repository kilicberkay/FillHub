# Chrome Web Store listing: FillHub (Deutsch)

**Name:** FillHub

**Summary (132 characters max):**
Füllt Webformulare mit realistischen, konsistenten Testdaten in 15 Sprachen. Datenschutzmodus, Rückgängig, keine Datenerhebung.

## Description

FillHub füllt Webformulare mit realistischen, konsistenten Testdaten, damit Entwickler und Tester Registrierungs-, Bestell- und Dateneingabe-Abläufe prüfen können, ohne Testwerte von Hand einzugeben oder echte Personendaten zu verwenden.

Highlights

- 15 Sprachen und 15 Länderprofile. Namen, Adressen, Telefonnummern, Firmennamen und Identifikationsnummern folgen dem Format des jeweiligen Landes.
- Konsistente Personen. Eine Füllung erzeugt eine Person, daher stimmen Vorname, Nachname, E-Mail, das Feld „E-Mail wiederholen“, der Benutzername und die Telefonnummer zueinander.
- Intelligente Felderkennung. Beschriftungen, Namen, Autocomplete-Hinweise und Eingabetypen werden kombiniert, sodass ein Feld mit der Beschriftung „Cep telefonu“ oder „Soyadınız“ den richtigen Wert erhält.
- PII-Safe-Modus (standardmäßig aktiv). Personenbezogene Kennungen verwenden eindeutige Testwerte: example.com-E-Mail-Adressen, Platzhalter-Telefonnummern und Test-Identitätsnummern, die nie für den echten Einsatz gedacht sind.
- Identitätsprofile. Verwenden Sie bei jeder Füllung eine neue zufällige Person oder behalten Sie eine feste Person bei. Ein Profil kann Vorname, Nachname, E-Mail, Telefon und Passwort festlegen und so ein festes Testkonto enthalten.
- Benutzerdefinierte Regeln. Ordnen Sie einen CSS-Selektor einem Datentyp zu, wenn die integrierte Erkennung ein Feld übersieht. Regeln werden auf der Einstellungsseite bearbeitet.
- Einwilligungs-Kontrollkästchen (Bedingungen, Datenschutz, KVKK) werden angekreuzt; Marketing-Kontrollkästchen bleiben leer.
- Textfelder erhalten Beispielsätze in der Sprache des Landes, gekürzt auf die maximale Feldlänge.
- Dateifelder erhalten eine kleine erzeugte Datei, die dem akzeptierten Typ entspricht.
- Optionales automatisches Absenden (standardmäßig aus) klickt auf die echte Absende-Schaltfläche des ausgefüllten Formulars. Löschende Schaltflächen wie Abbrechen oder Löschen werden nie angeklickt, und Websites können ausgeschlossen werden.
- Captchas werden nie angeklickt oder gelöst. Ein sichtbares Captcha wird markiert, Sie lösen es selbst, und das Formular wird nicht automatisch abgeschickt.
- Chaos-Modus für Fuzz-Tests mit ungewöhnlichen Eingaben.
- Rückgängig stellt das Formular in den Zustand vor der letzten Füllung zurück.
- Einstellungs-Backup als lokale JSON-Datei sowie ein Diagnosebericht, der nur Zählwerte enthält.
- Funktioniert in iframes derselben Herkunft, liest Beschriftungen in der Sprache der Seite und hält Werte mit JavaScript-Frameworks synchron. iframes anderer Herkunft liegen außerhalb der activeTab-Berechtigung und bleiben unverändert.

So verwenden Sie es

1. Öffnen Sie eine Seite mit einem Formular.
2. Drücken Sie Ctrl+Shift+F (unter macOS Command+Shift+F) oder klicken Sie auf das FillHub-Symbol in der Symbolleiste. Das Formular wird sofort ausgefüllt.
3. Drücken Sie Ctrl+Shift+U, um rückgängig zu machen.
4. Drücken Sie Ctrl+Shift+Y für den Chaos-Modus (ungewöhnliche Werte für Fuzz-Tests).

Tastenkürzel können unter chrome://extensions/shortcuts geändert werden. Klicken Sie mit der rechten Maustaste auf ein einzelnes Feld und wählen Sie „Dieses Feld ausfüllen“, um nur dieses Feld auszufüllen.

Datenschutz

FillHub erhebt keine Daten. Die Einstellungen bleiben in Ihrem Browser. Die Erweiterung sendet nichts an den Autor oder an Dritte. Siehe die Datenschutzerklärung: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Open Source

FillHub ist kostenlos und Open Source unter der MIT-Lizenz. Quellcode, Probleme und Beiträge: https://github.com/kilicberkay/FillHub

Unterstützung

FillHub ist kostenlos. Wenn es Ihnen bei der Arbeit hilft, können Sie die Entwicklung über GitHub Sponsors unterstützen: https://github.com/sponsors/kilicberkay

Verantwortungsvolle Nutzung

FillHub ist für Tests und Entwicklung gedacht. Erzeugte Identitätsnummern können öffentliche Prüfsummenregeln bestehen; verwenden Sie erzeugte Daten daher nicht für echte Anwendungen, Käufe oder Identitätsnachweise.
