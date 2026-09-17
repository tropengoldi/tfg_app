-- PROJ-15 · Persönliche Whisky-Datenbank (teilbar)
--
-- Ein rein persönliches, freies Whisky-Tagebuch pro Mitglied — unabhängig
-- von Events. Anders als die profilbezogene Sichtbarkeit aus PROJ-14 (drei
-- einzelne Spalten in einer sonst sichtbaren Zeile maskieren) ist die
-- Sichtbarkeit hier ZEILENWEISE, alles oder nichts pro Person: die eigenen
-- Zeilen immer, fremde nur wenn die Zielperson „Sammlung sichtbar" an hat.
-- Das lässt sich direkt als RLS-USING-Klausel ausdrücken — keine maskierende
-- Sicht nötig.
--
-- Bausteine (Reihenfolge ist relevant: die Helfer-Funktion ist `language
-- sql` und wird deshalb schon bei CREATE FUNCTION gegen die referenzierten
-- Spalten geprüft — profiles.show_collection muss also VOR der Funktion
-- angelegt werden, nicht erst danach):
--   1. Neue Tabelle collection_entries (eine Zeile pro Sammlungs-Eintrag).
--      source_event_id verweist optional auf das Ursprungs-Event (gesetzt nur
--      über den PROJ-9-„Zur Sammlung hinzufügen"-Button) mit ON DELETE SET
--      NULL — ein gelöschtes Event darf den Eintrag nicht mitreißen.
--      source_event_date ist ein unveränderlicher Datums-Snapshot, der auch
--      nach dem Verlust der Verknüpfung noch die Herkunfts-Zeile trägt.
--   2. Achter Sichtbarkeits-Schalter profiles.show_collection (Default
--      sichtbar, wie die sieben aus PROJ-14) inkl. Spalten-GRANT.
--   3. Helfer-Funktion profile_shows_collection(uuid) — liest
--      profiles.show_collection (SECURITY DEFINER, Projekt-Konvention: keine
--      Policy referenziert eine andere Tabelle direkt).
--   4. RLS: eigene Zeilen immer lesbar; fremde nur bei show_collection = true.
--      Schreiben (Insert/Update/Delete) nur die eigene Zeile. Das
--      Herkunftsfeld ist nach dem Anlegen nicht mehr änderbar (Spalten-GRANT
--      lässt source_event_id/source_event_date beim Update aus).

begin;

-- ===========================================================================
-- 1 · Tabelle
-- ===========================================================================
create table public.collection_entries (
  id                 uuid        primary key default gen_random_uuid(),
  profile_id         uuid        not null references public.profiles (id) on delete cascade,
  name               text        not null check (char_length(name) between 1 and 200),
  distillery         text        check (distillery is null or char_length(distillery) <= 120),
  region             text        check (region is null or char_length(region) <= 120),
  age_label          text        check (age_label is null or char_length(age_label) <= 50),
  tasted_on          date,
  value_note         text        check (value_note is null or char_length(value_note) <= 200),
  rating             smallint    check (rating is null or rating between 1 and 10),
  notes              text        check (notes is null or char_length(notes) <= 2000),
  owned              boolean     not null default false,
  source_event_id    uuid        references public.tasting_events (id) on delete set null,
  source_event_date  date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_collection_entries_profile
  on public.collection_entries (profile_id, updated_at desc);

create trigger set_updated_at before update on public.collection_entries
  for each row execute function public.tg_set_updated_at();

-- ===========================================================================
-- 2 · Achter Sichtbarkeits-Schalter (PROJ-14-Muster)
--   Muss vor der Helfer-Funktion in Abschnitt 3 stehen — die Funktion ist
--   `language sql` und wird schon bei CREATE FUNCTION gegen die Spalte
--   geprüft.
-- ===========================================================================
alter table public.profiles
  add column if not exists show_collection boolean not null default true;

-- Additiv zu den bestehenden Spalten-GRANTs aus PROJ-14 (Spaltenrechte
-- akkumulieren pro Rolle/Tabelle, kein erneutes Auflisten der übrigen sechs
-- nötig).
grant select (show_collection) on public.profiles to authenticated;
grant update (show_collection) on public.profiles to authenticated;

-- ===========================================================================
-- 3 · Helfer-Funktion  (SECURITY DEFINER + STABLE + search_path = '')
-- ===========================================================================
create or replace function public.profile_shows_collection(p_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select show_collection from public.profiles where id = p_profile),
    false
  );
$$;

revoke execute on function public.profile_shows_collection(uuid) from public, anon;
grant  execute on function public.profile_shows_collection(uuid) to authenticated;

-- ===========================================================================
-- 4 · RLS
-- ===========================================================================
revoke all on public.collection_entries from anon;
alter table public.collection_entries enable row level security;

create policy collection_entries_select on public.collection_entries
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (select public.profile_shows_collection(profile_id))
  );

create policy collection_entries_insert_own on public.collection_entries
  for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy collection_entries_update_own on public.collection_entries
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy collection_entries_delete_own on public.collection_entries
  for delete to authenticated
  using (profile_id = (select auth.uid()));

-- Herkunftsfeld nach dem Anlegen einfrieren: Update-Grant lässt
-- source_event_id/source_event_date bewusst aus (id/profile_id/created_at
-- ohnehin nicht dabei).
revoke update on public.collection_entries from authenticated;
grant  update (
  name, distillery, region, age_label, tasted_on,
  value_note, rating, notes, owned
) on public.collection_entries to authenticated;

commit;
