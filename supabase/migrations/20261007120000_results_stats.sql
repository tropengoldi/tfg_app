-- PROJ-25 · Erweiterte Ergebnis-Statistiken
--
--   1. whisky_rankings: abv, age_years, price_eur ANS ENDE angehängt.
--      Die Sicht liefert weiterhin nur abgeschlossene Tastings an aktive
--      Mitglieder (Owner-Rechte, status = 'closed', is_active_member()) — damit
--      werden die Angaben erst nach dem Abschluss sichtbar. Die Zugriffsregeln
--      auf whisky_details (Blindheit) bleiben unverändert.
--   2. past_tastings: winner_rating_count angehängt (PROJ-19 BUG-2: Sieger
--      ab einer Bewertung statt ab Punkten > 0).
--   3. tg_ratings_step: Werte, die kein Vielfaches von 0,5 sind, bekommen die
--      eigene Meldung TS022 „Nur ganze oder halbe Punkte." (PROJ-19 BUG-1);
--      TS021 bleibt für „halbe Punkte im 1er-Tasting".
--
-- `create or replace view` mit ausschließlich angehängten Spalten behält
-- bestehende Spalten, Abhängigkeiten (past_tastings → whisky_rankings) und
-- GRANTs. Definitionen sonst 1:1 aus 20261006120000.

begin;

-- ===========================================================================
-- 1 · whisky_rankings + Alkohol / Alter / Preis
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
  wd.price_eur
from public.whiskies w
join public.tasting_events e  on e.id = w.event_id and e.status = 'closed'
join public.whisky_details wd on wd.whisky_id = w.id
left join public.ratings r    on r.whisky_id = w.id
where public.is_active_member()
group by w.event_id, w.id, w.position,
         wd.name, wd.distillery, wd.region, wd.video_url, wd.brought_by,
         wd.abv, wd.age_years, wd.price_eur;

-- ===========================================================================
-- 2 · past_tastings + Anzahl Bewertungen des Siegers
-- ===========================================================================
create or replace view public.past_tastings as
select
  e.id            as event_id,
  e.event_date,
  e.location,
  e.theme,
  e.closed_at,
  e.host_id,
  hp.display_name as host_name,
  e.helper_id,
  lp.display_name as helper_name,
  wr.whisky_id    as winner_whisky_id,
  wr.name         as winner_name,
  wr.total_points as winner_points,
  wr.rating_count as winner_rating_count
from public.tasting_events e
join public.profiles hp on hp.id = e.host_id
left join public.profiles lp on lp.id = e.helper_id
left join public.whisky_rankings wr on wr.event_id = e.id and wr.rank = 1
where e.status = 'closed'
  and public.is_active_member();

-- ===========================================================================
-- 3 · Bewertungs-Prüfung: TS022 für Werte ohne halben Schritt
-- ===========================================================================
create or replace function public.tg_ratings_step()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_step numeric;
begin
  if mod(new.nose_points, 0.5) <> 0 or mod(new.taste_points, 0.5) <> 0 then
    raise exception 'Nur ganze oder halbe Punkte.' using errcode = 'TS022';
  end if;
  select rating_step into v_step from public.tasting_events where id = new.event_id;
  if v_step is null then
    return new; -- unbekanntes Event: FK / RLS lehnen ohnehin ab
  end if;
  if mod(new.nose_points, v_step) <> 0 or mod(new.taste_points, v_step) <> 0 then
    raise exception 'In diesem Tasting werden nur ganze Punkte vergeben.' using errcode = 'TS021';
  end if;
  return new;
end;
$$;

commit;
