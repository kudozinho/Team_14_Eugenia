# Ghost UI (Next.js)

Interface du compte rendu : tableau de bord et rapport. Fausses données de l'Agence Belvédère.

```bash
cd binta-cpo/app/ghost-ui
npm install
npm run dev    # http://localhost:3100
```

- `/` : tableau de bord (heures récupérables, tâches classées, matrice gain / effort)
- `/rapport` : fiche opportunité à 2 axes et bouton « Prouver avec l'agent »
- Données : `data/*.json` (exemples, formes de `commun/contrats.md`). Jeudi : lecture Supabase (`.env.example`).
- Aucune donnée par personne n'est affichée.
