# Chrome Web Store listing: FillHub (Français)

**Name:** FillHub

**Summary (132 characters max):**
Remplit les formulaires web avec des données fictives réalistes et cohérentes en 15 langues. Mode sûr, annulation, sans collecte.

## Description

FillHub remplit les formulaires web avec des données fictives réalistes et cohérentes. Les développeurs et les testeurs peuvent tester les parcours d'inscription, de paiement et de saisie de données sans saisir de valeurs de test à la main et sans utiliser les informations de personnes réelles.

Points forts

- 15 langues et 15 profils de pays. Les noms, adresses, numéros de téléphone, noms d'entreprise et numéros d'identité suivent le format de chaque pays.
- Des données de personne cohérentes. Chaque remplissage crée une seule personne. Le prénom, le nom, l'adresse e-mail, le champ « Confirmer l'adresse e-mail », le nom d'utilisateur et le numéro de téléphone concordent donc entre eux.
- Détection intelligente des champs. FillHub combine le libellé, le nom du champ, les indications de saisie automatique et le type de champ pour identifier chaque champ. Les libellés rédigés dans d'autres langues sont également reconnus. Par exemple, un champ turc libellé « Cep telefonu » (téléphone mobile) reçoit un numéro de téléphone, et un champ libellé « Soyadınız » (votre nom de famille) reçoit un nom de famille.
- Mode PII Safe (activé par défaut). Les identifiants personnels utilisent des valeurs de test évidentes : adresses e-mail en example.com, numéros de téléphone fictifs et numéros d'identité de test qui ne sont pas destinés à un usage réel.
- Profils d'identité. Utilisez une nouvelle personne aléatoire à chaque remplissage, ou conservez une personne fixe. Un profil peut fixer le prénom, le nom, l'adresse e-mail, le numéro de téléphone et le mot de passe, afin d'utiliser le même compte de test à chaque remplissage.
- Règles personnalisées. Associez un sélecteur CSS à un type de données lorsque la détection intégrée ne reconnaît pas un champ. Les règles se modifient sur la page des paramètres.
- Les cases de consentement (conditions d'utilisation, politique de confidentialité et consentement KVKK prévu par la loi turque sur la protection des données) sont cochées. Les cases marketing restent décochées.
- Les champs texte reçoivent des phrases d'exemple dans la langue du pays, raccourcies à la longueur maximale du champ.
- Les champs de fichier reçoivent un petit fichier généré qui correspond au type de fichier accepté.
- L'envoi automatique (facultatif, désactivé par défaut) clique sur le véritable bouton d'envoi du formulaire rempli. Les boutons destructifs, comme Annuler ou Supprimer, ne sont jamais cliqués. Des sites précis peuvent être exclus de l'envoi automatique.
- Les captchas ne sont jamais cliqués ni résolus. Un captcha visible est encadré afin que vous le complétiez vous-même. Dans ce cas, le formulaire n'est pas envoyé automatiquement.
- Le mode chaos remplit les champs avec des valeurs inhabituelles pour les tests de type fuzz.
- La fonction d'annulation rétablit le formulaire dans l'état qu'il avait avant le dernier remplissage.
- Les paramètres peuvent être sauvegardés dans un fichier JSON local. Le rapport de diagnostic destiné aux signalements de bogues contient des compteurs et des paramètres de base, mais aucun nom, aucune valeur de champ et aucune adresse de site.
- Fonctionne dans les iframes de même origine et garde les valeurs synchronisées avec les frameworks JavaScript. Les iframes d'une autre origine sont hors du périmètre de l'autorisation activeTab et ne sont pas remplies.

Mode d'emploi

1. Ouvrez une page contenant un formulaire.
2. Appuyez sur Ctrl+Shift+F (Command+Shift+F sous macOS) ou cliquez sur l'icône FillHub dans la barre d'outils. Le formulaire est rempli immédiatement.
3. Appuyez sur Ctrl+Shift+U (Command+Shift+U sous macOS) pour annuler le remplissage.
4. Appuyez sur Ctrl+Shift+Y (Command+Shift+Y sous macOS) pour remplir le formulaire en mode chaos, avec des valeurs inhabituelles pour les tests de type fuzz.

Les raccourcis peuvent être modifiés sur chrome://extensions/shortcuts. Pour remplir un seul champ, faites un clic droit sur ce champ et choisissez « Remplir ce champ ».

Confidentialité

FillHub ne collecte aucune donnée et n'effectue aucune requête réseau. Les paramètres sont stockés uniquement dans votre navigateur. L'extension n'envoie rien à l'auteur ni à aucun tiers. Politique de confidentialité : https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Open source

FillHub est gratuit et open source sous licence MIT. Code source, tickets et contributions : https://github.com/kilicberkay/FillHub

Soutien

FillHub est gratuit. Si FillHub vous est utile dans votre travail, vous pouvez soutenir son développement via GitHub Sponsors : https://github.com/sponsors/kilicberkay

Utilisation responsable

FillHub est destiné aux tests et au développement. Les numéros d'identité générés peuvent satisfaire les règles publiques de clé de contrôle. N'utilisez pas les données générées pour de vraies demandes, des achats ou des vérifications d'identité.
