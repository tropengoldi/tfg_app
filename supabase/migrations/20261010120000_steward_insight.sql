-- PROJ-20 · Whisky-Steward: Live-Einblick in Wertungen
--
--   1. steward_can_view_insight(event) — DIE eine Stelle für die Regel
--      „aktiver Nutzer ∧ Steward dieses Events ∧ Event läuft ∧ Event sichtbar (PROJ-26)".
--      Bewusst NICHT can_run_host_control: das schließt den Admin ein, der meist
--      mitverkostet und den Einblick nicht bekommen darf.
--   2. steward_ratings(event)     — je ausgeschenktem Whisky × Teilnehmer eine Zeile,
--      Punkte + Notiz (leer = noch nicht bewertet).
--   3. steward_winner_tips(event) — je Teilnehmer der getippte Whisky (leer = kein Tipp).
--
-- Nur lesend (STABLE). Zugriffsregeln auf ratings / winner_tips und alle Sichten
-- bleiben UNVERÄNDERT. Nach dem Abschluss lehnen beide Funktionen ab (TS004).
-- Kein neuer Fehlercode.

begin;

-- ===========================================================================
-- 1 · Prüfung
-- ===========================================================================
create or replace function public.steward_can_view_insight(p_event uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_active_member()
     and exists (
       select 1 from public.tasting_events
       where id = p_event
         and helper_id = (select auth.uid())
         and status = 'active'
     )
     and public.event_visible(p_event);
$$;

-- ===========================================================================
-- 2 · Wertungen
-- ===========================================================================
create or replace function public.steward_ratings(p_event uuid)
returns table (
  whisky_id       uuid,
  whisky_position smallint,
  whisky_name     text,
  rater_id        uuid,
  rater_name      text,
  nose_points     numeric,
  taste_points    numeric,
  total_points    numeric,
  notes           text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.steward_can_view_insight(p_event) then
    raise exception 'Nur der Whisky-Steward sieht die Wertungen, solange das Tasting läuft.'
      using errcode = 'TS004';
  end if;

  return query
  select w.id,
         w.position,
         d.name,
         p.id,
         p.display_name,
         r.nose_points,
         r.taste_points,
         r.total_points,
         r.notes
  from public.tasting_events e
  join public.whiskies w            on w.event_id = e.id
                                   and w.position <= e.current_position
  join public.whisky_details d      on d.whisky_id = w.id
  join public.event_participants ep on ep.event_id = e.id
  join public.profiles p            on p.id = ep.profile_id
  left join public.ratings r        on r.whisky_id = w.id
                                   and r.profile_id = ep.profile_id
  where e.id = p_event
  order by w.position, p.display_name;
end;
$$;

-- ===========================================================================
-- 3 · Sieger-Tipps
-- ===========================================================================
create or replace function public.steward_winner_tips(p_event uuid)
returns table (
  rater_id        uuid,
  rater_name      text,
  whisky_id       uuid,
  whisky_position smallint,
  whisky_name     text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.steward_can_view_insight(p_event) then
    raise exception 'Nur der Whisky-Steward sieht die Tipps, solange das Tasting läuft.'
      using errcode = 'TS004';
  end if;

  return query
  select p.id,
         p.display_name,
         w.id,
         w.position,
         d.name
  from public.event_participants ep
  join public.profiles p        on p.id = ep.profile_id
  left join public.winner_tips t on t.event_id = ep.event_id
                                and t.profile_id = ep.profile_id
  left join public.whiskies w    on w.id = t.whisky_id
  left join public.whisky_details d on d.whisky_id = w.id
  where ep.event_id = p_event
  order by p.display_name;
end;
$$;

-- ===========================================================================
-- 4 · Rechte
-- ===========================================================================
revoke execute on function public.steward_can_view_insight(uuid) from public, anon;
revoke execute on function public.steward_ratings(uuid)          from public, anon;
revoke execute on function public.steward_winner_tips(uuid)      from public, anon;
grant  execute on function public.steward_can_view_insight(uuid) to authenticated;
grant  execute on function public.steward_ratings(uuid)          to authenticated;
grant  execute on function public.steward_winner_tips(uuid)      to authenticated;

commit;
