# Fiche de Omar (CAIO)

**À lire ce soir (10 min) :** le `README.md` à la racine, puis cette fiche.
**Tes documents de référence :** `commun/roadmap/03-mvp-demo-planning.md`, `commun/roadmap/04-equipe-chantiers.md`, `commun/roadmap/07-fiche-scoring-base-immo-formulaire.md`, et toujours `commun/contrats.md` (les formats communs).
**Tes dossiers de travail :** ce dossier. Tu travailles sur ta branche GitHub (ex. `omar/ma-brique`).

**La règle :** tu n'attends jamais la brique d'un autre. En attendant, tu utilises les fausses données de `commun/donnees/`.

| | |
|---|---|
| **Reçoit** | Profils (déjà dans le kit) · contexte et postes d'exemple (déjà dans `commun/donnees/`) · vrais événements (mercredi 11h) |
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

> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (Eugenia × H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, détecte les tâches répétitives, les note, fait exécuter l'une d'elles par l'agent de H Company pour chronométrer le gain, et livre un plan d'automatisation. Règle de choix de l'outil : API disponible → n8n ; pas d'API → agent H ; déjà couvert par le logiciel du client → rien à construire. Démo : agence immobilière fictive, une assistante recopie chaque annonce sur 3 sites de test sans passerelle. Stack : Python (application Mac), Supabase, Next.js sur Vercel, n8n, Agent API de H Company (`hai-agents`), Claude (Haiku 5.5 et Sonnet 5.5), modèles Hugging Face en local. Coupé cette semaine : extension Chrome, Windows, paiement. Je te joins `commun/contrats.md`, `commun/schema-supabase.sql` et `commun/roadmap/04-equipe-chantiers.md` : respecte ces formats à la lettre. Je suis le CAIO. Aide-moi à construire en Python : 1) `nettoyer(texte, profil)` : motifs du profil métier puis reconnaissance de noms en français, en local, avec un jeu de 20 phrases pièges ; 2) l'étage de détection sans IA : transformer les événements en actions, trouver les séquences répétées au moins 3 fois, mesurer leur durée, ignorer les événements `hors_perimetre` ; 3) `assembler_prompt(profil, contexte, poste)` qui empile 3 couches (métier, entreprise, poste) et renvoie le texte et son empreinte ; 4) le prompt d'analyse qui reçoit 5 candidates et renvoie le JSON §2 ; 5) les 2 prompts du mode vocal (reformulation à valider, puis solutions). Lots de moins de 100 000 tokens. Mesure la reproductibilité : 5 relances sur 10 cas. Sur `evenements-exemple.json`, la détection doit sortir la tâche de `tache-detectee-exemple.json`.

---
Si tu es bloqué plus de 30 minutes : un message dans le groupe (ce que j'essaie, ce qui bloque, ce que j'ai tenté). Assel tranche en 10 minutes.
