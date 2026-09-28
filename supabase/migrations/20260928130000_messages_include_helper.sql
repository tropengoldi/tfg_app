-- PROJ-16 · Fix: der Helfer eines Tastings (PROJ-11) fehlte als möglicher
-- Empfänger einer tasting-bezogenen Nachricht.
--
-- Der Helfer steht bewusst nicht in event_participants (er verkostet nicht
-- mit, siehe PROJ-11) — resolve_message_recipients prüfte "gehört zu diesem
-- Tasting" aber ausschließlich über event_participants, dadurch war der
-- Helfer weder in der Empfänger-Auswahl der App sichtbar noch als Empfänger
-- zulässig. Ein Fund aus dem echten Betrieb (Post-Deploy), kein bewusster
-- Scope-Entscheid: der Helfer steuert den Abend und gehört als Empfänger
-- klar dazu.
--
-- Fix: ein Empfänger gilt zusätzlich als beteiligt, wenn er der Helfer des
-- Tastings ist. Signatur/Fehlercodes unverändert, nur create or replace.

begin;

create or replace function public.resolve_message_recipients(
  p_recipient_ids uuid[],
  p_event_id      uuid default null
) returns table (
  recipient_id    uuid,
  recipient_email text,
  recipient_name  text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_ids uuid[];
begin
  if not public.is_active_member() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  if p_event_id is not null then
    if not (
      public.is_event_participant(p_event_id)
      or public.is_event_host(p_event_id)
      or public.is_event_helper(p_event_id)
    ) then
      raise exception 'Du bist an diesem Tasting nicht beteiligt.' using errcode = 'TS018';
    end if;
  end if;

  -- Dedup + Absender selbst raus (still, kein Fehler — die UI wählt sich
  -- ohnehin nie selbst vor, das ist nur das Sicherheitsnetz).
  select coalesce(array_agg(distinct x), array[]::uuid[]) into v_ids
  from unnest(p_recipient_ids) x
  where x <> v_uid;

  if array_length(v_ids, 1) is null then
    return; -- leere Ergebnismenge, kein Fehler — der Aufrufer meldet "keiner erreichbar"
  end if;

  if p_event_id is not null then
    if exists (
      select 1 from unnest(v_ids) rid
      where not exists (
        select 1 from public.event_participants ep
        where ep.event_id = p_event_id and ep.profile_id = rid
      )
      -- Fix: der Helfer gehört auch dazu, obwohl er kein event_participants-
      -- Eintrag hat (er verkostet nicht mit, siehe PROJ-11).
      and not exists (
        select 1 from public.tasting_events te
        where te.id = p_event_id and te.helper_id = rid
      )
    ) then
      raise exception 'Mindestens einer der gewählten Empfänger gehört nicht zu diesem Tasting.'
        using errcode = 'TS019';
    end if;
  end if;

  return query
  select p.id, u.email::text, p.display_name
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = any (v_ids)
    and p.is_active;
end;
$$;

commit;
