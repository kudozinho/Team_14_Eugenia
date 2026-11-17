-- Schéma Supabase de Ghost (à coller tel quel dans l'éditeur SQL de Supabase)
-- Version 2 : intègre les ajouts de la roadmap (commun/roadmap/04-equipe-chantiers.md).
-- Identifiants en texte pour coller aux données d'exemple du kit.

create table profils_metier (
  id text primary key,
  nom text not null,
  config jsonb not null,            -- contexte, motifs à flouter, base_connaissances, prompt de la couche métier
  cree_le timestamptz default now()
);

create table organisations (
  id text primary key default gen_random_uuid()::text,
  nom text not null,
  profil_metier_id text references profils_metier(id),
  cree_le timestamptz default now()
);

-- Contexte d'entreprise issu du formulaire avant audit (contrat §7)
create table contextes_entreprise (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  reponses jsonb not null,
  resume jsonb,
  cree_le timestamptz default now()
);

-- Postes (contrat §8) : on décrit des postes, pas des personnes
create table postes (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  intitule text not null,
  missions jsonb,
  outils jsonb,
  peut_decider jsonb,
  ne_peut_pas jsonb
);

create table utilisateurs (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  poste_id text references postes(id),
  nom text not null,
  email text,
  role text check (role in ('gerant', 'collaborateur', 'personnel')) default 'collaborateur',
  mode_analyse text check (mode_analyse in ('questionnaire', 'vocal', 'ecran')),
  consentement_le timestamptz,
  cree_le timestamptz default now()
);

create table applis_autorisees (
  id text primary key default gen_random_uuid()::text,
  utilisateur_id text references utilisateurs(id) on delete cascade,
  appli text not null,
  cree_le timestamptz default now()
);

-- Liste blanche de sites pour les navigateurs (autoriser Chrome seul ne capte rien)
create table sites_autorises (
  id text primary key default gen_random_uuid()::text,
  utilisateur_id text references utilisateurs(id) on delete cascade,
  domaine text not null
);

-- Prompt système assemblé en 3 couches (contrat §9)
create table prompts_systeme (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  poste_id text references postes(id),
  version int default 1,
  empreinte text not null,
  contenu text not null,
  cree_le timestamptz default now()
);

create table audits (
  id text primary key default gen_random_uuid()::text,
  organisation_id text references organisations(id) on delete cascade,
  debut timestamptz default now(),
  fin timestamptz,
  statut text check (statut in ('en_cours', 'termine', 'supprime')) default 'en_cours'
);

-- Événements capturés (contrat §1 et §1 bis)
create table evenements (
  id text primary key default gen_random_uuid()::text,
  audit_id text references audits(id) on delete cascade,
  utilisateur_id text references utilisateurs(id) on delete cascade,
  horodatage timestamptz not null,
  appli text,
  titre_fenetre text,
  url text,
  type text check (type in ('changement_appli', 'changement_fenetre', 'changement_ecran', 'hors_perimetre')),
  texte_nettoye text,
  miniature_url text,
  empreinte text,
  duree_s int
);
create index on evenements (audit_id, horodatage);

create table transcriptions (
  id text primary key default gen_random_uuid()::text,
  audit_id text references audits(id) on delete cascade,
  utilisateur_id text references utilisateurs(id) on delete cascade,
  texte_nettoye text,
  reformulation jsonb,
  valide boolean default false,
  solutions jsonb default '[]'::jsonb,
  cree_le timestamptz default now()
);

-- Tâches détectées (contrat §2, avec score §10 et fiche §11)
create table taches_detectees (
  id text primary key default gen_random_uuid()::text,
  audit_id text references audits(id) on delete cascade,
  nom text not null,
  sequence jsonb,
  occurrences int,
  duree_moyenne_s int,
  temps_perdu_semaine_min int,
  automatisable boolean,
  methode text check (methode in ('agent_h', 'n8n', 'les_deux', 'outil_existant', 'rien')),
  gain_estime_h_semaine numeric,
  instructions_agent text,
  workflow_n8n_modele text,
  confiance numeric,
  score jsonb,
  fiche jsonb,
  prompt_empreinte text,
  cree_le timestamptz default now()
);

create table executions_agent (
  id text primary key default gen_random_uuid()::text,
  tache_id text references taches_detectees(id) on delete cascade,
  session_id text,
  statut text check (statut in ('completed', 'failed', 'timed_out', 'interrupted', 'en_cours')),
  duree_s int,
  duree_humaine_s int,
  portails_publies jsonb,
  resume text,
  cree_le timestamptz default now()
);

-- Résultats des séries de tests de l'agent H (contrat §12)
create table tests_agent (
  id text primary key default gen_random_uuid()::text,
  niveau int,
  cas text,
  modele text,
  essai int,
  statut text,
  reussi boolean,
  duree_s int,
  etapes int,
  cout_usd numeric,
  erreur text,
  contournement text,
  session_id text,
  cree_le timestamptz default now()
);

create table rapports (
  id text primary key default gen_random_uuid()::text,
  audit_id text references audits(id) on delete cascade,
  contenu jsonb not null,
  cree_le timestamptz default now()
);

-- Annonces déposées sur les 3 sites de test (pour vérifier le travail de l'agent H)
create table annonces_portails (
  id text primary key default gen_random_uuid()::text,
  portail text not null,
  titre text,
  prix int,
  surface_m2 int,
  ville text,
  description text,
  cree_le timestamptz default now()
);

-- Sécurité : sécurité par ligne activée partout.
-- Cette semaine, le Recorder et les scripts écrivent avec la clé « service » côté serveur uniquement (jamais dans le navigateur).
alter table profils_metier enable row level security;
alter table organisations enable row level security;
alter table contextes_entreprise enable row level security;
alter table postes enable row level security;
alter table utilisateurs enable row level security;
alter table applis_autorisees enable row level security;
alter table sites_autorises enable row level security;
alter table prompts_systeme enable row level security;
alter table audits enable row level security;
alter table evenements enable row level security;
alter table transcriptions enable row level security;
alter table taches_detectees enable row level security;
alter table executions_agent enable row level security;
alter table tests_agent enable row level security;
alter table rapports enable row level security;
alter table annonces_portails enable row level security;

-- Temps réel pour le tableau de bord de la démo
alter publication supabase_realtime add table evenements, taches_detectees, executions_agent;
