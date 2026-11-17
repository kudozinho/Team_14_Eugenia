# Ghost : « See the work. Ghost the task. »
*Voir le travail. Faire disparaître la corvée.*

Team 14 · Hackathon Build The Future (Eugenia × H Company) · 16 au 20 novembre 2026

## À lire en premier (10 minutes)
1. Ce README.
2. **Ta fiche** : `<prénom-rôle>/FICHE.md`. Tes tâches jour par jour, ce que tu reçois et de qui, ce que tu livres et à qui, quand c'est « terminé », et ton prompt de départ prêt à coller dans Fable.
3. Les documents de la roadmap cités en haut de ta fiche (`commun/roadmap/`).

## Ghost en 3 phrases
Ghost observe le travail sur écran, **uniquement dans les logiciels et les sites que le salarié autorise**, détecte les tâches répétitives, les note, et fait exécuter l'une d'elles par l'agent de H Company pour **chronométrer le gain**.
Il livre un plan : pour chaque tâche, le bon outil. **API disponible → n8n. Pas d'API → agent H. Déjà couvert par le logiciel du client → rien à construire.**
Démo : l'Agence Belvédère (fictive, Massy). Une assistante recopie chaque annonce sur **3 sites sans passerelle** : 12 minutes à la main, environ 1 min 35 pour l'agent.

## Ce qui a changé après la roadmap (lundi soir)
| Sujet | Décision |
|---|---|
| Cas de démo | « Recopier une annonce sur 3 **sites sans passerelle** » (les grands portails sont déjà couverts par les logiciels métier). La personne observée est l'**assistante**, pas le négociateur. |
| Autorisation du navigateur | **Par site** (liste blanche), plus par application. Chrome coché sans site = rien n'est capté. |
| Coupé cette semaine | Extension Chrome, Windows, paiement. L'adresse de l'onglet se lit depuis l'application Mac. |
| Nouveaux contrats | §1 bis (événement `hors_perimetre` + `duree_s`), §7 contexte d'entreprise, §8 poste, §9 prompt 3 couches, §10 score, §11 fiche, §12 test de l'agent. Tout est dans `commun/contrats.md` et déjà dans le schéma. |
| Chiffres | On affiche **205 h/an justifiées tâche par tâche**, pas 990 h. On ne compare plus à « un junior à 1 000-2 000 €/jour » mais à « 2 à 3 jours de consultant ». |
| Agence et gain (décision du mardi 17) | **Un seul effectif : 10 personnes** (1 gérante, 6 négociateurs, 2 assistantes, 1 gestionnaire locatif). **Un seul chiffre sur les slides : 205 h/an**, les 3 tâches de la matrice. Les autres pistes (155 h/an) sont « à confirmer pendant l'audit » et ne s'additionnent jamais au chiffre des slides. Source unique : `commun/donnees/taches-semaine-agence.json`. |
| Tableur de suivi (décision du mardi 17) | **Google Sheets** (dans Chrome, site `docs.google.com` autorisé), plus Excel. |
| Conformité | Ghost est présenté comme **le contre-modèle de la sanction CNIL de 2024** (secteur immobilier). Le gérant voit des tâches, jamais des personnes. |

## Le dépôt
```
README.md                ← ce fichier
commun/
  contrats.md            ← les formats communs : tout le monde code avec
  schema-supabase.sql    ← la base complète, à coller dans Supabase (version 2)
  donnees/               ← les fausses données pour travailler sans attendre les autres
  roadmap/               ← les 7 documents de la roadmap (stratégie, prix, démo, équipe, conformité, tests, scoring)
  architecture.md        ← première version du plan technique (la version à jour est dans roadmap/03)
  prompt-fable-roadmap.md
assel-ceo/       alejandro-cto/      omar-caio/
vladimir-cao/    henriquet-cdo/      binta-cpo/
                 ← un dossier par personne : FICHE.md + ses dossiers de code
```

**Fausses données disponibles** (`commun/donnees/`) : événements d'une journée d'assistante, tâches détectées avec score, profils métier (immobilier, compta, avocat), contexte de l'agence fictive, 3 postes, exemples de tests de l'agent. La fiche opportunité d'exemple est dans `commun/roadmap/07` (Binta la passe en JSON mardi).

## La règle d'or
**Tu n'attends jamais la brique d'un autre.** Tant qu'elle n'est pas prête, tu travailles avec les fausses données. Le jour du branchement, ça marche parce que tout le monde a respecté `commun/contrats.md`. On ne modifie `commun/` qu'après avoir prévenu Alejandro.

## Les branchements
| Quand | Quoi | Qui branche | Qui teste |
|---|---|---|---|
| Mardi 12h | Base ouverte à tous | Henriquet | Chacun |
| Mardi 18h | Filtres dans le Recorder | Omar + Alejandro | Omar |
| Mercredi 11h | Recorder → base | Alejandro + Henriquet | Henriquet |
| Mercredi 12h | Formulaire → n8n → contexte → prompt | Vladimir + Omar | Omar |
| Mercredi 14h | Base → détection | Omar + Henriquet | Henriquet |
| Mercredi 16h | Détection → agent H | Omar + Alejandro | Vladimir |
| **Mercredi 17h30** | **Test de bout en bout n°1** (après l'envoi du CP2) | Tous | Assel |
| Jeudi 10h | Détection → n8n | Vladimir + Omar | Vladimir |
| Jeudi 11h | Tout → interface | Binta + Alejandro | Binta |
| Jeudi 12h | Score → interface | Henriquet + Binta | Binta |
| **Jeudi 14h** | **Test de bout en bout n°2** : 3 passages de suite | Tous | Assel |

Points d'équipe : **9h** (15 min, objectifs du jour) et **18h30** (15 min : « la démo tourne-t-elle de bout en bout ? »).

## Le chemin critique
Recorder → filtres → détection → agent H → chrono. **On ne coupe jamais** : capture réelle, floutage, agent en live, chrono.
Si le retard s'accumule, on coupe dans cet ordre : sous-agents → Holo en local → comparaison de modèles → mode vocal en live (vidéo à la place) → 2e et 3e workflows n8n → formulaire en live (tableur rempli à la main).

## Bloqué ou en avance
- **Bloqué plus de 30 minutes** : un message dans le groupe (ce que j'essaie, ce qui bloque, ce que j'ai tenté). Assel tranche en 10 minutes.
- **En avance** : 1) aider sur le chemin critique, 2) 10 essais de plus dans le plan de tests de l'agent, 3) 3 lignes dans le journal de retours H, 4) préparer ta partie du pitch.

## Sécurité
- Clés API (H Company, Claude, Supabase) dans un fichier `.env`, **jamais sur GitHub** (le `.gitignore` le protège). Assel les partage en privé.
- La clé « service » de Supabase reste côté serveur, jamais dans le navigateur.
- Uniquement des données fictives cette semaine.
- Chaque session de l'agent H a une limite d'étapes et de durée.
