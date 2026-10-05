-- PROJ-22 · Sieger-Tipp & „Kenner der Woche"
--
--   1. Tabelle winner_tips — ein Tipp pro Person und Tasting (PK event_id +
--      profile_id), Whisky über zusammengesetzten FK an SEIN Tasting gebunden.
--      RLS: direkt lesbar ist nur die EIGENE Zeile (Blindheit — auch Gastgeber,
--      Whisky-Steward und Admin sehen während des Tastings keine fremden Tipps).
--      Kein direktes Schreiben.
--   2. set_winner_tip(p_event, p_position) — einziger Schreibweg. Prüft:
--      Tasting läuft, Aufrufer ist Teilnehmer (der Steward ist das nie,
--      PROJ-11), Ausschank-Nummer existiert → sonst TS023. Ein zweiter Aufruf
--      ersetzt den Tipp. `for share` auf dem Event: ein gleichzeitiges
--      close_event wartet bzw. der Tipp sieht danach „closed" → TS023.
--   3. Sicht winner_tips_revealed — nur abgeschlossene Tastings, nur aktive
--      Mitglieder (Muster wie whisky_rankings, Owner-Rechte). „Richtig" =
--      getippter Whisky ist Rang 1 UND im Tasting gab es mindestens eine
--      Bewertung.
--   4. Profil-Schalter show_kenner_count (Default an) + profiles_public am Ende
--      erweitert + Spalten-Rechte (Muster PROJ-14/15).
--
-- Neuer Fehlercode TS023 (TS018–TS022 vergeben, PT-Klasse tabu).

begin;

-- ===========================================================================
-- 1 · Tabelle
-- ===========================================================================
create table public.winner_tips (
  event_id    uuid        not null references public.tasting_events (id) on delete cascade,
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  whisky_id   uuid        not null,
  updated_at  timestamptz not null default now(),
  primary key (event_id, profile_id),
  foreign key (whisky_id, event_id)
    references public.whiskies (id, event_id) on delete cascade
);

create index idx_winner_tips_profile on public.winner_tips (profile_id);
create index idx_winner_tips_whisky  on public.winner_tips (whisky_id);

alter table public.winner_tips enable row level security;

revoke all on public.winner_tips from anon;
revoke insert, update, delete on public.winner_tips from authenticated;
grant  select on public.winner_tips to authenticated;

create policy winner_tips_select_own on public.winner_tips
  for select to authenticated
  using (profile_id = (select auth.uid()));

-- ===========================================================================
-- 2 · Tipp setzen
-- ===========================================================================
create or replace function public.set_winner_tip(p_event uuid, p_position smallint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_status public.event_status;
  v_whisky uuid;
begin
  if v_uid is null or not public.is_active_member() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  select status into v_status from public.tasting_events where id = p_event for share;
  if v_status is null or v_status <> 'active' then
    raise exception 'Tippen ist nur während des laufenden Tastings möglich.' using errcode = 'TS023';
  end if;

  if not public.is_event_participant(p_event) then
    raise exception 'Tippen kann nur, wer bei diesem Tasting mitverkostet.' using errcode = 'TS023';
  end if;

  select id into v_whisky
  from public.whiskies
  where event_id = p_event and position = p_position;
  if v_whisky is null then
    raise exception 'Diesen Whisky gibt es in diesem Tasting nicht.' using errcode = 'TS023';
  end if;

  insert into public.winner_tips (event_id, profile_id, whisky_id, updated_at)
  values (p_event, v_uid, v_whisky, now())
  on conflict (event_id, profile_id)
  do update set whisky_id = excluded.whisky_id, updated_at = now();
end;
$$;

revoke execute on function public.set_winner_tip(uuid, smallint) from public, anon;
grant  execute on function public.set_winner_tip(uuid, smallint) to authenticated;

-- ===========================================================================
-- 3 · Aufgedeckte Tipps (nach dem Abschluss)
-- ===========================================================================
create view public.winner_tips_revealed as
select
  t.event_id,
  t.profile_id,
  p.display_name,
  t.whisky_id,
  w.position,
  wr.name                                               as whisky_name,
  wr.rank,
  (wr.rank = 1 and exists (
     select 1 from public.ratings r where r.event_id = t.event_id
   ))                                                   as is_correct
from public.winner_tips t
join public.tasting_events e  on e.id = t.event_id and e.status = 'closed'
join public.profiles p        on p.id = t.profile_id
join public.whiskies w        on w.id = t.whisky_id
join public.whisky_rankings wr on wr.whisky_id = t.whisky_id
where public.is_active_member();

revoke all on public.winner_tips_revealed from anon;
grant  select on public.winner_tips_revealed to authenticated;

-- ===========================================================================
-- 4 · Profil-Schalter „Kenner der Woche"
-- ===========================================================================
alter table public.profiles
  add column if not exists show_kenner_count boolean not null default true;

grant select (show_kenner_count) on public.profiles to authenticated;
grant update (show_kenner_count) on public.profiles to authenticated;

-- profiles_public: Spalte nur ANGEHÄNGT, sonst 1:1 aus 20260916120000.
create or replace view public.profiles_public as
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
  p.show_avg_points,
  p.show_kenner_count
from public.profiles p;

commit;
