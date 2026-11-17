# Fiche de Assel (CEO)

**À lire ce soir (10 min) :** le `README.md` à la racine, puis cette fiche.
**Tes documents de référence :** `commun/roadmap/01-strategie.md`, `commun/roadmap/02-offres-couts-pricing.md`, `commun/roadmap/05-conformite-roadmap-produit.md`, `commun/roadmap/06-tests-agent-h.md`, `commun/roadmap/04-equipe-chantiers.md`, et toujours `commun/contrats.md` (les formats communs).
**Tes dossiers de travail :** ce dossier. Tu travailles sur ta branche GitHub (ex. `assel/ma-brique`).

**La règle :** tu n'attends jamais la brique d'un autre. En attendant, tu utilises les fausses données de `commun/donnees/`.

| | |
|---|---|
| **Reçoit** | Lignes de test §12 (Vladimir, Alejandro) · chiffres mesurés (Henriquet) · limites (Omar) |
| **Livre** | Décisions du soir · CP2 et CP4 envoyés · rapport de retours H · slides conformité, coût de run, go-to-market · pitch et réponses |
| **Ce soir** | Trancher les coupes. Envoyer la question des crédits aux mentors H. Partager ce dossier. |
| **Mardi** | Points de 9h et 18h30. Tester soi-même un agent H. Journal de décisions. Appeler 2 gérants d'agence (prix, tâches réelles) : 15 minutes chacun valent mieux qu'une slide. |
| **Mercredi** | Script de démo v1. Loom. **CP2 envoyé à 16h45.** Test n°1 à 17h30. |
| **Jeudi** | Rapport de retours H v1 (modèle en `commun/roadmap/06…`). Slides chiffrées. Vidéo de secours. Répétition à 16h. Questions difficiles (`commun/roadmap/05…`). |
| **Vendredi** | Répétition à 10h. Vérification des chiffres à 13h. **Envoi à 14h30.** Pitch. |
| **Terminé quand** | Chaque soir : le test de 18h30 a une réponse écrite. Jeudi : le pitch tient en temps réel avec la démo. |
| **En avance** | Appeler un 3e gérant, un expert-comptable |
| **Bloqué** | Arbitrage impossible : la question à se poser est « est-ce sur le chemin critique de la démo ? ». Sinon, on coupe. |

> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (Eugenia × H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, détecte les tâches répétitives, les note, fait exécuter l'une d'elles par l'agent de H Company pour chronométrer le gain, et livre un plan d'automatisation. Règle de choix de l'outil : API disponible → n8n ; pas d'API → agent H ; déjà couvert par le logiciel du client → rien à construire. Démo : agence immobilière fictive, une assistante recopie chaque annonce sur 3 sites de test sans passerelle. Stack : Python (application Mac), Supabase, Next.js sur Vercel, n8n, Agent API de H Company (`hai-agents`), Claude (Haiku 5.5 et Sonnet 5.5), modèles Hugging Face en local. Coupé cette semaine : extension Chrome, Windows, paiement. Je te joins `commun/contrats.md`, `commun/schema-supabase.sql` et `commun/roadmap/04-equipe-chantiers.md` : respecte ces formats à la lettre. Je suis le CEO. Aide-moi à : 1) tenir le planning heure par heure de mardi à vendredi avec les branchements et le test de 18h30 ; 2) écrire le script de démo de 4 minutes et son plan B ; 3) remplir le rapport de retours sur l'Agent API à partir de nos lignes de test ; 4) préparer mes réponses aux questions difficiles du jury (CNIL, fiabilité de l'agent, concurrence, prix, simulé) ; 5) préparer un guide d'entretien de 15 minutes pour un gérant d'agence : quelles tâches se répètent, combien de temps, quel budget. Sois exigeant : signale chaque chiffre que je ne peux pas justifier.

---
Si tu es bloqué plus de 30 minutes : un message dans le groupe (ce que j'essaie, ce qui bloque, ce que j'ai tenté). Assel tranche en 10 minutes.
