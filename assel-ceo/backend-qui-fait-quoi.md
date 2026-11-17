# Back-end de Ghost : qui fait quoi, où ça tourne, ce qui entre et ce qui sort

État vérifié dans le code de `main` le mardi 17/11 à 21h35 (après la fusion des PR #41 à #49). À tenir à jour par chacun : si ta brique change d'entrée, de sortie ou d'état, corrige ta ligne dans une PR.

## 1. Les 3 endroits où tourne Ghost

| Endroit | Ce qui y tourne | Qui y a accès |
|---|---|---|
| **Le Mac de démo (Assel)** | Tout le code **Python** : Recorder, détection et analyse (Holo), score, agent H | Clés dans des fichiers `.env` sur le Mac, jamais sur GitHub |
| **Supabase** (Paris, eu-west-3) | La base : c'est le **point de rencontre** de toutes les briques | Clé « service » côté serveur seulement |
| **Vercel** | Seulement le **Next.js** : les 3 sites de test et l'interface `ghost-ui` | Variables d'environnement Vercel |

**À retenir :** Vercel n'exécute aucun script Python et n'appelle pas H Company aujourd'hui. Le Python tourne sur la machine où on le lance (vendredi : le Mac d'Assel). Les briques ne s'appellent pas entre elles : chacune lit et écrit dans Supabase.

## 2. La chaîne, brique par brique

| # | Brique | Responsable | Code | Où ça tourne | Entrée | Sortie | Connexion | État |
|---|---|---|---|---|---|---|---|---|
| 1 | **Recorder** : capture, OCR, floutage | Alejandro (floutage : Omar) | `alejandro-cto/recorder/` | Mac de démo | L'écran, dans le périmètre autorisé | Événements floutés (§1) | Écrit dans **Supabase** `evenements` (sinon `journal/` en local) | ✅ Testé sur le Mac de démo le 17/11 |
| 2 | **Détection** des séquences répétées | Omar | `omar-caio/detection/detection.py`, `detection/supabase_audit.py` | Mac (script) | Les événements d'un audit, lus dans **Supabase** (ou un fichier JSON) | 5 tâches candidates | Lit **Supabase** `evenements` | ✅ PR #48. Première lecture réelle mercredi 10h30 |
| 3 | **Analyse par Holo** (modèle H) | Omar | `omar-caio/analyser_audit.py`, `detection/provider_holo.py` | Mac (script) | Les 5 candidates + prompt en 3 couches | Tâches qualifiées (§2) | Appelle **l'API H** (`api.hcompany.ai`, clé `HAI_API_KEY`), écrit dans **Supabase** `taches_detectees` | ✅ PR #48. Première écriture réelle mercredi 10h30 |
| 4 | **Score et gain** | Henriquet | `henriquet-cdo/scoring/` | Mac (script) | Notes des critères | Score /100, quadrant, h/an | Met à jour **Supabase** `taches_detectees` (option `--ecrire`) | ✅ Code et tests. Demande que la tâche existe déjà en base |
| 5 | **Agent H** : la preuve | Alejandro | `alejandro-cto/agent-h/lancer_agent.py` | Mac (script) | Une tâche de **Supabase** `taches_detectees` (sinon fichier d'exemple) + un mandat | Résultat (§4) : statut, durée, portails publiés | Appelle **l'API H** (`hai-agents`, clé `HAI_API_KEY`), vérifie sur les sites (`/api/annonces`), écrit dans **Supabase** `executions_agent` | ✅ Vrais mandats, 3 sur 3 en 99 s (0,10 $), pièges refusés 3 sur 3 (PR #42) |
| 6 | **Sites de test** A, B, C | Vladimir | `vladimir-cao/portails/` | **Vercel** | Le formulaire rempli (humain ou agent) | Une annonce publiée | Écrit dans **Supabase** `annonces_portails` ; `/api/annonces` (lecture), `/api/reset` (jeton) | ✅ En ligne |
| 7 | **Interface** : tableau de bord, rapport | Binta | `binta-cpo/app/ghost-ui/` | **Vercel** | Aujourd'hui : **fichiers d'exemple** (`data/*.json`) | Les écrans de la démo | ❌ Ne lit pas encore Supabase | 🟠 Écrans faits. **Bouton « Prouver » simulé** (minuterie) |
| 8 | **Alerte J2** | Vladimir | `vladimir-cao/n8n/` | n8n local, sur la machine de démo | Nouvelle tâche dans `taches_detectees` | E-mail au salarié | Lit **Supabase** toutes les minutes | ✅ PR #47. À installer sur le Mac de démo mercredi |

## 3. Qui branche l'API H Company ?

Celui qui a écrit le script qui l'appelle, sur la machine où il tourne :
- **Alejandro** pour l'agent (brique 5) : fait, il marche.
- **Omar** pour Holo (brique 3) : fait dans le code, à brancher sur la base.
- Une seule clé d'équipe (`HAI_API_KEY`), donnée en privé, dans le `.env` du Mac de démo. Jamais dans le code ni sur GitHub.
- **Vercel n'a pas besoin de la clé H** tant que le bouton « Prouver » ne lance pas l'agent lui-même (voir trou n°4).

## 4. Ce qu'il reste à relier avant le bout en bout (mercredi 14h)

| # | Trou | Qui | État |
|---|---|---|---|
| 1 | La détection lit Supabase | Omar (+ export d'Henriquet, PR #44) | ✅ Fait (PR #48), à tester en réel mercredi 10h30 |
| 2 | Les tâches analysées vont en base | Omar | ✅ Fait (PR #48), à tester en réel mercredi 10h30 |
| 3 | L'interface lit des fichiers d'exemple | **Binta** | ❌ À faire : `lib/data.ts` doit lire `taches_detectees` et `executions_agent` côté serveur |
| 4 | Le bouton « Prouver » est simulé | **Alejandro** + **Binta** | ❌ À faire. **Pour vendredi** : Alejandro lance `lancer_agent.py` depuis le Mac au clic, l'interface relit `executions_agent` toutes les 5 s. **Plus tard** : une route serveur Next.js appelle l'API H |
| 5 | Tout installer sur le Mac de démo | **Assel** + Vladimir (n8n) + Alejandro (clé H, RESET_TOKEN) | Mercredi matin |

**Fourchette des pièges :** alignée sur 1 500 à 6 000 €/m² (PR #42 et #45). Reste à faire lire cette valeur par l'agent dans la base de connaissances au lieu de la recopier (Alejandro, après le gel).

## 5. Le déroulé de la démo, côté back-end

1. Le Recorder tourne sur le Mac : les événements arrivent dans `evenements`.
2. Export des événements, puis détection et analyse Holo : la tâche arrive dans `taches_detectees`.
3. Score et gain : la tâche reçoit son score et ses heures par an.
4. L'interface affiche le tableau de bord et le rapport (lus dans Supabase).
5. Clic sur « Prouver » : `lancer_agent.py` lance l'agent H sur les 3 sites, vérifie et écrit dans `executions_agent`.
6. L'interface affiche le chrono réel et les annonces publiées.

Si une étape casse vendredi, on garde la base de démo gelée mercredi 18h et on reprend à l'étape suivante.
