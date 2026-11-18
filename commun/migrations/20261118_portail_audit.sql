-- MVP : un PC. Aucune lecture/commande publique sans passage par la route serveur authentifiée.
create table if not exists public.portail_recorder (
 id text primary key check(id = 'henriquet'),
 audit_id text references public.audits(id),
 desired text not null default 'stopped' check(desired in ('recording','stopped')),
 actual text not null default 'offline',
 applications jsonb not null default '[]',
 sites jsonb not null default '[]',
 heartbeat timestamptz,
 message text not null default '',
 consent_at timestamptz
);
alter table public.portail_recorder enable row level security;
revoke all on public.portail_recorder from anon, authenticated;
grant all on public.portail_recorder to service_role;
insert into public.portail_recorder(id) values ('henriquet') on conflict do nothing;

create or replace function public.demarrer_portail(p_apps jsonb, p_sites jsonb)
returns setof public.portail_recorder language plpgsql security invoker set search_path = public as $$
declare r public.portail_recorder; aid text;
begin
 select * into r from public.portail_recorder where id='henriquet' for update;
 if r.heartbeat is null or r.heartbeat < now()-interval '10 seconds' then
  raise exception 'PC hors ligne';
 end if;
 if r.desired <> 'stopped' or r.actual not in ('ready','completed','error','interrupted') then
  raise exception 'Une session est déjà active';
 end if;
 insert into public.audits default values returning id into aid;
 return query update public.portail_recorder set audit_id=aid, desired='recording',
 actual='starting', applications=p_apps, sites=p_sites, consent_at=now(), message=''
 where id='henriquet' returning *;
end $$;
revoke all on function public.demarrer_portail(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.demarrer_portail(jsonb,jsonb) to service_role;
