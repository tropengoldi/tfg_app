-- PROJ-19 · Flexible Punkteskala (0 Punkte, 0,5er-Schritte)
--
--   1. Ranglisten-Sichten abbauen (sie hängen an den Punkt-Spalten)
--   2. ratings: Nasen-/Gaumenpunkte smallint → numeric(3,1), Untergrenze 0,
--      nur Vielfache von 0,5; total_points (GENERATED) neu als numeric(4,1)
--   3. tasting_events.rating_step (1 | 0,5), Voreinstellung 1 — alle bestehenden
--      Tastings werden damit 1er-Tastings
--   4. Trigger: Wert muss ein Vielfaches der Schrittweite SEINES Tastings sein.
--      Bewertungen werden direkt unter RLS geschrieben (kein RPC) → die Regel
--      gehört in die Datenbank, sonst ließe sie sich umgehen.
--   5. create_event / update_event um p_rating_step (Default 1) erweitern.
--      Rümpfe 1:1 aus 20261005120000 (PROJ-18-Texte), nur Schrittweite ergänzt.
--      Die Sperre nach dem Start ist die bestehende Entwurfs-Regel in
--      update_event (TS005).
--   6. Ranglisten-Sichten neu anlegen — Definitionen aus 20260830120000 bzw.
--      past_tastings aus 20260831120000; einzige Änderung: ::int → ::numeric
--      bei den Punktsummen. Gleichstandsregel unverändert.
--   7. collection_entries.rating smallint → numeric(3,1), 0–10, Vielfache von 0,5
--
-- Neuer Fehlercode TS021 (TS018–TS020 vergeben; PT-Klasse ist tabu, weil
-- PostgREST sie als HTTP-Status liest).
-- Bestehende Werte bleiben verlustfrei erhalten (3 → 3.0). Spalten-GRANTs auf
-- ratings / collection_entries überleben die Typänderung.

begin;

-- ===========================================================================
-- 1 · Sichten abbauen (past_tastings hängt an whisky_rankings → zuerst weg)
-- ===========================================================================
drop view if exists public.past_tastings;
drop view if exists public.whisky_rankings;
drop view if exists public.whisky_score_breakdown;

-- ===========================================================================
-- 2 · ratings auf Dezimal umstellen
-- ===========================================================================
alter table public.ratings drop column total_points;

alter table public.ratings drop constraint ratings_nose_points_check;
alter table public.ratings drop constraint ratings_taste_points_check;

alter table public.ratings
  alter column nose_points  type numeric(3,1) using nose_points::numeric(3,1),
  alter column taste_points type numeric(3,1) using taste_points::numeric(3,1);

alter table public.ratings
  add constraint ratings_nose_points_check
    check (nose_points between 0 and 5 and nose_points * 2 = trunc(nose_points * 2)),
  add constraint ratings_taste_points_check
    check (taste_points between 0 and 10 and taste_points * 2 = trunc(taste_points * 2));

alter table public.ratings
  add column total_points numeric(4,1)
    generated always as (nose_points + taste_points) stored;

-- ===========================================================================
-- 3 · Schrittweite am Tasting
-- ===========================================================================
alter table public.tasting_events
  add column rating_step numeric(2,1) not null default 1
    constraint tasting_events_rating_step_check check (rating_step in (1, 0.5));

comment on column public.tasting_events.rating_step is
  'PROJ-19: Schrittweite der Bewertung (1 = ganze, 0.5 = halbe Punkte). Nur im Entwurf änderbar (update_event).';

-- ===========================================================================
-- 4 · Bewertung muss zur Schrittweite ihres Tastings passen
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

revoke execute on function public.tg_ratings_step() from public, anon, authenticated;

create trigger ratings_step
  before insert or update of nose_points, taste_points, event_id on public.ratings
  for each row execute function public.tg_ratings_step();

-- ===========================================================================
-- 5 · create_event / update_event mit Schrittweite
--   Signatur ändert sich → droppen, neu anlegen, Rechte neu vergeben.
-- ===========================================================================
drop function if exists public.create_event(date, text, uuid, uuid, text, text, smallint);
drop function if exists public.update_event(uuid, date, text, uuid, uuid, text, text, smallint);

create function public.create_event(
  p_event_date   date,
  p_location     text,
  p_host_id      uuid,
  p_helper_id    uuid     default null,
  p_theme        text     default null,
  p_food_info    text     default null,
  p_max_whiskies smallint default null,
  p_rating_step  numeric  default 1
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id  uuid;
begin
  if not public.is_admin() then
    raise exception 'Nur der Admin darf Events anlegen.' using errcode = 'TS004';
  end if;
  if p_rating_step is null or p_rating_step not in (1, 0.5) then
    raise exception 'Die Schrittweite muss 1 oder 0,5 sein.' using errcode = 'TS021';
  end if;
  if not exists (select 1 from public.profiles where id = p_host_id and is_active) then
    raise exception 'Der gewählte Gastgeber ist kein aktives Mitglied.' using errcode = 'TS004';
  end if;
  if p_helper_id is not null then
    if not exists (select 1 from public.profiles where id = p_helper_id and is_active) then
      raise exception 'Der gewählte Whisky-Steward ist kein aktives Mitglied.' using errcode = 'TS004';
    end if;
    if p_helper_id = p_host_id then
      raise exception 'Der Whisky-Steward kann nicht gleichzeitig Gastgeber dieses Abends sein.' using errcode = 'TS017';
    end if;
  end if;

  insert into public.tasting_events
    (event_date, location, theme, food_info, host_id, helper_id, created_by, max_whiskies_per_participant,
     rating_step)
  values
    (p_event_date, p_location, nullif(trim(p_theme), ''), nullif(trim(p_food_info), ''),
     p_host_id, p_helper_id, v_uid, p_max_whiskies, p_rating_step)
  returning id into v_id;

  insert into public.event_participants (event_id, profile_id)
  values (v_id, p_host_id)
  on conflict do nothing;

  return v_id;
end;
$$;

create function public.update_event(
  p_event        uuid,
  p_event_date   date,
  p_location     text,
  p_host_id      uuid,
  p_helper_id    uuid     default null,
  p_theme        text     default null,
  p_food_info    text     default null,
  p_max_whiskies smallint default null,
  p_rating_step  numeric  default 1
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status public.event_status;
begin
  if not public.is_admin() then
    raise exception 'Nur der Admin darf Events bearbeiten.' using errcode = 'TS004';
  end if;
  if p_rating_step is null or p_rating_step not in (1, 0.5) then
    raise exception 'Die Schrittweite muss 1 oder 0,5 sein.' using errcode = 'TS021';
  end if;
  select status into v_status from public.tasting_events where id = p_event for update;
  if v_status is null then
    raise exception 'Event nicht gefunden.' using errcode = 'TS004';
  end if;
  if v_status <> 'draft' then
    raise exception 'Nach dem Start lassen sich die Eckdaten nicht mehr ändern.' using errcode = 'TS005';
  end if;
  if not exists (select 1 from public.profiles where id = p_host_id and is_active) then
    raise exception 'Der gewählte Gastgeber ist kein aktives Mitglied.' using errcode = 'TS004';
  end if;
  if p_helper_id is not null then
    if not exists (select 1 from public.profiles where id = p_helper_id and is_active) then
      raise exception 'Der gewählte Whisky-Steward ist kein aktives Mitglied.' using errcode = 'TS004';
    end if;
    if p_helper_id = p_host_id then
      raise exception 'Der Whisky-Steward kann nicht gleichzeitig Gastgeber dieses Abends sein.' using errcode = 'TS017';
    end if;
    if exists (
      select 1 from public.event_participants
      where event_id = p_event and profile_id = p_helper_id
    ) then
      raise exception 'Der Whisky-Steward kann nicht gleichzeitig Teilnehmer dieses Abends sein. Nimm die Person zuerst aus der Teilnehmerliste.'
        using errcode = 'TS017';
    end if;
  end if;

  update public.tasting_events set
    event_date                  = p_event_date,
    location                    = p_location,
    theme                       = nullif(trim(p_theme), ''),
    food_info                   = nullif(trim(p_food_info), ''),
    host_id                     = p_host_id,
    helper_id                   = p_helper_id,
    max_whiskies_per_participant = p_max_whiskies,
    rating_step                  = p_rating_step
  where id = p_event;

  insert into public.event_participants (event_id, profile_id)
  values (p_event, p_host_id)
  on conflict do nothing;
end;
$$;

revoke execute on function
  public.create_event(date, text, uuid, uuid, text, text, smallint, numeric),
  public.update_event(uuid, date, text, uuid, uuid, text, text, smallint, numeric)
from public, anon;

grant execute on function
  public.create_event(date, text, uuid, uuid, text, text, smallint, numeric),
  public.update_event(uuid, date, text, uuid, uuid, text, text, smallint, numeric)
to authenticated;

-- ===========================================================================
-- 6 · Sichten neu (Dezimal-Summen, sonst unverändert)
--   OHNE security_invoker (Owner-Rechte), hart auf status = 'closed' und
--   is_active_member() gefiltert — wie bisher.
-- ===========================================================================
create view public.whisky_rankings as
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
  )::int                                       as rank
from public.whiskies w
join public.tasting_events e  on e.id = w.event_id and e.status = 'closed'
join public.whisky_details wd on wd.whisky_id = w.id
left join public.ratings r    on r.whisky_id = w.id
where public.is_active_member()
group by w.event_id, w.id, w.position,
         wd.name, wd.distillery, wd.region, wd.video_url, wd.brought_by;

create view public.past_tastings as
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
  wr.total_points as winner_points
from public.tasting_events e
join public.profiles hp on hp.id = e.host_id
left join public.profiles lp on lp.id = e.helper_id
left join public.whisky_rankings wr on wr.event_id = e.id and wr.rank = 1
where e.status = 'closed'
  and public.is_active_member();

-- BEWUSST ohne notes: fremde Notizen sind über diesen Weg nie lesbar.
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

revoke all on public.whisky_rankings        from anon;
revoke all on public.past_tastings          from anon;
revoke all on public.whisky_score_breakdown from anon;
grant  select on public.whisky_rankings        to authenticated;
grant  select on public.past_tastings          to authenticated;
grant  select on public.whisky_score_breakdown to authenticated;

-- ===========================================================================
-- 7 · Sammlungs-Note: 0–10 in 0,5er-Schritten (weiterhin optional)
-- ===========================================================================
alter table public.collection_entries drop constraint collection_entries_rating_check;

alter table public.collection_entries
  alter column rating type numeric(3,1) using rating::numeric(3,1);

alter table public.collection_entries
  add constraint collection_entries_rating_check
    check (rating is null or (rating between 0 and 10 and rating * 2 = trunc(rating * 2)));

commit;
