# Ghost : plan technique et répartition de l'équipe

> **Version 1, lundi après-midi.** La version à jour du plan technique est dans `commun/roadmap/03-mvp-demo-planning.md` et la répartition dans `commun/roadmap/04-equipe-chantiers.md`. Ce document reste valable pour comprendre les briques, mais le cas de démo, les autorisations (par site) et la répartition ont changé.

Hackathon Build The Future, 16 au 20 novembre 2026. Slogan : « See the work. Ghost the task. »
Démo : agence immobilière fictive, 3 faux portails d'annonces.

## Le principe
On n'entraîne aucune IA. On assemble des modèles existants avec du code et des prompts.
Règle d'or : le code déterministe fait 90 % du travail ; l'IA n'intervient qu'aux 2-3 endroits indispensables. C'est ce qui garde les coûts bas et rend le résultat fiable.

## Le parcours
```
[0] Profil métier   →  [1] Ghost Recorder (Mac)  →  [2] Supabase  →  [3] Moteur de détection  →  [4] Agent H + n8n
    règles RGPD          capture + nettoyage local     stockage         code + LLM                  preuve + livrable
    du secteur                                              ↓
                                         [5] Interface web Next.js sur Vercel (+ 3 faux portails immo)
```

## [0] Profil métier (nouvelle feature : l'outil devient universel)
Avant de lancer un audit, on choisit le métier du client : agence immobilière, cabinet comptable, cabinet d'avocats, RH, autre.
Chaque profil contient :
- **le contexte** : vocabulaire du métier, logiciels habituels, tâches typiques (aide l'IA à bien comprendre les écrans) ;
- **les données sensibles du secteur** : par exemple, en compta, les montants, IBAN, numéros SIREN et fiscaux, noms des clients ; en avocat, les noms des parties et le contenu des dossiers (secret professionnel) ; en immobilier, les coordonnées, budgets et situations des prospects ;
- **les règles de traitement** : ce qui est flouté, ce qui n'est jamais stocké, durée de conservation, et le socle RGPD commun à tous les profils.

**Le point clé : le profil s'applique à deux niveaux.**
1. **Dans le code, en local, avant tout envoi** : des filtres déterministes (expressions régulières pour les IBAN, montants, numéros de téléphone, e-mails, numéros de sécurité sociale, SIREN) et un modèle de reconnaissance de noms floutent ou suppriment les données. C'est ce qui garantit le RGPD : ce qui n'est jamais envoyé ne peut pas fuiter.
2. **Dans le prompt système de l'IA** : le contexte métier et la consigne de ne jamais reprendre de données sensibles dans le rapport. Ça améliore l'analyse, mais une consigne à l'IA ne suffit pas comme protection : la protection réelle, c'est l'étape 1.

Stockage : table `profils_metier` dans Supabase (contexte, liste de motifs à flouter, champs interdits, durée de conservation). On en prépare 3 pour la démo : immobilier (utilisé en live), comptable, avocat. Ajouter un métier = ajouter une ligne, sans toucher au code.

## [1] Ghost Recorder, l'application Mac (Python)
- Elle détecte l'application au premier plan et ne capture que si elle est autorisée (ex. Chrome, Excel).
- Elle capture sur événement (changement d'appli, de titre de fenêtre, ou écran qui a changé), pas en continu. Une empreinte d'image permet de jeter les doublons.
- En local : lecture du texte (OCR), puis application des filtres du profil métier.
- Icône dans la barre des menus, bouton pause, liste des applis autorisées modifiable.
- Chaque capture devient un événement `{heure, appli, titre de fenêtre, texte nettoyé, miniature floutée}`.

## [2] Supabase
Tables : `organisations`, `profils_metier`, `utilisateurs`, `applis_autorisees`, `evenements`, `taches_detectees`, `executions_agent` (avec la durée), `rapports`. Miniatures dans le stockage de fichiers. Le temps réel de Supabase fait bouger le tableau de bord pendant la démo.

## [3] Moteur de détection (2 étages)
- **Étage déterministe, gratuit** : on découpe les événements en actions (« Chrome / Portail A / formulaire annonce »), on compte les séquences qui se répètent (même enchaînement, au moins 3 fois) et on mesure le temps passé. On obtient les tâches candidates classées par temps perdu. Les écrans proches sont regroupés avec un petit modèle de similarité.
- **Étage IA, minuscule** : seules les 5 meilleures candidates (texte déjà nettoyé) partent au LLM, avec le prompt système du profil métier. Il nomme la tâche, dit si elle est automatisable et comment (agent H ou n8n), estime le gain et écrit les instructions de l'agent H.

## [4] Agent H et n8n
- **Agent H (la preuve)** : `pip install hai-agents`, puis `client.agents.create_agent(...)` avec un environnement navigateur hébergé (`kind: "web"`, `start_url` = un faux portail), les instructions générées à l'étape 3 et un `answer_format` (réponse structurée : portails publiés, durée). Bonus : un agent chef avec un sous-agent par portail. Lancement avec `client.run_session(...)`, durée enregistrée dans `executions_agent`.
- **n8n (le livrable)** : 2-3 modèles de workflows (relance des prospects, synchronisation des annonces vers Google Sheets) dont l'IA remplit les paramètres, plus l'alerte J2 (« on a détecté que tu publies la même annonce 3 fois »).

## [5] Interface et faux portails (Vercel)
- Appli Ghost : choix du profil métier, choix des logiciels autorisés, questionnaire, enregistrement audio, tableau de bord en direct, rapport, bouton « Prouver avec l'agent ».
- 3 faux portails immo (formulaire « Déposer une annonce ») : terrain de jeu fiable de l'agent H.

## Hugging Face
| Besoin | Modèle | Pourquoi |
|---|---|---|
| Transcription de l'audio « journée type » | `openai/whisper-large-v3-turbo` (ou plus léger) | Gratuit en local, bon en français |
| Floutage des noms (profil métier) | modèle de reconnaissance d'entités en français, type `Jean-Baptiste/camembert-ner` | Repère personnes, lieux, organisations avant tout envoi |
| Regrouper les écrans semblables | `intfloat/multilingual-e5-small` | Renforce l'étage déterministe |
| Bonus jury | petit modèle Holo 3.1 sous licence Apache 2.0 | Utiliser H jusque dans l'analyse des écrans |

Option : appeler Holo par l'API compatible OpenAI de H pour décrire les écrans à la place de Claude.

## Qui fait quoi
| | Mardi | Mercredi (checkpoint 2, 17h) | Jeudi |
|---|---|---|---|
| **Alejandro, CTO** | Recorder Mac : capture des applis autorisées, envoi vers Supabase | Création et lancement de l'agent H sur un faux portail | Tout relier de bout en bout, vidéo de secours |
| **Omar, CAIO** | OCR local + filtres du profil métier (motifs + reconnaissance de noms) | Étage déterministe + prompt système par métier | Instructions générées pour l'agent H, tests de fiabilité |
| **Vladimir, CAO** | 3 faux portails sur Vercel | 2-3 workflows n8n + alerte J2 | Branchement n8n sur les tâches détectées, chronométrage |
| **Henriquet, CDO** | Schéma Supabase + table des profils métier (immo, compta, avocat) + données de l'agence fictive | Joue le négociateur : 2 sessions de 15 min enregistrées | Calcul du gain, données du rapport |
| **Binta, CPO** | Parcours utilisateur + maquette (avec le choix du profil métier) | Interface Next.js + Loom de 2 min | Page rapport + pitch deck |
| **Assel, CEO** | Coordination, GitHub, pricing | Checkpoint 2, retours sur l'API H | Script de démo, répétitions, questions du jury |

Chemin critique : Recorder → filtres → détection → agent H. Ces briques passent avant l'interface.

## Prompts de départ (à coller dans Fable)
Chaque prompt commence par le même contexte :
> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran (uniquement les logiciels autorisés), détecte les tâches répétitives, fait exécuter la tâche par l'agent de H Company pour prouver le gain, et livre un plan d'automatisation. Chaque audit démarre par un profil métier qui fixe le contexte et les règles de confidentialité (RGPD). Démo : agence immobilière fictive, 3 faux portails d'annonces. Stack : Python (application Mac), Supabase, Next.js sur Vercel, GitHub, n8n, Agent API de H Company (`hai-agents`), Claude, modèles Hugging Face. Démo live vendredi.

**Alejandro (CTO)**
> [Contexte]. Je suis le CTO. Aide-moi à construire en 2 jours l'application Mac « Ghost Recorder » en Python : détection de l'application au premier plan, capture uniquement des fenêtres des applis autorisées (liste lue dans Supabase), capture sur événement avec suppression des doublons par empreinte d'image, icône dans la barre des menus avec pause, envoi des événements nettoyés vers Supabase. Puis le script qui crée et lance un agent H (`hai-agents`, environnement web, `start_url` sur un faux portail, `answer_format`) et enregistre la durée. Donne l'architecture des fichiers, le code étape par étape, les permissions macOS à accorder, et un plan B si la capture par fenêtre bloque.

**Omar (CAIO)**
> [Contexte]. Je suis le CAIO. Aide-moi à construire : 1) les filtres de confidentialité locaux appliqués avant tout envoi, pilotés par un profil métier (motifs pour IBAN, montants, téléphones, e-mails, numéros de sécurité sociale, SIREN, et reconnaissance de noms en français) ; 2) l'étage déterministe qui repère les séquences d'actions répétées dans les événements et mesure le temps perdu ; 3) le prompt système par métier et le prompt d'analyse qui reçoit les 5 meilleures tâches et renvoie en JSON : nom, automatisable ou non, méthode (agent H ou n8n), gain estimé, instructions pour l'agent H. Compare 2-3 LLM sur précision, coût et latence.

**Vladimir (CAO)**
> [Contexte]. Je suis le CAO. Aide-moi à : 1) créer 3 faux portails d'annonces immobilières (Next.js sur Vercel, formulaire « Déposer une annonce » enregistré dans Supabase, design différent pour chaque portail) ; 2) construire 2-3 workflows n8n réutilisables (relance des prospects après visite, synchronisation des annonces vers Google Sheets) dont les paramètres sont remplis par l'IA ; 3) l'alerte J2 envoyée au collaborateur quand une tâche répétitive est détectée. Donne les JSON des workflows et les tests de fiabilité.

**Henriquet (CDO)**
> [Contexte]. Je suis le CDO. Aide-moi à : 1) concevoir le schéma Supabase (organisations, profils_metier, utilisateurs, applis_autorisees, evenements, taches_detectees, executions_agent, rapports) avec le SQL et les règles de sécurité par ligne ; 2) remplir la table des profils métier pour l'immobilier, la compta et les avocats (contexte, données sensibles, motifs à flouter, champs interdits, durée de conservation) ; 3) créer les données de l'agence fictive (10 collaborateurs, annonces, prospects, mandats) ; 4) préparer le scénario des 2 sessions de 15 min que j'enregistrerai en jouant le négociateur, et le calcul du gain (personnes × fréquence × temps × adoption).

**Binta (CPO)**
> [Contexte]. Je suis la CPO. Aide-moi à : 1) dessiner le parcours utilisateur, simple comme Google : choix du profil métier, choix des logiciels autorisés, lancement de l'audit, alerte J2, rapport final, bouton « Prouver avec l'agent » ; 2) construire l'interface en Next.js (tableau de bord en direct via Supabase, page rapport) ; 3) préparer le Loom de 2 min du checkpoint 2 et le pitch deck final (8-12 slides : problème, solution, démo, business model, go-to-market, architecture, limites et roadmap, coût de run). Cible : gérants d'agences immobilières.

**Assel (CEO)**
> [Contexte]. Je suis le CEO. Aide-moi à piloter la semaine : planning heure par heure de mardi à vendredi avec les dépendances entre les 6 rôles, tenue du journal de décisions, grille de prix (entreprise et personnel) basée sur nos coûts, script de démo minuté de 4 minutes avec plan B, et les 10 questions difficiles du jury (CNIL, fiabilité de l'agent, concurrence, prix) avec mes réponses.
