-- PROJ-29 · Steward-Bewertung durch Teilnehmer („Steward-Noten")
--
--   1. Tabelle steward_scores — höchstens eine Note pro Person und Tasting
--      (PK event_id + profile_id). Der Steward selbst steht NICHT in der Zeile,
--      er ergibt sich aus tasting_events.helper_id (nach dem Start fest).
--      Note 0–10 in Halbschritten (numeric(3,1) wie die Whisky-Punkte),
--      Kommentar optional ≤ 500 Zeichen.
--      RLS: direkt lesbar ist nur die EIGENE Zeile — auch Steward, Gastgeber
--      und Admin sehen während des Tastings keine fremden Noten. Kein
--      Direktschreiben. Der Live-Einblick (PROJ-20, steward_ratings) liest
--      diese Tabelle nicht.
--   2. set_steward_score(p_event, p_score, p_comment) / clear_steward_score(p_event)
--      — einzige Schreibwege. Prüfen: aktives Mitglied (TS004), Tasting läuft
--      (`for share` gegen gleichzeitiges close_event), Tasting hat einen
--      Steward, Aufrufer ist nicht der Steward und verkostet mit, Note 0–10 und
--      passend zur Schrittweite des Tastings, Kommentar ≤ 500 → sonst TS028.
--   3. Sicht steward_scores_revealed — nur abgeschlossene Tastings, nur aktive
--      Mitglieder, Testkonten-Regel wie die übrigen Ergebnis-Sichten (PROJ-26).
--      Owner-Rechte (wie whisky_rankings / winner_tips_revealed).
--   4. Profil-Schalter show_steward_balance (Default an) + profiles_public am
--      Ende erweitert + Spalten-Rechte (Muster PROJ-14/22).
--
-- Neuer Fehlercode TS028 (TS018–TS027 vergeben, PT-Klasse tabu).

begin;

-- ===========================================================================
-- 1 · Tabelle
-- ===========================================================================
create table public.steward_scores (
  event_id    uuid         not null references public.tasting_events (id) on delete cascade,
  profile_id  uuid         not null references public.profiles (id) on delete cascade,
  score       numeric(3,1) not null
    constraint steward_scores_score_range check (score >= 0 and score <= 10 and mod(score * 2, 1) = 0),
  comment     text
    constraint steward_scores_comment_len check (comment is null or char_length(comment) between 1 and 500),
  updated_at  timestamptz  not null default now(),
  primary key (event_id, profile_id)
);

comment on table public.steward_scores is
  'PROJ-29: Note (0–10) der Teilnehmer für den Whisky-Steward eines Tastings. Steward = tasting_events.helper_id.';

create index idx_steward_scores_profile on public.steward_scores (profile_id);

alter table public.steward_scores enable row level security;

revoke all on public.steward_scores from anon;
revoke insert, update, delete on public.steward_scores from authenticated;
grant  select on public.steward_scores to authenticated;

create policy steward_scores_select_own on public.steward_scores
  for select to authenticated
  using (profile_id = (select auth.uid()));

-- ===========================================================================
-- 2 · Schreibwege
-- ===========================================================================

-- Gemeinsame Prüfung: Aufrufer darf den Steward dieses Tastings jetzt bewerten.
-- Liefert die Schrittweite des Tastings. Sperrt die Event-Zeile `for share`.
create or replace function public.steward_score_guard(p_event uuid)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_status public.event_status;
  v_helper uuid;
  v_step   numeric;
begin
  if v_uid is null or not public.is_active_member() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  select status, helper_id, rating_step
    into v_status, v_helper, v_step
  from public.tasting_events
  where id = p_event
  for share;

  if v_status is null or v_status <> 'active' then
    raise exception 'Den Whisky-Steward bewerten kann man nur während des laufenden Tastings.'
      using errcode = 'TS028';
  end if;

  if v_helper is null then
    raise exception 'Dieses Tasting hat keinen Whisky-Steward.' using errcode = 'TS028';
  end if;

  if v_helper = v_uid then
    raise exception 'Dich selbst kannst du nicht bewerten.' using errcode = 'TS028';
  end if;

  if not public.is_event_participant(p_event) then
    raise exception 'Den Whisky-Steward bewerten kann nur, wer bei diesem Tasting mitverkostet.'
      using errcode = 'TS028';
  end if;

  return v_step;
end;
$$;

revoke execute on function public.steward_score_guard(uuid) from public, anon, authenticated;

create or replace function public.set_steward_score(
  p_event   uuid,
  p_score   numeric,
  p_comment text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_step    numeric;
  v_comment text := nullif(btrim(coalesce(p_comment, '')), '');
begin
  v_step := public.steward_score_guard(p_event);

  if p_score is null or p_score < 0 or p_score > 10 then
    raise exception 'Die Note muss zwischen 0 und 10 liegen.' using errcode = 'TS028';
  end if;

  if mod(p_score, v_step) <> 0 then
    raise exception 'Diese Note passt nicht zur Schrittweite des Tastings.' using errcode = 'TS028';
  end if;

  if v_comment is not null and char_length(v_comment) > 500 then
    raise exception 'Der Kommentar darf höchstens 500 Zeichen lang sein.' using errcode = 'TS028';
  end if;

  insert into public.steward_scores (event_id, profile_id, score, comment, updated_at)
  values (p_event, (select auth.uid()), p_score, v_comment, now())
  on conflict (event_id, profile_id)
  do update set score = excluded.score, comment = excluded.comment, updated_at = now();
end;
$$;

revoke execute on function public.set_steward_score(uuid, numeric, text) from public, anon;
grant  execute on function public.set_steward_score(uuid, numeric, text) to authenticated;

create or replace function public.clear_steward_score(p_event uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.steward_score_guard(p_event);

  delete from public.steward_scores
  where event_id = p_event and profile_id = (select auth.uid());
end;
$$;

revoke execute on function public.clear_steward_score(uuid) from public, anon;
grant  execute on function public.clear_steward_score(uuid) to authenticated;

-- ===========================================================================
-- 3 · Aufgedeckte Steward-Noten (nach dem Abschluss)
-- ===========================================================================
create view public.steward_scores_revealed as
select
  s.event_id,
  e.helper_id                       as steward_id,
  s.profile_id,
  p.display_name,
  s.score,
  s.comment,
  public.is_test_event(s.event_id)  as is_test
from public.steward_scores s
join public.tasting_events e on e.id = s.event_id and e.status = 'closed'
join public.profiles p       on p.id = s.profile_id
where e.helper_id is not null
  and public.is_active_member()
  and ((select public.viewer_sees_tests()) or not public.is_test_event(s.event_id));

revoke all on public.steward_scores_revealed from anon;
grant  select on public.steward_scores_revealed to authenticated;

-- ===========================================================================
-- 4 · Profil-Schalter „Steward-Bilanz"
-- ===========================================================================
alter table public.profiles
  add column if not exists show_steward_balance boolean not null default true;

grant select (show_steward_balance) on public.profiles to authenticated;
grant update (show_steward_balance) on public.profiles to authenticated;

-- profiles_public: Spalte nur ANGEHÄNGT, sonst 1:1 aus 20261009120000.
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
  p.show_kenner_count,
  p.is_test,
  p.show_steward_balance
from public.profiles p
where p.id = (select auth.uid())
   or not p.is_test
   or (select public.viewer_sees_tests());

commit;
