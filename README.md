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

## Planning resserré (décision du mardi 17, 13h40) : tout fini mercredi 18h
Priorité au cœur du produit : **audit → compte rendu**, avec l'agent H comme preuve dans le compte rendu. Jeudi = marge (fiabiliser, mesurer, répéter, deck).

**Livré mercredi soir** : 1) audit (capture des sites autorisés, floutage, tâche détectée) ; 2) compte rendu (tâche, score, fiche à 2 axes, 205 h/an) ; 3) preuve (l'agent H refait la tâche sur les 3 sites, chrono dans le rapport).

**Coupé ou repoussé** : mode vocal et formulaire → n8n → prompt (contexte de l'agence en dur) ; n8n réduit à l'alerte J2 ; benchmark, sous-agents et Holo en local seulement jeudi si tout marche ; interface réduite à 2 écrans (tableau de bord, rapport).

| Quand | Alejandro | Omar | Vladimir | Henriquet | Binta |
|---|---|---|---|---|---|
| **Mardi, d'ici 18h30** | Recorder testé sur Mac ; agent H sur le site A | Analyse branchée sur Holo | 3 sites en ligne, adresses envoyées | Mandats, prospects, vrais domaines ; PR vers main | Interface Next.js : tableau de bord |
| **Mercredi matin** | Agent H sur les 3 sites, résultat en base | Détection sur les vraies sessions | Alerte J2 ; aide à l'agent H | 9h-10h : 2 sessions jouées sur Mac | Page rapport sur les fichiers d'exemple |
| **Mercredi 14h** | Bout en bout n°1 : session → tâche → rapport → agent | Tâche détectée envoyée à l'agent | Chronos main / agent | Scores et gain en base | Rapport branché sur la base |
| **Mercredi 17h** | CP2 envoyé (Assel) | | | | Loom |
| **Mercredi 18h** | **Bout en bout n°2 : 3 passages de suite. Gel de la base de démo.** | | | | |
| Jeudi | Vidéo de secours, tests de l'agent | Benchmark Holo si le temps le permet | Tests de l'agent | Chiffres finaux | Deck, répétitions |

Assel : script de démo et questions difficiles mercredi soir, deck avec Binta jeudi.
Test décisif ce soir 18h30 : Recorder sur Mac + agent H sur un site. Si l'un échoue, plan B (capture plein écran, ou agent prêt à l'emploi avec consigne écrite à la main).

## Le dépôt
```
README.md                     ← ce fichier
commun/                       ← partagé : on ne le modifie qu'après avoir prévenu Alejandro
  contrats.md                 ← les formats communs : tout le monde code avec
  schema-supabase.sql         ← la base complète (version 2)
  donnees/                    ← fausses données (événements, tâches, profils, agence, postes, semaine type)
  roadmap/                    ← les 7 documents de la roadmap (stratégie, prix, démo, équipe, conformité, tests, scoring)
  archives/                   ← anciennes versions, pour mémoire seulement
alejandro-cto/  recorder/     ← Ghost Recorder (capture des fenêtres autorisées, Windows + Mac)
                agent-h/      ← appel à l'agent H Company
omar-caio/      filtres/      ← floutage local nettoyer()
                detection/    ← séquences répétées, prompts 3 couches, analyse par le modèle
                vocal/        ← prompts du mode vocal (coupé cette semaine)
vladimir-cao/   portails/     ← les 3 sites de test A, B, C (Next.js)
                n8n/          ← workflows exportés (alerte J2)
henriquet-cdo/  supabase/     ← données de départ, purge, test de connexion
                donnees/      ← agence Belvédère fictive (mandats, prospects)
binta-cpo/      app/ghost-ui/ ← interface Next.js (tableau de bord, rapport)
                app/maquette/ ← maquette HTML des écrans de démo
                pitch/        ← formulaire, fiche opportunité
assel-ceo/      journal/      ← revues et décisions
```
Chaque dossier personnel a sa `FICHE.md` (tâches, entrées, sorties, prompt de départ).

## Lancer chaque brique
| Brique | Commande (depuis la racine) | Clés dans `.env` |
|---|---|---|
| Recorder | `cd alejandro-cto/recorder && pip install -r requirements.txt && python recorder.py` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (facultatif) |
| Agent H | `cd alejandro-cto/agent-h && pip install -r requirements.txt && python premier_appel.py --start-url <site A>` | `HAI_API_KEY` |
| Floutage et détection | `PYTHONPATH=omar-caio python -m pytest omar-caio/tests -q` | aucune |
| Sites de test | `cd vladimir-cao/portails && npm install && npm run dev:a` (`dev:b`, `dev:c`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (sinon mode mémoire) |
| Interface | `cd binta-cpo/app/ghost-ui && npm install && npm run dev` | aucune pour l'instant (fichiers d'exemple) |
| Base | coller `commun/schema-supabase.sql`, puis les fichiers de `henriquet-cdo/supabase/` | - |

Les tests et les deux applications Next.js sont vérifiés automatiquement à chaque push (onglet **Actions** de GitHub).

**Fausses données** (`commun/donnees/`) : événements d'une journée d'assistante, tâches détectées avec score, profils métier (immobilier, compta, avocat), contexte de l'agence, 3 postes, exemples de tests de l'agent, semaine type (source unique des chiffres : 205 h/an justifiées). Fiche opportunité d'exemple : `binta-cpo/pitch/fiche-opportunite-exemple.json`.

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
