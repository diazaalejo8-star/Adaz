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
