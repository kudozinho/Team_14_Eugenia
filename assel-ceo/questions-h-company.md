# Questions pour H Company (mentors, personne de H sur place, Discord)

À poser cette semaine. Chaque réponse va dans la slide « Retours sur l'Agent API » (`commun/roadmap/06-tests-agent-h.md`).

## Fiabilité de l'agent
1. `h/web-surfer-flash` nous a donné un faux succès : titre reformulé, puis « publié » annoncé (session 8f893be4). Peut-on le rendre fiable sur des formulaires (consigne, réglage), ou `h/web-surfer-pro` est-il le bon choix pour recopier des valeurs exactes ?
2. Le résumé final de l'agent peut contredire ce qu'il a réellement fait. Existe-t-il un réglage pour limiter ça, ou faut-il toujours vérifier côté application, comme nous le faisons ?
3. Pour une règle métier (« ne publie pas sans classe énergie »), vaut-il mieux la mettre dans la consigne, dans une Skill, ou dans le schéma de réponse ?

## Skills et agents sur mesure
4. Peut-on créer et mettre à jour une Skill par API (`skills.create_skill`) depuis notre audit, puis un agent qui l'utilise (`agents.create_agent`) ? Y a-t-il des limites de taille ou de nombre ?
5. Une Skill peut-elle contenir des fichiers (photo d'annonce, données du mandat) ?

## Coûts et limites
6. Combien coûte en moyenne une session `web-surfer-pro` sur une tâche de 3 formulaires ? Notre mesure : 0,19 $ pour 156 s. Est-ce représentatif ?
7. Combien de sessions peut-on lancer en parallèle avec nos crédits (pour un agent par site) ?
8. Avec quelles offres un client PME tiendrait-il un usage quotidien (une passe par annonce, environ 50 annonces par mois) ?

## Confidentialité et local
9. Holo (poids sur Hugging Face) peut-il tourner sur un Mac récent pour lire un écran sans rien envoyer ? Quel modèle conseillez-vous, et à quelle vitesse par écran ?
10. Le coffre d'identifiants (vault) remplit-il les mots de passe de vrais portails sans que le modèle les voie ? C'est la condition pour passer de nos sites de test à de vrais portails.

## Environnements
11. L'environnement bureau (desktop) est-il disponible dans le cloud, ou seulement en local via le SDK ? Notre cas suivant concerne des logiciels de bureau sans API.
12. Comment l'agent envoie-t-il une photo dans un formulaire ? Nous déposons le fichier dans la session : est-ce la bonne méthode ?
