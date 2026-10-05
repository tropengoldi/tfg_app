-- PROJ-18 · Begriffe: Gaumenpunkte & Whisky-Steward
--
-- Die Rolle aus PROJ-11 heißt sichtbar jetzt „Whisky-Steward" statt „Helfer".
-- Die App zeigt TS-Fehlermeldungen wörtlich so an, wie die Datenbank sie
-- liefert (messageForDbError) — deshalb werden hier die 10 Funktionen neu
-- definiert, die „Helfer" in einer Meldung tragen.
--
-- AUSSCHLIESSLICH die Meldungstexte ändern sich (15 Stück). Logik, Signaturen,
-- Fehlercodes und Rechte sind identisch: jeder Rumpf ist 1:1 aus der jeweils
-- jüngsten Fassung übernommen —
--   update_event_host_fields   aus 20260909120000_host_keeps_event_basics.sql
--   alle übrigen 9             aus 20260831120000_helper_role.sql
-- `create or replace` bei unveränderter Signatur behält die bestehenden
-- GRANT/REVOKE-Einstellungen. Interne Bezeichner (helper_id, is_event_helper …)
-- bleiben bewusst unverändert.

begin;

create or replace function public.update_event_host_fields(
  p_event      uuid,
  p_theme      text,
  p_food_info  text,
  p_host_notes text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not (public.can_run_host_control(p_event) or public.is_event_host(p_event)) then
    raise exception 'Nur Gastgeber, Whisky-Steward oder Admin.' using errcode = 'TS004';
  end if;
  if not exists (select 1 from public.tasting_events where id = p_event) then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;

  update public.tasting_events set
    theme      = nullif(trim(p_theme), ''),
    food_info  = nullif(trim(p_food_info), ''),
    host_notes = nullif(trim(p_host_notes), '')
  where id = p_event;
end;
$$;

create or replace function public.set_whisky_order(p_event uuid, p_ordered uuid[])
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
  v_cur    int;
  v_n      int;
  v_locked int;
begin
  if not public.can_run_host_control(p_event) then
    raise exception 'Nur Gastgeber, Whisky-Steward oder Admin dürfen die Reihenfolge setzen.' using errcode = 'TS004';
  end if;
  select status, current_position into v_status, v_cur
    from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status = 'closed' then
    raise exception 'Ein abgeschlossenes Event lässt sich nicht mehr ändern.' using errcode = 'TS010';
  end if;

  select count(*) into v_n from public.whiskies where event_id = p_event;

  if array_length(p_ordered, 1) is distinct from v_n
     or (select count(distinct x) from unnest(p_ordered) x) <> v_n
     or exists (
        select 1 from unnest(p_ordered) x
        where not exists (select 1 from public.whiskies w where w.id = x and w.event_id = p_event)
     )
  then
    raise exception 'Die übergebene Reihenfolge passt nicht zu den Whiskies des Events.' using errcode = 'TS008';
  end if;

  if v_status = 'active' and v_cur > 0 then
    select count(*) into v_locked
    from unnest(p_ordered) with ordinality as o(id, ord)
    join public.whiskies w on w.id = o.id
    where o.ord <= v_cur and w.position <> o.ord;
    if v_locked > 0 then
      raise exception 'Bereits ausgeschenkte Whiskies lassen sich nicht mehr umsortieren.' using errcode = 'TS006';
    end if;
  end if;

  set constraints all deferred;
  update public.whiskies w
    set position = o.ord
  from unnest(p_ordered) with ordinality as o(id, ord)
  where w.id = o.id and w.event_id = p_event;
end;
$$;

create or replace function public.start_event(p_event uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
  v_n      int;
  v_maxpos int;
begin
  if not public.can_run_host_control(p_event) then
    raise exception 'Nur Gastgeber, Whisky-Steward oder Admin dürfen das Event starten.' using errcode = 'TS004';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Nur ein Event in Vorbereitung lässt sich starten.' using errcode = 'TS010';
  end if;

  select count(*), coalesce(max(position), 0) into v_n, v_maxpos
    from public.whiskies where event_id = p_event;
  if v_n = 0 then
    raise exception 'Es ist noch kein Whisky eingetragen.' using errcode = 'TS008';
  end if;
  if v_maxpos <> v_n then
    raise exception 'Die Ausschankreihenfolge hat Lücken.' using errcode = 'TS008';
  end if;

  if exists (
    select 1 from public.tasting_events
    where status = 'active' and id <> p_event
  ) then
    raise exception 'Es läuft bereits ein anderes Tasting.' using errcode = 'TS010';
  end if;

  update public.tasting_events
    set status = 'active', current_position = 1, started_at = now()
    where id = p_event;
end;
$$;

create or replace function public.close_round(p_event uuid, p_expected_position smallint)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
  v_cur    int;
  v_n      int;
begin
  if not public.can_run_host_control(p_event) then
    raise exception 'Nur Gastgeber, Whisky-Steward oder Admin dürfen die Runde weiterschalten.' using errcode = 'TS004';
  end if;
  select status, current_position into v_status, v_cur
    from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status <> 'active' then
    raise exception 'Das Event läuft nicht.' using errcode = 'TS010';
  end if;
  if v_cur <> p_expected_position then
    raise exception 'Die Runde wurde bereits weitergeschaltet.' using errcode = 'TS002';
  end if;

  select count(*) into v_n from public.whiskies where event_id = p_event;
  if v_cur >= v_n then
    raise exception 'Der letzte Whisky ist im Glas — jetzt nur noch das Tasting abschließen.'
      using errcode = 'TS007';
  end if;

  update public.tasting_events set current_position = current_position + 1
    where id = p_event;
end;
$$;

create or replace function public.close_event(p_event uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
begin
  if not public.can_run_host_control(p_event) then
    raise exception 'Nur Gastgeber, Whisky-Steward oder Admin dürfen das Event abschließen.' using errcode = 'TS004';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status <> 'active' then
    raise exception 'Nur ein laufendes Event lässt sich abschließen.' using errcode = 'TS010';
  end if;

  update public.tasting_events
    set status = 'closed', closed_at = now()
    where id = p_event;
end;
$$;

create or replace function public.rating_progress(p_event uuid)
returns table (whisky_position smallint, rating_count int, participant_count int)
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.can_run_host_control(p_event) then
    raise exception 'Nur Gastgeber, Whisky-Steward oder Admin dürfen den Fortschritt abfragen.' using errcode = 'TS004';
  end if;

  return query
  select w.position,
         count(r.id)::int,
         (select count(*)::int from public.event_participants ep where ep.event_id = p_event)
  from public.whiskies w
  left join public.ratings r on r.whisky_id = w.id
  where w.event_id = p_event
  group by w.position
  order by w.position;
end;
$$;

create or replace function public.create_event(
  p_event_date   date,
  p_location     text,
  p_host_id      uuid,
  p_helper_id    uuid     default null,
  p_theme        text     default null,
  p_food_info    text     default null,
  p_max_whiskies smallint default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id  uuid;
begin
  if not public.is_admin() then
    raise exception 'Nur der Admin darf Events anlegen.' using errcode = 'TS004';
  end if;
  if not exists (select 1 from public.profiles where id = p_host_id and is_active) then
    raise exception 'Der gewählte Gastgeber ist kein aktives Mitglied.' using errcode = 'TS004';
  end if;
  if p_helper_id is not null then
    if not exists (select 1 from public.profiles where id = p_helper_id and is_active) then
      raise exception 'Der gewählte Whisky-Steward ist kein aktives Mitglied.' using errcode = 'TS004';
    end if;
    if p_helper_id = p_host_id then
      raise exception 'Der Whisky-Steward kann nicht gleichzeitig Gastgeber dieses Abends sein.' using errcode = 'TS017';
    end if;
  end if;

  insert into public.tasting_events
    (event_date, location, theme, food_info, host_id, helper_id, created_by, max_whiskies_per_participant)
  values
    (p_event_date, p_location, nullif(trim(p_theme), ''), nullif(trim(p_food_info), ''),
     p_host_id, p_helper_id, v_uid, p_max_whiskies)
  returning id into v_id;

  insert into public.event_participants (event_id, profile_id)
  values (v_id, p_host_id)
  on conflict do nothing;

  return v_id;
end;
$$;

create or replace function public.update_event(
  p_event        uuid,
  p_event_date   date,
  p_location     text,
  p_host_id      uuid,
  p_helper_id    uuid     default null,
  p_theme        text     default null,
  p_food_info    text     default null,
  p_max_whiskies smallint default null
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
begin
  if not public.is_admin() then
    raise exception 'Nur der Admin darf Events bearbeiten.' using errcode = 'TS004';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Nach dem Start lassen sich die Eckdaten nicht mehr ändern.' using errcode = 'TS005';
  end if;
  if not exists (select 1 from public.profiles where id = p_host_id and is_active) then
    raise exception 'Der gewählte Gastgeber ist kein aktives Mitglied.' using errcode = 'TS004';
  end if;
  if p_helper_id is not null then
    if not exists (select 1 from public.profiles where id = p_helper_id and is_active) then
      raise exception 'Der gewählte Whisky-Steward ist kein aktives Mitglied.' using errcode = 'TS004';
    end if;
    if p_helper_id = p_host_id then
      raise exception 'Der Whisky-Steward kann nicht gleichzeitig Gastgeber dieses Abends sein.' using errcode = 'TS017';
    end if;
    if exists (
      select 1 from public.event_participants
      where event_id = p_event and profile_id = p_helper_id
    ) then
      raise exception 'Der Whisky-Steward kann nicht gleichzeitig Teilnehmer dieses Abends sein. Nimm die Person zuerst aus der Teilnehmerliste.'
        using errcode = 'TS017';
    end if;
  end if;

  update public.tasting_events set
    event_date                  = p_event_date,
    location                    = p_location,
    theme                       = nullif(trim(p_theme), ''),
    food_info                   = nullif(trim(p_food_info), ''),
    host_id                     = p_host_id,
    helper_id                   = p_helper_id,
    max_whiskies_per_participant = p_max_whiskies
  where id = p_event;

  insert into public.event_participants (event_id, profile_id)
  values (p_event, p_host_id)
  on conflict do nothing;
end;
$$;

create or replace function public.set_event_participants(
  p_event       uuid,
  p_profile_ids uuid[]
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
  v_host   uuid;
  v_helper uuid;
  v_ids    uuid[];
begin
  if not public.is_admin() then
    raise exception 'Nur der Admin darf die Teilnehmerliste setzen.' using errcode = 'TS004';
  end if;
  select status, host_id, helper_id into v_status, v_host, v_helper
    from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status = 'closed' then
    raise exception 'Ein abgeschlossenes Event lässt sich nicht mehr ändern.' using errcode = 'TS010';
  end if;
  if v_helper is not null and v_helper = any (p_profile_ids) then
    raise exception 'Der Whisky-Steward dieses Abends kann nicht zugleich Teilnehmer sein.' using errcode = 'TS017';
  end if;

  select coalesce(array_agg(distinct p.id), array[v_host]) into v_ids
  from public.profiles p
  where p.id = any (p_profile_ids || v_host)
    and p.is_active;

  if exists (
    select 1 from public.event_participants ep
    where ep.event_id = p_event
      and ep.profile_id <> all (v_ids)
      and (
        exists (select 1 from public.whisky_details wd
                where wd.event_id = p_event and wd.brought_by = ep.profile_id)
        or exists (select 1 from public.ratings r
                where r.event_id = p_event and r.profile_id = ep.profile_id)
      )
  ) then
    raise exception 'Ein Teilnehmer mit eingetragenen Whiskies oder Bewertungen kann nicht entfernt werden.'
      using errcode = 'TS009';
  end if;

  delete from public.event_participants
  where event_id = p_event and profile_id <> all (v_ids);

  insert into public.event_participants (event_id, profile_id)
  select p_event, unnest(v_ids)
  on conflict do nothing;
end;
$$;

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

  perform 1 from public.profiles
  where id = p_target or (role = 'admin' and is_active)
  order by id
  for update;

  select role, is_active into v_role, v_active
  from public.profiles where id = p_target;
  if v_role is null then
    raise exception 'Teilnehmer nicht gefunden.' using errcode = 'TS004';
  end if;

  if exists (
    select 1 from public.tasting_events
    where (host_id = p_target or helper_id = p_target)
      and status in ('draft', 'active')
  ) then
    raise exception 'Diese Person ist Gastgeber oder Whisky-Steward eines Tastings, das noch nicht abgeschlossen ist. Weise das Event zuerst jemand anderem zu.'
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

commit;
