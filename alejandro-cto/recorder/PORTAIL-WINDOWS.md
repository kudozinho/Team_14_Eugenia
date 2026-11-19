# Portail client MVP — PC Windows d’Henriquet

Le dashboard `/mon-audit` commande le Recorder grâce à un compagnon qui reste lancé sur le PC. Aucun clic ne peut démarrer un programme Windows si ce compagnon est fermé. L’enregistrement exige un consentement et un périmètre explicites. Aucune capture n’est lancée au démarrage du compagnon.

## Installation équipe (une fois)

1. Appliquer `commun/migrations/20261118_portail_audit.sql` dans Supabase. La nouvelle table est privée (RLS sans accès anon/authenticated), distincte des tests Prouver.
2. Générer un secret appareil, aléatoires, de 32 caractères minimum (`python -c "import secrets; print(secrets.token_urlsafe(32))"`, deux fois). Ne pas les committer.
3. Sur Vercel, configurer `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GHOST_CLIENT_EMAIL`, `SUPABASE_ANON_KEY` (connexion Supabase Auth, voir CONNEXION-CLIENT.md) et `GHOST_DEVICE_TOKEN` (secret réservé au compagnon). Redéployer le dashboard depuis cette branche après revue.
4. Sur le PC, conserver les dépendances/configuration Supabase et Recorder existantes. Dans `alejandro-cto/recorder/.env`, ajouter `GHOST_PORTAL_URL` (origine HTTPS du **nouveau** déploiement sans slash final), `GHOST_DEVICE_TOKEN` identique à Vercel et `GHOST_ANALYSIS_MODEL` (identifiant Holo déjà qualifié par Omar). `HAI_API_KEY` doit être renseignée dans le .env racine (ou héritée explicitement) et être disponible pour le sous-processus d’analyse. Ne pas utiliser le code client comme secret du compagnon.
5. Double-cliquer `alejandro-cto/recorder/LANCER-PORTAIL.cmd` (ou, depuis la racine, lancer `python alejandro-cto/recorder/portail.py`). Garder cette console ouverte. Un verrou local empêche deux compagnons sur ce PC.

## Utilisation client

Ouvrir `/mon-audit`, se connecter avec le code temporaire reçu par e-mail, attendre « PC Windows connecté ». Cocher Chrome, Excel ou Word. Pour Chrome, saisir uniquement les domaines autorisés, sans protocole ni chemin (portails de démo et ImmoGest). Garder Chrome dans une fenêtre dédiée en F11 : le problème de recadrage Windows reste ouvert. Cocher le consentement puis Démarrer. Arrêter et analyser déclenche l’analyse de cette session ; ses tâches apparaissent dans Mon audit. Les anciens écrans Tableau de bord/Rapport conservent leur fonctionnement existant et ne sont pas le résultat de cette nouvelle session.

Chaque démarrage crée un nouvel `audit_id`. Le périmètre ne change pas pendant une session. Le PC confirme les commandes ; l’interface ne simule pas d’enregistrement. Si le réseau échoue, le compagnon arrête la capture lors du prochain contrôle (requête de commande limitée à 5 s, contrôle toutes les 2 s entre les captures ; une capture/OCR ou un envoi Supabase déjà en cours peut retarder ce contrôle). Une reconnexion exige une nouvelle session. Limite de sécurité : deux heures par session. Analyse limitée à trois minutes ; en cas d’échec, les événements restent disponibles.

## Recette sur le PC (à effectuer avec Henriquet)

- Sans code / mauvais code : commande refusée. Sans compagnon : Démarrer indisponible.
- Chrome coché sans domaine ou consentement absent : refus.
- Démarrer : nouvel audit, état confirmé « Enregistrement en cours », événements uniquement dans cet audit et dans le périmètre autorisé.
- Arrêter : plus de captures, analyse puis tâches de ce même audit. Aucune tâche détectée doit être annoncée honnêtement.
- Couper le réseau ou fermer le compagnon : arrêt de la capture et état hors ligne/interrompu, sans reprise automatique.
- Double clic / deux onglets : un seul démarrage grâce au verrou de la fonction SQL.

Ce MVP est un portail privé pour un PC. Il ne constitue pas un système multi-clients avec comptes individuels. La connexion personnelle est décrite dans CONNEXION-CLIENT.md.
