# Plan de démo (5 minutes, en direct) et plan B

## Avant de commencer (à faire 10 minutes avant)
1. **Remettre Karim à zéro** : `cd ghost-new-era/agents && tests_h/.venv/bin/python acces/acces.py --seulement-reset` (ou le script de remise à zéro de la PR #79). Vérifier : arrivée « nouvelle », les 9 éléments de `v_onboarding` à faux, aucun run « en cours ».
2. **Réveiller Render** : ouvrir https://ghost-agents.onrender.com/sante (peut prendre une minute). Le portail le réveille aussi à l'ouverture d'une session.
3. Chrome, micro autorisé, son activé, un seul onglet du portail. Se connecter en Sophie. Ne pas lancer d'autre test en même temps (même Karim, même base).

## Déroulé (cible : 5 minutes)
| Temps | Action | Ce que le jury voit |
|---|---|---|
| 0:00 | Landing : « trois agents IA agissent sous tes yeux » | Le problème, les trois fantômes Alma, Nino, Lia |
| 0:30 | Connexion de Sophie, accueil sombre, trois outils cochés | Les consignes, l'accord outil par outil |
| 0:50 | « Commencer l'observation », Ghost dit bonjour, « Partager mon onglet » | Pastille, pause, voix, pastilles d'espaces observés |
| 1:15 | Sophie parcourt RH, messagerie, wiki (laisser les pastilles se remplir) | « Ce que Ghost lit » toutes les 4 secondes |
| 1:45 | Retour sur l'accueil RH : notification « Nouvelle arrivée : Karim Benali » | Proposition en 5 à 30 secondes ; dire « oui » à voix haute |
| 2:15 | Onglet « Agents en direct » | Alma, Nino, Lia cliquent chacun dans leur écran |
| 3:30 | Question de l'agent (manager) : répondre « Claire Fontaine » | La décision humaine, l'agent reprend |
| 4:15 | « Valide » pour la commande de l'ordinateur | La seule action irréversible demande un humain |
| 4:30 | Rapport final : « Karim est prêt pour son jour 1 » | 9 éléments prouvés dans la base, durée, jetons, ce qui n'est pas mesuré |

## Chiffres à citer (mesurés)
- Détection : 1 à 2 secondes de lecture par Holo, proposition environ 15 secondes après le début de l'observation.
- Trois agents en parallèle : 145 à 173 secondes (8 runs complets réussis).
- Coût : environ 546 000 jetons H par onboarding, sur un quota de 60 millions par mois.
- À ne pas citer comme mesuré : « 2 h par arrivée » (hypothèse), taux de réussite (8 runs seulement), prix (tarifs de démonstration).

## Plan B
- **Pas de partage d'écran possible** : bouton « Secours : signaler l'arrivée de Karim » (la proposition est étiquetée « [secours] » dans la base, à dire au jury).
- **Render endormi ou agents en panne** : montrer la **vidéo d'un run complet** enregistrée avant (à faire), et les lignes `agents_runs` / `agents_evenements` dans Supabase.
- **Micro refusé** : cliquer au lieu de parler.
