-- GHOST New Era : schéma Supabase (Henriquet, CDO)
-- Atelier Nova, PME fictive. Données 100 % fictives.
-- Sécurité : RLS activée partout. Aucune politique pour anon : le navigateur ne lit rien directement.
-- L'intranet et l'orchestration écrivent par des routes serveur avec la clé service_role.
-- Seules exceptions : profils et abonnements, lisibles et modifiables par leur propriétaire connecté (Supabase Auth).
-- Aucune image n'est jamais stockée.

create extension if not exists pgcrypto;

-- ===== Compte de l'utilisatrice (portail Ghost) =====
create table if not exists public.profils (
  user_id uuid primary key,
  prenom text, nom text, role text, secteur text, taille_entreprise text,
  onboardings_par_an int, recrutements_par_an int, departs_par_an int,
  outils_utilises text[] not null default '{}',
  outils_interdits text[] not null default '{}'
);

create table if not exists public.abonnements (
  user_id uuid primary key,
  plan text not null default 'demo',
  statut text not null default 'demo' check (statut in ('demo')),
  cree_le timestamptz not null default now()
);

-- ===== Atelier Nova : les personnes et les arrivées =====
create table if not exists public.personnes (
  id text primary key default gen_random_uuid()::text,
  prenom text not null, nom text not null,
  poste text not null, equipe text not null,
  manager_id text references public.personnes(id),
  date_arrivee date,
  statut text not null check (statut in ('en_poste','arrivee_prevue'))
);

create table if not exists public.arrivees (
  id text primary key default gen_random_uuid()::text,
  personne_id text not null references public.personnes(id),
  statut text not null default 'nouvelle' check (statut in ('nouvelle','en_cours','terminee')),
  cree_le timestamptz not null default now()
);

-- ===== Espace RH et badges =====
create table if not exists public.rh_fiches (
  personne_id text primary key references public.personnes(id),
  poste text, equipe text,
  manager_id text references public.personnes(id),
  date_arrivee date,
  statut_fiche text not null default 'vide' check (statut_fiche in ('vide','creee'))
);

create table if not exists public.catalogue_acces (
  poste text not null, outil text not null, niveau text not null,
  primary key (poste, outil)
);

create table if not exists public.rh_acces (
  personne_id text not null references public.personnes(id),
  outil text not null, niveau text not null,
  statut text not null default 'demande' check (statut in ('demande','accorde')),
  primary key (personne_id, outil)
);

create table if not exists public.rh_badges (
  personne_id text primary key references public.personnes(id),
  zones text[] not null default '{}',
  statut text not null default 'a_demander' check (statut in ('a_demander','demande','pret'))
);

-- Irréversible : seul un humain passe une ligne en « valide ».
create table if not exists public.rh_materiel (
  id text primary key default gen_random_uuid()::text,
  personne_id text not null references public.personnes(id),
  article text not null,
  statut text not null default 'a_valider' check (statut in ('a_valider','valide'))
);

-- ===== Messagerie =====
create table if not exists public.msg_canaux (
  id text primary key,
  nom text not null, description text
);

create table if not exists public.msg_messages (
  id text primary key default gen_random_uuid()::text,
  canal_id text not null references public.msg_canaux(id),
  auteur text not null, texte text not null,
  cree_le timestamptz not null default now()
);

create table if not exists public.msg_demandes (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('parrain','cafe')),
  personne_id text not null references public.personnes(id),
  destinataire_id text references public.personnes(id),
  statut text not null default 'envoyee' check (statut in ('envoyee','acceptee')),
  creneau timestamptz
);

-- ===== Wiki =====
create table if not exists public.wiki_pages (
  id text primary key default gen_random_uuid()::text,
  titre text not null, espace text not null,
  role_cible text, tags text[] not null default '{}',
  contenu text not null default '', cree_par text
);

create table if not exists public.wiki_checklists (
  id text primary key default gen_random_uuid()::text,
  personne_id text not null references public.personnes(id),
  periode text not null check (periode in ('jour1','semaine1','mois1')),
  libelle text not null,
  coche boolean not null default false
);

-- ===== Observation (Ghost) =====
create table if not exists public.sessions_audit (
  id text primary key default gen_random_uuid()::text,
  user_id uuid,
  outils_autorises text[] not null default '{}',
  statut text not null default 'en_cours',
  debut timestamptz not null default now(), fin timestamptz
);

create table if not exists public.consentements (
  session_id text not null references public.sessions_audit(id) on delete cascade,
  outil text not null, accorde boolean not null,
  horodatage timestamptz not null default now(),
  primary key (session_id, outil)
);

create table if not exists public.vocaux (
  id text primary key default gen_random_uuid()::text,
  session_id text references public.sessions_audit(id) on delete cascade,
  transcription text not null,
  cree_le timestamptz not null default now()
);

-- Jamais d'image : seulement le résumé texte de Holo.
create table if not exists public.captures_lues (
  id text primary key default gen_random_uuid()::text,
  session_id text references public.sessions_audit(id) on delete cascade,
  horodatage timestamptz not null default now(),
  resume_holo text, latence_ms int,
  memoire boolean not null default false
);

create table if not exists public.taches_detectees (
  id text primary key default gen_random_uuid()::text,
  session_id text references public.sessions_audit(id) on delete cascade,
  libelle text not null,
  outils text[] not null default '{}',
  confiance numeric check (confiance between 0 and 1),
  declencheur_arrivee_id text references public.arrivees(id)
);

create table if not exists public.propositions (
  id text primary key default gen_random_uuid()::text,
  tache_id text references public.taches_detectees(id) on delete cascade,
  texte text not null,
  statut text not null default 'proposee' check (statut in ('proposee','acceptee','refusee'))
);

-- ===== Agents H =====
create table if not exists public.agents_runs (
  id text primary key default gen_random_uuid()::text,
  proposition_id text references public.propositions(id),
  agent text not null check (agent in ('acces','equipe','docs')),
  statut text not null default 'en_cours' check (statut in ('en_cours','termine','echec','en_attente')),
  session_h_id text, vue_directe_url text,
  debut timestamptz not null default now(), fin timestamptz,
  actions_total int not null default 0,
  actions_verifiees int not null default 0,
  cout_credits numeric
);

create table if not exists public.agents_evenements (
  id text primary key default gen_random_uuid()::text,
  run_id text not null references public.agents_runs(id) on delete cascade,
  horodatage timestamptz not null default now(),
  action text not null, outil text,
  statut text not null check (statut in ('en_cours','ok','echec','question','attente_validation')),
  detail text
);

create table if not exists public.decisions_humaines (
  id text primary key default gen_random_uuid()::text,
  run_id text references public.agents_runs(id) on delete cascade,
  libelle text not null,
  statut text not null default 'en_attente' check (statut in ('en_attente','validee')),
  reponse text
);

-- ===== Sécurité =====
do $$
declare t text;
begin
  foreach t in array array['profils','abonnements','personnes','arrivees','rh_fiches','catalogue_acces','rh_acces',
    'rh_badges','rh_materiel','msg_canaux','msg_messages','msg_demandes','wiki_pages','wiki_checklists',
    'sessions_audit','consentements','vocaux','captures_lues','taches_detectees','propositions',
    'agents_runs','agents_evenements','decisions_humaines'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke all on public.%I from authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- Propriétaire connecté : son profil et son abonnement uniquement.
grant select, insert, update on public.profils to authenticated;
grant select, insert on public.abonnements to authenticated;
drop policy if exists profils_proprietaire on public.profils;
create policy profils_proprietaire on public.profils for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists abonnements_proprietaire on public.abonnements;
create policy abonnements_proprietaire on public.abonnements for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and statut = 'demo');

-- ===== Preuve : v_onboarding =====
-- Pour chaque personne : chaque élément attendu de l'onboarding, et s'il est présent dans l'espace.
-- C'est cette vue qui prouve qu'une action d'agent est réelle (lecture côté serveur uniquement).
create or replace view public.v_onboarding with (security_invoker = true) as
with p as (select * from public.personnes)
select p.id as personne_id, p.prenom, p.nom, p.poste, e.ordre, e.element, e.espace, e.present
from p
cross join lateral (values
  (1, 'fiche', 'rh', exists(select 1 from public.rh_fiches f where f.personne_id = p.id and f.statut_fiche = 'creee')),
  (2, 'acces', 'rh',
     exists(select 1 from public.catalogue_acces c where c.poste = p.poste)
     and not exists(select 1 from public.catalogue_acces c where c.poste = p.poste
       and not exists(select 1 from public.rh_acces a where a.personne_id = p.id and a.outil = c.outil))),
  (3, 'badge', 'rh', exists(select 1 from public.rh_badges b where b.personne_id = p.id and b.statut in ('demande','pret'))),
  (4, 'canal', 'messagerie', exists(select 1 from public.msg_messages m
       where m.canal_id = lower(p.equipe) and m.texte ilike '%' || p.prenom || '%')),
  (5, 'message', 'messagerie', exists(select 1 from public.msg_messages m
       where m.canal_id = 'accueil' and m.texte ilike '%' || p.prenom || '%')),
  (6, 'parrain', 'messagerie', exists(select 1 from public.msg_demandes d where d.personne_id = p.id and d.type = 'parrain')),
  (7, 'cafe', 'messagerie', exists(select 1 from public.msg_demandes d where d.personne_id = p.id and d.type = 'cafe' and d.creneau is not null)),
  (8, 'page_wiki', 'wiki', exists(select 1 from public.wiki_pages w where w.titre ilike 'Bienvenue ' || p.prenom || '%')),
  (9, 'checklist', 'wiki', (select count(distinct periode) from public.wiki_checklists k where k.personne_id = p.id) = 3)
) as e(ordre, element, espace, present);

revoke all on public.v_onboarding from anon, authenticated;
grant select on public.v_onboarding to service_role;
