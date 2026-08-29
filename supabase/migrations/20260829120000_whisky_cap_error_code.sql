-- PROJ-5 · Eigener Fehlercode für „mehr als 10 Whiskys pro Abend"
--
-- `add_whisky` meldete die Obergrenze bisher mit `TS008` (= order_invalid,
-- „Ausschankreihenfolge unvollständig"). Beim Eintragen ist keine Reihenfolge im
-- Spiel — im Frontend käme dadurch der falsche Hilfetext. Neuer Code:
--   TS016 event_whisky_cap_reached
--
-- Sonst ist die Funktion unverändert (byte-genau die Fassung aus
-- 20260827120700_error_codes_ts_prefix.sql). `create or replace` erhält die
-- bestehenden EXECUTE-Grants.

begin;

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
  if not public.is_event_participant(p_event) then
    raise exception 'Nur Teilnehmer dürfen Whiskies eintragen.' using errcode = 'TS004';
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

commit;
