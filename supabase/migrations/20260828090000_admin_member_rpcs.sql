-- PROJ-3 · Admin – Teilnehmerverwaltung: Datenbank-Aktionen
--
-- Vier RPCs, alle SECURITY DEFINER + SET search_path = ''. Jede prüft die
-- Admin-Rolle des Aufrufers selbst und erzwingt die Integritätsregeln IM SELBEN
-- Schritt wie die Änderung (Zeilensperre) — zwei gleichzeitige Admin-Aktionen
-- können damit nicht beide „am letzten Admin vorbei".
--
-- Custom SQLSTATEs (Klasse 'TS', siehe src/lib/errors.ts):
--   TS004 not_authorized            TS012 would_leave_no_active_admin
--   TS010 wrong_state (generisch)   TS013 host_of_non_closed_event
--   TS011 self_action_forbidden     TS014 only_active_members_promotable

begin;

-- ---------------------------------------------------------------------------
-- Liste aller Teilnehmer inkl. E-Mail und „hat sich schon mal angemeldet?"
-- (die E-Mail liegt in auth.users, nicht in profiles — PROJ-1).
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_members()
returns table (
  id            uuid,
  display_name  text,
  role          public.app_role,
  is_active     boolean,
  email         text,
  has_signed_in boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  return query
  select p.id,
         p.display_name,
         p.role,
         p.is_active,
         u.email::text,
         (u.last_sign_in_at is not null) as has_signed_in
  from public.profiles p
  join auth.users u on u.id = p.id
  order by lower(p.display_name), p.display_name;
end;
$$;

-- ---------------------------------------------------------------------------
-- Deaktivieren
-- ---------------------------------------------------------------------------
create or replace function public.deactivate_member(p_target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_role   public.app_role;
  v_active boolean;
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;
  if p_target = v_uid then
    raise exception 'Du kannst dich nicht selbst deaktivieren.' using errcode = 'TS011';
  end if;

  select role, is_active into v_role, v_active
  from public.profiles where id = p_target for update;
  if v_role is null then
    raise exception 'Teilnehmer nicht gefunden.' using errcode = 'TS004';
  end if;

  if exists (
    select 1 from public.tasting_events
    where host_id = p_target and status in ('draft', 'active')
  ) then
    raise exception 'Diese Person ist Gastgeber eines Tastings, das noch nicht abgeschlossen ist. Weise das Event zuerst einem anderen Gastgeber zu.'
      using errcode = 'TS013';
  end if;

  if v_role = 'admin' and (
    select count(*) from public.profiles
    where role = 'admin' and is_active and id <> p_target
  ) = 0 then
    raise exception 'Es muss mindestens ein aktiver Admin übrig bleiben. Mach zuerst jemand anderen zum Admin.'
      using errcode = 'TS012';
  end if;

  update public.profiles set is_active = false where id = p_target;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reaktivieren
-- ---------------------------------------------------------------------------
create or replace function public.reactivate_member(p_target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;
  if not exists (select 1 from public.profiles where id = p_target) then
    raise exception 'Teilnehmer nicht gefunden.' using errcode = 'TS004';
  end if;

  update public.profiles set is_active = true where id = p_target;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin-Rolle setzen (befördern / degradieren)
-- ---------------------------------------------------------------------------
create or replace function public.set_member_admin(p_target uuid, p_make_admin boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role     public.app_role;
  v_active   boolean;
  v_signedin boolean;
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  select p.role, p.is_active, (u.last_sign_in_at is not null)
    into v_role, v_active, v_signedin
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = p_target
  for update of p;
  if v_role is null then
    raise exception 'Teilnehmer nicht gefunden.' using errcode = 'TS004';
  end if;

  if p_make_admin then
    if not (v_active and v_signedin) then
      raise exception 'Nur aktive Teilnehmer können zum Admin gemacht werden.'
        using errcode = 'TS014';
    end if;
    update public.profiles set role = 'admin' where id = p_target;
  else
    if (
      select count(*) from public.profiles
      where role = 'admin' and is_active and id <> p_target
    ) = 0 then
      raise exception 'Es muss mindestens ein aktiver Admin übrig bleiben. Mach zuerst jemand anderen zum Admin.'
        using errcode = 'TS012';
    end if;
    update public.profiles set role = 'teilnehmer' where id = p_target;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Aufruf nur für authentifizierte Nutzer (die Admin-Prüfung steckt in den
-- Funktionen selbst).
-- ---------------------------------------------------------------------------
revoke execute on function
  public.admin_list_members(),
  public.deactivate_member(uuid),
  public.reactivate_member(uuid),
  public.set_member_admin(uuid, boolean)
from public, anon;

grant execute on function
  public.admin_list_members(),
  public.deactivate_member(uuid),
  public.reactivate_member(uuid),
  public.set_member_admin(uuid, boolean)
to authenticated;

commit;
