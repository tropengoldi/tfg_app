-- PROJ-4 · Admin – Tasting-Events verwalten: Datenbank-Aktionen
--
-- Zwei RPCs, SECURITY DEFINER + SET search_path = ''. Jede prüft die Admin-Rolle
-- selbst. Anlegen/Bearbeiten laufen weiter über die PROJ-1-RPCs
-- (create_event / update_event / set_event_participants).
--
-- Neuer Custom-SQLSTATE (Klasse 'TS', siehe src/lib/errors.ts):
--   TS015 event_has_whiskies

begin;

-- ---------------------------------------------------------------------------
-- Event-Liste für den Admin: Event + Gastgebername + Teilnehmer- und
-- Whisky-Anzahl gebündelt. Sortierung: heute/Zukunft zuerst (nächstes oben),
-- danach Vergangenheit (jüngstes oben).
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_events()
returns table (
  id                uuid,
  event_date        date,
  location          text,
  theme             text,
  host_id           uuid,
  host_name         text,
  status            public.event_status,
  max_whiskies_per_participant smallint,
  participant_count int,
  whisky_count      int
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
  select e.id,
         e.event_date,
         e.location,
         e.theme,
         e.host_id,
         hp.display_name as host_name,
         e.status,
         e.max_whiskies_per_participant,
         (select count(*)::int from public.event_participants ep where ep.event_id = e.id),
         (select count(*)::int from public.whiskies w where w.event_id = e.id)
  from public.tasting_events e
  join public.profiles hp on hp.id = e.host_id
  order by (e.event_date >= current_date) desc,
           case when e.event_date >= current_date then e.event_date end asc,
           e.event_date desc
  limit 1000;
end;
$$;

-- ---------------------------------------------------------------------------
-- Event löschen — nur „In Vorbereitung" und nur ohne Whiskies/Bewertungen.
-- Löscht die Teilnehmer-Zuordnung mit (ON DELETE CASCADE).
-- ---------------------------------------------------------------------------
create or replace function public.delete_event(p_event uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.event_status;
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Nur ein Tasting in Vorbereitung lässt sich löschen.' using errcode = 'TS005';
  end if;
  if exists (select 1 from public.whiskies w where w.event_id = p_event) then
    raise exception 'Es hängen bereits Whiskies an diesem Tasting. Entferne sie zuerst.'
      using errcode = 'TS015';
  end if;

  delete from public.tasting_events where id = p_event;
end;
$$;

revoke execute on function
  public.admin_list_events(),
  public.delete_event(uuid)
from public, anon;

grant execute on function
  public.admin_list_events(),
  public.delete_event(uuid)
to authenticated;

commit;
