-- PROJ-1 · start_event: erst das Event selbst prüfen, dann den globalen Kontext
--
-- Die "es läuft bereits ein anderes Tasting"-Prüfung (TS010) stand vor der
-- "kein Whisky / Lücken"-Prüfung (TS008). Ein Event ohne Whiskies lässt sich aber
-- unter KEINEN Umständen starten — das ist ein intrinsischer Mangel und sollte
-- zuerst gemeldet werden. Reihenfolge:
--   1. Berechtigung (TS004)
--   2. Status = 'draft' (TS010)
--   3. >= 1 Whisky, lückenlose Reihenfolge 1..n (TS008)
--   4. kein anderes Event aktiv (TS010)

begin;

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
    raise exception 'Nur Gastgeber oder Admin dürfen das Event starten.' using errcode = 'TS004';
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

commit;
