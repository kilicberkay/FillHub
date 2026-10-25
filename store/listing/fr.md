# Chrome Web Store listing: FillHub (Français)

**Name:** FillHub

**Summary (132 characters max):**
Remplit les formulaires web avec des données fictives réalistes et cohérentes en 15 langues. Mode sûr, annulation, sans collecte.

## Description

FillHub remplit les formulaires web avec des données fictives réalistes et cohérentes, afin que les développeurs et les testeurs puissent tester les flux d'inscription, de paiement et de saisie de données sans saisir les valeurs à la main ni utiliser les informations de vraies personnes.

Points forts

- 15 langues et 15 profils de pays. Les noms, adresses, numéros de téléphone, noms d'entreprise et numéros d'identité suivent le format de chaque pays.
- Des personnes cohérentes. Un remplissage crée une seule personne : le prénom, le nom, l'e-mail, le champ « répéter l'e-mail », le nom d'utilisateur et le numéro de téléphone concordent.
- Détection intelligente des champs. Les libellés, les noms, les indications de saisie automatique et les types de champs sont combinés ; un champ libellé « Cep telefonu » ou « Soyadınız » reçoit donc la bonne valeur.
- Mode PII Safe (activé par défaut). Les identifiants personnels utilisent des valeurs de test évidentes : adresses e-mail en example.com, numéros de téléphone factices et numéros d'identité de test qui ne sont jamais destinés à un usage réel.
- Profils d'identité. Utilisez une personne aléatoire différente à chaque remplissage, ou gardez une personne fixe. Un profil peut fixer le prénom, le nom, l'e-mail, le téléphone et le mot de passe, afin de contenir un compte de test fixe.
- Règles personnalisées. Associez un sélecteur CSS à un type de données lorsque la détection intégrée rate un champ. Les règles se modifient sur la page des paramètres.
- Les cases de consentement (conditions, confidentialité, KVKK) sont cochées ; les cases marketing restent décochées.
- Les champs texte reçoivent des phrases d'exemple dans la langue du pays, coupées à la longueur maximale du champ.
- Les champs de fichier reçoivent un petit fichier généré qui correspond au type accepté.
- L'envoi automatique facultatif (désactivé par défaut) clique sur le vrai bouton d'envoi du formulaire rempli. Les boutons destructifs comme Annuler ou Supprimer ne sont jamais cliqués, et des sites peuvent être exclus.
- Les captchas ne sont jamais cliqués ni résolus. Un captcha visible est encadré, vous le complétez vous-même, et le formulaire n'est pas envoyé automatiquement.
- Mode chaos pour les tests de type fuzz avec des valeurs inhabituelles.
- Annulation : rétablit le formulaire dans l'état qu'il avait avant le dernier remplissage.
- Sauvegarde des paramètres dans un fichier JSON local, et un rapport de diagnostic qui ne contient que des compteurs.
- Fonctionne dans les iframes de même origine, lit les libellés dans la langue de la page et garde les valeurs synchronisées avec les frameworks JavaScript. Les iframes d'une autre origine sont hors de l'autorisation activeTab et restent intactes.

Mode d'emploi

1. Ouvrez une page contenant un formulaire.
2. Appuyez sur Ctrl+Shift+F (Command+Shift+F sous macOS) ou cliquez sur l'icône FillHub dans la barre d'outils. Le formulaire se remplit immédiatement.
3. Appuyez sur Ctrl+Shift+U pour annuler.
4. Appuyez sur Ctrl+Shift+Y pour le mode chaos (valeurs inhabituelles pour les tests de type fuzz).

Les raccourcis peuvent être modifiés sur chrome://extensions/shortcuts. Faites un clic droit sur un champ et choisissez « Remplir ce champ » pour ne remplir que ce champ.

Confidentialité

FillHub ne collecte aucune donnée. Les paramètres restent dans votre navigateur. L'extension n'envoie rien à l'auteur ni à un tiers. Consultez la politique de confidentialité : https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Open source

FillHub est gratuit et open source sous licence MIT. Code source, tickets et contributions : https://github.com/kilicberkay/FillHub

Soutien

FillHub est gratuit. Si l'outil vous aide dans votre travail, vous pouvez soutenir son développement via GitHub Sponsors : https://github.com/sponsors/kilicberkay

Utilisation responsable

FillHub est destiné aux tests et au développement. Les numéros d'identité générés peuvent passer les règles de somme de contrôle publiques ; n'utilisez donc pas les données générées pour de vraies candidatures, des achats ou des déclarations d'identité.
