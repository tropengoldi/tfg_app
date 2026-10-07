-- PROJ-21 · Whisky-Steward bringt Whiskies mit
--
--   1. add_whisky: Berechtigung „Teilnehmer“ → „Teilnehmer oder Whisky-Steward dieses Abends“.
--      Limit, Obergrenze 10, „nur im Entwurf“ unverändert; Gastgeber-Bonus weiter nur für den Gastgeber.
--   2. update_event: Steward wechseln/entfernen wird abgelehnt (TS009), wenn der bisherige Steward
--      in diesem Abend schon Whiskies eingetragen hat.
--
-- Signaturen unverändert → create or replace erhält die EXECUTE-Grants. Rümpfe sonst byte-genau die
-- zuletzt gültigen Fassungen (add_whisky: 20260829120000, update_event: 20261006120000).
-- Ändern/Entfernen eines Whiskys, Lese-Regeln und Sichten bleiben UNVERÄNDERT.

begin;

-- ===========================================================================
-- 1 · add_whisky
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
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  -- PROJ-21: auch der Whisky-Steward dieses Abends (Limit wie Teilnehmer, kein Bonus —
  -- der Bonus hängt unten nur am Gastgeber, und der Steward ist nie Gastgeber).
  if not (public.is_event_participant(p_event) or public.is_event_helper(p_event)) then
    raise exception 'Nur Teilnehmer und der Whisky-Steward dürfen Whiskies eintragen.' using errcode = 'TS004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Whiskies lassen sich nur vor dem Start eintragen.' using errcode = 'TS005';
  end if;

  if v_limit is not null then
    v_effective_limit := v_limit + case when v_uid = v_host then 1 else 0 end;
    select count(*) into v_count
      from public.whisky_details
      where event_id = p_event and brought_by = v_uid;
    if v_count >= v_effective_limit then
      raise exception 'Dein Limit an Whiskies für dieses Tasting ist erreicht.' using errcode = 'TS003';
    end if;
  end if;

  select coalesce(max(position), 0) + 1 into v_next_pos
    from public.whiskies where event_id = p_event;
  if v_next_pos > 10 then
    raise exception 'Für diesen Abend sind bereits 10 Whiskys eingetragen — mehr sind nicht vorgesehen.'
      using errcode = 'TS016';
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
-- 2 · update_event
-- ===========================================================================
create or replace function public.update_event(
  p_event        uuid,
  p_event_date   date,
  p_location     text,
  p_host_id      uuid,
  p_helper_id    uuid     default null,
  p_theme        text     default null,
  p_food_info    text     default null,
  p_max_whiskies smallint default null,
  p_rating_step  numeric  default 1
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status     public.event_status;
  v_old_helper uuid;
begin
  if not public.is_admin() then
    raise exception 'Nur der Admin darf Events bearbeiten.' using errcode = 'TS004';
  end if;
  if p_rating_step is null or p_rating_step not in (1, 0.5) then
    raise exception 'Die Schrittweite muss 1 oder 0,5 sein.' using errcode = 'TS021';
  end if;
  select status, helper_id into v_status, v_old_helper
    from public.tasting_events where id = p_event for update;
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

  -- PROJ-21: Steward wechseln/entfernen nur, wenn der bisherige keine Whiskies eingetragen hat
  -- (gleiche Regel und gleicher Code wie beim Entfernen eines Teilnehmers).
  if v_old_helper is not null
     and v_old_helper is distinct from p_helper_id
     and exists (
       select 1 from public.whisky_details
       where event_id = p_event and brought_by = v_old_helper
     ) then
    raise exception 'Der bisherige Whisky-Steward hat schon Whiskies eingetragen. Er muss sie zuerst entfernen, dann lässt sich der Steward wechseln.'
      using errcode = 'TS009';
  end if;

  update public.tasting_events set
    event_date                  = p_event_date,
    location                    = p_location,
    theme                       = nullif(trim(p_theme), ''),
    food_info                   = nullif(trim(p_food_info), ''),
    host_id                     = p_host_id,
    helper_id                   = p_helper_id,
    max_whiskies_per_participant = p_max_whiskies,
    rating_step                  = p_rating_step
  where id = p_event;

  insert into public.event_participants (event_id, profile_id)
  values (p_event, p_host_id)
  on conflict do nothing;
end;
$$;

commit;
