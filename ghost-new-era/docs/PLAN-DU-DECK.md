# Plan du deck (8 à 12 diapositives, pitch 6 minutes, Q&R 4 minutes)

Chaque diapositive ne cite que ce qui est mesuré ; le reste est présenté comme hypothèse.

1. **Titre** : Ghost, « il observe, il propose, il agit après ton accord ». Les trois fantômes.
2. **Problème** : une arrivée = plusieurs outils, un oubli = pas d'accès ni de badge le premier jour (durée « environ 2 h » : hypothèse, à chronométrer).
3. **Solution** : trois temps (observe, propose, agit), la personne décide à chaque étape.
4. **Démo** : capture du portail avec les trois agents en direct (ou la vidéo).
5. **Comment ça marche** : Holo lit l'écran, la proposition, trois agents H en parallèle, la base prouve chaque action (`v_onboarding`).
6. **Architecture** : schéma de `docs/ARCHITECTURE.md` (site, intranet, service Render, Supabase, H, Hugging Face).
7. **Résultats mesurés** : 8 runs complets réussis, 9 éléments sur 9, 145 à 173 s, lecture par Holo 1 à 2 s, environ 546 000 jetons par onboarding.
8. **Confiance** : images jamais conservées, pastille et pause, validation humaine avant l'irréversible. À ne pas dire : « limité aux outils cochés » (c'est l'onglet partagé).
9. **Business model** : à décider (qui paie, combien). Tarifs actuels = démonstration (49 et 149 euros par mois, valeurs d'exemple).
10. **Go-to-market** : RH et office managers de PME, onboarding comme porte d'entrée, puis toute tâche multi-outils sans API.
11. **Limites et roadmap** : n'apprend pas les gestes (onboarding modèle fixe), service Render gratuit, agents propres à chaque compte H, mémoire de session, comparaison chronométrée avec la durée humaine.
12. **Retours sur l'API de H** : ce qui a marché (parallélisme, vue des clics via les événements), cassé (page de vue non intégrable, message à une session non démontré), surpris (agents propres à chaque compte). Détail : `docs/RETOURS-API-H.md`.
