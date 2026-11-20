# Accès, comptes connectés et connecteurs

Ce que la personne coche sur l'écran d'accueil du portail est enregistré (`sessions_audit.outils_autorises`, `consentements`) et **appliqué** par les agents : un agent n'utilise un outil que s'il est coché.

| Case | Ce que ça autorise | Où se configure l'accès |
|---|---|---|
| Espace RH, messagerie, wiki | Les agents H travaillent dans l'intranet d'Atelier Nova | Rien à configurer |
| Navigateur et comptes connectés | Les navigateurs des agents sont liés au coffre-fort H : ils se connectent seuls aux comptes enregistrés | Page « Comptes connectés » du site |
| Notion | Lire la page Notion partagée et y créer la page d'onboarding | Variables du service des agents |
| Slack | Publier le message de bienvenue | Variables du service des agents |
| Gmail | Envoyer l'e-mail de bienvenue | Variables du service des agents |

L'écran d'accueil coche d'office les accès **configurés** (route `/connecteurs` du service, qui répond seulement oui ou non) ; la personne peut décocher. Un accès non configuré est grisé : « non configuré ».

## Variables du service des agents (Render, onglet Environment ; jamais dans le dépôt)
- Slack : `SLACK_BOT_TOKEN`, `SLACK_CHANNEL`.
- Gmail : `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`, `NEW_HIRE_EMAIL`.
- Notion : `NOTION_TOKEN`, `NOTION_PARENT_PAGE_ID` (un identifiant **ou le lien** de la page ; la page doit être partagée avec l'intégration).
- Coffre-fort H : `H_VAULT_ID` (facultatif : sinon le coffre « ghost-comptes » est créé au premier compte enregistré).

## Comptes connectés
Page `/connexions` : plateforme, adresse de connexion, identifiant, mot de passe, clé secrète du code à usage unique (facultatif). Les valeurs partent du navigateur vers le service, puis vers le coffre-fort hébergé par H ; elles ne sont ni stockées par Ghost ni relues. Chaque personne ne voit que ses comptes.

## Ce qui est testé, ce qui ne l'est pas
- Testé : création, lecture des métadonnées et suppression d'un élément du coffre-fort ; logique « seul ce qui est coché est utilisé » ; lecture d'un lien Notion.
- **Non testé** : une vraie connexion automatique sur un site, Slack, Gmail, la lecture réelle d'une page Notion, le rattachement du coffre-fort à une session d'agent.
