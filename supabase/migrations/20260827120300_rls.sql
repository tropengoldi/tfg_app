-- PROJ-1 · Row Level Security + Spalten-GRANTs
--
-- Grundsätze:
--   * RLS auf allen fünf Tabellen, jede Policy  TO authenticated  (nie anon/public).
--   * Kein Policy-Ausdruck referenziert direkt eine andere Tabelle — alles über
--     die SECURITY-DEFINER-Helfer aus 120100 (Rekursionsschutz).
--   * (select public.fn())  statt  public.fn()  → einmal pro Statement, nicht pro Zeile.
--   * Was RLS strukturell nicht kann (Spaltenauswahl beim Schreiben, Spalten-
--     sichtbarkeit beim Lesen), läuft über GRANT/REVOKE auf Spaltenebene oder über
--     die RPCs in 120400.

begin;

-- ---------------------------------------------------------------------------
-- anon bekommt auf keine Fachtabelle Zugriff (geschlossener Nutzerkreis).
-- ---------------------------------------------------------------------------
revoke all on public.profiles           from anon;
revoke all on public.tasting_events     from anon;
revoke all on public.event_participants from anon;
revoke all on public.whiskies           from anon;
revoke all on public.whisky_details     from anon;
revoke all on public.ratings            from anon;

-- ---------------------------------------------------------------------------
-- RLS aktivieren  (KEIN "force" — die Owner-Rechte der DEFINER-Helfer sollen
-- weiterhin an RLS vorbeilaufen, sonst kehrt die Rekursion zurück).
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.tasting_events     enable row level security;
alter table public.event_participants enable row level security;
alter table public.whiskies           enable row level security;
alter table public.whisky_details     enable row level security;
alter table public.ratings            enable row level security;

-- ===========================================================================
-- profiles
--   Lesen: jeder Angemeldete sieht jedes Profil (keine PII, nur Anzeigedaten) —
--          Teilnehmerlisten und Ranglisten brauchen die Namen, auch von
--          stillgelegten Mitgliedern.
--   Schreiben: nur die eigene Zeile, und per Spalten-GRANT nur die unkritischen
--          Felder. role / is_active bleiben außen vor → kein Selbst-Upgrade zum Admin.
--          Anlage über handle_new_user (DEFINER), Deaktivierung über die Admin-Route
--          (PROJ-3, Service-Role).
-- ===========================================================================
create policy profiles_select_all on public.profiles
  for select to authenticated
  using (true);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, delete on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
grant  update (display_name, avatar_url, bio, favorite_dram, favorite_region)
  on public.profiles to authenticated;

-- ===========================================================================
-- tasting_events
--   Lesen: Teilnehmer des Events oder Admin.
--   Schreiben: NIEMAND direkt. RLS kann nicht einschränken, welche Spalten sich
--          ändern — ein Schreibrecht ließe host_id/status aus dem Browser umschreiben.
--          Anlegen, Bearbeiten und alle Zustandsübergänge laufen über die RPCs
--          in 120400.
-- ===========================================================================
create policy events_select_participant_or_admin on public.tasting_events
  for select to authenticated
  using (
    (select public.is_event_participant(id))
    or (select public.is_admin())
  );

revoke insert, update, delete on public.tasting_events from authenticated;

-- ===========================================================================
-- event_participants
--   Lesen: Teilnehmer desselben Events oder Admin  (Helfer → kein 42P17).
--   Schreiben: nur über RPC set_event_participants (Admin).
-- ===========================================================================
create policy participants_select_same_event on public.event_participants
  for select to authenticated
  using (
    (select public.is_event_participant(event_id))
    or (select public.is_admin())
  );

revoke insert, update, delete on public.event_participants from authenticated;

-- ===========================================================================
-- whiskies  (die SICHTBARE Hälfte — nur Position)
--   Lesen: Teilnehmer des Events oder Admin. Alle Zeilen, aber nur die Spalten
--          id / event_id / position (Spalten-GRANT).
--   Schreiben: nur über RPCs add_whisky / remove_whisky / set_whisky_order.
-- ===========================================================================
create policy whiskies_select_participant_or_admin on public.whiskies
  for select to authenticated
  using (
    (select public.is_event_participant(event_id))
    or (select public.is_admin())
  );

revoke insert, update, delete on public.whiskies from authenticated;
revoke select on public.whiskies from authenticated;
grant  select (id, event_id, position) on public.whiskies to authenticated;

-- ===========================================================================
-- whisky_details  (die GEHEIME Hälfte — Name, Herkunft, Video-Link, Bringer)
--   Lesen:
--     * Admin: immer
--     * sonst nur als Teilnehmer des Events UND
--         - es ist der eigene Whisky, ODER
--         - der Nutzer ist Gastgeber (er schenkt aus), ODER
--         - das Event ist abgeschlossen (Auflösung für alle)
--   Ändern: nur der Bringer, nur solange das Event 'draft' ist, und per
--           Spalten-GRANT nur die Sachfelder (nicht whisky_id / event_id / brought_by).
--   Anlegen / Löschen: nur über RPCs add_whisky / remove_whisky.
-- ===========================================================================
create policy wd_select on public.whisky_details
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      (select public.is_event_participant(event_id))
      and (
        brought_by = (select auth.uid())
        or (select public.is_event_host(event_id))
        or (select public.is_event_closed(event_id))
      )
    )
  );

create policy wd_update_own on public.whisky_details
  for update to authenticated
  using (
    brought_by = (select auth.uid())
    and (select public.event_status_of(event_id)) = 'draft'
  )
  with check (
    brought_by = (select auth.uid())
    and (select public.event_status_of(event_id)) = 'draft'
  );

revoke insert, delete on public.whisky_details from authenticated;
revoke update on public.whisky_details from authenticated;
grant  update (name, distillery, region, age_years, abv, cask_type,
               bottler, price_eur, owner_notes, video_url)
  on public.whisky_details to authenticated;

-- ===========================================================================
-- ratings
--   Lesen:
--     * Admin: immer
--     * sonst nur als Teilnehmer des Events UND
--         - es ist die eigene Bewertung, ODER
--         - das Event ist abgeschlossen
--     → Der Gastgeber sieht VOR dem Abschluss KEINE Punkte (er ist zwar
--       Teilnehmer, aber profile_id ≠ eigene und noch nicht 'closed').
--   Anlegen: nur unter eigenem Namen und nur wenn can_rate_whisky() zutrifft
--            (Event aktiv, Whisky ausgeschenkt, Nutzer ist Teilnehmer).
--   Ändern / Löschen: nur die eigene Bewertung; nach Abschluss zusätzlich vom
--            Trigger ratings_lock (PT001) blockiert.
--   Spalten-GRANT: schreibbar nur nose_points / taste_points / notes.
-- ===========================================================================
create policy ratings_select on public.ratings
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      (select public.is_event_participant(event_id))
      and (
        profile_id = (select auth.uid())
        or (select public.is_event_closed(event_id))
      )
    )
  );

create policy ratings_insert_own on public.ratings
  for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and (select public.can_rate_whisky(whisky_id))
  );

create policy ratings_update_own on public.ratings
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (
    profile_id = (select auth.uid())
    and (select public.can_rate_whisky(whisky_id))
  );

create policy ratings_delete_own on public.ratings
  for delete to authenticated
  using (profile_id = (select auth.uid()));

revoke update on public.ratings from authenticated;
grant  update (nose_points, taste_points, notes) on public.ratings to authenticated;

commit;
