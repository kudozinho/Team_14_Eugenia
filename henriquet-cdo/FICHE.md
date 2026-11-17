# Fiche de Henriquet (CDO)

**À lire ce soir (10 min) :** le `README.md` à la racine, puis cette fiche.
**Tes documents de référence :** `commun/roadmap/03-mvp-demo-planning.md`, `commun/roadmap/04-equipe-chantiers.md`, `commun/roadmap/07-fiche-scoring-base-immo-formulaire.md`, `commun/roadmap/02-offres-couts-pricing.md`, et toujours `commun/contrats.md` (les formats communs).
**Tes dossiers de travail :** ce dossier. Tu travailles sur ta branche GitHub (ex. `henriquet/ma-brique`).

**La règle :** tu n'attends jamais la brique d'un autre. En attendant, tu utilises les fausses données de `commun/donnees/`.

| | |
|---|---|
| **Reçoit** | Rien pour démarrer · durées de l'agent (Alejandro, jeudi) · tâches détectées (Omar, mercredi) |
| **Livre** | Base et ajouts de schéma (à tous, mardi midi) · fichiers factices · agence fictive · base de connaissances immobilier en base · 2 sessions jouées · scores §10 et gain (à Binta, Assel) |
| **Mardi** | 9h-12h : base, schéma du kit, ajouts de ce document, profils, fichiers factices. Après-midi : agence fictive (liste en `commun/roadmap/03…`), base de connaissances immobilier chargée dans le profil (depuis `commun/roadmap/07…`). |
| **Mercredi** | 11h branchement Recorder. **2 sessions de 15 minutes** dans le rôle de l'assistante : 3 annonces sur 3 sites, plus une messagerie ouverte 2 fois (pour produire des `hors_perimetre`). Chronométrer chaque annonce. 14h branchement détection. |
| **Jeudi** | Fonction de score (formule de `commun/roadmap/07…`) et quadrant. Gain : formule du professeur, hypothèses écrites une par une. Données du rapport. 18h : gel de la base de démo et copie de sauvegarde. |
| **Vendredi** | Relire chaque chiffre du deck avec Assel. |
| **Terminé quand** | Mardi midi : chacun lit et écrit en base. Mercredi : 2 sessions en base, durées notées. Jeudi : chaque tâche a un score et une ligne d'hypothèses. |
| **CP2** | Capture de la base remplie, durée humaine mesurée |
| **CP4** | Slide du gain avec hypothèses, phrase type |
| **En avance** | Profil comptable : charger 10 lignes de base de connaissances |
| **Bloqué** | Sécurité par ligne : rester sur la clé de service côté serveur, comme prévu dans le kit. |

> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (Eugenia × H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, détecte les tâches répétitives, les note, fait exécuter l'une d'elles par l'agent de H Company pour chronométrer le gain, et livre un plan d'automatisation. Règle de choix de l'outil : API disponible → n8n ; pas d'API → agent H ; déjà couvert par le logiciel du client → rien à construire. Démo : agence immobilière fictive, une assistante recopie chaque annonce sur 3 sites de test sans passerelle. Stack : Python (application Mac), Supabase, Next.js sur Vercel, n8n, Agent API de H Company (`hai-agents`), Claude (Haiku 5.5 et Sonnet 5.5), modèles Hugging Face en local. Coupé cette semaine : extension Chrome, Windows, paiement. Je te joins `commun/contrats.md`, `commun/schema-supabase.sql` et `commun/roadmap/04-equipe-chantiers.md` : respecte ces formats à la lettre. Je suis le CDO. Aide-moi à : 1) installer la base Supabase (schéma du kit et ajouts de `commun/roadmap/04…`) ; 2) générer l'agence fictive : 10 collaborateurs désignés par leur poste, 10 mandats réalistes en Essonne, 20 prospects inventés avec des numéros et des adresses manifestement fictifs ; 3) charger la base de connaissances immobilier dans le profil métier ; 4) écrire le scénario minute par minute de mes 2 sessions de 15 minutes ; 5) coder la fonction de score : total = (0,35 × gain + 0,20 × facilité + 0,20 × (6 − effort) + 0,15 × (6 − risque) + 0,10 × confiance) × 20, avec le quadrant ; 6) calculer le gain : personnes × fréquence × temps gagné × adoption × part récupérée, chaque hypothèse écrite avec la personne à qui la vérifier.

---
Si tu es bloqué plus de 30 minutes : un message dans le groupe (ce que j'essaie, ce qui bloque, ce que j'ai tenté). Assel tranche en 10 minutes.
