-- CI ONLY: empty disposable PostgreSQL database. Never run on the shared project.
\set ON_ERROR_STOP on
begin;
create role anon;
create role authenticated;
create role service_role bypassrls;
create table public.taches_detectees(id text primary key,methode text,instructions_agent text);
create table public.executions_agent(id text primary key default gen_random_uuid()::text,tache_id text references taches_detectees(id),statut text,resume text,cree_le timestamptz default now());
\ir ../../commun/migrations/20261119_agent_heberge.sql
\ir ../../commun/migrations/20261119_agent_http.sql
-- Reapplication must be safe.
\ir ../../commun/migrations/20261119_agent_http.sql
grant all on public.taches_detectees, public.executions_agent to service_role;
insert into public.taches_detectees values('tache_a1a0c7545c805f328eba1e25','agent_h','Fictitious test instructions');
update public.agent_worker set heartbeat=now(),remaining_runs=1,credits_confirmed_until=now()+interval '10 minutes';
set local role service_role;
do $$
declare first_id text; recovered_id text;
begin
 select id into first_id from public.demander_agent_http('tache_a1a0c7545c805f328eba1e25','a0000000-0000-4000-8000-000000000001');
 select id into recovered_id from public.demander_agent_http('tache_a1a0c7545c805f328eba1e25','a0000000-0000-4000-8000-000000000001');
 assert first_id=recovered_id, 'same key must return same id';
 assert (select count(*)=1 from public.executions_agent), 'one key one request';
 assert (select remaining_runs=0 from public.agent_worker), 'one admission one reservation';
 begin
  perform public.demander_agent_http('tache_a1a0c7545c805f328eba1e25','a0000000-0000-4000-8000-000000000002');
  raise exception 'should refuse concurrent request';
 exception when raise_exception then
  if sqlerrm <> 'BUSY_OR_REVIEW' then raise; end if;
 end;
 update public.executions_agent set statut='completed',verification='ok' where id=first_id;
 update public.agent_worker set heartbeat='1970-01-01';
 select id into recovered_id from public.demander_agent_http('tache_a1a0c7545c805f328eba1e25','a0000000-0000-4000-8000-000000000001');
 assert first_id=recovered_id, 'recovery works with expired heartbeat';
 update public.agent_worker set heartbeat=now();
 begin
  perform public.demander_agent_http('tache_a1a0c7545c805f328eba1e25','a0000000-0000-4000-8000-000000000002');
  raise exception 'should refuse unconfirmed credit';
 exception when raise_exception then
  if sqlerrm <> 'NO_CONFIRMED_CREDITS' then raise; end if;
 end;
 update public.agent_worker set remaining_runs=1;
 update public.executions_agent set review_required=true where id=first_id;
 begin
  perform public.demander_agent_http('tache_a1a0c7545c805f328eba1e25','a0000000-0000-4000-8000-000000000002');
  raise exception 'should refuse after uncertain publication';
 exception when raise_exception then
  if sqlerrm <> 'BUSY_OR_REVIEW' then raise; end if;
 end;
 assert (select remaining_runs=1 from public.agent_worker), 'refusal must not reserve budget';
end $$;
reset role;
do $$ begin
 assert not has_function_privilege('anon','public.demander_agent_http(text,uuid)','execute');
 assert not has_function_privilege('authenticated','public.demander_agent_http(text,uuid)','execute');
 assert not has_table_privilege('anon','public.agent_worker','select');
 assert not has_table_privilege('authenticated','public.agent_worker','select');
end $$;
rollback;
