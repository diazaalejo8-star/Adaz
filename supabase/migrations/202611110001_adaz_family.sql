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
