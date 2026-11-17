# Contrats d'interface : les formats communs (v2)

Tout le monde code avec ces formats. On ne les change pas sans prévenir Alejandro (CTO) et le noter dans le journal de décisions.

## 1. Événement capturé
Produit par : Recorder (Alejandro + Omar) ou mode vocal (Omar). Stocké dans : `evenements`. Lu par : détection (Omar), interface (Binta).

```json
{
  "id": "evt_0001",
  "audit_id": "aud_demo",
  "utilisateur_id": "usr_negociateur",
  "horodatage": "2026-11-18T09:05:10+01:00",
  "appli": "Google Chrome",
  "titre_fenetre": "Portail A - Déposer une annonce",
  "url": "https://portail-a.example/deposer",
  "type": "changement_ecran",
  "texte_nettoye": "Déposer une annonce | Titre : Appartement T3 | Prix : [MONTANT] | Contact : [TELEPHONE]",
  "miniature_url": null,
  "empreinte": "9f3a1c"
}
```
- `type` : `changement_appli`, `changement_fenetre` ou `changement_ecran`.
- `texte_nettoye` : le texte lu à l'écran APRÈS les filtres du profil métier. Les données sensibles sont remplacées par des marqueurs : `[NOM]`, `[TELEPHONE]`, `[EMAIL]`, `[MONTANT]`, `[IBAN]`, `[ADRESSE]`.
- `url` : seulement si l'appli est un navigateur, sinon `null`.
- `empreinte` : empreinte de l'image, sert à jeter les doublons.

## 2. Tâche détectée
Produite par : détection (Omar). Stockée dans : `taches_detectees`. Lue par : agent H (Alejandro), n8n (Vladimir), interface (Binta).

```json
{
  "id": "tache_001",
  "audit_id": "aud_demo",
  "nom": "Publier la même annonce sur 3 portails",
  "sequence": ["ImmoGest / fiche mandat", "Portail A / formulaire", "Portail B / formulaire", "Portail C / formulaire"],
  "occurrences": 3,
  "duree_moyenne_s": 720,
  "temps_perdu_semaine_min": 180,
  "automatisable": true,
  "methode": "agent_h",
  "gain_estime_h_semaine": 2.5,
  "instructions_agent": "Ouvre chaque portail, clique sur Déposer une annonce, remplis le formulaire avec les données fournies, valide, et note l'adresse de l'annonce publiée.",
  "workflow_n8n_modele": "multidiffusion_annonce",
  "confiance": 0.8
}
```
- `methode` : `agent_h`, `n8n` ou `les_deux`.
- `workflow_n8n_modele` : le nom d'un modèle préparé par Vladimir, ou `null`.

## 3. Demande d'exécution à l'agent H
Produite par : interface (bouton « Prouver avec l'agent ») ou script d'Alejandro. Envoyée à : l'Agent API de H Company.

```json
{
  "tache_id": "tache_001",
  "agent": "ghost-multidiffusion",
  "start_url": "https://portail-a.example/deposer",
  "consignes": "(= instructions_agent de la tâche)",
  "donnees": {
    "titre": "Appartement T3 lumineux",
    "prix": 289000,
    "surface_m2": 68,
    "ville": "Massy",
    "description": "T3 au 2e étage, proche RER, balcon."
  },
  "portails": ["https://portail-a.example/deposer", "https://portail-b.example/nouvelle", "https://portail-c.example/publier"]
}
```

## 4. Résultat de l'agent H
Renvoyé par : l'agent H (grâce à `answer_format`). Stocké dans : `executions_agent`. Lu par : interface (Binta), rapport.

```json
{
  "tache_id": "tache_001",
  "session_id": "(identifiant renvoyé par H)",
  "statut": "completed",
  "duree_s": 95,
  "duree_humaine_s": 720,
  "portails_publies": ["Portail A", "Portail B", "Portail C"],
  "resume": "Annonce publiée sur les 3 portails."
}
```
- `statut` : `completed`, `failed`, `timed_out` ou `interrupted` (les statuts de H).

Le `answer_format` à donner à l'agent H (JSON Schema) :
```json
{
  "type": "object",
  "properties": {
    "portails_publies": { "type": "array", "items": { "type": "string" } },
    "resume": { "type": "string" }
  },
  "required": ["portails_publies", "resume"]
}
```
La durée (`duree_s`) est mesurée par notre code entre le lancement et la fin de la session, pas par l'agent.

## 5. Mode vocal
Produit par : Omar. Stocké dans : `transcriptions`.

```json
{
  "id": "voc_001",
  "audit_id": "aud_demo",
  "utilisateur_id": "usr_negociateur",
  "texte_nettoye": "Le matin je reprends le mandat dans ImmoGest puis je recopie l'annonce sur trois portails...",
  "reformulation": {
    "etapes": ["Ouvrir le mandat dans ImmoGest", "Copier titre, prix, description", "Coller sur le portail A", "Recommencer sur B et C"],
    "outils": ["ImmoGest", "Portail A", "Portail B", "Portail C"],
    "frequence": "3 à 5 fois par semaine",
    "temps_estime_min": 15
  },
  "valide": false,
  "solutions": []
}
```
- `valide` passe à `true` quand l'utilisateur confirme « oui, c'est bien ça ».
- `solutions` : la liste des solutions proposées après validation (même forme qu'une tâche détectée).

## 6. Profil métier
Voir `../commun/donnees/profils-metier.json`. Clés : `id`, `nom`, `contexte`, `logiciels_habituels`, `taches_typiques`, `motifs_a_flouter`, `entites_a_flouter`, `champs_jamais_stockes`, `conservation_jours`, `prompt_systeme`.

---

# Ajouts de la roadmap (v2)
Le schéma `commun/schema-supabase.sql` intègre déjà ces ajouts. La méthode `outil_existant` ou `rien` est aussi possible dans une tâche détectée (règle : API → n8n, pas d'API → agent H, déjà couvert → outil existant).

Les §1 à §6 du kit restent inchangés, sauf deux ajouts au §1.

### §1 bis. Événement : 2 ajouts
- Nouveau `type` : `hors_perimetre`. Fenêtre non autorisée au premier plan. Tous les champs de contenu sont `null`. Sert seulement à garder des durées justes.
- Nouveau champ `duree_s` : temps passé sur l'écran avant l'événement suivant.

```json
{ "id": "evt_0042", "audit_id": "aud_demo", "utilisateur_id": "usr_assistante",
  "horodatage": "2026-11-18T09:12:40+01:00", "appli": null, "titre_fenetre": null, "url": null,
  "type": "hors_perimetre", "texte_nettoye": null, "miniature_url": null, "empreinte": null, "duree_s": 95 }
```

### §7. Contexte d'entreprise (sorti du formulaire)
Produit par : n8n (Vladimir). Stocké dans : `contextes_entreprise`. Lu par : assemblage du prompt (Omar).
```json
{
  "organisation_id": "org_belvedere",
  "profil_metier_id": "immobilier",
  "resume": {
    "activite": "Transaction et gestion locative, Massy et environs",
    "effectif": 10,
    "decideurs": {"achats_logiciels": "gérante", "publication_annonces": "assistantes", "prix_et_mandats": "négociateurs"},
    "outils": ["ImmoGest", "Google Chrome", "Google Sheets", "Messagerie", "Agenda"],
    "process_principaux": ["Prise de mandat", "Publication des annonces", "Visites", "Relances", "Compromis"],
    "irritants": ["Ressaisie des annonces sur 3 sites", "Relances oubliées après visite"],
    "objectifs": ["Libérer 1 jour par semaine aux assistantes"],
    "contraintes": ["Ne jamais stocker les coordonnées des prospects", "Pas d'envoi automatique d'e-mail sans validation"]
  }
}
```

### §8. Poste
```json
{
  "id": "poste_assistante", "organisation_id": "org_belvedere", "intitule": "Assistante commerciale",
  "missions": ["Publier et mettre à jour les annonces", "Préparer les dossiers de mandat", "Accueil téléphonique"],
  "outils": ["ImmoGest", "Google Chrome", "Google Sheets"],
  "peut_decider": ["Mise en ligne d'une annonce validée"],
  "ne_peut_pas": ["Modifier un prix", "Signer un mandat"]
}
```

### §9. Prompt système assemblé
Produit par : fonction `assembler_prompt(profil, contexte, poste)` (Omar). Stocké dans : `prompts_systeme`.
```json
{ "id": "prm_001", "organisation_id": "org_belvedere", "poste_id": "poste_assistante",
  "version": 1, "empreinte": "a41f09", "contenu": "(texte des 3 couches, voir 07)" }
```
`empreinte` = empreinte du texte. Elle est recopiée dans chaque tâche détectée : on sait toujours quel prompt a produit quel résultat.

### §10. Score (ajouté à la tâche détectée, champ `score`)
```json
{ "gain": 3, "facilite": 4, "effort": 2, "risque": 2, "confiance": 4,
  "total": 73, "heures_an": 49, "quadrant": "gain_rapide",
  "hypotheses": ["2 assistantes", "300 opérations par an et par personne", "10 min gagnées", "adoption 70 %", "part récupérée 70 %"] }
```
`quadrant` : `gain_rapide`, `projet`, `a_regrouper`, `a_ecarter`.

### §11. Fiche opportunité (champ `fiche` de la tâche détectée)
Modèle complet en `07`. Clés de premier niveau : `metier` et `technique`.

### §12. Résultat d'un test de l'agent (table `tests_agent`)
Produit par : script de test (Alejandro, Vladimir). Lu par : rapport de retours (Assel).
```json
{ "id": "tst_0031", "niveau": 3, "cas": "3 sites, champs différents", "modele": "holo4-35b-a3b",
  "essai": 4, "statut": "completed", "reussi": true, "duree_s": 102, "etapes": 37,
  "cout_usd": 0.11, "erreur": null, "contournement": null, "session_id": "(renvoyé par H)" }
```
`reussi` est vérifié **par notre code** (les 3 annonces existent dans `annonces_portails` avec les bons champs), pas par la réponse de l'agent.

