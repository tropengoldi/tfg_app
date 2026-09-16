-- PROJ-14 · Profil sichtbar für andere (Sichtbarkeits-Einstellungen)
--
-- Andere Mitglieder dürfen ein fremdes Profil read-only ansehen; jedes
-- Mitglied legt pro Feld fest, ob andere es sehen. Der Anzeigename bleibt
-- immer sichtbar (Ranglisten/Teilnehmerlisten brauchen ihn) und ist deshalb
-- nicht Teil der Schalter.
--
-- Bausteine:
--   1. 7 neue Boolean-Spalten an profiles (Default „sichtbar" — die Runde ist
--      eine geschlossene Freundesrunde ohne Fremdpublikum, siehe Spec).
--   2. Sicht profiles_public: liefert die drei Stammdaten-Felder (bio,
--      favorite_dram, favorite_region) nur, wenn der jeweilige Schalter an
--      ist ODER der Aufrufer selbst die Zeile ist (man sieht sich selbst
--      immer vollständig — die Schalter wirken nur nach außen).
--   3. Lesezugriff auf die Basistabelle wird für diese drei Felder entzogen
--      (Spalten-Grant statt Zeilen-Policy — RLS kann keine Spalten maskieren).
--      Ein Direktzugriff auf `profiles.bio` u. Ä. über den fremden Zeilen ist
--      damit nicht mehr möglich, nur noch über die Sicht. Alle anderen
--      Spalten (inkl. der 7 neuen Schalter) bleiben wie bisher lesbar.
--   4. Schreibzugriff auf die 7 Schalter: dieselbe „nur die eigene Zeile"-
--      Policy wie die bestehenden Stammdaten-Felder, per Spalten-Grant.
--
-- Die Bilanz-Kennzahlen selbst (Anzahl Tastings, mitgebrachte Whiskys, beste
-- Platzierung, Ø vergebene Punkte) brauchen KEINE neue Berechtigung — sie
-- werden aus den seit PROJ-9 für jedes aktive Mitglied freigegebenen
-- Archiv-Views (whisky_rankings, whisky_score_breakdown, event_participants
-- für abgeschlossene Events) berechnet und in der Anwendungsschicht anhand
-- der Schalter maskiert (kein Zugriff auf fremde Roh-Bewertungen).

begin;

-- ===========================================================================
-- 1 · Sichtbarkeits-Schalter
-- ===========================================================================
alter table public.profiles
  add column if not exists show_favorite_dram   boolean not null default true,
  add column if not exists show_favorite_region boolean not null default true,
  add column if not exists show_bio             boolean not null default true,
  add column if not exists show_tasting_count    boolean not null default true,
  add column if not exists show_whisky_count     boolean not null default true,
  add column if not exists show_best_placement   boolean not null default true,
  add column if not exists show_avg_points       boolean not null default true;

-- ===========================================================================
-- 2 · Sicht profiles_public — maskierte Stammdaten für fremde Betrachter
--   OHNE security_invoker → läuft mit Owner-Rechten (wie whisky_rankings /
--   past_tastings), Maskierung passiert in der Sicht selbst, nicht über RLS.
--   `(select auth.uid())` einmal pro Statement statt pro Zeile.
-- ===========================================================================
create view public.profiles_public as
select
  p.id,
  p.display_name,
  case when p.id = (select auth.uid()) or p.show_bio
    then p.bio else null end             as bio,
  case when p.id = (select auth.uid()) or p.show_favorite_dram
    then p.favorite_dram else null end   as favorite_dram,
  case when p.id = (select auth.uid()) or p.show_favorite_region
    then p.favorite_region else null end as favorite_region,
  p.show_tasting_count,
  p.show_whisky_count,
  p.show_best_placement,
  p.show_avg_points
from public.profiles p;

revoke all on public.profiles_public from anon;
grant  select on public.profiles_public to authenticated;

-- ===========================================================================
-- 3 · Lesezugriff auf die Basistabelle verengen
--   `bio` / `favorite_dram` / `favorite_region` sind ab jetzt nur noch über
--   die Sicht erreichbar — ein Direktzugriff auf profiles für eine fremde
--   Zeile liefert diese drei Felder nicht mehr. Alle anderen Spalten
--   (inkl. der 7 neuen Schalter) bleiben wie bisher direkt lesbar, u. a. weil
--   past_tastings / whisky_rankings / die Teilnehmerlisten weiterhin
--   display_name brauchen und die eigene Profilseite die Schalter lädt.
-- ===========================================================================
revoke select on public.profiles from authenticated;
grant  select (
  id, display_name, role, avatar_url, is_active, created_at, updated_at,
  show_favorite_dram, show_favorite_region, show_bio,
  show_tasting_count, show_whisky_count, show_best_placement, show_avg_points
) on public.profiles to authenticated;

-- ===========================================================================
-- 4 · Schreibzugriff auf die 7 Schalter — nur die eigene Zeile
--   `profiles_update_own` (PROJ-1) gilt schon zeilenweise für alle Updates;
--   hier nur der zusätzliche Spalten-Grant für die neuen Felder.
-- ===========================================================================
grant update (
  show_favorite_dram, show_favorite_region, show_bio,
  show_tasting_count, show_whisky_count, show_best_placement, show_avg_points
) on public.profiles to authenticated;

commit;
