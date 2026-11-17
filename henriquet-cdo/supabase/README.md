# Base Supabase de Ghost (chantier D, Henriquet)

**Projet :** `ghost-team14` · région Paris (eu-west-3) · URL `https://bvxmnrvqehemqsjiasdr.supabase.co`

## État au mardi matin

| Table | Lignes | Contenu |
|---|---|---|
| `profils_metier` | 3 | immobilier, comptable, avocat (`commun/donnees/profils-metier.json`) |
| `organisations` | 1 | `org_belvedere`, Agence Belvédère (fictive) |
| `contextes_entreprise` | 1 | contexte §7 de l'agence |
| `postes` | 4 | gérante, négociateur, assistante (§8), gestionnaire locatif |
| `utilisateurs` | 10 | désignés par leur poste, jamais par un vrai nom (1 gérante, 6 négociateurs, 2 assistantes, 1 gestionnaire locatif) |
| `applis_autorisees`, `sites_autorises` | 1 + 5 | ce que l'assistante autorise (Chrome ; immogest, les 3 portails et `docs.google.com` pour le suivi Google Sheets). **À mettre à jour dès que Vladimir a déployé** : les domaines réels seront `ghost-portail-a.vercel.app`, etc., pas `portail-a.example`. |
| `audits` | 1 | `aud_demo` |
| `mandats` | 10 | ajouté le 17/11 après-midi : biens de l'agence, dont 3 de démo (voir `henriquet-cdo/donnees/`) |
| `stats_portails` | 60 | ajouté le 17/11 : vues et contacts par bien et par portail. Piste « rapport aux vendeurs » annulée pour la démo, gardée comme matière à confirmer pendant l'audit |
| `evenements`, `taches_detectees`, `tests_agent` | 17, 2, 5 | **exemples du kit**, à purger mercredi matin |

Les autres tables (`transcriptions`, `prompts_systeme`, `executions_agent`, `rapports`, `annonces_portails`) sont vides et prêtes.

**Décision du 17/11** : tableur = Google Sheets. Si la base contient déjà la ligne `app_assist_2` (Microsoft Excel), la supprimer : `delete from applis_autorisees where id = 'app_assist_2';`. Après la fusion de la PR #2, relancer `generer_seed.py` pour récupérer les événements d'exemple mis à jour.

## Fichiers

| Fichier | Rôle |
|---|---|
| `commun/schema-supabase.sql` | Les tables (version 2, ajouts du 04 **déjà inclus** : ne pas rejouer le bloc « Ajouts » du 04) |
| `generer_seed.py` | Régénère `seed_mardi.sql` depuis `commun/donnees/` |
| `seed_mardi.sql` | Données de départ, relançable sans doublon |
| `purger_exemples.sql` | Mercredi matin, avant les sessions jouées : retire les exemples du kit |
| `test_connexion.py` | Chacun le lance une fois : 1 lecture et 1 écriture |

## Pour se brancher (chaque membre)

1. Demander la clé `service_role` à Henriquet **en message privé**.
2. La mettre dans `.env` à la racine du dépôt (le `.gitignore` l'exclut déjà) :
   ```
   SUPABASE_URL=https://bvxmnrvqehemqsjiasdr.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. `pip install supabase python-dotenv` puis `python henriquet-cdo/supabase/test_connexion.py`.

## Sécurité

- La sécurité par ligne est activée sur toutes les tables, **sans règle d'accès** : la clé publique (anon) ne voit rien. Seule la clé `service_role` lit et écrit, et elle ne sert que **côté serveur** (Recorder, scripts, n8n, routes serveur de Next.js).
- Jamais de clé `service_role` dans le code du navigateur, sur GitHub ou dans un message de groupe.
- Pour Binta : l'interface Next.js lit la base depuis des routes serveur (`app/api/...`), pas depuis le navigateur. Si une lecture côté navigateur devient nécessaire (temps réel du tableau de bord), on ajoute une règle de lecture ciblée, à demander à Henriquet.
