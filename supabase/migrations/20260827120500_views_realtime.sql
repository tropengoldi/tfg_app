-- PROJ-1 · Ranglisten-Views + Realtime-Publication

begin;

-- ===========================================================================
-- whisky_rankings
--   security_invoker = on  → die View läuft mit den RLS-Rechten des Abfragenden.
--   Hart auf status = 'closed' gefiltert: ein aktives Event liefert 0 Zeilen.
--   Damit kippt die Sichtbarkeit der Einzelbewertungen und die des Aggregats im
--   selben Moment — und es kann kein unvollständiges "Live-Leaderboard" entstehen.
--   Rang: Gesamtpunkte desc → Geschmack desc → Nase desc → Position asc (eindeutig).
-- ===========================================================================
create view public.whisky_rankings
with (security_invoker = on) as
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
group by w.event_id, w.id, w.position,
         wd.name, wd.distillery, wd.region, wd.video_url, wd.brought_by;

-- ===========================================================================
-- past_tastings — Datum, Ort, Gastgeber, Sieger-Whisky je abgeschlossenem Event.
-- ===========================================================================
create view public.past_tastings
with (security_invoker = on) as
select
  e.id            as event_id,
  e.event_date,
  e.location,
  e.theme,
  e.host_id,
  hp.display_name as host_name,
  wr.whisky_id    as winner_whisky_id,
  wr.name         as winner_name,
  wr.total_points as winner_points
from public.tasting_events e
join public.profiles hp on hp.id = e.host_id
left join public.whisky_rankings wr on wr.event_id = e.id and wr.rank = 1
where e.status = 'closed';

revoke all on public.whisky_rankings from anon;
revoke all on public.past_tastings  from anon;
grant select on public.whisky_rankings to authenticated;
grant select on public.past_tastings  to authenticated;

-- ===========================================================================
-- Realtime — NUR Event- und Whisky-Tabelle. ratings und whisky_details bleiben
-- bewusst außen vor, damit kein Geheimnis je über einen Kanal wandert.
-- replica identity full: bei UPDATE/DELETE ist auch die alte Zeile verfügbar,
-- sodass Client-Filter (id / event_id) greifen und "was hat sich geändert"
-- (current_position, status) ableitbar ist.
-- ===========================================================================
alter table public.tasting_events replica identity full;
alter table public.whiskies       replica identity full;

alter publication supabase_realtime add table public.tasting_events;
alter publication supabase_realtime add table public.whiskies;

commit;
