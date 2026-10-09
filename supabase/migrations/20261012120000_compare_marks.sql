-- PROJ-23 · Vergleichs-Merker
--
--   1. Tabelle compare_marks — eine Zeile je (Tasting, Person, Whisky) mit Gruppennummer.
--      Der Primärschlüssel garantiert „ein Whisky in höchstens einer Gruppe".
--      Lesbar nur für den Eigentümer und nur im laufenden Tasting; kein direkter Schreibzugriff
--      (auch der Admin liest keine fremden Merker).
--   2. toggle_compare_mark(event, from, to) — die EINE Schreib-Stelle:
--        beide in derselben Gruppe → „to" verlässt die Gruppe; Rest von 1 → Gruppe aufgelöst
--        sonst                     → zusammenführen (auch zwei bestehende Gruppen)
--      Liefert danach alle eigenen Merker des Tastings (Position, Gruppennummer).
--   3. Auslöser: beim Statuswechsel auf „closed" werden alle Merker des Tastings gelöscht.
--
-- Neuer Fehlercode TS026 (TS018–TS025 vergeben, PT-Klasse tabu).

begin;

-- ===========================================================================
-- 1 · Tabelle
-- ===========================================================================
create table public.compare_marks (
  event_id    uuid        not null references public.tasting_events (id) on delete cascade,
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  whisky_id   uuid        not null,
  group_no    smallint    not null check (group_no > 0),
  updated_at  timestamptz not null default now(),
  primary key (event_id, profile_id, whisky_id),
  foreign key (whisky_id, event_id)
    references public.whiskies (id, event_id) on delete cascade
);

create index idx_compare_marks_profile on public.compare_marks (profile_id);
create index idx_compare_marks_whisky  on public.compare_marks (whisky_id);

alter table public.compare_marks enable row level security;

revoke all on public.compare_marks from anon;
revoke insert, update, delete on public.compare_marks from authenticated;
grant  select on public.compare_marks to authenticated;

-- Nur Eigenes, nur solange das Tasting läuft. Bewusst ohne Admin-Ausnahme.
create policy compare_marks_select_own on public.compare_marks
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    and (select public.event_status_of(event_id)) = 'active'
  );

-- ===========================================================================
-- 2 · Merker umschalten
-- ===========================================================================
create or replace function public.toggle_compare_mark(
  p_event uuid,
  p_from  smallint,
  p_to    smallint
)
returns table (whisky_position smallint, group_no smallint)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_uid     uuid := (select auth.uid());
  v_status  public.event_status;
  v_current smallint;
  v_from    uuid;
  v_to      uuid;
  v_gf      smallint;
  v_gt      smallint;
  v_target  smallint;
begin
  if v_uid is null or not public.is_active_member() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  select e.status, e.current_position into v_status, v_current
  from public.tasting_events e where e.id = p_event for share;
  if v_status is null or v_status <> 'active' then
    raise exception 'Merken ist nur während des laufenden Tastings möglich.' using errcode = 'TS026';
  end if;

  if not public.is_event_participant(p_event) then
    raise exception 'Merken kann nur, wer bei diesem Tasting mitverkostet.' using errcode = 'TS026';
  end if;

  if p_from is null or p_to is null or p_from = p_to
     or p_from < 1 or p_to < 1 or p_from > v_current or p_to > v_current then
    raise exception 'Vergleichen geht nur zwischen zwei verschiedenen, schon ausgeschenkten Whiskies.'
      using errcode = 'TS026';
  end if;

  select w.id into v_from from public.whiskies w where w.event_id = p_event and w.position = p_from;
  select w.id into v_to   from public.whiskies w where w.event_id = p_event and w.position = p_to;
  if v_from is null or v_to is null then
    raise exception 'Diesen Whisky gibt es in diesem Tasting nicht.' using errcode = 'TS026';
  end if;

  -- Klicks derselben Person in diesem Tasting nacheinander abarbeiten.
  perform pg_advisory_xact_lock(hashtextextended(p_event::text || ':' || v_uid::text, 0));

  select m.group_no into v_gf from public.compare_marks m
  where m.event_id = p_event and m.profile_id = v_uid and m.whisky_id = v_from;
  select m.group_no into v_gt from public.compare_marks m
  where m.event_id = p_event and m.profile_id = v_uid and m.whisky_id = v_to;

  if v_gf is not null and v_gf = v_gt then
    -- Herausnehmen; eine Gruppe aus nur einem Whisky gibt es nicht.
    delete from public.compare_marks m
    where m.event_id = p_event and m.profile_id = v_uid and m.whisky_id = v_to;
    if (select count(*) from public.compare_marks m
        where m.event_id = p_event and m.profile_id = v_uid and m.group_no = v_gf) < 2 then
      delete from public.compare_marks m
      where m.event_id = p_event and m.profile_id = v_uid and m.group_no = v_gf;
    end if;
  else
    -- Zusammenführen: bestehende Gruppe von „from" übernimmt, sonst die von „to", sonst neu.
    v_target := coalesce(v_gf, v_gt, (
      select coalesce(max(m.group_no), 0) + 1 from public.compare_marks m
      where m.event_id = p_event and m.profile_id = v_uid
    ));
    if v_gt is not null and v_gt <> v_target then
      update public.compare_marks m set group_no = v_target, updated_at = now()
      where m.event_id = p_event and m.profile_id = v_uid and m.group_no = v_gt;
    end if;
    insert into public.compare_marks (event_id, profile_id, whisky_id, group_no)
    values (p_event, v_uid, v_from, v_target), (p_event, v_uid, v_to, v_target)
    on conflict (event_id, profile_id, whisky_id)
    do update set group_no = excluded.group_no, updated_at = now();
  end if;

  return query
  select w.position, m.group_no
  from public.compare_marks m
  join public.whiskies w on w.id = m.whisky_id
  where m.event_id = p_event and m.profile_id = v_uid
  order by m.group_no, w.position;
end;
$$;

revoke execute on function public.toggle_compare_mark(uuid, smallint, smallint) from public, anon;
grant  execute on function public.toggle_compare_mark(uuid, smallint, smallint) to authenticated;

-- ===========================================================================
-- 3 · Beim Abschluss aufräumen
-- ===========================================================================
create or replace function public.clear_compare_marks_on_close()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.compare_marks where event_id = new.id;
  return new;
end;
$$;

revoke execute on function public.clear_compare_marks_on_close() from public, anon, authenticated;

create trigger trg_compare_marks_clear_on_close
  after update of status on public.tasting_events
  for each row
  when (new.status = 'closed' and old.status is distinct from 'closed')
  execute function public.clear_compare_marks_on_close();

commit;
