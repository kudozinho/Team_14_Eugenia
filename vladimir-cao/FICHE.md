# Fiche de Vladimir (CAO)

**À lire ce soir (10 min) :** le `README.md` à la racine, puis cette fiche.
**Tes documents de référence :** `commun/roadmap/03-mvp-demo-planning.md`, `commun/roadmap/04-equipe-chantiers.md`, `commun/roadmap/06-tests-agent-h.md`, `commun/roadmap/07-fiche-scoring-base-immo-formulaire.md`, et toujours `commun/contrats.md` (les formats communs).
**Tes dossiers de travail :** ce dossier. Tu travailles sur ta branche GitHub (ex. `vladimir/ma-brique`).

**La règle :** tu n'attends jamais la brique d'un autre. En attendant, tu utilises les fausses données de `commun/donnees/`.

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

> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (Eugenia × H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, détecte les tâches répétitives, les note, fait exécuter l'une d'elles par l'agent de H Company pour chronométrer le gain, et livre un plan d'automatisation. Règle de choix de l'outil : API disponible → n8n ; pas d'API → agent H ; déjà couvert par le logiciel du client → rien à construire. Démo : agence immobilière fictive, une assistante recopie chaque annonce sur 3 sites de test sans passerelle. Stack : Python (application Mac), Supabase, Next.js sur Vercel, n8n, Agent API de H Company (`hai-agents`), Claude (Haiku 5.5 et Sonnet 5.5), modèles Hugging Face en local. Coupé cette semaine : extension Chrome, Windows, paiement. Je te joins `commun/contrats.md`, `commun/schema-supabase.sql` et `commun/roadmap/04-equipe-chantiers.md` : respecte ces formats à la lettre. Je suis le CAO. Aide-moi à : 1) créer 3 sites de test d'annonces en Next.js sur Vercel, de difficulté croissante (formulaire simple ; autres noms de champs et menu déroulant ; 2 étapes avec case à cocher et envoi de photo), qui écrivent dans `annonces_portails`, avec une page « Annonces publiées » ; 2) construire dans n8n : `formulaire_vers_contexte` (une réponse Google Forms devient un contexte au format §7 dans Supabase), `alerte_j2` (message au salarié quand une tâche est détectée) et `synchro_annonces_sheets` ; 3) lancer des séries de 10 essais de l'agent H par niveau avec le script d'Alejandro et lire les résultats au format §12. Donne le code, les JSON des workflows et la façon de vérifier chaque brique.

---
Si tu es bloqué plus de 30 minutes : un message dans le groupe (ce que j'essaie, ce qui bloque, ce que j'ai tenté). Assel tranche en 10 minutes.
