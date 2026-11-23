-- PROJ-28 · Whisky-Fotos
--
-- Je ein optionales Foto pro Tasting-Whisky und pro Sammlungs-Eintrag, gespeichert
-- in einem PRIVATEN Storage-Bucket. Die Datenbank kennt nur die Speicherorte; der
-- Browser lädt die (bereits verkleinerten) Dateien direkt in den Bucket, angezeigt
-- wird ausschließlich über kurzlebige signierte Links.
--
-- Bausteine:
--   1. Spalten photo_path / photo_thumb_path an whisky_details und collection_entries.
--      whisky_details: KEIN Update-Grant — geschrieben wird nur über set_whisky_photo,
--      damit die bestehende Sperre „Details nur im Entwurf" für alle anderen Felder
--      unverändert bleibt. collection_entries: Update-Grant um die zwei Spalten
--      erweitert (eigene Zeile, wie die übrigen Felder).
--   2. whisky_rankings hängt die zwei Spalten an (Ergebnisseite).
--   3. Prüf-Funktionen:
--        can_view_whisky_details(whisky)  — DIE Blindheits-Regel für Fotos:
--            vor dem Abschluss wie wd_select (Admin, Steward, Bringer, Gastgeber ohne
--            Steward), nach dem Abschluss jedes aktive Mitglied (gemeinsames Archiv
--            seit PROJ-9, Entscheidung 2026-11-23); Testkonten-Tastings nur für
--            Testkonten/Admin (PROJ-26).
--        can_edit_whisky_photo(whisky)    — Bringer (aktiv) oder Admin, jeder Status.
--        whisky_photo_object_ok(name, op) — dieselben Regeln für Bucket-Objekte,
--            gelesen aus dem Pfad: tasting/<event>/<whisky>/… bzw.
--            collection/<profil>/<eintrag>/…  Ungültige Pfade → false (nie ein Fehler
--            im Policy-Ausdruck).
--   4. RPC set_whisky_photo(whisky, photo, thumb) — die EINE Schreib-Stelle für
--      Tasting-Fotos. Beide null = entfernen. Liefert die bisherigen Pfade, damit die
--      App die alten Dateien löscht. Neuer Fehlercode TS027 (ungültiger Speicherort).
--   5. Bucket whisky-photos (privat, 2 MB, nur image/jpeg) + Regeln auf
--      storage.objects für Lesen, Anlegen, Löschen. Kein Überschreiben (Update):
--      jeder Upload hat einen neuen Dateinamen.
--
-- Datenbank-Kaskaden löschen keine Storage-Dateien; Reste räumen die Wartungsskripte
-- (tasting:delete, user:delete, photos:cleanup) weg.

begin;

-- ===========================================================================
-- 1 · Spalten
-- ===========================================================================
alter table public.whisky_details
  add column photo_path       text check (photo_path is null or char_length(photo_path) <= 300),
  add column photo_thumb_path text check (photo_thumb_path is null or char_length(photo_thumb_path) <= 300),
  add constraint whisky_details_photo_pair
    check ((photo_path is null) = (photo_thumb_path is null));

alter table public.collection_entries
  add column photo_path       text check (photo_path is null or char_length(photo_path) <= 300),
  add column photo_thumb_path text check (photo_thumb_path is null or char_length(photo_thumb_path) <= 300),
  add constraint collection_entries_photo_pair
    check ((photo_path is null) = (photo_thumb_path is null));

-- Sammlung: die eigene Zeile darf ihre Foto-Spalten setzen. Pfade, die nicht im
-- eigenen Ordner liegen, lehnt die Prüfung unten ab.
grant update (photo_path, photo_thumb_path) on public.collection_entries to authenticated;

alter table public.collection_entries
  add constraint collection_entries_photo_folder
    check (
      photo_path is null
      or (
        photo_path       ~ ('^collection/' || profile_id::text || '/' || id::text || '/[0-9]{10,16}-full\.jpg$')
        and photo_thumb_path ~ ('^collection/' || profile_id::text || '/' || id::text || '/[0-9]{10,16}-thumb\.jpg$')
      )
    );

-- ===========================================================================
-- 2 · Ranglisten-Sicht: Foto-Spalten anhängen (Definition sonst unverändert)
-- ===========================================================================
create or replace view public.whisky_rankings as
select
  w.event_id,
  w.id                                         as whisky_id,
  w.position,
  wd.name,
  wd.distillery,
  wd.region,
  wd.video_url,
  wd.brought_by,
  coalesce(sum(r.nose_points), 0)::numeric     as nose_total,
  coalesce(sum(r.taste_points), 0)::numeric    as taste_total,
  coalesce(sum(r.total_points), 0)::numeric    as total_points,
  count(r.id)::int                             as rating_count,
  rank() over (
    partition by w.event_id
    order by coalesce(sum(r.total_points), 0) desc,
             coalesce(sum(r.taste_points), 0) desc,
             coalesce(sum(r.nose_points), 0) desc,
             w.position asc
  )::int                                       as rank,
  wd.abv,
  wd.age_years,
  wd.price_eur,
  public.is_test_event(w.event_id)             as is_test,
  wd.photo_path,
  wd.photo_thumb_path
from public.whiskies w
join public.tasting_events e  on e.id = w.event_id and e.status = 'closed'
join public.whisky_details wd on wd.whisky_id = w.id
left join public.ratings r    on r.whisky_id = w.id
where public.is_active_member()
  and ((select public.viewer_sees_tests()) or not public.is_test_event(w.event_id))
group by w.event_id, w.id, w.position,
         wd.name, wd.distillery, wd.region, wd.video_url, wd.brought_by,
         wd.abv, wd.age_years, wd.price_eur, wd.photo_path, wd.photo_thumb_path;

-- ===========================================================================
-- 3 · Prüf-Funktionen
-- ===========================================================================
create or replace function public.can_view_whisky_details(p_whisky uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.whisky_details wd
    where wd.whisky_id = p_whisky
      and (
        public.is_admin()
        or public.is_event_helper(wd.event_id)
        or (
          public.is_event_participant(wd.event_id)
          and (
            wd.brought_by = (select auth.uid())
            or (public.is_event_host(wd.event_id) and not public.event_has_helper(wd.event_id))
          )
        )
        or (public.is_event_closed(wd.event_id) and public.is_active_member())
      )
      and (public.viewer_sees_tests() or not public.is_test_event(wd.event_id))
  );
$$;

create or replace function public.can_edit_whisky_photo(p_whisky uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.whisky_details wd
    where wd.whisky_id = p_whisky
      and (
        public.is_admin()
        or (wd.brought_by = (select auth.uid()) and public.is_active_member())
      )
  );
$$;

-- Bucket-Objekt prüfen. p_op: 'read' | 'write'. Liest den Pfad, prüft die Form
-- per Regex VOR jedem Cast — ein kaputter Name ergibt false, nie einen Fehler.
create or replace function public.whisky_photo_object_ok(p_name text, p_op text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uuid  constant text := '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  v_parts text[];
  v_whisky uuid;
  v_owner  uuid;
begin
  if p_name is null or (select auth.uid()) is null then
    return false;
  end if;

  if p_name ~ ('^tasting/' || v_uuid || '/' || v_uuid || '/[0-9]{10,16}-(full|thumb)\.jpg$') then
    v_parts  := string_to_array(p_name, '/');
    v_whisky := v_parts[3]::uuid;
    -- Event-Segment muss zum Whisky passen (kein Unterschieben in fremde Ordner).
    if not exists (
      select 1 from public.whisky_details wd
      where wd.whisky_id = v_whisky and wd.event_id = v_parts[2]::uuid
    ) then
      return false;
    end if;
    if p_op = 'read' then
      return public.can_view_whisky_details(v_whisky);
    end if;
    return public.can_edit_whisky_photo(v_whisky);
  end if;

  if p_name ~ ('^collection/' || v_uuid || '/' || v_uuid || '/[0-9]{10,16}-(full|thumb)\.jpg$') then
    v_parts := string_to_array(p_name, '/');
    v_owner := v_parts[2]::uuid;
    if p_op = 'read' then
      return v_owner = (select auth.uid()) or public.profile_shows_collection(v_owner);
    end if;
    return v_owner = (select auth.uid()) and public.is_active_member();
  end if;

  return false;
end;
$$;

revoke all on function public.can_view_whisky_details(uuid)       from public, anon;
revoke all on function public.can_edit_whisky_photo(uuid)         from public, anon;
revoke all on function public.whisky_photo_object_ok(text, text)  from public, anon;
grant execute on function public.can_view_whisky_details(uuid)      to authenticated;
grant execute on function public.can_edit_whisky_photo(uuid)        to authenticated;
grant execute on function public.whisky_photo_object_ok(text, text) to authenticated;

-- ===========================================================================
-- 4 · Foto eines Tasting-Whiskys setzen / entfernen
-- ===========================================================================
create or replace function public.set_whisky_photo(
  p_whisky     uuid,
  p_photo_path text default null,
  p_thumb_path text default null
)
returns table (old_photo_path text, old_thumb_path text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_event  uuid;
  v_old_p  text;
  v_old_t  text;
  v_prefix text;
begin
  if (select auth.uid()) is null or not public.is_active_member() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  select wd.event_id, wd.photo_path, wd.photo_thumb_path
    into v_event, v_old_p, v_old_t
  from public.whisky_details wd
  where wd.whisky_id = p_whisky
  for update;

  if v_event is null or not public.can_edit_whisky_photo(p_whisky) then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  if (p_photo_path is null) <> (p_thumb_path is null) then
    raise exception 'Ungültiger Speicherort für das Foto.' using errcode = 'TS027';
  end if;

  if p_photo_path is not null then
    v_prefix := 'tasting/' || v_event::text || '/' || p_whisky::text || '/';
    if p_photo_path !~ ('^' || v_prefix || '([0-9]{10,16})-full\.jpg$')
       or p_thumb_path !~ ('^' || v_prefix || '([0-9]{10,16})-thumb\.jpg$')
       or substring(p_photo_path from '([0-9]{10,16})-full\.jpg$')
          <> substring(p_thumb_path from '([0-9]{10,16})-thumb\.jpg$') then
      raise exception 'Ungültiger Speicherort für das Foto.' using errcode = 'TS027';
    end if;
  end if;

  update public.whisky_details wd
     set photo_path = p_photo_path,
         photo_thumb_path = p_thumb_path
   where wd.whisky_id = p_whisky;

  return query select v_old_p, v_old_t;
end;
$$;

revoke all on function public.set_whisky_photo(uuid, text, text) from public, anon;
grant execute on function public.set_whisky_photo(uuid, text, text) to authenticated;

-- ===========================================================================
-- 5 · Bucket + Regeln
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('whisky-photos', 'whisky-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists whisky_photos_select on storage.objects;
drop policy if exists whisky_photos_insert on storage.objects;
drop policy if exists whisky_photos_delete on storage.objects;

create policy whisky_photos_select on storage.objects
  for select to authenticated
  using (bucket_id = 'whisky-photos' and public.whisky_photo_object_ok(name, 'read'));

create policy whisky_photos_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'whisky-photos' and public.whisky_photo_object_ok(name, 'write'));

create policy whisky_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'whisky-photos' and public.whisky_photo_object_ok(name, 'write'));

commit;
