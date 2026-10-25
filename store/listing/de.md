# Chrome Web Store listing: FillHub (Deutsch)

**Name:** FillHub

**Summary (132 characters max):**
Füllt Webformulare mit realistischen, konsistenten Testdaten in 15 Sprachen. Datenschutzmodus, Rückgängig, keine Datenerhebung.

## Description

FillHub füllt Webformulare mit realistischen, konsistenten Testdaten. Entwickler und Tester können Registrierungs-, Bestell- und Dateneingabeprozesse prüfen, ohne Testwerte von Hand einzugeben und ohne echte Personendaten zu verwenden.

Funktionen im Überblick

- 15 Sprachen und 15 Länderprofile. Namen, Adressen, Telefonnummern, Firmennamen und Identifikationsnummern entsprechen dem Format des jeweiligen Landes.
- Konsistente Personendaten. Eine Füllung erzeugt genau eine Person. Vorname, Nachname, E-Mail-Adresse, das Feld „E-Mail-Adresse wiederholen“, Benutzername und Telefonnummer passen daher zueinander.
- Intelligente Felderkennung. FillHub wertet Beschriftung, Feldname, Autocomplete-Hinweise und Eingabetyp gemeinsam aus, um jedes Feld zu erkennen. Beschriftungen in anderen Sprachen werden ebenfalls erkannt. Ein türkisches Feld mit der Beschriftung „Cep telefonu“ (Mobiltelefon) erhält zum Beispiel eine Telefonnummer, ein Feld mit der Beschriftung „Soyadınız“ (Ihr Nachname) einen Nachnamen.
- Modus „PII Safe“ (standardmäßig aktiv). Für personenbezogene Kennungen werden eindeutig erkennbare Testwerte verwendet: E-Mail-Adressen unter example.com, Platzhalter-Telefonnummern und Test-Identifikationsnummern, die nicht für den echten Einsatz bestimmt sind.
- Identitätsprofile. Verwenden Sie bei jeder Füllung eine neue zufällige Person oder eine feste Person. Ein Profil kann Vorname, Nachname, E-Mail-Adresse, Telefonnummer und Passwort festlegen. So lässt sich bei jeder Füllung dasselbe Testkonto verwenden.
- Benutzerdefinierte Regeln. Ordnen Sie einem CSS-Selektor einen Datentyp zu, wenn die integrierte Erkennung ein Feld nicht erkennt. Regeln werden auf der Einstellungsseite bearbeitet.
- Einwilligungs-Kontrollkästchen (Nutzungsbedingungen, Datenschutzerklärung und KVKK-Einwilligung nach türkischem Datenschutzrecht) werden angekreuzt. Marketing-Kontrollkästchen bleiben leer.
- Textfelder erhalten Beispielsätze in der Sprache des Landes, gekürzt auf die maximale Feldlänge.
- Dateifelder erhalten eine kleine generierte Datei, die dem zulässigen Dateityp entspricht.
- Automatisches Absenden (optional, standardmäßig deaktiviert) klickt auf die tatsächliche Absende-Schaltfläche des ausgefüllten Formulars. Destruktive Schaltflächen wie „Abbrechen“ oder „Löschen“ werden nie angeklickt. Einzelne Websites können vom automatischen Absenden ausgeschlossen werden.
- Captchas werden nie angeklickt oder gelöst. Ein sichtbares Captcha wird umrandet, damit Sie es selbst lösen können. In diesem Fall wird das Formular nicht automatisch abgeschickt.
- Der Chaos-Modus füllt Felder mit ungewöhnlichen Werten für Fuzz-Tests.
- Die Rückgängig-Funktion stellt den Zustand des Formulars vor der letzten Füllung wieder her.
- Einstellungen lassen sich in einer lokalen JSON-Datei sichern. Der Diagnosebericht für Fehlermeldungen enthält Zählwerte und grundlegende Einstellungen, aber keine Namen, Feldwerte oder Website-Adressen.
- Funktioniert in iframes derselben Herkunft und hält Werte mit JavaScript-Frameworks synchron. iframes anderer Herkunft liegen außerhalb der activeTab-Berechtigung und werden nicht ausgefüllt.

So verwenden Sie FillHub

1. Öffnen Sie eine Seite mit einem Formular.
2. Drücken Sie Ctrl+Shift+F (unter macOS Command+Shift+F) oder klicken Sie in der Symbolleiste auf das FillHub-Symbol. Das Formular wird sofort ausgefüllt.
3. Drücken Sie Ctrl+Shift+U (unter macOS Command+Shift+U), um die Füllung rückgängig zu machen.
4. Drücken Sie Ctrl+Shift+Y (unter macOS Command+Shift+Y), um das Formular im Chaos-Modus mit ungewöhnlichen Werten für Fuzz-Tests zu füllen.

Tastenkürzel können unter chrome://extensions/shortcuts geändert werden. Um nur ein einzelnes Feld zu füllen, klicken Sie mit der rechten Maustaste auf das Feld und wählen Sie „Dieses Feld füllen“.

Datenschutz

FillHub erhebt keine Daten und stellt keine Netzwerkanfragen. Die Einstellungen werden ausschließlich in Ihrem Browser gespeichert. Die Erweiterung sendet nichts an den Entwickler oder an Dritte. Datenschutzerklärung: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Open Source

FillHub ist kostenlos und unter der MIT-Lizenz quelloffen. Quellcode, Fehlerberichte und Beiträge: https://github.com/kilicberkay/FillHub

Unterstützung

FillHub ist kostenlos. Wenn FillHub Ihnen bei der Arbeit nützt, können Sie die Weiterentwicklung über GitHub Sponsors unterstützen: https://github.com/sponsors/kilicberkay

Verantwortungsvolle Nutzung

FillHub ist für Tests und Entwicklung bestimmt. Erzeugte Identifikationsnummern können öffentliche Prüfziffernverfahren bestehen. Verwenden Sie erzeugte Daten nicht für echte Anträge, Käufe oder Identitätsnachweise.
