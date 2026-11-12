-- ADAZ Family v1.1: adults can read only their own responses for permitted active outings.
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
