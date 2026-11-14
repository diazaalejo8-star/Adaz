-- ADAZ FAMILY · CONFIGURACIÓN COMPLETA DE BASE DE DATOS
-- Ejecutar completo en Supabase SQL Editor. El script puede volver a ejecutarse si una ejecución anterior quedó incompleta.
-- Incluye las cinco migraciones versionadas del repositorio.
-- Las políticas y restricciones se preparan para una ejecución repetible.

-- SOURCE: supabase/migrations/202611110001_adaz_family.sql
-- ADAZ Family v1
-- Shared summaries are opt-in, category-scoped, and protected by RLS.
create extension if not exists pgcrypto;

create table if not exists public.adaz_family_invites (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  parent_email text not null,
  code_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.adaz_family_links (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid not null references auth.users(id) on delete cascade,
  child_label text not null default 'ADAZ Personal',
  status text not null default 'active' check (status in ('active','revoked')),
  permissions jsonb not null default '{"study":false,"habits":false,"business":false,"training":false,"outings":false}'::jsonb,
  created_at timestamptz not null default now(),
  unique(child_id,parent_id),
  check (jsonb_typeof(permissions) = 'object')
);

create table if not exists public.adaz_family_summaries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  summary_date date not null default current_date,
  category text not null check (category in ('study','habits','business','training')),
  payload jsonb not null,
  verification text not null default 'declared' check (verification in ('declared','verified','pending')),
  created_at timestamptz not null default now(),
  unique(child_id,summary_date,category)
);

create table if not exists public.adaz_outing_requests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  companion_context text not null default '',
  departure_at timestamptz not null,
  expected_return_at timestamptz not null,
  note text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','discuss')),
  created_at timestamptz not null default now(),
  check (expected_return_at > departure_at)
);

create table if not exists public.adaz_parent_responses (
  id uuid primary key default gen_random_uuid(),
  outing_request_id uuid not null references public.adaz_outing_requests(id) on delete cascade,
  parent_id uuid not null references auth.users(id) on delete cascade,
  response text not null check (response in ('approved','discuss')),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique(outing_request_id,parent_id)
);

create index if not exists adaz_family_links_parent_idx on public.adaz_family_links(parent_id,status);
create index if not exists adaz_family_summaries_child_date_idx on public.adaz_family_summaries(child_id,summary_date desc);
create index if not exists adaz_outing_requests_child_date_idx on public.adaz_outing_requests(child_id,departure_at desc);

create or replace function public.adaz_is_linked_parent(p_child_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.adaz_family_links l
    where l.child_id = p_child_id and l.parent_id = auth.uid() and l.status = 'active'
  );
$$;

create or replace function public.adaz_create_family_invite(p_parent_email text)
returns text language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(p_parent_email));
  v_code text := upper(encode(gen_random_bytes(5),'hex'));
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión.'; end if;
  if v_email is null or length(v_email) < 6 or position('@' in v_email) < 2 then
    raise exception 'Escribe un correo válido de tu padre, madre o acudiente.';
  end if;
  if v_email = lower(coalesce(auth.jwt()->>'email','')) then
    raise exception 'Usa un correo distinto al de tu cuenta.';
  end if;
  insert into public.adaz_family_invites(child_id,parent_email,code_hash,expires_at)
  values(auth.uid(),v_email,encode(digest(v_code,'sha256'),'hex'),now()+interval '7 days');
  return v_code;
end;
$$;

create or replace function public.adaz_accept_family_invite(p_code text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_invite public.adaz_family_invites%rowtype;
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero.'; end if;
  if coalesce(trim(p_code),'') = '' then raise exception 'Introduce el código de invitación.'; end if;
  select * into v_invite
  from public.adaz_family_invites
  where code_hash = encode(digest(upper(trim(p_code)),'sha256'),'hex')
    and accepted_at is null and expires_at > now()
  limit 1;
  if not found then raise exception 'El código no existe, expiró o ya fue utilizado.'; end if;
  if v_email <> v_invite.parent_email then
    raise exception 'Inicia sesión con el correo al que se envió la invitación.';
  end if;
  if auth.uid() = v_invite.child_id then raise exception 'No puedes vincular tu cuenta contigo mismo.'; end if;
  insert into public.adaz_family_links(child_id,parent_id,child_label,status)
  values(v_invite.child_id,auth.uid(),'ADAZ Personal','active')
  on conflict(child_id,parent_id) do update set status='active';
  update public.adaz_family_invites set accepted_at=now(),accepted_by=auth.uid() where id=v_invite.id;
  return v_invite.child_id;
end;
$$;

alter table public.adaz_family_invites enable row level security;
alter table public.adaz_family_links enable row level security;
alter table public.adaz_family_summaries enable row level security;
alter table public.adaz_outing_requests enable row level security;
alter table public.adaz_parent_responses enable row level security;

revoke all on public.adaz_family_invites, public.adaz_family_links, public.adaz_family_summaries, public.adaz_outing_requests, public.adaz_parent_responses from anon;
grant select on public.adaz_family_invites to authenticated;
grant select, delete on public.adaz_family_links to authenticated;
grant select, insert, update, delete on public.adaz_family_summaries to authenticated;
grant select, insert, update, delete on public.adaz_outing_requests to authenticated;
grant select, insert on public.adaz_parent_responses to authenticated;
grant execute on function public.adaz_create_family_invite(text) to authenticated;
grant execute on function public.adaz_accept_family_invite(text) to authenticated;

drop policy if exists "child reads own invites" on public.adaz_family_invites;
create policy "child reads own invites" on public.adaz_family_invites for select to authenticated using (child_id = auth.uid());

drop policy if exists "participants read family links" on public.adaz_family_links;
create policy "participants read family links" on public.adaz_family_links for select to authenticated using (child_id = auth.uid() or parent_id = auth.uid());
drop policy if exists "child revokes own family link" on public.adaz_family_links;
create policy "child revokes own family link" on public.adaz_family_links for delete to authenticated using (child_id = auth.uid());

drop policy if exists "child manages own summaries" on public.adaz_family_summaries;
create policy "child manages own summaries" on public.adaz_family_summaries for all to authenticated using (child_id = auth.uid()) with check (child_id = auth.uid());
drop policy if exists "linked parent reads permitted summaries" on public.adaz_family_summaries;
create policy "linked parent reads permitted summaries" on public.adaz_family_summaries for select to authenticated using (
  exists (
    select 1 from public.adaz_family_links l
    where l.child_id = adaz_family_summaries.child_id
      and l.parent_id = auth.uid() and l.status = 'active'
      and coalesce((l.permissions ->> adaz_family_summaries.category)::boolean,false)
  )
);

drop policy if exists "child manages own outing requests" on public.adaz_outing_requests;
create policy "child manages own outing requests" on public.adaz_outing_requests for all to authenticated using (child_id = auth.uid()) with check (child_id = auth.uid());
drop policy if exists "linked parent reads outing requests" on public.adaz_outing_requests;
create policy "linked parent reads outing requests" on public.adaz_outing_requests for select to authenticated using (
  public.adaz_is_linked_parent(child_id)
  and exists(select 1 from public.adaz_family_links l where l.child_id=adaz_outing_requests.child_id and l.parent_id=auth.uid() and coalesce((l.permissions->>'outings')::boolean,false))
);

drop policy if exists "parent responds to linked outing" on public.adaz_parent_responses;
create policy "parent responds to linked outing" on public.adaz_parent_responses for insert to authenticated with check (
  parent_id = auth.uid()
  and exists (
    select 1 from public.adaz_outing_requests o
    join public.adaz_family_links l on l.child_id=o.child_id
    where o.id=outing_request_id and l.parent_id=auth.uid() and l.status='active'
  )
);
drop policy if exists "child reads responses to own outings" on public.adaz_parent_responses;
create policy "child reads responses to own outings" on public.adaz_parent_responses for select to authenticated using (
  exists(select 1 from public.adaz_outing_requests o where o.id=outing_request_id and o.child_id=auth.uid())
);

comment on table public.adaz_family_summaries is 'Opt-in summaries published by the child; no raw health logs or private messages.';
comment on table public.adaz_outing_requests is 'Manually entered outing plans; no GPS or background location.';


-- SOURCE: supabase/migrations/202611110002_adaz_family_permissions.sql
-- Tighten ADAZ Family v1 permissions and expose a narrow permission-update RPC.
-- Remove the permissive bootstrap default from links created before this migration.
update public.adaz_family_links
set permissions = '{"study":false,"habits":false,"business":false,"training":false,"outings":false}'::jsonb
where permissions = '{"study":true,"habits":true,"business":false,"training":false,"outings":true}'::jsonb;

alter table public.adaz_family_links
  alter column permissions set default '{"study":false,"habits":false,"business":false,"training":false,"outings":false}'::jsonb;

revoke update on public.adaz_family_links from authenticated;
grant update(permissions) on public.adaz_family_links to authenticated;
drop policy if exists "child updates own family permissions" on public.adaz_family_links;
create policy "child updates own family permissions"
on public.adaz_family_links for update to authenticated
using (child_id = auth.uid())
with check (child_id = auth.uid());

create or replace function public.adaz_accept_family_invite(p_code text)
returns uuid language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_invite public.adaz_family_invites%rowtype;
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero.'; end if;
  if coalesce(trim(p_code),'') = '' then raise exception 'Introduce el código de invitación.'; end if;
  select * into v_invite
  from public.adaz_family_invites
  where code_hash = encode(digest(upper(trim(p_code)),'sha256'),'hex')
    and accepted_at is null and expires_at > now()
  limit 1;
  if not found then raise exception 'El código no existe, expiró o ya fue utilizado.'; end if;
  if v_email <> v_invite.parent_email then raise exception 'Inicia sesión con el correo al que se envió la invitación.'; end if;
  if auth.uid() = v_invite.child_id then raise exception 'No puedes vincular tu cuenta contigo mismo.'; end if;
  insert into public.adaz_family_links(child_id,parent_id,child_label,status,permissions)
  values(v_invite.child_id,auth.uid(),'ADAZ Personal','active','{"study":false,"habits":false,"business":false,"training":false,"outings":false}'::jsonb)
  on conflict(child_id,parent_id) do update set status='active';
  update public.adaz_family_invites set accepted_at=now(),accepted_by=auth.uid() where id=v_invite.id;
  return v_invite.child_id;
end;
$$;
grant execute on function public.adaz_accept_family_invite(text) to authenticated;


-- SOURCE: supabase/migrations/202611110003_adaz_family_evidence_constraints.sql
-- Finalize the declaration-only evidence model and validate permission values.
alter table public.adaz_family_summaries
  drop constraint if exists adaz_family_summaries_verification_check;
update public.adaz_family_summaries set verification='declared' where verification='verified';
alter table public.adaz_family_summaries
  add constraint adaz_family_summaries_verification_check
  check (verification in ('declared','pending'));

alter table public.adaz_family_links
  drop constraint if exists adaz_family_links_permissions_check;
alter table public.adaz_family_links
  add constraint adaz_family_links_permissions_check check (
    jsonb_typeof(permissions)='object'
    and jsonb_typeof(permissions->'study')='boolean'
    and jsonb_typeof(permissions->'habits')='boolean'
    and jsonb_typeof(permissions->'business')='boolean'
    and jsonb_typeof(permissions->'training')='boolean'
    and jsonb_typeof(permissions->'outings')='boolean'
  );


-- SOURCE: supabase/migrations/202611120001_adaz_family_outing_permission.sql
-- ADAZ Family v1.1: parent responses require the outing permission.
drop policy if exists "parent responds to linked outing" on public.adaz_parent_responses;
create policy "parent responds to linked outing"
on public.adaz_parent_responses
for insert to authenticated
with check (
  parent_id = auth.uid()
  and exists (
    select 1
    from public.adaz_outing_requests o
    join public.adaz_family_links l on l.child_id = o.child_id
    where o.id = outing_request_id
      and l.parent_id = auth.uid()
      and l.status = 'active'
      and coalesce((l.permissions ->> 'outings')::boolean, false)
  )
);


-- SOURCE: supabase/migrations/202611120002_adaz_family_parent_response_read.sql
-- ADAZ Family v1.1: adults can read only their own responses for permitted active outings.
drop policy if exists "parent reads own outing responses" on public.adaz_parent_responses;
create policy "parent reads own outing responses"
on public.adaz_parent_responses
for select to authenticated
using (
  parent_id = auth.uid()
  and exists (
    select 1
    from public.adaz_outing_requests o
    join public.adaz_family_links l on l.child_id = o.child_id
    where o.id = outing_request_id
      and l.parent_id = auth.uid()
      and l.status = 'active'
      and coalesce((l.permissions ->> 'outings')::boolean, false)
  )
);


-- SOURCE: supabase/migrations/202611120004_adaz_usage_monitoring.sql
-- ADAZ TRUST: opt-in app usage snapshots. Stores only foreground app identity and aggregated minutes.
alter table public.adaz_family_links
  alter column permissions set default '{"study":false,"habits":false,"business":false,"training":false,"outings":false,"usage":false}'::jsonb;

alter table public.adaz_family_links
  drop constraint if exists adaz_family_links_permissions_check;
alter table public.adaz_family_links
  add constraint adaz_family_links_permissions_check check (
    jsonb_typeof(permissions)='object'
    and jsonb_typeof(permissions->'study')='boolean'
    and jsonb_typeof(permissions->'habits')='boolean'
    and jsonb_typeof(permissions->'business')='boolean'
    and jsonb_typeof(permissions->'training')='boolean'
    and jsonb_typeof(permissions->'outings')='boolean'
    and (not (permissions ? 'usage') or jsonb_typeof(permissions->'usage')='boolean')
  );

create table if not exists public.adaz_usage_snapshots (
  child_id uuid primary key references auth.users(id) on delete cascade,
  active_package text not null default '',
  active_app text not null default '',
  active_since timestamptz,
  daily_usage jsonb not null default '[]'::jsonb,
  captured_at timestamptz not null default now(),
  device_status text not null default 'active' check (device_status in ('active','permission_missing','stopped'))
);
alter table public.adaz_usage_snapshots enable row level security;
drop policy if exists "child manages own usage snapshot" on public.adaz_usage_snapshots;
create policy "child manages own usage snapshot"
on public.adaz_usage_snapshots for all to authenticated
using (child_id=auth.uid())
with check (child_id=auth.uid());

drop policy if exists "parent reads opted-in usage snapshot" on public.adaz_usage_snapshots;
create policy "parent reads opted-in usage snapshot"
on public.adaz_usage_snapshots for select to authenticated
using (
  exists (
    select 1 from public.adaz_family_links l
    where l.child_id=adaz_usage_snapshots.child_id
      and l.parent_id=auth.uid()
      and l.status='active'
      and coalesce((l.permissions->>'usage')::boolean,false)=true
  )
);
revoke all on public.adaz_usage_snapshots from anon;
grant select, insert, update, delete on public.adaz_usage_snapshots to authenticated;

create index if not exists adaz_usage_snapshots_captured_at_idx
on public.adaz_usage_snapshots(captured_at desc);




-- ADAZ TRUST: usage-only parent scope. Apply after the base Family and usage schema.
update public.adaz_family_links
set permissions = jsonb_build_object(
  'study', false, 'habits', false, 'business', false,
  'training', false, 'outings', false,
  'usage', coalesce((permissions ->> 'usage')::boolean, false)
);
alter table public.adaz_family_links alter column permissions set default
  '{"study":false,"habits":false,"business":false,"training":false,"outings":false,"usage":false}'::jsonb;
alter table public.adaz_family_links drop constraint if exists adaz_family_links_permissions_check;
alter table public.adaz_family_links add constraint adaz_family_links_permissions_check check (
  jsonb_typeof(permissions)='object'
  and jsonb_typeof(permissions->'study')='boolean' and (permissions->>'study')::boolean=false
  and jsonb_typeof(permissions->'habits')='boolean' and (permissions->>'habits')::boolean=false
  and jsonb_typeof(permissions->'business')='boolean' and (permissions->>'business')::boolean=false
  and jsonb_typeof(permissions->'training')='boolean' and (permissions->>'training')::boolean=false
  and jsonb_typeof(permissions->'outings')='boolean' and (permissions->>'outings')::boolean=false
  and jsonb_typeof(permissions->'usage')='boolean'
);

create or replace function public.adaz_accept_family_invite(p_code text)
returns uuid language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_invite public.adaz_family_invites%rowtype;
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero.'; end if;
  if coalesce(trim(p_code),'') = '' then raise exception 'Introduce el código de invitación.'; end if;
  select * into v_invite from public.adaz_family_invites
  where code_hash = encode(digest(upper(trim(p_code)),'sha256'),'hex')
    and accepted_at is null and expires_at > now()
  limit 1;
  if not found then raise exception 'El código no existe, expiró o ya fue utilizado.'; end if;
  if v_email <> v_invite.parent_email then
    raise exception 'Inicia sesión con el correo al que se envió la invitación.';
  end if;
  if auth.uid() = v_invite.child_id then raise exception 'No puedes vincular tu cuenta contigo mismo.'; end if;
  insert into public.adaz_family_links(child_id,parent_id,child_label,status,permissions)
  values(v_invite.child_id,auth.uid(),'ADAZ Personal','active',
    '{"study":false,"habits":false,"business":false,"training":false,"outings":false,"usage":false}'::jsonb)
  on conflict(child_id,parent_id) do update set status='active';
  update public.adaz_family_invites set accepted_at=now(),accepted_by=auth.uid() where id=v_invite.id;
  return v_invite.child_id;
end;
$$;
revoke all on function public.adaz_accept_family_invite(text) from public, anon;
grant execute on function public.adaz_accept_family_invite(text) to authenticated;

drop policy if exists "linked parent reads permitted summaries" on public.adaz_family_summaries;
drop policy if exists "linked parent reads outing requests" on public.adaz_outing_requests;
drop policy if exists "parent responds to linked outing" on public.adaz_parent_responses;
drop policy if exists "parent reads own outing responses" on public.adaz_parent_responses;
revoke insert on public.adaz_parent_responses from authenticated;

drop policy if exists "child reads own invites" on public.adaz_family_invites;
create policy "child reads own invites" on public.adaz_family_invites for select to authenticated
using (child_id = (select auth.uid()));
drop policy if exists "participants read family links" on public.adaz_family_links;
create policy "participants read family links" on public.adaz_family_links for select to authenticated
using (child_id = (select auth.uid()) or parent_id = (select auth.uid()));
drop policy if exists "child revokes own family link" on public.adaz_family_links;
create policy "child revokes own family link" on public.adaz_family_links for delete to authenticated
using (child_id = (select auth.uid()));
drop policy if exists "child updates own family permissions" on public.adaz_family_links;
create policy "child updates own family permissions" on public.adaz_family_links for update to authenticated
using (child_id = (select auth.uid())) with check (child_id = (select auth.uid()));

drop policy if exists "child manages own summaries" on public.adaz_family_summaries;
create policy "child manages own summaries" on public.adaz_family_summaries for all to authenticated
using (child_id = (select auth.uid())) with check (child_id = (select auth.uid()));
drop policy if exists "child manages own outing requests" on public.adaz_outing_requests;
create policy "child manages own outing requests" on public.adaz_outing_requests for all to authenticated
using (child_id = (select auth.uid())) with check (child_id = (select auth.uid()));
drop policy if exists "child reads responses to own outings" on public.adaz_parent_responses;
create policy "child reads responses to own outings" on public.adaz_parent_responses for select to authenticated
using (exists (
  select 1 from public.adaz_outing_requests o
  where o.id=adaz_parent_responses.outing_request_id and o.child_id=(select auth.uid())
));

drop policy if exists "child manages own usage snapshot" on public.adaz_usage_snapshots;
drop policy if exists "parent reads opted-in usage snapshot" on public.adaz_usage_snapshots;
drop policy if exists "child or opted-in parent reads usage snapshot" on public.adaz_usage_snapshots;
drop policy if exists "child inserts own usage snapshot" on public.adaz_usage_snapshots;
drop policy if exists "child updates own usage snapshot" on public.adaz_usage_snapshots;
drop policy if exists "child deletes own usage snapshot" on public.adaz_usage_snapshots;
create policy "child or opted-in parent reads usage snapshot" on public.adaz_usage_snapshots
for select to authenticated using (
  child_id=(select auth.uid()) or exists (
    select 1 from public.adaz_family_links l
    where l.child_id=adaz_usage_snapshots.child_id
      and l.parent_id=(select auth.uid()) and l.status='active'
      and coalesce((l.permissions->>'usage')::boolean,false)=true
  )
);
create policy "child inserts own usage snapshot" on public.adaz_usage_snapshots
for insert to authenticated with check (child_id=(select auth.uid()));
create policy "child updates own usage snapshot" on public.adaz_usage_snapshots
for update to authenticated using (child_id=(select auth.uid()))
with check (child_id=(select auth.uid()));
create policy "child deletes own usage snapshot" on public.adaz_usage_snapshots
for delete to authenticated using (child_id=(select auth.uid()));

drop policy if exists "deny client access to ai usage" on public.adaz_ai_usage;
create policy "deny client access to ai usage" on public.adaz_ai_usage for all to authenticated
using (false) with check (false);
revoke all on public.adaz_ai_usage from anon, authenticated;
drop function if exists public.adaz_is_linked_parent(uuid);

create index if not exists adaz_family_invites_child_id_idx on public.adaz_family_invites(child_id);
create index if not exists adaz_family_invites_accepted_by_idx on public.adaz_family_invites(accepted_by);
create index if not exists adaz_parent_responses_parent_id_idx on public.adaz_parent_responses(parent_id);

comment on table public.adaz_usage_snapshots is
  'ADAZ TRUST: foreground application name and aggregated daily usage only; no screen or in-app content.';
comment on table public.adaz_family_links is
  'ADAZ TRUST: active adult relationship; only the usage permission is supported in the current product scope.';
