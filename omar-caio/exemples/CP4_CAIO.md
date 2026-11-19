# Pitch final — éléments CAIO à compléter avec tests réels

- Les filtres de confidentialité tournent localement, avant toute transmission.
- La répétition est décidée en Python ; le LLM ne choisit pas les occurrences ni les durées.
- Le prompt a trois couches (métier, entreprise, poste) et une empreinte SHA-256.
- Décision méthodologique : outil existant > API/n8n > interface sans API/agent H ; ne rien automatiser si preuve insuffisante.
- La synthèse du rapport affiche une médiane agent de 113 s sur trois exécutions et une moyenne humaine de 244 s sur trois essais. Le clic du 18 novembre a donné 98 s sur un essai identifié. Le coût de cet essai et la conformité de la photo restent à confirmer. Le comparatif des deux modèles attend la stabilisation du portail. [Mesures, provenance et cinq limites](../POINT_CAIO_19_NOVEMBRE.md)
- **Ne pas présenter** les résultats du simulateur local comme des mesures Claude ou H Company.
