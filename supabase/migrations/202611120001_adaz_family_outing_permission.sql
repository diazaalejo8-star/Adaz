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
