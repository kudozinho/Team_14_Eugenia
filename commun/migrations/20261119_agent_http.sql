-- Complément idempotent : conserve toutes les demandes et fonctions historiques.
alter table public.executions_agent add column if not exists cle_demande uuid;
alter table public.executions_agent add column if not exists verification text;
alter table public.executions_agent add column if not exists preuve jsonb;
alter table public.executions_agent add column if not exists review_required boolean not null default false;
create unique index if not exists executions_agent_cle_unique on public.executions_agent(cle_demande) where cle_demande is not null;
alter table public.agent_worker add column if not exists remaining_runs integer not null default 0 check (remaining_runs >= 0);
alter table public.agent_worker add column if not exists credits_confirmed_until timestamptz;
insert into public.agent_worker(id,heartbeat) values('cloud','1970-01-01') on conflict(id) do nothing;

create or replace function public.demander_agent_http(p_tache text,p_cle uuid)
returns setof public.executions_agent language plpgsql security invoker set search_path=public as $$
begin
 perform pg_advisory_xact_lock(1419001);
 if p_tache <> 'tache_a1a0c7545c805f328eba1e25' or p_cle is null then
  raise exception using message='INVALID_TASK',errcode='P0001';
 end if;
 -- Une reprise ne consomme pas un second crédit et fonctionne même service endormi.
 if exists(select 1 from public.executions_agent where cle_demande=p_cle) then
  return query select * from public.executions_agent where cle_demande=p_cle and tache_id=p_tache;
  return;
 end if;
 if exists(select 1 from public.executions_agent where statut='en_cours' or review_required) then
  raise exception using message='BUSY_OR_REVIEW',errcode='P0001';
 end if;
 if not exists(select 1 from public.agent_worker where id='cloud' and heartbeat>now()-interval '30 seconds') then
  raise exception using message='OFFLINE',errcode='P0001';
 end if;
 if not exists(select 1 from public.agent_worker where id='cloud' and remaining_runs>0 and credits_confirmed_until>now()) then
  raise exception using message='NO_CONFIRMED_CREDITS',errcode='P0001';
 end if;
 if not exists(select 1 from public.taches_detectees where id=p_tache and methode in ('agent_h','les_deux') and length(trim(instructions_agent))>0) then
  raise exception using message='INVALID_TASK',errcode='P0001';
 end if;
 update public.agent_worker set remaining_runs=remaining_runs-1 where id='cloud';
 return query insert into public.executions_agent(tache_id,statut,resume,cle_demande)
 values(p_tache,'en_cours','HTTP_PENDING',p_cle) returning *;
end $$;
revoke all on function public.demander_agent_http(text,uuid) from public,anon,authenticated;
grant execute on function public.demander_agent_http(text,uuid) to service_role;
