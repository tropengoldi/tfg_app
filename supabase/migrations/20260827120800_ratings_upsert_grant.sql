-- PROJ-1 · ratings: Spalten-GRANT so weiten, dass der Upsert funktioniert
--
-- Die App speichert/ändert Bewertungen per Upsert (INSERT ... ON CONFLICT
-- (whisky_id, profile_id) DO UPDATE). PostgREST schreibt im UPDATE-Zweig ALLE
-- Spalten der Payload — also auch whisky_id / event_id / profile_id. Mit dem
-- engen GRANT aus 20260827120300 (nur nose_points, taste_points, notes) scheitert
-- der Konflikt-Pfad mit 42501.
--
-- Das enge GRANT ist hier nicht nötig, um Manipulation zu verhindern:
--   * RLS ratings_update_own erzwingt WITH CHECK
--       profile_id = auth.uid()  AND  can_rate_whisky(whisky_id)
--     → profile_id lässt sich nicht auf einen Fremden ändern, whisky_id nicht auf
--       einen nicht ausgeschenkten Whisky.
--   * Der zusammengesetzte FK (whisky_id, event_id) → whiskies(id, event_id) hält
--     event_id konsistent.
--   * total_points ist GENERATED und bleibt außen vor.
--
-- id / created_at / updated_at bleiben ohne UPDATE-Recht (updated_at setzt ohnehin
-- der Trigger).

begin;

revoke update on public.ratings from authenticated;
grant  update (whisky_id, event_id, profile_id, nose_points, taste_points, notes)
  on public.ratings to authenticated;

commit;
