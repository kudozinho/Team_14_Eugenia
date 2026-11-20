# Essai de bout en bout de l'agent H (20/11, 2h10-2h25)

Site testé : https://ghost-ebon-eight.vercel.app. Source des données : le Google Sheet des 5 mandats. Vidéo de l'essai (17 min) disponible auprès de Vladimir.

## Parcours
1. Création d'un compte avec une adresse fictive.
2. Observation : M-0142 est publiée à la main sur les portails A, B et C. Ghost repère seul le workflow « Publier un bien immobilier » (Sheet et 3 portails retrouvés).
3. Source « Sheet connecté », puis ajout de la règle « Ne rien publier si la classe énergie est vide ».
4. Agent lancé sur M-0143, M-0144, M-0145 et M-T01.

## Résultat, comparé mot à mot au Sheet

| Mandat | Résultat |
|---|---|
| M-0142 | OK sur A, B et C, avec la photo (fait à la main) |
| M-0143 | OK sur A, B et C, avec la photo (agent) |
| M-0144 | OK sur A, B et C, avec la photo (agent) |
| M-T01 | OK : refusée par l'agent, car la classe énergie est vide |
| M-0145 | Échec : description modifiée |

Coût : 0,40 $ de crédits H, sur 2 lancements.

## Bug à corriger
- **Le texte n'est pas recopié à l'identique.** « commerces » est devenu « commerciaux », puis « organismes ».
- **Il y a des doublons.** À la relance de la seule ligne M-0145, l'agent a publié 5 annonces au lieu de 3.
- **La vérification ne voit rien.** Ghost affiche « Fait et relu » malgré ces erreurs.

Correctifs proposés :
- recopier les valeurs exactes du Sheet ;
- ne pas republier une annonce qui existe déjà ;
- vérifier tous les champs et le nombre d'annonces publiées.

Workflow : 12616d0d-0386-4d21-afc2-32491c3bd744. Exécutions : c0a14ad7-d772-4478-9da9-888c84a9284c et 7e5e5251-6436-41d1-a4c9-d72c194e6edd.

## Portails
L'ancienne base Supabase avait été supprimée. Les portails A, B et C sont rebranchés sur une nouvelle base gratuite (projet `ghost-portails`, compte de Vladimir). Ils fonctionnent de nouveau.
