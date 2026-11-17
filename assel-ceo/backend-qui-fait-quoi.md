# Back-end de Ghost : qui fait quoi, où ça tourne, ce qui entre et ce qui sort

État vérifié dans le code de `main` le mardi 17/11 à 17h20. À tenir à jour par chacun : si ta brique change d'entrée, de sortie ou d'état, corrige ta ligne dans une PR.

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
| 2 | **Détection** des séquences répétées | Omar | `omar-caio/detection/detection.py` | Mac (script) | Un **fichier JSON** d'événements exportés | 5 tâches candidates | Aucune : fichier en entrée | ✅ Code et tests. 🟠 Ne lit pas encore Supabase |
| 3 | **Analyse par Holo** (modèle H) | Omar | `omar-caio/analyser_audit.py`, `detection/provider_holo.py` | Mac (script) | Les 5 candidates + prompt en 3 couches | Tâches qualifiées (§2) | Appelle **l'API H** (`api.hcompany.ai`, clé `HAI_API_KEY`) | ✅ Code. 🟠 Le résultat s'affiche à l'écran, **pas écrit dans Supabase** `taches_detectees` |
| 4 | **Score et gain** | Henriquet | `henriquet-cdo/scoring/` | Mac (script) | Notes des critères | Score /100, quadrant, h/an | Met à jour **Supabase** `taches_detectees` (option `--ecrire`) | ✅ Code et tests. Demande que la tâche existe déjà en base |
| 5 | **Agent H** : la preuve | Alejandro | `alejandro-cto/agent-h/lancer_agent.py` | Mac (script) | Une tâche de **Supabase** `taches_detectees` (sinon fichier d'exemple) + un mandat | Résultat (§4) : statut, durée, portails publiés | Appelle **l'API H** (`hai-agents`, clé `HAI_API_KEY`), vérifie sur les sites (`/api/annonces`), écrit dans **Supabase** `executions_agent` | ✅ 3 sur 3 en 156 s. Pièges ajoutés |
| 6 | **Sites de test** A, B, C | Vladimir | `vladimir-cao/portails/` | **Vercel** | Le formulaire rempli (humain ou agent) | Une annonce publiée | Écrit dans **Supabase** `annonces_portails` ; `/api/annonces` (lecture), `/api/reset` (jeton) | ✅ En ligne |
| 7 | **Interface** : tableau de bord, rapport | Binta | `binta-cpo/app/ghost-ui/` | **Vercel** | Aujourd'hui : **fichiers d'exemple** (`data/*.json`) | Les écrans de la démo | ❌ Ne lit pas encore Supabase | 🟠 Écrans faits. **Bouton « Prouver » simulé** (minuterie) |
| 8 | **Alerte J2** | Vladimir | `vladimir-cao/n8n/` | n8n (cloud) | Nouvelle tâche détectée | Message au salarié | Lira Supabase | ❌ Dossier vide |

## 3. Qui branche l'API H Company ?

Celui qui a écrit le script qui l'appelle, sur la machine où il tourne :
- **Alejandro** pour l'agent (brique 5) : fait, il marche.
- **Omar** pour Holo (brique 3) : fait dans le code, à brancher sur la base.
- Une seule clé d'équipe (`HAI_API_KEY`), donnée en privé, dans le `.env` du Mac de démo. Jamais dans le code ni sur GitHub.
- **Vercel n'a pas besoin de la clé H** tant que le bouton « Prouver » ne lance pas l'agent lui-même (voir trou n°4).

## 4. Les 4 trous à boucher avant le bout en bout (mercredi 14h)

| # | Trou | Qui | Correctif | Terminé quand |
|---|---|---|---|---|
| 1 | La détection lit un fichier, pas Supabase | **Henriquet** (export) + **Omar** | Un petit script exporte les `evenements` d'un audit depuis Supabase vers le JSON que lit `analyser_audit.py` | Les sessions de mercredi 9h passent dans la détection sans copier de fichier à la main |
| 2 | Les tâches analysées ne vont pas en base | **Omar** | `analyser_audit.py --ecrire` insère les tâches (§2) dans `taches_detectees` | La tâche « recopier sur 3 sites » est dans `taches_detectees`, Henriquet peut la noter, Alejandro peut la lancer |
| 3 | L'interface lit des fichiers d'exemple | **Binta** | `lib/data.ts` lit `taches_detectees` et `executions_agent` dans Supabase (même forme que les fichiers, voir `commun/contrats.md`) | Le rapport affiche la vraie tâche, son score et le vrai chrono |
| 4 | Le bouton « Prouver » est simulé | **Alejandro** + **Binta** | **Pour vendredi** : Alejandro lance `lancer_agent.py` depuis le Mac au clic, et l'interface affiche le résultat dès qu'il arrive dans `executions_agent` (bouton « Actualiser »). **Plus tard** : une route serveur Next.js appelle l'API H, avec la clé dans les variables Vercel | Au clic, l'agent tourne et le chrono réel s'affiche |

**À aligner :** la fourchette de prix au m² des pièges. Agent (Alejandro) : 2 000 à 7 000 €/m². Données (Henriquet) : 1 500 à 6 000 €/m². Une seule source : les données d'Henriquet. Les deux attrapent le mandat piégé M-T02 (484 €/m²).

## 5. Le déroulé de la démo, côté back-end

1. Le Recorder tourne sur le Mac : les événements arrivent dans `evenements`.
2. Export des événements, puis détection et analyse Holo : la tâche arrive dans `taches_detectees`.
3. Score et gain : la tâche reçoit son score et ses heures par an.
4. L'interface affiche le tableau de bord et le rapport (lus dans Supabase).
5. Clic sur « Prouver » : `lancer_agent.py` lance l'agent H sur les 3 sites, vérifie et écrit dans `executions_agent`.
6. L'interface affiche le chrono réel et les annonces publiées.

Si une étape casse vendredi, on garde la base de démo gelée mercredi 18h et on reprend à l'étape suivante.
