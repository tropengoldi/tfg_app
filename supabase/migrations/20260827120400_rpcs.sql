-- PROJ-1 · RPCs — alle Schreibpfade auf tasting_events / whiskies / whisky_details
--
-- Der Browser-Client ist read-only + Realtime. Jede Mutation an Event, Whisky-Liste
-- oder Reihenfolge läuft über eine dieser Funktionen. Sie sind SECURITY DEFINER und
-- prüfen die Berechtigung IMMER selbst (RLS greift bei DEFINER nicht).
--
-- Custom SQLSTATEs (Klasse 'PT') → src/lib/errors.ts:
--   PT001 event_closed            PT006 position_already_poured
--   PT002 stale_position          PT007 last_round
--   PT003 whisky_limit_reached    PT008 order_invalid
--   PT004 not_authorized          PT009 participant_has_data
--   PT005 event_not_draft         PT010 wrong_status

begin;

-- ===========================================================================
-- Event anlegen  (Admin)
-- ===========================================================================
create or replace function public.create_event(
  p_event_date   date,
  p_location     text,
  p_host_id      uuid,
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
    raise exception 'Nur der Admin darf Events anlegen.' using errcode = 'PT004';
  end if;
  if not exists (select 1 from public.profiles where id = p_host_id and is_active) then
    raise exception 'Der gewählte Gastgeber ist kein aktives Mitglied.' using errcode = 'PT004';
  end if;

  insert into public.tasting_events
    (event_date, location, theme, food_info, host_id, created_by, max_whiskies_per_participant)
  values
    (p_event_date, p_location, nullif(trim(p_theme), ''), nullif(trim(p_food_info), ''),
     p_host_id, v_uid, p_max_whiskies)
  returning id into v_id;

  insert into public.event_participants (event_id, profile_id)
  values (v_id, p_host_id)
  on conflict do nothing;

  return v_id;
end;
$$;

-- ===========================================================================
-- Event-Eckdaten bearbeiten  (Admin, nur solange 'draft')
-- ===========================================================================
create or replace function public.update_event(
  p_event        uuid,
  p_event_date   date,
  p_location     text,
  p_host_id      uuid,
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
    raise exception 'Nur der Admin darf Events bearbeiten.' using errcode = 'PT004';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Nach dem Start lassen sich die Eckdaten nicht mehr ändern.' using errcode = 'PT005';
  end if;
  if not exists (select 1 from public.profiles where id = p_host_id and is_active) then
    raise exception 'Der gewählte Gastgeber ist kein aktives Mitglied.' using errcode = 'PT004';
  end if;

  update public.tasting_events set
    event_date                  = p_event_date,
    location                    = p_location,
    theme                       = nullif(trim(p_theme), ''),
    food_info                   = nullif(trim(p_food_info), ''),
    host_id                     = p_host_id,
    max_whiskies_per_participant = p_max_whiskies
  where id = p_event;

  insert into public.event_participants (event_id, profile_id)
  values (p_event, p_host_id)
  on conflict do nothing;
end;
$$;

-- ===========================================================================
-- Gastgeber-Eckdaten (Thema / Essen / Anmerkungen)  (Gastgeber oder Admin, jeder Status)
-- ===========================================================================
create or replace function public.update_event_host_fields(
  p_event      uuid,
  p_theme      text,
  p_food_info  text,
  p_host_notes text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not (public.is_admin() or public.is_event_host(p_event)) then
    raise exception 'Nur Gastgeber oder Admin.' using errcode = 'PT004';
  end if;
  if not exists (select 1 from public.tasting_events where id = p_event) then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;

  update public.tasting_events set
    theme      = nullif(trim(p_theme), ''),
    food_info  = nullif(trim(p_food_info), ''),
    host_notes = nullif(trim(p_host_notes), '')
  where id = p_event;
end;
$$;

-- ===========================================================================
-- Teilnehmerliste setzen  (Admin) — fügt den Gastgeber automatisch hinzu,
-- verweigert das Entfernen von jemandem mit Whiskies oder Bewertungen.
-- ===========================================================================
create or replace function public.set_event_participants(
  p_event       uuid,
  p_profile_ids uuid[]
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
  v_host   uuid;
  v_ids    uuid[];
begin
  if not public.is_admin() then
    raise exception 'Nur der Admin darf die Teilnehmerliste setzen.' using errcode = 'PT004';
  end if;
  select status, host_id into v_status, v_host
    from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if v_status = 'closed' then
    raise exception 'Ein abgeschlossenes Event lässt sich nicht mehr ändern.' using errcode = 'PT010';
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
      using errcode = 'PT009';
  end if;

  delete from public.event_participants
  where event_id = p_event and profile_id <> all (v_ids);

  insert into public.event_participants (event_id, profile_id)
  select p_event, unnest(v_ids)
  on conflict do nothing;
end;
$$;

-- ===========================================================================
-- Eigenen Whisky anlegen  (Teilnehmer, nur 'draft') — atomar über beide Tabellen.
-- Limit = max_whiskies_per_participant, für den Gastgeber + 1 (Bonus).
-- Ohne Limit ist die Anzahl frei.
-- ===========================================================================
create or replace function public.add_whisky(
  p_event       uuid,
  p_name        text,
  p_distillery  text     default null,
  p_region      text     default null,
  p_age_years   smallint default null,
  p_abv         numeric  default null,
  p_cask_type   text     default null,
  p_bottler     text     default null,
  p_price_eur   numeric  default null,
  p_owner_notes text     default null,
  p_video_url   text     default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_status public.event_status;
  v_host   uuid;
  v_limit  smallint;
  v_effective_limit int;
  v_count  int;
  v_next_pos int;
  v_whisky uuid;
begin
  select status, host_id, max_whiskies_per_participant
    into v_status, v_host, v_limit
    from public.tasting_events where id = p_event for update;

  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if not public.is_event_participant(p_event) then
    raise exception 'Nur Teilnehmer dürfen Whiskies eintragen.' using errcode = 'PT004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Whiskies lassen sich nur vor dem Start eintragen.' using errcode = 'PT005';
  end if;

  if v_limit is not null then
    v_effective_limit := v_limit + case when v_uid = v_host then 1 else 0 end;
    select count(*) into v_count
      from public.whisky_details
      where event_id = p_event and brought_by = v_uid;
    if v_count >= v_effective_limit then
      raise exception 'Dein Limit an Whiskies für dieses Tasting ist erreicht.' using errcode = 'PT003';
    end if;
  end if;

  select coalesce(max(position), 0) + 1 into v_next_pos
    from public.whiskies where event_id = p_event;
  if v_next_pos > 10 then
    raise exception 'Mehr als 10 Whiskies pro Tasting sind nicht vorgesehen.' using errcode = 'PT008';
  end if;

  insert into public.whiskies (event_id, position)
  values (p_event, v_next_pos)
  returning id into v_whisky;

  insert into public.whisky_details
    (whisky_id, event_id, brought_by, name, distillery, region, age_years, abv,
     cask_type, bottler, price_eur, owner_notes, video_url)
  values
    (v_whisky, p_event, v_uid, trim(p_name), nullif(trim(p_distillery), ''),
     nullif(trim(p_region), ''), p_age_years, p_abv, nullif(trim(p_cask_type), ''),
     nullif(trim(p_bottler), ''), p_price_eur, nullif(trim(p_owner_notes), ''),
     nullif(trim(p_video_url), ''));

  return v_whisky;
end;
$$;

-- ===========================================================================
-- Eigenen Whisky entfernen  (Bringer oder Admin, nur 'draft') — schließt die
-- Positionslücke wieder.
-- ===========================================================================
create or replace function public.remove_whisky(p_whisky uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_event   uuid;
  v_pos     int;
  v_bringer uuid;
  v_status  public.event_status;
begin
  select w.event_id, w.position, wd.brought_by
    into v_event, v_pos, v_bringer
    from public.whiskies w
    join public.whisky_details wd on wd.whisky_id = w.id
    where w.id = p_whisky;

  if v_event is null then
    raise exception 'Whisky nicht gefunden.' using errcode = 'PT004';
  end if;

  select status into v_status from public.tasting_events where id = v_event for update;
  if v_status <> 'draft' then
    raise exception 'Nach dem Start lässt sich die Whisky-Liste nicht mehr ändern.' using errcode = 'PT005';
  end if;
  if not (v_bringer = v_uid or public.is_admin()) then
    raise exception 'Nur der Bringer oder der Admin darf den Whisky entfernen.' using errcode = 'PT004';
  end if;

  set constraints all deferred;
  delete from public.whiskies where id = p_whisky;
  update public.whiskies
    set position = position - 1
    where event_id = v_event and position > v_pos;
end;
$$;

-- ===========================================================================
-- Ausschankreihenfolge setzen  (Gastgeber oder Admin).
-- p_ordered = alle Whisky-IDs des Events in Wunschreihenfolge (Index 1..n).
-- Läuft das Event, sind ausgeschenkte Positionen gesperrt. Alle Positionen
-- werden in EINEM Statement geschrieben (Unique-Index-Kollision beim Tausch).
-- ===========================================================================
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
  if not (public.is_admin() or public.is_event_host(p_event)) then
    raise exception 'Nur Gastgeber oder Admin dürfen die Reihenfolge setzen.' using errcode = 'PT004';
  end if;
  select status, current_position into v_status, v_cur
    from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if v_status = 'closed' then
    raise exception 'Ein abgeschlossenes Event lässt sich nicht mehr ändern.' using errcode = 'PT010';
  end if;

  select count(*) into v_n from public.whiskies where event_id = p_event;

  if array_length(p_ordered, 1) is distinct from v_n
     or (select count(distinct x) from unnest(p_ordered) x) <> v_n
     or exists (
        select 1 from unnest(p_ordered) x
        where not exists (select 1 from public.whiskies w where w.id = x and w.event_id = p_event)
     )
  then
    raise exception 'Die übergebene Reihenfolge passt nicht zu den Whiskies des Events.' using errcode = 'PT008';
  end if;

  if v_status = 'active' and v_cur > 0 then
    select count(*) into v_locked
    from unnest(p_ordered) with ordinality as o(id, ord)
    join public.whiskies w on w.id = o.id
    where o.ord <= v_cur and w.position <> o.ord;
    if v_locked > 0 then
      raise exception 'Bereits ausgeschenkte Whiskies lassen sich nicht mehr umsortieren.' using errcode = 'PT006';
    end if;
  end if;

  set constraints all deferred;
  update public.whiskies w
    set position = o.ord
  from unnest(p_ordered) with ordinality as o(id, ord)
  where w.id = o.id and w.event_id = p_event;
end;
$$;

-- ===========================================================================
-- Event starten  (Gastgeber oder Admin): draft → active
--   verlangt ≥ 1 Whisky und lückenlose Reihenfolge 1..n
-- ===========================================================================
create or replace function public.start_event(p_event uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
  v_n      int;
  v_maxpos int;
begin
  if not (public.is_admin() or public.is_event_host(p_event)) then
    raise exception 'Nur Gastgeber oder Admin dürfen das Event starten.' using errcode = 'PT004';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Nur ein Event in Vorbereitung lässt sich starten.' using errcode = 'PT010';
  end if;

  select count(*), coalesce(max(position), 0) into v_n, v_maxpos
    from public.whiskies where event_id = p_event;
  if v_n = 0 then
    raise exception 'Es ist noch kein Whisky eingetragen.' using errcode = 'PT008';
  end if;
  if v_maxpos <> v_n then
    raise exception 'Die Ausschankreihenfolge hat Lücken.' using errcode = 'PT008';
  end if;

  begin
    update public.tasting_events
      set status = 'active', current_position = 1, started_at = now()
      where id = p_event;
  exception when unique_violation then
    raise exception 'Es läuft bereits ein anderes Tasting.' using errcode = 'PT010';
  end;
end;
$$;

-- ===========================================================================
-- Runde abschließen  (Gastgeber oder Admin): current_position + 1
--   p_expected_position = optimistische Sperre gegen Doppel-Tap auf zwei Geräten.
-- ===========================================================================
create or replace function public.close_round(p_event uuid, p_expected_position smallint)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
  v_cur    int;
  v_n      int;
begin
  if not (public.is_admin() or public.is_event_host(p_event)) then
    raise exception 'Nur Gastgeber oder Admin dürfen die Runde weiterschalten.' using errcode = 'PT004';
  end if;
  select status, current_position into v_status, v_cur
    from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if v_status <> 'active' then
    raise exception 'Das Event läuft nicht.' using errcode = 'PT010';
  end if;
  if v_cur <> p_expected_position then
    raise exception 'Die Runde wurde bereits weitergeschaltet.' using errcode = 'PT002';
  end if;

  select count(*) into v_n from public.whiskies where event_id = p_event;
  if v_cur >= v_n then
    raise exception 'Der letzte Whisky ist im Glas — jetzt nur noch das Tasting abschließen.'
      using errcode = 'PT007';
  end if;

  update public.tasting_events set current_position = current_position + 1
    where id = p_event;
end;
$$;

-- ===========================================================================
-- Event abschließen  (Gastgeber oder Admin): active → closed
-- ===========================================================================
create or replace function public.close_event(p_event uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
begin
  if not (public.is_admin() or public.is_event_host(p_event)) then
    raise exception 'Nur Gastgeber oder Admin dürfen das Event abschließen.' using errcode = 'PT004';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if v_status <> 'active' then
    raise exception 'Nur ein laufendes Event lässt sich abschließen.' using errcode = 'PT010';
  end if;

  update public.tasting_events
    set status = 'closed', closed_at = now()
    where id = p_event;
end;
$$;

-- ===========================================================================
-- Bewertungsfortschritt  (Gastgeber oder Admin): NUR Zählwerte, keine Punkte, keine Namen.
-- ===========================================================================
create or replace function public.rating_progress(p_event uuid)
returns table (position smallint, rating_count int, participant_count int)
language plpgsql security definer set search_path = ''
as $$
begin
  if not (public.is_admin() or public.is_event_host(p_event)) then
    raise exception 'Nur Gastgeber oder Admin dürfen den Fortschritt abfragen.' using errcode = 'PT004';
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

-- ---------------------------------------------------------------------------
-- Aufruf nur für authentifizierte Nutzer.
-- ---------------------------------------------------------------------------
revoke execute on function
  public.create_event(date, text, uuid, text, text, smallint),
  public.update_event(uuid, date, text, uuid, text, text, smallint),
  public.update_event_host_fields(uuid, text, text, text),
  public.set_event_participants(uuid, uuid[]),
  public.add_whisky(uuid, text, text, text, smallint, numeric, text, text, numeric, text, text),
  public.remove_whisky(uuid),
  public.set_whisky_order(uuid, uuid[]),
  public.start_event(uuid),
  public.close_round(uuid, smallint),
  public.close_event(uuid),
  public.rating_progress(uuid)
from public, anon;

grant execute on function
  public.create_event(date, text, uuid, text, text, smallint),
  public.update_event(uuid, date, text, uuid, text, text, smallint),
  public.update_event_host_fields(uuid, text, text, text),
  public.set_event_participants(uuid, uuid[]),
  public.add_whisky(uuid, text, text, text, smallint, numeric, text, text, numeric, text, text),
  public.remove_whisky(uuid),
  public.set_whisky_order(uuid, uuid[]),
  public.start_event(uuid),
  public.close_round(uuid, smallint),
  public.close_event(uuid),
  public.rating_progress(uuid)
to authenticated;

commit;
