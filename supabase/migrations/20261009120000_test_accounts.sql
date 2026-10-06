-- PROJ-26 · Testkonten für normale Nutzer unsichtbar
--
--   1. profiles.is_test (nur Admin änderbar; nie zugleich Admin)
--   2. Drei zentrale Prüfungen: viewer_sees_tests / is_test_event / profile_visible
--      (+ is_test_profile, event_visible als Bausteine)
--   3. Zugriffsregeln VERSCHÄRFT (zusätzliche Bedingung „sichtbar"), nie geöffnet:
--      profiles, tasting_events, event_participants, whiskies, whisky_details,
--      collection_entries (über profile_shows_collection)
--   4. Sichten filtern + Kennzeichnung is_test (am Ende angehängt):
--      profiles_public, whisky_rankings, past_tastings, whisky_score_breakdown,
--      winner_tips_revealed
--   5. Admin-Funktionen: Listen mit is_test, Testkonto setzen / Auswirkung,
--      set_member_admin lehnt Testkonten ab
--   6. Nachrichten: Testkonto → nur Testkonten (TS024); unsichtbare Empfänger fallen raus
--   7. Konto-Anlage übernimmt is_test aus den Metadaten der Anlage
--   8. Datenpflege: Seed-Testkonto + übrig gebliebene qa-…@example.com markieren
--
-- Neue Fehlercodes: TS024 (Testkonto → echtes Mitglied), TS025 (Testkonto ↔ Admin).
-- „Ein aktives Tasting" bleibt global (Produktentscheidung) — unverändert.

begin;

-- ===========================================================================
-- 1 · Merkmal
-- ===========================================================================
alter table public.profiles
  add column if not exists is_test boolean not null default false;

alter table public.profiles
  add constraint profiles_test_not_admin check (not (is_test and role = 'admin'));

-- Lesbar für alle (Abzeichen), änderbar nur über admin_set_test_account
-- (kein Update-Grant für die Spalte, Muster PROJ-14).
grant select (is_test) on public.profiles to authenticated;

-- ===========================================================================
-- 2 · Prüfungen (SECURITY DEFINER: lesen profiles/participants ohne RLS-Zyklus)
-- ===========================================================================

-- Darf der aktuelle Nutzer Testdaten sehen? Admin oder selbst Testkonto.
create or replace function public.viewer_sees_tests()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_test
  );
$$;

create or replace function public.is_test_profile(p_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_test from public.profiles where id = p_profile), false);
$$;

-- Test-Tasting = Gastgeber, Whisky-Steward oder ein Teilnehmer ist Testkonto.
-- DIE eine Stelle für diese Regel.
create or replace function public.is_test_event(p_event uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tasting_events e
    join public.profiles p on p.id in (e.host_id, e.helper_id)
    where e.id = p_event and p.is_test
  ) or exists (
    select 1
    from public.event_participants ep
    join public.profiles p on p.id = ep.profile_id
    where ep.event_id = p_event and p.is_test
  );
$$;

create or replace function public.profile_visible(p_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_profile = (select auth.uid())
      or not public.is_test_profile(p_profile)
      or public.viewer_sees_tests();
$$;

create or replace function public.event_visible(p_event uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.viewer_sees_tests() or not public.is_test_event(p_event);
$$;

revoke execute on function public.viewer_sees_tests()     from public, anon;
revoke execute on function public.is_test_profile(uuid)   from public, anon;
revoke execute on function public.is_test_event(uuid)     from public, anon;
revoke execute on function public.profile_visible(uuid)   from public, anon;
revoke execute on function public.event_visible(uuid)     from public, anon;
grant  execute on function public.viewer_sees_tests()     to authenticated;
grant  execute on function public.is_test_profile(uuid)   to authenticated;
grant  execute on function public.is_test_event(uuid)     to authenticated;
grant  execute on function public.profile_visible(uuid)   to authenticated;
grant  execute on function public.event_visible(uuid)     to authenticated;

-- ===========================================================================
-- 3 · Zugriffsregeln (bestehende Bedingung UND sichtbar)
--     Idiom: (select viewer_sees_tests()) einmal pro Statement, is_test_event pro Zeile.
-- ===========================================================================
drop policy profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or not is_test
    or (select public.viewer_sees_tests())
  );

drop policy events_select_participant_or_admin on public.tasting_events;
create policy events_select_participant_or_admin on public.tasting_events
  for select to authenticated
  using (
    (
      (select public.is_event_participant(id))
      or (select public.is_admin())
      or (select public.is_event_helper(id))
    )
    and ((select public.viewer_sees_tests()) or not public.is_test_event(id))
  );

drop policy participants_select_same_event on public.event_participants;
create policy participants_select_same_event on public.event_participants
  for select to authenticated
  using (
    (
      (select public.is_event_participant(event_id))
      or (select public.is_admin())
      or (select public.is_event_helper(event_id))
      or (
        (select public.is_active_member())
        and (select public.is_event_closed(event_id))
      )
    )
    and ((select public.viewer_sees_tests()) or not public.is_test_event(event_id))
  );

drop policy whiskies_select_participant_or_admin on public.whiskies;
create policy whiskies_select_participant_or_admin on public.whiskies
  for select to authenticated
  using (
    (
      (select public.is_event_participant(event_id))
      or (select public.is_admin())
      or (select public.is_event_helper(event_id))
    )
    and ((select public.viewer_sees_tests()) or not public.is_test_event(event_id))
  );

drop policy wd_select on public.whisky_details;
create policy wd_select on public.whisky_details
  for select to authenticated
  using (
    (
      (select public.is_admin())
      or (select public.is_event_helper(event_id))
      or (
        (select public.is_event_participant(event_id))
        and (
          brought_by = (select auth.uid())
          or (
            (select public.is_event_host(event_id))
            and not (select public.event_has_helper(event_id))
          )
          or (select public.is_event_closed(event_id))
        )
      )
    )
    and ((select public.viewer_sees_tests()) or not public.is_test_event(event_id))
  );

-- Sammlung (PROJ-15): fremde Sammlung nur, wenn freigegeben UND Profil sichtbar.
-- Die eigene Sammlung bleibt über profile_id = auth.uid() immer lesbar.
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
  ) and public.profile_visible(p_profile);
$$;

-- ===========================================================================
-- 4 · Sichten (Owner-Rechte) — Filter + is_test am Ende angehängt
-- ===========================================================================
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
  p.is_test
from public.profiles p
where p.id = (select auth.uid())
   or not p.is_test
   or (select public.viewer_sees_tests());

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
  public.is_test_event(w.event_id)             as is_test
from public.whiskies w
join public.tasting_events e  on e.id = w.event_id and e.status = 'closed'
join public.whisky_details wd on wd.whisky_id = w.id
left join public.ratings r    on r.whisky_id = w.id
where public.is_active_member()
  and ((select public.viewer_sees_tests()) or not public.is_test_event(w.event_id))
group by w.event_id, w.id, w.position,
         wd.name, wd.distillery, wd.region, wd.video_url, wd.brought_by,
         wd.abv, wd.age_years, wd.price_eur;

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
  wr.rating_count as winner_rating_count,
  public.is_test_event(e.id) as is_test
from public.tasting_events e
join public.profiles hp on hp.id = e.host_id
left join public.profiles lp on lp.id = e.helper_id
left join public.whisky_rankings wr on wr.event_id = e.id and wr.rank = 1
where e.status = 'closed'
  and public.is_active_member()
  and ((select public.viewer_sees_tests()) or not public.is_test_event(e.id));

create or replace view public.whisky_score_breakdown as
select
  r.event_id,
  r.whisky_id,
  r.profile_id   as rater_id,
  p.display_name as rater_name,
  r.nose_points,
  r.taste_points,
  r.total_points,
  public.is_test_event(r.event_id) as is_test
from public.ratings r
join public.tasting_events e on e.id = r.event_id and e.status = 'closed'
join public.profiles p      on p.id = r.profile_id
where public.is_active_member()
  and ((select public.viewer_sees_tests()) or not public.is_test_event(r.event_id));

create or replace view public.winner_tips_revealed as
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
   ))                                                   as is_correct,
  public.is_test_event(t.event_id)                      as is_test
from public.winner_tips t
join public.tasting_events e  on e.id = t.event_id and e.status = 'closed'
join public.profiles p        on p.id = t.profile_id
join public.whiskies w        on w.id = t.whisky_id
join public.whisky_rankings wr on wr.whisky_id = t.whisky_id
where public.is_active_member()
  and ((select public.viewer_sees_tests()) or not public.is_test_event(t.event_id));

-- ===========================================================================
-- 5 · Admin-Funktionen
-- ===========================================================================

-- Listen: Rückgabetyp ändert sich → neu anlegen (Rechte wie zuvor).
drop function public.admin_list_members();
create function public.admin_list_members()
returns table (
  id            uuid,
  display_name  text,
  role          public.app_role,
  is_active     boolean,
  email         text,
  has_signed_in boolean,
  is_test       boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  return query
  select p.id,
         p.display_name,
         p.role,
         p.is_active,
         u.email::text,
         (u.last_sign_in_at is not null) as has_signed_in,
         p.is_test
  from public.profiles p
  join auth.users u on u.id = p.id
  order by lower(p.display_name), p.display_name
  limit 1000;
end;
$$;
revoke execute on function public.admin_list_members() from public, anon;
grant  execute on function public.admin_list_members() to authenticated;

drop function public.admin_list_events();
create function public.admin_list_events()
returns table (
  id                uuid,
  event_date        date,
  location          text,
  theme             text,
  host_id           uuid,
  host_name         text,
  helper_id         uuid,
  helper_name       text,
  status            public.event_status,
  max_whiskies_per_participant smallint,
  participant_count int,
  whisky_count      int,
  is_test           boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  return query
  select e.id,
         e.event_date,
         e.location,
         e.theme,
         e.host_id,
         hp.display_name as host_name,
         e.helper_id,
         lp.display_name as helper_name,
         e.status,
         e.max_whiskies_per_participant,
         (select count(*)::int from public.event_participants ep where ep.event_id = e.id),
         (select count(*)::int from public.whiskies w where w.event_id = e.id),
         public.is_test_event(e.id)
  from public.tasting_events e
  join public.profiles hp on hp.id = e.host_id
  left join public.profiles lp on lp.id = e.helper_id
  order by (e.event_date >= current_date) desc,
           case when e.event_date >= current_date then e.event_date end asc,
           e.event_date desc
  limit 1000;
end;
$$;
revoke execute on function public.admin_list_events() from public, anon;
grant  execute on function public.admin_list_events() to authenticated;

-- Wie viele Tastings würden durch das Setzen/Entfernen der Markierung für die
-- Runde aus- bzw. eingeblendet? Intern, ohne Rechteprüfung.
create or replace function public.test_account_impact_internal(p_target uuid, p_value boolean)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  with involved as (
    select e.id
    from public.tasting_events e
    where e.host_id = p_target or e.helper_id = p_target
    union
    select ep.event_id from public.event_participants ep where ep.profile_id = p_target
  )
  select count(*)::int
  from involved i
  where case
    -- Markieren: betroffen ist, was heute noch KEIN Test-Tasting ist.
    when p_value then not public.is_test_event(i.id)
    -- Entfernen: betroffen ist, was danach kein anderes Testkonto mehr hält.
    else not exists (
      select 1
      from public.tasting_events e
      join public.profiles p on p.id in (e.host_id, e.helper_id)
      where e.id = i.id and p.is_test and p.id <> p_target
    ) and not exists (
      select 1
      from public.event_participants ep
      join public.profiles p on p.id = ep.profile_id
      where ep.event_id = i.id and p.is_test and p.id <> p_target
    )
  end;
$$;
revoke execute on function public.test_account_impact_internal(uuid, boolean) from public, anon, authenticated;

-- Für die Rückfrage im Admin-Bereich, bevor gesetzt wird.
create or replace function public.admin_test_account_impact(p_target uuid, p_value boolean)
returns int
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;
  return public.test_account_impact_internal(p_target, p_value);
end;
$$;
revoke execute on function public.admin_test_account_impact(uuid, boolean) from public, anon;
grant  execute on function public.admin_test_account_impact(uuid, boolean) to authenticated;

-- Markierung setzen/entfernen. Gibt die Zahl betroffener Tastings zurück.
create or replace function public.admin_set_test_account(p_target uuid, p_value boolean)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role   public.app_role;
  v_impact int;
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  select role into v_role from public.profiles where id = p_target for update;
  if v_role is null then
    raise exception 'Teilnehmer nicht gefunden.' using errcode = 'TS004';
  end if;
  if p_value and v_role = 'admin' then
    raise exception 'Testkonten können keine Admins sein.' using errcode = 'TS025';
  end if;

  v_impact := public.test_account_impact_internal(p_target, p_value);
  update public.profiles set is_test = p_value where id = p_target;
  return v_impact;
end;
$$;
revoke execute on function public.admin_set_test_account(uuid, boolean) from public, anon;
grant  execute on function public.admin_set_test_account(uuid, boolean) to authenticated;

-- Zum Admin machen: Testkonten ausgeschlossen. Sonst 1:1 aus 20260828090000.
create or replace function public.set_member_admin(p_target uuid, p_make_admin boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role     public.app_role;
  v_active   boolean;
  v_signedin boolean;
  v_test     boolean;
begin
  if not public.is_admin() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  -- Ziel UND alle aktiven Admins sperren (siehe deactivate_member).
  perform 1 from public.profiles
  where id = p_target or (role = 'admin' and is_active)
  order by id
  for update;

  select p.role, p.is_active, (u.last_sign_in_at is not null), p.is_test
    into v_role, v_active, v_signedin, v_test
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = p_target;
  if v_role is null then
    raise exception 'Teilnehmer nicht gefunden.' using errcode = 'TS004';
  end if;

  if p_make_admin then
    if v_test then
      raise exception 'Testkonten können keine Admins sein.' using errcode = 'TS025';
    end if;
    if not (v_active and v_signedin) then
      raise exception 'Nur aktive Teilnehmer können zum Admin gemacht werden.'
        using errcode = 'TS014';
    end if;
    update public.profiles set role = 'admin' where id = p_target;
  else
    if (
      select count(*) from public.profiles
      where role = 'admin' and is_active and id <> p_target
    ) = 0 then
      raise exception 'Es muss mindestens ein aktiver Admin übrig bleiben. Mach zuerst jemand anderen zum Admin.'
        using errcode = 'TS012';
    end if;
    update public.profiles set role = 'teilnehmer' where id = p_target;
  end if;
end;
$$;

-- ===========================================================================
-- 6 · Nachrichten-Empfänger (sonst 1:1 aus 20260928130000)
-- ===========================================================================
create or replace function public.resolve_message_recipients(
  p_recipient_ids uuid[],
  p_event_id      uuid default null
) returns table (
  recipient_id    uuid,
  recipient_email text,
  recipient_name  text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_ids uuid[];
begin
  if not public.is_active_member() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  if p_event_id is not null then
    if not (
      public.is_event_participant(p_event_id)
      or public.is_event_host(p_event_id)
      or public.is_event_helper(p_event_id)
    ) then
      raise exception 'Du bist an diesem Tasting nicht beteiligt.' using errcode = 'TS018';
    end if;
  end if;

  select coalesce(array_agg(distinct x), array[]::uuid[]) into v_ids
  from unnest(p_recipient_ids) x
  where x <> v_uid;

  if array_length(v_ids, 1) is null then
    return;
  end if;

  -- PROJ-26: Ein Testkonto (kein Admin) darf nur Testkonten anschreiben.
  if public.is_test_profile(v_uid) and not public.is_admin() then
    if exists (select 1 from unnest(v_ids) rid where not public.is_test_profile(rid)) then
      raise exception 'Testkonten können nur andere Testkonten anschreiben.'
        using errcode = 'TS024';
    end if;
  end if;

  if p_event_id is not null then
    if exists (
      select 1 from unnest(v_ids) rid
      where not exists (
        select 1 from public.event_participants ep
        where ep.event_id = p_event_id and ep.profile_id = rid
      )
      and not exists (
        select 1 from public.tasting_events te
        where te.id = p_event_id and te.helper_id = rid
      )
    ) then
      raise exception 'Mindestens einer der gewählten Empfänger gehört nicht zu diesem Tasting.'
        using errcode = 'TS019';
    end if;
  end if;

  -- Unsichtbare Empfänger (Testkonten für normale Mitglieder) fallen still
  -- heraus — wie inaktive.
  return query
  select p.id, u.email::text, p.display_name
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = any (v_ids)
    and p.is_active
    and public.profile_visible(p.id);
end;
$$;

-- ===========================================================================
-- 7 · Konto-Anlage: is_test aus den Metadaten der Anlage
--   Sicher, weil Registrierung gesperrt ist: Konten entstehen nur durch den
--   Admin (inviteUserByEmail) bzw. die Testsuite (Service-Rolle). Der Trigger
--   läuft nur beim Anlegen — spätere Metadaten-Änderungen des Nutzers wirken
--   nicht auf is_test.
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role, is_test)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    'teilnehmer',
    coalesce((new.raw_app_meta_data ->> 'is_test')::boolean, false)
      or coalesce((new.raw_user_meta_data ->> 'is_test')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ===========================================================================
-- 8 · Datenpflege (geprüft 2026-10-06: 20 Konten, alle teilnehmer, ohne Fußabdruck)
-- ===========================================================================
update public.profiles p
set is_test = true
from auth.users u
where u.id = p.id
  and p.role <> 'admin'
  and (u.email = 'test.teilnehmer@example.com' or u.email like 'qa-%@example.com');

commit;
