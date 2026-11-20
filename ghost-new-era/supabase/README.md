# Supabase : GHOST New Era

Projet Supabase `ghost-new-era` (région Paris, plan gratuit). Données 100 % fictives (Atelier Nova).

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `supabase/schema.sql` | Toutes les tables, la sécurité (RLS) et la vue de preuve `v_onboarding` |
| `donnees/seed.sql` | Données minimales : 13 personnes, 6 canaux, 16 pages wiki, Léa complète, Karim vide |

Ordre d'installation sur un projet neuf : `schema.sql`, puis `seed.sql` (relançable sans doublon).

## Sécurité

- RLS activée sur toutes les tables.
- `anon` ne lit rien. `authenticated` lit et modifie seulement son propre `profils` et son propre `abonnements`.
- Tout le reste (intranet, agents, observation) passe par des routes serveur avec la clé `service_role`, jamais exposée au navigateur.
- Aucune image stockée : `captures_lues` ne garde que le résumé texte de Holo.

## Tester la preuve

```sql
select element, espace, present
from v_onboarding
where personne_id = 'karim-benali'
order by ordre;
```

Attendu avant les agents : Léa 9 sur 9, Karim 0 sur 9. Chaque élément qui passe à `true` pour Karim prouve qu'un agent a vraiment agi dans l'intranet.

Les 9 éléments : `fiche`, `acces` (tous les outils du catalogue du poste), `badge` (demandé ou prêt), `canal` (message citant le prénom dans le canal de l'équipe), `message` (annonce dans `accueil`), `parrain`, `cafe` (avec créneau), `page_wiki` (titre « Bienvenue Karim »), `checklist` (jour 1, semaine 1 et mois 1).

## Identifiants utiles

- Karim Benali : `karim-benali`, poste `Commercial`, équipe `Ventes`, `manager_id` vide (volontaire : l'agent doit poser la question).
- Arrivée de Karim : `arrivee-karim` (statut `nouvelle`).
- Canaux : `general`, `tech`, `ventes`, `rh`, `accueil`, `cafe`.
- `rh_materiel` : passage à `valide` réservé à un humain.
