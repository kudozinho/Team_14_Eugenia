# Test de bout en bout « Prouver » sur Windows

Ce guide vérifie le bouton avec le PC Windows d’Henriquet. Le Recorder n’est pas nécessaire pour ce test : on vérifie le parcours entre le rapport, Supabase, le script d’écoute et l’Agent H.

## Données de ce test

- Tâche Supabase : `tache_a1a0c7545c805f328eba1e25`
- Mandat fictif : `M-0142`
- Référence humaine validée : **244 s (4 min 04)**, moyenne de trois chronométrages manuels
- Gain annuel : **non validé**

## Conditions avant de cliquer

1. Mettre le dépôt à jour depuis `main` sur le PC d’Henriquet.
2. Utiliser les portails actifs et inscriptibles : `ghost-portail-a.vercel.app`, `ghost-portail-b.vercel.app` et `ghost-portail-c.vercel.app`. Ne pas utiliser les prévisualisations `*-v2.vercel.app` : elles sont en lecture seule et bloquent les publications et remises à zéro.
3. Vérifier que les portails actifs sont accessibles sans connexion, et que le site C accepte une photo.
4. Dans un fichier `.env` local à la racine du dépôt, vérifier que `HAI_API_KEY`, `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont renseignées. `lancer_agent.py` charge ce fichier. Confirmer qu’il s’agit bien de la clé H d’équipe prévue pour la démo : la qualification précédente de la tâche a utilisé un accès personnel, et la clé d’équipe restait à valider dans le bilan CAIO. Garder les clés sur le PC ; ne pas les copier dans un message, une capture ou GitHub.
5. Garder `PORTAIL_A_URL`, `PORTAIL_B_URL` et `PORTAIL_C_URL` absentes pour utiliser les domaines actifs par défaut, ou les régler sur ces domaines sans chemin `/deposer`, `/nouvelle` ou `/publier`. Ne pas les faire pointer vers les prévisualisations `*-v2`.
6. Le script vide les portails au début si `RESET_TOKEN` est défini. Confirmer que ces sites ne contiennent que les annonces fictives de test et qu’aucun autre essai n’est en cours avant de le lancer.

## Préparer le PC

Dans PowerShell, depuis la racine du dépôt :

```powershell
cd alejandro-cto/agent-h
py -3 --version
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Si PowerShell bloque l’activation, ne change pas la politique de sécurité du poste : ouvre `cmd.exe`, active avec `.venv\Scripts\activate.bat`, puis continue.

Dans cette même fenêtre, lancer l’écouteur :

```powershell
python attendre_prouver.py --mandat M-0142
```

Laisser cette fenêtre ouverte. Un seul écouteur doit tourner pour ce test.

## Ouvrir le rapport localement

Dans un second PowerShell, depuis la racine du dépôt :

```powershell
cd binta-cpo/app/ghost-ui
npm install
```

Créer `.env.local` à partir de `.env.example` et renseigner les mêmes `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`, puis `TACHE_ID=tache_a1a0c7545c805f328eba1e25`. Lancer :

```powershell
npm run dev
```

Ouvrir `http://localhost:3100/rapport`. Si le dashboard est déjà déployé avec ces trois variables, on peut l’ouvrir à la place ; vérifier qu’il affiche bien cette tâche avant de cliquer.

## Exécuter et contrôler

1. Vérifier que le rapport affiche la tâche attendue et **4 min 04 à la main**. Il ne doit pas reprendre les 12 minutes du scénario d’exemple.
2. Cliquer **« Prouver avec l’agent »** une seule fois.
3. Dans la fenêtre de l’écouteur, vérifier qu’il prend le clic et démarre l’Agent H.
4. Attendre la fin, puis vérifier dans le rapport que l’exécution est `completed`, que les trois portails sont vérifiés et que la durée de l’agent est comparée à **244 s**.
5. Relire les annonces sur A, B et C, y compris la photo sur C. Vérifier aussi que le résultat est écrit dans la même ligne `executions_agent` créée au clic, avec le bon `tache_id`.
6. Recharger le rapport : les mêmes exécution et référence manuelle doivent rester affichées. Noter la durée réelle et les éventuelles erreurs. Ne pas annoncer de gain annuel avant validation de ses hypothèses.

Si le clic reste en cours, vérifier d’abord que l’écouteur tourne, que les deux environnements pointent sur la même base, que le `TACHE_ID` est correct et que le site consulté n’est pas une prévisualisation en lecture seule. Ne pas fusionner ni annoncer le test comme réussi avant le contrôle des trois annonces.
