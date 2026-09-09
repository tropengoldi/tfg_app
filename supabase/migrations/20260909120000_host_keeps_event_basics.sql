-- PROJ-11 · Verfeinerung: der Gastgeber behält die Eckdaten (Thema / Essen /
-- Anmerkungen) auch dann, wenn ein Helfer benannt ist.
--
-- Ausgangslage: mit `20260831120000_helper_role.sql` wanderten ALLE sechs
-- Steuerungs-RPCs auf `can_run_host_control()`. Damit verlor der
-- Gastgeber-mit-Helfer auch `update_event_host_fields` — also Thema, Info zum
-- Essen und Anmerkungen. Das ist zu weit: Essen und Anmerkungen sind Sache des
-- Gastgebers (er lädt zu sich nach Hause ein) und berühren die Blindheit nicht.
--
-- Änderung: `update_event_host_fields` erlaubt zusätzlich `is_event_host()`.
-- Effektiv damit: Admin ∨ Helfer ∨ Gastgeber.  Die anderen fünf RPCs
-- (`set_whisky_order`, `start_event`, `close_round`, `close_event`,
-- `rating_progress`) bleiben unverändert bei `can_run_host_control()`.
--
-- Signatur unverändert → `create or replace` erhält die EXECUTE-Grants.
-- Rumpf sonst byte-genau die Fassung aus `20260831120000_helper_role.sql`.

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
    raise exception 'Nur Gastgeber, Helfer oder Admin.' using errcode = 'TS004';
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

commit;
