# Site Ghost

Le produit : landing, tarifs de démonstration, inscription et connexion (Supabase Auth), paiement en **mode démo**, questionnaire, portail de la personne.

Prototype : https://ghost-new-era.vercel.app · Next.js (App Router, TypeScript) · déployé sur Vercel, racine `ghost-new-era/site`.

## Pages

| Route | Rôle |
|---|---|
| `/` , `/tarifs` | Landing et tarifs (valeurs d'exemple : le prix réel reste à décider) |
| `/inscription` , `/connexion` | Compte (Supabase Auth) |
| `/paiement` | Façade « mode démo » : écrit une ligne dans `abonnements`, aucune donnée bancaire |
| `/questionnaire` | Contexte de la personne, enregistré dans `profils` |
| `/portail` | Accord outil par outil, pastille avec pause, partage d'onglet, proposition de Ghost |

## Routes serveur (`app/api`)

| Route | Rôle |
|---|---|
| `/api/session` | Crée la session d'observation et enregistre les accords (`sessions_audit`, `consentements`) |
| `/api/capture` | Reçoit une capture, la fait lire par Holo (`lib/holo.ts`), garde seulement le **résumé** (`captures_lues`), crée la proposition si la base confirme l'arrivée de Karim |
| `/api/proposition` | Enregistre la réponse de la personne (acceptée ou refusée) |

Les routes vérifient le jeton de connexion et que la session appartient à la personne.

## Variables d'environnement

Voir `.env.example`. Les clés ne sont **jamais** dans le dépôt : fichier `.env.local` en local, variables du projet Vercel en ligne.

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clés publiques, navigateur |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur seulement, jamais dans une variable `NEXT_PUBLIC_` |
| `HAI_API_KEY`, `HOLO_MODELE` | Lecture des captures par Holo, serveur seulement |
| `NEXT_PUBLIC_INTRANET_URL` | Adresse de l'intranet (valeur par défaut dans le code) |

## Lancer en local

```bash
npm install && npm run dev
```

Charte graphique : [`../docs/charte`](../docs/charte/CHARTE-GRAPHIQUE.md).
