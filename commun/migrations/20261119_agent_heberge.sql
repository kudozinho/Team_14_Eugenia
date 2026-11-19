create table if not exists public.agent_worker (
 id text primary key,
 heartbeat timestamptz not null default now()
);
alter table public.agent_worker enable row level security;
revoke all on public.agent_worker from anon, authenticated;
grant all on public.agent_worker to service_role;
create or replace function public.demander_agent(p_tache text)
returns setof public.executions_agent language plpgsql security invoker set search_path=public as $$
begin
 perform pg_advisory_xact_lock(1419001);
 if not exists(select 1 from public.agent_worker where id='cloud' and heartbeat>now()-interval '20 seconds') then
  raise exception 'Agent hébergé indisponible';
 end if;
 if exists(select 1 from public.executions_agent where statut='en_cours') then
  raise exception 'Une exécution est déjà en cours';
 end if;
 if not exists(select 1 from public.taches_detectees where id=p_tache and methode in ('agent_h','les_deux')) then
  raise exception 'Tâche agent H introuvable';
 end if;
 return query insert into public.executions_agent(tache_id,statut,resume) values(p_tache,'en_cours','CLOUD_PENDING') returning *;
end $$;
revoke all on function public.demander_agent(text) from public,anon,authenticated;
grant execute on function public.demander_agent(text) to service_role;
