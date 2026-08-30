-- PROJ-9 · Ergebnisse & Tasting-Historie: Sichtbarkeit abgeschlossener Tastings
--
-- Bis hier galt: die Rangliste und die Einzelbewertungen eines abgeschlossenen
-- Events sehen nur, wer an dem Abend teilgenommen hat. PROJ-9 macht die
-- abgeschlossene Runde zum gemeinsamen Archiv:
--
--   * whisky_rankings / past_tastings laufen künftig mit den Rechten des
--     View-Owners (statt security_invoker) und tragen den Filter „nur
--     status = 'closed'  UND  Aufrufer ist aktives Mitglied" in sich.
--     Die Blindheits-Garantie hängt weiterhin am status='closed'-Filter,
--     nicht am Rechte-Modus.
--   * Neue View whisky_score_breakdown: Punkte pro Whisky pro Bewerter
--     (Name, Nase, Geschmack, Gesamt) — OHNE notes-Spalte. Selber Filter.
--   * Teilnehmerlisten abgeschlossener Events sind für jedes aktive Mitglied
--     lesbar.
--   * ratings roh: nur noch die EIGENEN Zeilen (bisher durfte ein Teilnehmer
--     eines abgeschlossenen Events auch fremde Zeilen inkl. notes lesen).
--     Die geteilte Auswertung kommt jetzt ausschließlich aus den Views, die
--     keine Notiz führen → fremde Notizen sind strukturell unerreichbar.

begin;

-- ===========================================================================
-- Helfer: ist der Aufrufer ein aktives Mitglied der Runde?
--   „Die Runde" = jeder vom Admin eingeladene, nicht deaktivierte Nutzer,
--   unabhängig von der Rolle. Deckt sich mit is_admin(), das ebenfalls
--   is_active verlangt.
-- ===========================================================================
create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and is_active
  );
$$;

revoke execute on function public.is_active_member() from public, anon;
grant  execute on function public.is_active_member() to authenticated;

-- ===========================================================================
-- Views neu aufbauen. past_tastings hängt an whisky_rankings → zuerst weg.
-- ===========================================================================
drop view if exists public.past_tastings;
drop view if exists public.whisky_rankings;

-- ---------------------------------------------------------------------------
-- whisky_rankings
--   OHNE security_invoker → läuft mit Owner-Rechten (RLS der Basistabellen
--   greift nicht, „force row level security" ist projektweit aus).
--   Hart auf status = 'closed' (Join) UND is_active_member() (where) gefiltert:
--   ein aktives Event liefert 0 Zeilen, ein Nicht-Mitglied auch.
--   Rang: Gesamtpunkte desc → Geschmack desc → Nase desc → Position asc.
--   Trägt weiterhin KEINE persönlichen Notizen.
-- ---------------------------------------------------------------------------
create view public.whisky_rankings as
select
  w.event_id,
  w.id                                     as whisky_id,
  w.position,
  wd.name,
  wd.distillery,
  wd.region,
  wd.video_url,
  wd.brought_by,
  coalesce(sum(r.nose_points), 0)::int     as nose_total,
  coalesce(sum(r.taste_points), 0)::int    as taste_total,
  coalesce(sum(r.total_points), 0)::int    as total_points,
  count(r.id)::int                         as rating_count,
  rank() over (
    partition by w.event_id
    order by coalesce(sum(r.total_points), 0) desc,
             coalesce(sum(r.taste_points), 0) desc,
             coalesce(sum(r.nose_points), 0) desc,
             w.position asc
  )::int                                   as rank
from public.whiskies w
join public.tasting_events e  on e.id = w.event_id and e.status = 'closed'
join public.whisky_details wd on wd.whisky_id = w.id
left join public.ratings r    on r.whisky_id = w.id
where public.is_active_member()
group by w.event_id, w.id, w.position,
         wd.name, wd.distillery, wd.region, wd.video_url, wd.brought_by;

-- ---------------------------------------------------------------------------
-- past_tastings — Datum, Ort, Thema, Abschlusszeitpunkt, Gastgeber,
--   Sieger-Whisky je abgeschlossenem Event. Selber Owner-Rechte-+-Filter.
--   NEU gegenüber PROJ-1: closed_at (Zweitsortierschlüssel der Historie).
-- ---------------------------------------------------------------------------
create view public.past_tastings as
select
  e.id            as event_id,
  e.event_date,
  e.location,
  e.theme,
  e.closed_at,
  e.host_id,
  hp.display_name as host_name,
  wr.whisky_id    as winner_whisky_id,
  wr.name         as winner_name,
  wr.total_points as winner_points
from public.tasting_events e
join public.profiles hp on hp.id = e.host_id
left join public.whisky_rankings wr on wr.event_id = e.id and wr.rank = 1
where e.status = 'closed'
  and public.is_active_member();

-- ---------------------------------------------------------------------------
-- whisky_score_breakdown — die aufklappbaren Einzelbewertungen.
--   Eine Zeile pro Bewerter pro Whisky. Owner-Rechte, selber Filter.
--   BEWUSST ohne notes: fremde Notizen können über diesen Weg nicht gelesen
--   werden. Die eigene Notiz holt das Frontend direkt aus ratings
--   (profile_id = auth.uid()).
-- ---------------------------------------------------------------------------
create view public.whisky_score_breakdown as
select
  r.event_id,
  r.whisky_id,
  r.profile_id   as rater_id,
  p.display_name as rater_name,
  r.nose_points,
  r.taste_points,
  r.total_points
from public.ratings r
join public.tasting_events e on e.id = r.event_id and e.status = 'closed'
join public.profiles p      on p.id = r.profile_id
where public.is_active_member();

-- Grants nach dem Neuaufbau erneut setzen (drop view verwirft sie).
revoke all on public.whisky_rankings        from anon;
revoke all on public.past_tastings          from anon;
revoke all on public.whisky_score_breakdown from anon;
grant  select on public.whisky_rankings        to authenticated;
grant  select on public.past_tastings          to authenticated;
grant  select on public.whisky_score_breakdown to authenticated;

-- ===========================================================================
-- event_participants — Teilnehmerliste abgeschlossener Events für jedes
--   aktive Mitglied lesbar (für den Ergebnis-Kopf „Wer war dabei").
--   Laufende / vorbereitete Events: unverändert nur eigene Teilnahme / Admin.
-- ===========================================================================
drop policy participants_select_same_event on public.event_participants;

create policy participants_select_same_event on public.event_participants
  for select to authenticated
  using (
    (select public.is_event_participant(event_id))
    or (select public.is_admin())
    or (
      (select public.is_active_member())
      and (select public.is_event_closed(event_id))
    )
  );

-- ===========================================================================
-- ratings — Roh-Lesezugriff auf die EIGENEN Zeilen beschränken.
--   Bisher: Teilnehmer + (eigene Zeile ODER Event abgeschlossen).
--   Jetzt:  Admin ODER eigene Zeile — sonst nichts.
--   Die geteilte Sicht auf ein abgeschlossenes Event liefern
--   whisky_rankings / whisky_score_breakdown (ohne notes).
--   Insert / Update / Delete bleiben unverändert (nur eigene Zeile,
--   can_rate_whisky, Trigger ratings_lock nach Abschluss).
-- ===========================================================================
drop policy ratings_select on public.ratings;

create policy ratings_select on public.ratings
  for select to authenticated
  using (
    (select public.is_admin())
    or profile_id = (select auth.uid())
  );

commit;
