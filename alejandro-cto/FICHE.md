# Fiche de Alejandro (CTO)

**À lire ce soir (10 min) :** le `README.md` à la racine, puis cette fiche.
**Tes documents de référence :** `commun/roadmap/03-mvp-demo-planning.md`, `commun/roadmap/04-equipe-chantiers.md`, `commun/roadmap/06-tests-agent-h.md`, et toujours `commun/contrats.md` (les formats communs).
**Tes dossiers de travail :** ce dossier. Tu travailles sur ta branche GitHub (ex. `alejandro/ma-brique`).

**La règle :** tu n'attends jamais la brique d'un autre. En attendant, tu utilises les fausses données de `commun/donnees/`.

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

> Contexte : nous construisons Ghost (« See the work. Ghost the task. ») au hackathon Build The Future (Eugenia × H Company), du 16 au 20 novembre 2026. Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, détecte les tâches répétitives, les note, fait exécuter l'une d'elles par l'agent de H Company pour chronométrer le gain, et livre un plan d'automatisation. Règle de choix de l'outil : API disponible → n8n ; pas d'API → agent H ; déjà couvert par le logiciel du client → rien à construire. Démo : agence immobilière fictive, une assistante recopie chaque annonce sur 3 sites de test sans passerelle. Stack : Python (application Mac), Supabase, Next.js sur Vercel, n8n, Agent API de H Company (`hai-agents`), Claude (Haiku 5.5 et Sonnet 5.5), modèles Hugging Face en local. Coupé cette semaine : extension Chrome, Windows, paiement. Je te joins `commun/contrats.md`, `commun/schema-supabase.sql` et `commun/roadmap/04-equipe-chantiers.md` : respecte ces formats à la lettre. Je suis le CTO. Aide-moi à construire en Python sur macOS : 1) « Ghost Recorder » : application de barre des menus (`rumps`) qui suit l'application au premier plan, ne capture que les fenêtres des applications cochées, lit l'adresse de l'onglet actif de Chrome et ne capture que les domaines autorisés, produit un événement `hors_perimetre` sans aucun contenu sinon, capture sur événement, jette les doublons par empreinte d'image, lit le texte en local, appelle `nettoyer(texte, profil)` puis écrit l'événement au format §1 dans Supabase ; 2) un script qui lance un agent H sur une tâche détectée (navigateur hébergé, réponse structurée, limites d'étapes et de temps), mesure la durée et écrit le résultat au format §4 ; 3) un script de série de tests qui écrit au format §12 et vérifie la réussite en lisant la table `annonces_portails`. Donne l'arborescence, le code étape par étape, les permissions macOS, et un plan B si la capture par fenêtre bloque. Vérifie les noms exacts des paramètres dans la documentation actuelle de `hai-agents` avant d'écrire le code.

---
Si tu es bloqué plus de 30 minutes : un message dans le groupe (ce que j'essaie, ce qui bloque, ce que j'ai tenté). Assel tranche en 10 minutes.
