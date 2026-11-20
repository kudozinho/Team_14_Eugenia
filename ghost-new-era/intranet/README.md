# Intranet d'Atelier Nova (faux client)

Ce n'est **pas** un site vitrine : ce sont les outils internes d'une PME **fictive**, Atelier Nova. Sophie y travaille, et les agents H y cliquent comme sur des outils sans API. Données 100 % fictives. Déployé à part du site Ghost, avec sa propre identité (bleu ardoise, logo fictif).

Adresse : https://atelier-nova-intranet.vercel.app/intranet/rh · Next.js · Vercel, racine `ghost-new-era/intranet`. Public, sans connexion.

| Espace | Route | Contenu |
|---|---|---|
| RH et badges | `/intranet/rh` | Notification d'arrivée, personnes, fiche, accès, badge, matériel (la validation d'une commande est réservée à une personne) |
| Messagerie | `/intranet/messagerie` | Canaux, messages, demandes de parrain et de café |
| Wiki | `/intranet/wiki` | Pages, recherche par poste, création, checklists jour 1, semaine 1, mois 1 |

## Règles de conception (un agent lit l'écran)

Libellés clairs et stables, menu toujours visible, aucune animation, aucune fenêtre surgissante, bandeau « Environnement de test fictif ». Chaque action écrit dans Supabase par une route serveur : c'est ce qui permet de la **vérifier** (vue `v_onboarding`).

## Variables d'environnement

`NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (serveur seulement). Voir `.env.example`. Jamais de clé dans le dépôt.

## Lancer en local

```bash
npm install && npm run dev
```
