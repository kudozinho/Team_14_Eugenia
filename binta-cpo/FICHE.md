# Fiche de Binta (CPO)

**À lire ce soir (10 min) :** le `README.md` à la racine, puis cette fiche.
**Tes documents de référence :** `commun/roadmap/01-strategie.md`, `commun/roadmap/02-offres-couts-pricing.md`, `commun/roadmap/03-mvp-demo-planning.md`, `commun/roadmap/04-equipe-chantiers.md`, `commun/roadmap/07-fiche-scoring-base-immo-formulaire.md`, et toujours `commun/contrats.md` (les formats communs).
**Tes dossiers de travail :** ce dossier. Tu travailles sur ta branche GitHub (ex. `binta/ma-brique`).

**La règle :** tu n'attends jamais la brique d'un autre. En attendant, tu utilises les fausses données de `commun/donnees/`.

| | |
|---|---|
| **Reçoit** | Fichiers d'exemple (kit) · prompts du mode vocal (Omar, mercredi) · scores et gain (Henriquet, jeudi) · chiffres de coût et de prix (Assel, `commun/roadmap/02…`) |
| **Livre** | Maquette (mardi) · questions du formulaire (à Vladimir, mardi 16h) · fiche d'exemple (mardi midi) · interface · page rapport · deck |
| **Mardi** | Organigramme (depuis `commun/roadmap/03…`) et maquette des écrans **[D]**. Google Forms avec les 22 questions de `commun/roadmap/07…`. Fiche opportunité d'exemple. |
| **Mercredi** | Interface sur fichiers d'exemple : tableau de bord, matrice gain / effort. Écran du mode vocal (enregistrer, reformulation, valider). Loom avec Assel avant 16h. |
| **Jeudi** | 11h vraies données. Page rapport avec 1 fiche complète et le bouton « Prouver ». Deck v1 à 18h. Répétition à 16h. |
| **Vendredi** | Deck final à 13h. Envoi avant 15h. |
| **Terminé quand** | Mardi : quelqu'un d'extérieur comprend le parcours en 30 secondes. Mercredi : le tableau de bord s'affiche avec les fichiers d'exemple. Jeudi : le rapport affiche une vraie exécution de l'agent. |
| **CP2** | Parcours utilisateur, Loom |
| **CP4** | Deck complet |
| **En avance** | Maquette de la vue Personnel |
| **Bloqué** | Temps réel : un bouton « Actualiser » suffit. |

> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (Eugenia × H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, détecte les tâches répétitives, les note, fait exécuter l'une d'elles par l'agent de H Company pour chronométrer le gain, et livre un plan d'automatisation. Règle de choix de l'outil : API disponible → n8n ; pas d'API → agent H ; déjà couvert par le logiciel du client → rien à construire. Démo : agence immobilière fictive, une assistante recopie chaque annonce sur 3 sites de test sans passerelle. Stack : Python (application Mac), Supabase, Next.js sur Vercel, n8n, Agent API de H Company (`hai-agents`), Claude (Haiku 5.5 et Sonnet 5.5), modèles Hugging Face en local. Coupé cette semaine : extension Chrome, Windows, paiement. Je te joins `commun/contrats.md`, `commun/schema-supabase.sql` et `commun/roadmap/04-equipe-chantiers.md` : respecte ces formats à la lettre. Je suis la CPO. Aide-moi à : 1) dessiner l'organigramme de l'application (vues Entreprise, Collaborateur, Personnel) et maquetter seulement les écrans indispensables à la démo ; 2) construire en Next.js le tableau de bord (heures récupérables, tâches classées, matrice gain / effort) et la page rapport (fiche opportunité à 2 axes, durée avant/après, bouton « Prouver avec l'agent »), d'abord sur les fichiers d'exemple puis sur Supabase ; 3) l'écran du mode vocal : enregistrer, afficher « voici ce que j'ai compris », valider ou corriger ; 4) le Loom de 2 minutes du checkpoint 2 ; 5) le deck de 8 à 12 slides dans l'ordre : problème, solution, démo, business model, go-to-market, architecture, limites et roadmap, coût de run. Le gérant ne doit jamais voir de donnée par personne.

---
Si tu es bloqué plus de 30 minutes : un message dans le groupe (ce que j'essaie, ce qui bloque, ce que j'ai tenté). Assel tranche en 10 minutes.
