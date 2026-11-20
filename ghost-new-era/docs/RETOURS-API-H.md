# Retours sur l'API de H Company

Livrable du hackathon : ce qui a marché, ce qui a cassé, ce qui a surpris. À compléter au fil des tests ; on n'écrit que ce qui a été constaté.

## Holo (lecture d'écran), mesuré le 20/11/2026

- Modèle retenu : `holo4-27b`. Mesure sur 5 captures du site, 3 passages : 5 détections justes sur 5, latence médiane 1,8 à 1,9 s, maximum 3,8 s.
- `holo3-1-35b-a3b` : 4 détections justes sur 5 (déclenche à tort sur la fiche de Karim), latence médiane 2,3 s.
- Surprise : `holo4-27b` raisonne avant de répondre. Avec `max_tokens` à 400, il a été coupé avant d'écrire le JSON ; 1 200 règle le problème.
- Le champ « outils » renvoyé par Holo n'est pas fiable : la source de vérité reste les accords de la personne.
- Détail : [`agents/holo/README.md`](../agents/holo/README.md).

## Agents H (sessions, parallélisme, vue en direct)

À compléter après les tests : une session, trois sessions en parallèle, vue en direct dans un cadre, envoi d'un message à une session en cours, crédits consommés.

## Ce qui a cassé / ce qui a surpris

À compléter.
