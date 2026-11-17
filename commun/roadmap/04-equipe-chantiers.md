# Ghost : roadmap, partie 4 : répartition du travail entre les 6 (point 11)

Ce document **complète** le kit, il ne le remplace pas. Les fiches `<prénom-rôle>/FICHE.md` restent valables. Ici : ce qui change, ce qui s'ajoute, et la vue d'ensemble.

**La règle ne change pas** : personne n'attend personne. Tant que la brique d'avant n'est pas prête, on travaille avec les données factices.

## Ce qui change par rapport au kit
| Sujet | Avant | Maintenant |
|---|---|---|
| Cas de démo | « Publier la même annonce sur 3 portails » | « Recopier l'annonce sur 3 **sites sans passerelle** ». Les données ne changent pas, seul le récit change. |
| Extension Chrome, Windows | Dans le périmètre | **Coupés.** L'adresse de l'onglet se lit depuis l'application Mac. |
| Autorisation de Chrome | Par application | **Par site** (liste blanche de domaines). |
| Mode vocal | Omar seul | Omar écrit les prompts, **Binta** fait l'écran. Version courte. |
| Scoring | Non attribué | **Henriquet** (c'est un calcul), formule en `07`. |
| Formulaire avant audit | Absent | Questions : **Binta**. Branchement n8n : **Vladimir**. Prompt 3 couches : **Omar**. |
| Plan de tests de l'agent H | Absent | Pilote : **Alejandro**. Séries de tests : **Vladimir**. Rapport : **Assel**. |
| Base de connaissances immobilier | Absente | **Henriquet** la charge depuis `07`. |
| Test de bout en bout n°1 | Mercredi 17h | Mercredi **17h30**, après l'envoi du CP2. |

---

## 1. Contrats d'interface ajoutés (suite de `commun/contrats.md`)

Les §1 à §6 du kit restent inchangés, sauf deux ajouts au §1.

### §1 bis. Événement : 2 ajouts
- Nouveau `type` : `hors_perimetre`. Fenêtre non autorisée au premier plan. Tous les champs de contenu sont `null`. Sert seulement à garder des durées justes.
- Nouveau champ `duree_s` : temps passé sur l'écran avant l'événement suivant.

```json
{ "id": "evt_0042", "audit_id": "aud_demo", "utilisateur_id": "usr_assistante",
  "horodatage": "2026-11-18T09:12:40+01:00", "appli": null, "titre_fenetre": null, "url": null,
  "type": "hors_perimetre", "texte_nettoye": null, "miniature_url": null, "empreinte": null, "duree_s": 95 }
```

### §7. Contexte d'entreprise (sorti du formulaire)
Produit par : n8n (Vladimir). Stocké dans : `contextes_entreprise`. Lu par : assemblage du prompt (Omar).
```json
{
  "organisation_id": "org_belvedere",
  "profil_metier_id": "immobilier",
  "resume": {
    "activite": "Transaction et gestion locative, Massy et environs",
    "effectif": 10,
    "decideurs": {"achats_logiciels": "gérante", "publication_annonces": "assistantes", "prix_et_mandats": "négociateurs"},
    "outils": ["ImmoGest", "Google Chrome", "Google Sheets", "Messagerie", "Agenda"],
    "process_principaux": ["Prise de mandat", "Publication des annonces", "Visites", "Relances", "Compromis"],
    "irritants": ["Ressaisie des annonces sur 3 sites", "Relances oubliées après visite"],
    "objectifs": ["Libérer 1 jour par semaine aux assistantes"],
    "contraintes": ["Ne jamais stocker les coordonnées des prospects", "Pas d'envoi automatique d'e-mail sans validation"]
  }
}
```

### §8. Poste
```json
{
  "id": "poste_assistante", "organisation_id": "org_belvedere", "intitule": "Assistante commerciale",
  "missions": ["Publier et mettre à jour les annonces", "Préparer les dossiers de mandat", "Accueil téléphonique"],
  "outils": ["ImmoGest", "Google Chrome", "Google Sheets"],
  "peut_decider": ["Mise en ligne d'une annonce validée"],
  "ne_peut_pas": ["Modifier un prix", "Signer un mandat"]
}
```

### §9. Prompt système assemblé
Produit par : fonction `assembler_prompt(profil, contexte, poste)` (Omar). Stocké dans : `prompts_systeme`.
```json
{ "id": "prm_001", "organisation_id": "org_belvedere", "poste_id": "poste_assistante",
  "version": 1, "empreinte": "a41f09", "contenu": "(texte des 3 couches, voir 07)" }
```
`empreinte` = empreinte du texte. Elle est recopiée dans chaque tâche détectée : on sait toujours quel prompt a produit quel résultat.

### §10. Score (ajouté à la tâche détectée, champ `score`)
```json
{ "gain": 3, "facilite": 4, "effort": 2, "risque": 2, "confiance": 4,
  "total": 73, "heures_an": 49, "quadrant": "gain_rapide",
  "hypotheses": ["2 assistantes", "300 opérations par an et par personne", "10 min gagnées", "adoption 70 %", "part récupérée 70 %"] }
```
`quadrant` : `gain_rapide`, `projet`, `a_regrouper`, `a_ecarter`.

### §11. Fiche opportunité (champ `fiche` de la tâche détectée)
Modèle complet en `07`. Clés de premier niveau : `metier` et `technique`.

### §12. Résultat d'un test de l'agent (table `tests_agent`)
Produit par : script de test (Alejandro, Vladimir). Lu par : rapport de retours (Assel).
```json
{ "id": "tst_0031", "niveau": 3, "cas": "3 sites, champs différents", "modele": "holo4-35b-a3b",
  "essai": 4, "statut": "completed", "reussi": true, "duree_s": 102, "etapes": 37,
  "cout_usd": 0.11, "erreur": null, "contournement": null, "session_id": "(renvoyé par H)" }
```
`reussi` est vérifié **par notre code** (les 3 annonces existent dans `annonces_portails` avec les bons champs), pas par la réponse de l'agent.

### Ajouts au schéma Supabase (Henriquet, mardi matin)
```sql
alter table evenements add column duree_s int;
alter table evenements drop constraint evenements_type_check;
alter table evenements add constraint evenements_type_check
  check (type in ('changement_appli','changement_fenetre','changement_ecran','hors_perimetre'));

create table contextes_entreprise (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  reponses jsonb not null, resume jsonb, cree_le timestamptz default now());

create table postes (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  intitule text not null, missions jsonb, outils jsonb, peut_decider jsonb, ne_peut_pas jsonb);

alter table utilisateurs add column poste_id text references postes(id);

create table sites_autorises (
  id text primary key default gen_random_uuid()::text,
  utilisateur_id text references utilisateurs(id) on delete cascade,
  domaine text not null);

create table prompts_systeme (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  poste_id text references postes(id), version int default 1,
  empreinte text not null, contenu text not null, cree_le timestamptz default now());

alter table taches_detectees add column score jsonb, add column fiche jsonb, add column prompt_empreinte text;

create table tests_agent (
  id text primary key default gen_random_uuid()::text,
  niveau int, cas text, modele text, essai int, statut text, reussi boolean,
  duree_s int, etapes int, cout_usd numeric, erreur text, contournement text,
  session_id text, cree_le timestamptz default now());

alter table contextes_entreprise enable row level security;
alter table postes enable row level security;
alter table sites_autorises enable row level security;
alter table prompts_systeme enable row level security;
alter table tests_agent enable row level security;
```
Le nom de la contrainte (`evenements_type_check`) est le nom par défaut de Postgres : vérifiez-le dans l'éditeur avant d'exécuter.

### Données factices à ajouter dans `commun/donnees/`
| Fichier | Contenu | Qui le crée | Pour qui |
|---|---|---|---|
| `contexte-entreprise-exemple.json` | Le §7 ci-dessus | Henriquet, mardi 10h | Omar, Vladimir |
| `postes-exemple.json` | 3 postes : gérante, négociateur, assistante | Henriquet, mardi 10h | Omar |
| `fiche-opportunite-exemple.json` | La fiche remplie de `07` | Binta, mardi 12h | Omar, Henriquet |
| `tests-agent-exemple.json` | 5 lignes au format §12 | Alejandro, mardi 14h | Vladimir, Assel |

---

## 2. Les 6 chantiers

| Chantier | Responsable | En une phrase | Dépend de (remplacé par le factice) |
|---|---|---|---|
| **A. Voir et agir** | Alejandro | Le Recorder capte, l'agent H exécute, la démo tourne | Tâche détectée d'exemple |
| **B. Comprendre** | Omar | Filtres, détection, prompts 3 couches, prompts du mode vocal | Événements d'exemple, contexte d'exemple |
| **C. Terrain et automatisations** | Vladimir | 3 sites de test, n8n, formulaire, séries de tests de l'agent | Tâche détectée d'exemple |
| **D. Données et mesure** | Henriquet | Base, profils, base immobilier, agence fictive, sessions jouées, scoring et gain | Rien : il démarre en premier |
| **E. Ce qu'on voit** | Binta | Parcours, interface, rapport et fiche, questions du formulaire, deck | Fichiers d'exemple |
| **F. Pilotage et preuve business** | Assel | Planning, prix, conformité, rapport de retours H, pitch et questions | Rien |

---

## 3. Fiche par personne

**Contexte commun à coller en tête de chaque prompt**
> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (Eugenia × H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, détecte les tâches répétitives, les note, fait exécuter l'une d'elles par l'agent de H Company pour chronométrer le gain, et livre un plan d'automatisation. Règle de choix de l'outil : API disponible → n8n ; pas d'API → agent H ; déjà couvert par le logiciel du client → rien à construire. Démo : agence immobilière fictive, une assistante recopie chaque annonce sur 3 sites de test sans passerelle. Stack : Python (application Mac), Supabase, Next.js sur Vercel, n8n, Agent API de H Company (`hai-agents`), Claude (Haiku 5.5 et Sonnet 5.5), modèles Hugging Face en local. Coupé cette semaine : extension Chrome, Windows, paiement. Je te joins `commun/contrats.md`, `commun/schema-supabase.sql` et `commun/roadmap/04-equipe-chantiers.md` : respecte ces formats à la lettre.

### Alejandro (CTO) : chantier A
| | |
|---|---|
| **Reçoit** | Schéma (Henriquet, mardi midi) · fonction `nettoyer()` (Omar, mardi soir) · adresses des 3 sites (Vladimir, mardi soir) · tâches détectées (Omar, mercredi 16h) |
| **Livre** | Événements §1 en base (à Omar, Binta) · résultats §4 (à Binta) · script de test §12 (à Vladimir) · démo live |
| **Mardi** | Dépôt GitHub. Recorder : application au premier plan, capture d'une fenêtre autorisée, événement `hors_perimetre` sinon. Lecture de l'adresse de l'onglet et liste blanche de sites. Icône et pause. **Avant midi : un premier appel à `h/web-surfer-flash`** pour valider la clé et mesurer une session. |
| **Mercredi** | 11h branchement Recorder → base. Agent sur 1 site, puis 3. Réponse structurée. Durée mesurée par le code. 16h branchement détection → agent. Schéma d'architecture pour le CP2. |
| **Jeudi** | Corrections. Script de test (niveau, modèle, 10 essais, écriture en §12). 11h interface. 14h test n°2. 15h vidéo de secours. README. |
| **Vendredi** | Machine de présentation testée à 9h. Code figé à 11h. |
| **Terminé quand** | Mardi : je change de fenêtre, un événement arrive en base ; une fenêtre non cochée ne produit qu'un `hors_perimetre`. Mercredi : l'agent crée 3 annonces en base. Jeudi : 3 passages de suite sans intervention. |
| **CP2** | Schéma d'architecture, 20 secondes d'agent en action pour le Loom |
| **CP4** | Slide architecture, démo live, vidéo de secours |
| **En avance** | Sous-agents (1 par site), puis test sur logiciel de bureau en local |
| **Bloqué** | Capture par fenêtre : passer au plan B du kit (écran entier, seulement si l'application est autorisée). Agent : revenir à l'agent prêt à l'emploi avec une consigne en texte. |

> [Contexte commun]. Je suis le CTO. Aide-moi à construire en Python sur macOS : 1) « Ghost Recorder » : application de barre des menus (`rumps`) qui suit l'application au premier plan, ne capture que les fenêtres des applications cochées, lit l'adresse de l'onglet actif de Chrome et ne capture que les domaines autorisés, produit un événement `hors_perimetre` sans aucun contenu sinon, capture sur événement, jette les doublons par empreinte d'image, lit le texte en local, appelle `nettoyer(texte, profil)` puis écrit l'événement au format §1 dans Supabase ; 2) un script qui lance un agent H sur une tâche détectée (navigateur hébergé, réponse structurée, limites d'étapes et de temps), mesure la durée et écrit le résultat au format §4 ; 3) un script de série de tests qui écrit au format §12 et vérifie la réussite en lisant la table `annonces_portails`. Donne l'arborescence, le code étape par étape, les permissions macOS, et un plan B si la capture par fenêtre bloque. Vérifie les noms exacts des paramètres dans la documentation actuelle de `hai-agents` avant d'écrire le code.

### Omar (CAIO) : chantier B
| | |
|---|---|
| **Reçoit** | Profils (déjà dans le kit) · contexte et postes d'exemple (Henriquet, mardi 10h) · vrais événements (mercredi 11h) |
| **Livre** | `nettoyer()` (à Alejandro, mardi soir) · tâches §2 avec `prompt_empreinte` (à Alejandro, Henriquet, Vladimir, Binta) · `assembler_prompt()` et prompts §9 · prompts du mode vocal (à Binta) |
| **Mardi** | Filtres : motifs du profil + reconnaissance de noms. Jeu de 20 phrases pièges (nom composé, numéro avec points, montant sans symbole). `assembler_prompt()` sur les données d'exemple. |
| **Mercredi** | Étage code : actions, séquences répétées au moins 3 fois, durées (avec `duree_s`). Étage LLM : 5 candidates, sortie JSON stricte. 14h et 16h : branchements. Prompts du mode vocal (reformulation, puis solutions). |
| **Jeudi** | 10h branchement n8n. Fiabilité : 5 relances sur 10 cas, taux d'accord. Comparaison de 2 modèles (Haiku, Sonnet) sur ces 10 cas : précision, coût, durée. Slide « limites ». |
| **Vendredi** | Aucune modification de prompt après 11h. |
| **Terminé quand** | Mardi : « Appelez M. Dupont au 06 12 34 56 78 » → « Appelez [NOM] au [TELEPHONE] », et 18 phrases pièges sur 20. Mercredi : la tâche d'exemple ressort du fichier d'exemple. Jeudi : même tâche et même méthode sur au moins 9 relances sur 10. |
| **CP2** | Un exemple avant/après floutage, une tâche détectée réelle |
| **CP4** | Tableau de comparaison des modèles, taux de reproductibilité |
| **En avance** | Décrire les écrans avec un petit Holo3.1 en local, pour le rapport de retours |
| **Bloqué** | Reconnaissance de noms trop lente : garder les motifs seuls et une liste de prénoms. Détection : comparer seulement appli + titre de fenêtre. |

> [Contexte commun]. Je suis le CAIO. Aide-moi à construire en Python : 1) `nettoyer(texte, profil)` : motifs du profil métier puis reconnaissance de noms en français, en local, avec un jeu de 20 phrases pièges ; 2) l'étage de détection sans IA : transformer les événements en actions, trouver les séquences répétées au moins 3 fois, mesurer leur durée, ignorer les événements `hors_perimetre` ; 3) `assembler_prompt(profil, contexte, poste)` qui empile 3 couches (métier, entreprise, poste) et renvoie le texte et son empreinte ; 4) le prompt d'analyse qui reçoit 5 candidates et renvoie le JSON §2 ; 5) les 2 prompts du mode vocal (reformulation à valider, puis solutions). Lots de moins de 100 000 tokens. Mesure la reproductibilité : 5 relances sur 10 cas. Sur `evenements-exemple.json`, la détection doit sortir la tâche de `tache-detectee-exemple.json`.

### Vladimir (CAO) : chantier C
| | |
|---|---|
| **Reçoit** | Table `annonces_portails` (Henriquet, mardi midi) · questions du formulaire (Binta, mardi 16h) · script de test (Alejandro, jeudi 9h) |
| **Livre** | 3 adresses de sites (à Alejandro, mardi soir) · workflows n8n · contexte §7 en base (à Omar) · lignes §12 (à Assel) |
| **Mardi** | 3 sites de difficulté croissante. A : formulaire simple. B : autres noms de champs, menu déroulant. C : 2 étapes, case à cocher, envoi d'une photo. Page « Annonces publiées » sur chacun. Déploiement public. |
| **Mercredi** | n8n : `formulaire_vers_contexte` (réponse au formulaire → table → appel de l'assemblage). `alerte_j2`. `synchro_annonces_sheets`. Aide à l'agent à 16h. |
| **Jeudi** | 10h branchement détection → n8n. 9h-13h : **séries de tests** de l'agent, niveaux 1 à 4, 10 essais chacun. Chronométrage main / agent / n8n. Export des workflows. |
| **Vendredi** | Sites gelés. Vérifier à 9h qu'ils répondent. |
| **Terminé quand** | Mardi : une annonce saisie à la main sur chaque site apparaît en base. Mercredi : une réponse au formulaire crée un contexte §7. Jeudi : 40 lignes dans `tests_agent`. |
| **CP2** | Adresses des 3 sites, capture du workflow |
| **CP4** | Chiffres main / agent / n8n, taux de réussite par niveau |
| **En avance** | Site D « piège » (fenêtre de cookies, champ obligatoire caché) pour le niveau 5 |
| **Bloqué** | Formulaire : un simple tableur Google rempli à la main fait l'affaire. Envoi de photo : le retirer du site C et le noter comme limite. |

> [Contexte commun]. Je suis le CAO. Aide-moi à : 1) créer 3 sites de test d'annonces en Next.js sur Vercel, de difficulté croissante (formulaire simple ; autres noms de champs et menu déroulant ; 2 étapes avec case à cocher et envoi de photo), qui écrivent dans `annonces_portails`, avec une page « Annonces publiées » ; 2) construire dans n8n : `formulaire_vers_contexte` (une réponse Google Forms devient un contexte au format §7 dans Supabase), `alerte_j2` (message au salarié quand une tâche est détectée) et `synchro_annonces_sheets` ; 3) lancer des séries de 10 essais de l'agent H par niveau avec le script d'Alejandro et lire les résultats au format §12. Donne le code, les JSON des workflows et la façon de vérifier chaque brique.

### Henriquet (CDO) : chantier D
| | |
|---|---|
| **Reçoit** | Rien pour démarrer · durées de l'agent (Alejandro, jeudi) · tâches détectées (Omar, mercredi) |
| **Livre** | Base et ajouts de schéma (à tous, mardi midi) · fichiers factices · agence fictive · base de connaissances immobilier en base · 2 sessions jouées · scores §10 et gain (à Binta, Assel) |
| **Mardi** | 9h-12h : base, schéma du kit, ajouts de ce document, profils, fichiers factices. Après-midi : agence fictive (liste en `03`), base de connaissances immobilier chargée dans le profil (depuis `07`). |
| **Mercredi** | 11h branchement Recorder. **2 sessions de 15 minutes** dans le rôle de l'assistante : 3 annonces sur 3 sites, plus une messagerie ouverte 2 fois (pour produire des `hors_perimetre`). Chronométrer chaque annonce. 14h branchement détection. |
| **Jeudi** | Fonction de score (formule de `07`) et quadrant. Gain : formule du professeur, hypothèses écrites une par une. Données du rapport. 18h : gel de la base de démo et copie de sauvegarde. |
| **Vendredi** | Relire chaque chiffre du deck avec Assel. |
| **Terminé quand** | Mardi midi : chacun lit et écrit en base. Mercredi : 2 sessions en base, durées notées. Jeudi : chaque tâche a un score et une ligne d'hypothèses. |
| **CP2** | Capture de la base remplie, durée humaine mesurée |
| **CP4** | Slide du gain avec hypothèses, phrase type |
| **En avance** | Profil comptable : charger 10 lignes de base de connaissances |
| **Bloqué** | Sécurité par ligne : rester sur la clé de service côté serveur, comme prévu dans le kit. |

> [Contexte commun]. Je suis le CDO. Aide-moi à : 1) installer la base Supabase (schéma du kit et ajouts de `04`) ; 2) générer l'agence fictive : 10 collaborateurs désignés par leur poste, 10 mandats réalistes en Essonne, 20 prospects inventés avec des numéros et des adresses manifestement fictifs ; 3) charger la base de connaissances immobilier dans le profil métier ; 4) écrire le scénario minute par minute de mes 2 sessions de 15 minutes ; 5) coder la fonction de score : total = (0,35 × gain + 0,20 × facilité + 0,20 × (6 − effort) + 0,15 × (6 − risque) + 0,10 × confiance) × 20, avec le quadrant ; 6) calculer le gain : personnes × fréquence × temps gagné × adoption × part récupérée, chaque hypothèse écrite avec la personne à qui la vérifier.

### Binta (CPO) : chantier E
| | |
|---|---|
| **Reçoit** | Fichiers d'exemple (kit) · prompts du mode vocal (Omar, mercredi) · scores et gain (Henriquet, jeudi) · chiffres de coût et de prix (Assel, `02`) |
| **Livre** | Maquette (mardi) · questions du formulaire (à Vladimir, mardi 16h) · fiche d'exemple (mardi midi) · interface · page rapport · deck |
| **Mardi** | Organigramme (depuis `03`) et maquette des écrans **[D]**. Google Forms avec les 22 questions de `07`. Fiche opportunité d'exemple. |
| **Mercredi** | Interface sur fichiers d'exemple : tableau de bord, matrice gain / effort. Écran du mode vocal (enregistrer, reformulation, valider). Loom avec Assel avant 16h. |
| **Jeudi** | 11h vraies données. Page rapport avec 1 fiche complète et le bouton « Prouver ». Deck v1 à 18h. Répétition à 16h. |
| **Vendredi** | Deck final à 13h. Envoi avant 15h. |
| **Terminé quand** | Mardi : quelqu'un d'extérieur comprend le parcours en 30 secondes. Mercredi : le tableau de bord s'affiche avec les fichiers d'exemple. Jeudi : le rapport affiche une vraie exécution de l'agent. |
| **CP2** | Parcours utilisateur, Loom |
| **CP4** | Deck complet |
| **En avance** | Maquette de la vue Personnel |
| **Bloqué** | Temps réel : un bouton « Actualiser » suffit. |

> [Contexte commun]. Je suis la CPO. Aide-moi à : 1) dessiner l'organigramme de l'application (vues Entreprise, Collaborateur, Personnel) et maquetter seulement les écrans indispensables à la démo ; 2) construire en Next.js le tableau de bord (heures récupérables, tâches classées, matrice gain / effort) et la page rapport (fiche opportunité à 2 axes, durée avant/après, bouton « Prouver avec l'agent »), d'abord sur les fichiers d'exemple puis sur Supabase ; 3) l'écran du mode vocal : enregistrer, afficher « voici ce que j'ai compris », valider ou corriger ; 4) le Loom de 2 minutes du checkpoint 2 ; 5) le deck de 8 à 12 slides dans l'ordre : problème, solution, démo, business model, go-to-market, architecture, limites et roadmap, coût de run. Le gérant ne doit jamais voir de donnée par personne.

### Assel (CEO) : chantier F
| | |
|---|---|
| **Reçoit** | Lignes de test §12 (Vladimir, Alejandro) · chiffres mesurés (Henriquet) · limites (Omar) |
| **Livre** | Décisions du soir · CP2 et CP4 envoyés · rapport de retours H · slides conformité, coût de run, go-to-market · pitch et réponses |
| **Ce soir** | Trancher les coupes. Envoyer la question des crédits aux mentors H. Partager ce dossier. |
| **Mardi** | Points de 9h et 18h30. Tester soi-même un agent H. Journal de décisions. Appeler 2 gérants d'agence (prix, tâches réelles) : 15 minutes chacun valent mieux qu'une slide. |
| **Mercredi** | Script de démo v1. Loom. **CP2 envoyé à 16h45.** Test n°1 à 17h30. |
| **Jeudi** | Rapport de retours H v1 (modèle en `06`). Slides chiffrées. Vidéo de secours. Répétition à 16h. Questions difficiles (`05`). |
| **Vendredi** | Répétition à 10h. Vérification des chiffres à 13h. **Envoi à 14h30.** Pitch. |
| **Terminé quand** | Chaque soir : le test de 18h30 a une réponse écrite. Jeudi : le pitch tient en temps réel avec la démo. |
| **En avance** | Appeler un 3e gérant, un expert-comptable |
| **Bloqué** | Arbitrage impossible : la question à se poser est « est-ce sur le chemin critique de la démo ? ». Sinon, on coupe. |

> [Contexte commun]. Je suis le CEO. Aide-moi à : 1) tenir le planning heure par heure de mardi à vendredi avec les branchements et le test de 18h30 ; 2) écrire le script de démo de 4 minutes et son plan B ; 3) remplir le rapport de retours sur l'Agent API à partir de nos lignes de test ; 4) préparer mes réponses aux questions difficiles du jury (CNIL, fiabilité de l'agent, concurrence, prix, simulé) ; 5) préparer un guide d'entretien de 15 minutes pour un gérant d'agence : quelles tâches se répètent, combien de temps, quel budget. Sois exigeant : signale chaque chiffre que je ne peux pas justifier.

---

## 4. Moments de branchement

| Quand | Quoi | Qui branche | Qui teste | Réussi si |
|---|---|---|---|---|
| Mardi 12h | Base ouverte à tous | Henriquet | Chacun | Lecture et écriture depuis chaque poste |
| Mardi 18h | `nettoyer()` dans le Recorder | Omar + Alejandro | Omar | Aucun nom ni numéro en clair dans 10 événements |
| Mercredi 11h | Recorder → base | Alejandro + Henriquet | Henriquet | 50 événements réels, dont des `hors_perimetre` |
| Mercredi 12h | Formulaire → n8n → contexte → prompt | Vladimir + Omar | Omar | Un prompt §9 créé à partir d'une réponse |
| Mercredi 14h | Base → détection | Omar + Henriquet | Henriquet | La tâche répétée sort des vraies sessions |
| Mercredi 16h | Détection → agent H | Omar + Alejandro | Vladimir | 3 annonces créées à partir de consignes générées |
| **Mercredi 17h30** | **Bout en bout n°1** | Tous | Assel | Voir `03` |
| Jeudi 10h | Détection → n8n | Vladimir + Omar | Vladimir | L'alerte J2 part |
| Jeudi 11h | Tout → interface | Binta + Alejandro | Binta | Le rapport affiche une vraie exécution |
| Jeudi 12h | Score → interface | Henriquet + Binta | Binta | La matrice place 3 tâches |
| **Jeudi 14h** | **Bout en bout n°2** | Tous | Assel | 3 passages de suite |

---

## 5. RACI

R = réalise · A = décide et répond du résultat · C = consulté · I = informé

| Livrable | Assel | Alejandro | Vladimir | Omar | Henriquet | Binta |
|---|---|---|---|---|---|---|
| Recorder (capture, sites, pause) | I | **A/R** | | C | I | C |
| Filtres de confidentialité | I | C | | **A/R** | C | |
| Détection | I | C | | **A/R** | C | I |
| Prompts 3 couches | I | | C | **A/R** | C | C |
| Scoring et gain | C | | | C | **A/R** | I |
| Agent H (exécution) | I | **A/R** | R | C | | I |
| 3 sites de test | I | C | **A/R** | | C | |
| Workflows n8n | I | | **A/R** | C | | |
| Formulaire avant audit | C | | R | C | | **A/R** |
| Base et schéma | I | C | I | I | **A/R** | I |
| Base de connaissances immobilier | C | | | C | **A/R** | C |
| Agence fictive et sessions jouées | I | C | | C | **A/R** | |
| Interface et rapport | C | C | | | C | **A/R** |
| Mode vocal | I | | | R | | **A/R** |
| Plan de tests de l'agent | C | **A** | **R** | | | |
| Rapport de retours pour H | **A/R** | C | C | C | | |
| Prix et coûts | **A/R** | | | C | C | C |
| Conformité | **A/R** | C | | C | C | C |
| Deck | A | C | C | C | C | **R** |
| Démo live et vidéo de secours | A | **R** | C | | | C |
| Checkpoints envoyés à l'heure | **A/R** | | | | | C |

---

## 6. Si on a fini en avance, si on est bloqué

**En avance, dans cet ordre**
1. Aider sur le chemin critique : Recorder → filtres → détection → agent H.
2. Passer 10 essais de plus dans le plan de tests de l'agent.
3. Écrire 3 lignes dans le rapport de retours H (ce qui a marché, cassé, surpris).
4. Préparer sa partie du pitch.

**Bloqué plus de 30 minutes**
1. Message dans le groupe : ce que j'essaie, ce qui bloque, ce que j'ai tenté.
2. Assel tranche en 10 minutes : aide d'un autre, plan B de la fiche, ou coupe.
3. La coupe est notée dans le journal de décisions, avec ce qu'on dira au jury.

**Ordre des coupes si le retard s'accumule** : sous-agents → Holo en local → comparaison de modèles → mode vocal en live (vidéo à la place) → 2e et 3e workflows n8n → formulaire en live (tableur rempli à la main). On ne coupe jamais : capture réelle, floutage, agent en live, chrono.
