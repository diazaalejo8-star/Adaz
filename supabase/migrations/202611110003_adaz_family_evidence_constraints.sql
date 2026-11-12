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
