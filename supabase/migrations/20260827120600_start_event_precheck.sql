-- PROJ-1 · start_event: aktives Event proaktiv prüfen statt Unique-Violation abfangen
--
-- Die abgefangene unique_violation aus dem Partial-Index one_active_event_at_a_time
-- kam über den Supabase-API-Proxy als Verbindungsabbruch zurück statt als sauberer
-- Fehler. Jetzt: erst nachsehen, ob schon ein Event 'active' ist, und dann PT010
-- werfen — es entsteht gar keine Constraint-Verletzung mehr.

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
    raise exception 'Nur Gastgeber oder Admin dürfen das Event starten.' using errcode = 'PT004';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'PT004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Nur ein Event in Vorbereitung lässt sich starten.' using errcode = 'PT010';
  end if;

  if exists (
    select 1 from public.tasting_events
    where status = 'active' and id <> p_event
  ) then
    raise exception 'Es läuft bereits ein anderes Tasting.' using errcode = 'PT010';
  end if;

  select count(*), coalesce(max(position), 0) into v_n, v_maxpos
    from public.whiskies where event_id = p_event;
  if v_n = 0 then
    raise exception 'Es ist noch kein Whisky eingetragen.' using errcode = 'PT008';
  end if;
  if v_maxpos <> v_n then
    raise exception 'Die Ausschankreihenfolge hat Lücken.' using errcode = 'PT008';
  end if;

  update public.tasting_events
    set status = 'active', current_position = 1, started_at = now()
    where id = p_event;
end;
$$;

commit;
