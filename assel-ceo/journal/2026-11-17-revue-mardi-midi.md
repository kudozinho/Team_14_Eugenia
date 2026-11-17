# Revue du dépôt : mardi 17/11, 13h

Branches relues : `main` et les 6 branches personnelles. Une seule pull request est ouverte (#1, Binta).

## En une phrase
Binta, Vladimir et Henriquet ont bien avancé. Le chemin critique (Recorder → filtres → détection → agent H), lui, n'a encore **aucun code poussé**. Alejandro et Omar n'ont rien sur leur branche.

## État par personne

| Personne | Poussé | Vérifié | Retard par rapport au plan |
|---|---|---|---|
| **Alejandro** (CTO) | Rien (branche identique à `main`) | - | **Critique.** Prévu mardi : Recorder v1 + premier appel à l'agent H avant midi. |
| **Omar** (CAIO) | Rien | - | À surveiller. `nettoyer()` doit être livré à Alejandro à 18h. |
| **Vladimir** (CAO) | 3 sites de test A, B, C en Next.js (formulaires différents, menu déroulant, 2 étapes, case à cocher, photo), page « Annonces publiées », remise à zéro entre essais, script de vérification | **Compile, et les 3 dépôts réussissent en local** (photo comprise) | En avance sur le code. Reste : **déploiement Vercel** et envoi des 3 adresses à Alejandro. |
| **Henriquet** (CDO) | Base Supabase créée (Paris), données de départ (profils, agence, 3 postes, 3 utilisateurs, autorisations, audit de démo, exemples), purge des exemples, test de connexion | Code relu ; base non testée faute de clé | Pas encore : 10 mandats, 20 prospects, base de connaissances immobilier dans le profil. Sa branche n'est pas fusionnée : **personne ne voit son README de branchement sur `main`**. |
| **Binta** (CPO) | Organigramme (Markdown + image), maquette des 7 écrans de démo, 22 questions du formulaire, fiche opportunité en JSON (PR #1) | Relu, conforme aux contrats | En avance. Reste : créer le Google Forms et envoyer le lien à Vladimir avant 16h. |
| **Assel** (CEO) | Rien dans `assel-ceo/` jusqu'à cette revue | - | Journal de décisions à démarrer. |
| `main` | Structure, `commun/` (contrats, schéma v2, données factices, roadmap), README, et à 12h08 `taches-semaine-agence.json` | - | - |

## Corrigé pendant la revue (déjà poussé sur chaque branche, faites `git pull`)

| Où | Problème | Correction |
|---|---|---|
| `vladimir/cao` | Le site C s'intitulait « Portail C - Publier **une annonce** ». Le contrat, les événements d'exemple et la fiche du kit attendent « Publier **un bien** ». Or la détection regroupe les écrans par titre de fenêtre. | Titre, en-tête et README alignés sur « Publier un bien ». |
| `vladimir/cao` | Le README disait de pousser la branche `vladimir/portails`, qui n'existe pas. | Remplacé par `vladimir/cao`. |
| `henriquet/cdo` | La clé Supabase s'appelait `SUPABASE_SERVICE_KEY` chez Henriquet et `SUPABASE_SERVICE_ROLE_KEY` chez Vladimir : deux noms pour la même clé. | Nom unique `SUPABASE_SERVICE_ROLE_KEY` (l'ancien nom reste accepté par le script). |
| `henriquet/cdo` | Les sites autorisés en base sont `portail-a.example`… alors que les vrais domaines seront sur Vercel. | Ajout d'une note dans le README : à mettre à jour après le déploiement. |
| `binta/cpo` | Règle « une tâche n'apparaît qu'à partir de 3 participants » : la tâche de démo, faite par l'assistante seule, aurait disparu du tableau de bord. L'erreur venait de la roadmap (03 et 05). | Nouvelle règle : la tâche s'affiche toujours ; sous 3 personnes, aucune répartition par personne. Corrigé aussi dans `commun/roadmap/03` et `05` (cette branche). |
| `binta/cpo` | La maquette autorisait `suivi.belvedere.example`, la base `immogest.example`. | Aligné sur `immogest.example`. |

## À trancher (non corrigé : c'est une décision, pas une faute)

1. **`commun/donnees/taches-semaine-agence.json` contredit le reste du projet.** Il décrit une agence de **4 personnes** (README, contexte et base : 10), affiche **258 h/an** (README et maquette : 205 h) et **ne contient pas la tâche de démo**. Sa tâche t01 dit même que la multidiffusion est « déjà faite par la passerelle ». Les calculs du fichier sont justes.
   Son intérêt : ses tâches pour l'agent H (extranets des syndics, Géorisques, statistiques des espaces pro des portails) sont plus crédibles que notre cas de démo.
   **Recommandation** : garder la démo telle quelle, ajouter la tâche « recopier sur 3 sites sans passerelle » dans ce fichier, choisir un seul effectif (10, déjà en base) et un seul chiffre de gain pour toutes les slides.
2. **Excel ou Google Sheets ?** Le contexte et les postes disent Google Sheets ; la base et les événements d'exemple disent Microsoft Excel. À choisir avant les sessions jouées de mercredi.
3. **Événements « hors périmètre » sans durée** (`duree_s` vide dans les exemples), alors que le contrat §1 bis dit que la durée sert justement à garder des temps justes. À remplir quand le Recorder produira de vrais événements.
4. **`organigramme.png`** porte encore l'ancienne règle des 3 participants : Binta doit régénérer l'image.
5. **Fusionner dans `main`** la PR #1 (Binta) et la branche d'Henriquet, pour que tout le monde ait le README de connexion à la base.

## Reste à faire aujourd'hui (mardi)

| Heure | Quoi | Qui |
|---|---|---|
| **Maintenant** | Premier appel à l'agent H (`h/web-surfer-flash`) pour valider la clé et mesurer une session. Pousser le squelette du Recorder, même incomplet. | Alejandro |
| 14h | Déployer les 3 sites sur Vercel, accès public, envoyer les adresses | Vladimir |
| 14h | Décision sur les points 1 et 2 ci-dessus, notée dans le journal | Assel |
| 15h | 10 mandats et 20 prospects fictifs ; domaines Vercel dans `sites_autorises` | Henriquet |
| 16h | Lien du Google Forms à Vladimir ; image de l'organigramme régénérée | Binta |
| 18h | `nettoyer()` livré au Recorder (« Appelez M. Dupont au 06 12 34 56 78 » → « Appelez [NOM] au [TELEPHONE] ») | Omar + Alejandro |
| 18h30 | Test du soir : chaque brique passe son critère seule, et l'agent H a rempli au moins 1 site | Tous |

Si Alejandro n'a pas d'agent H qui tourne à 16h, Vladimir prend le premier essai sur le site A pendant qu'Alejandro finit le Recorder.
