-- Tighten ADAZ Family v1 permissions and expose a narrow permission-update RPC.
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
