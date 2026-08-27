-- PROJ-1 · Helper-Funktionen für RLS, Trigger und RPCs
--
-- Alle SECURITY DEFINER + STABLE + SET search_path = ''.
--
-- WARUM SECURITY DEFINER: Eine RLS-Policy darf keine andere Tabelle direkt
-- referenzieren (Zyklus tasting_events → event_participants → tasting_events →
-- "infinite recursion detected in policy", 42P17). Die Helfer laufen mit den
-- Rechten des Owners und damit OHNE RLS auf ihren inneren Reads — der Zyklus
-- reißt beim ersten Sprung ab.
--
-- PERFORMANCE-IDIOM in den Policies: immer  (select public.is_admin())  statt
-- public.is_admin() — die (select …)-Klammer lässt den Planner die Funktion einmal
-- pro Statement als InitPlan auswerten statt einmal pro Zeile.

begin;

-- Ist der aktuelle Nutzer ein AKTIVER Admin?  (deaktivierter Admin verliert die Rolle)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and is_active
  );
$$;

-- Ist der aktuelle Nutzer Teilnehmer des Events?
create or replace function public.is_event_participant(p_event uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.event_participants
    where event_id = p_event
      and profile_id = (select auth.uid())
  );
$$;

-- Ist der aktuelle Nutzer Gastgeber des Events?
create or replace function public.is_event_host(p_event uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tasting_events
    where id = p_event
      and host_id = (select auth.uid())
  );
$$;

-- Status des Events (draft / active / closed), NULL wenn es das Event nicht gibt.
create or replace function public.event_status_of(p_event uuid)
returns public.event_status
language sql
stable
security definer
set search_path = ''
as $$
  select status from public.tasting_events where id = p_event;
$$;

-- Ist das Event abgeschlossen?
create or replace function public.is_event_closed(p_event uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.event_status_of(p_event) = 'closed';
$$;

-- Darf der aktuelle Nutzer diesen Whisky JETZT bewerten?
--   Event aktiv  +  Whisky bereits (oder gerade) ausgeschenkt  +  Nutzer ist Teilnehmer.
create or replace function public.can_rate_whisky(p_whisky uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.whiskies w
    join public.tasting_events e on e.id = w.event_id
    where w.id = p_whisky
      and e.status = 'active'
      and w.position <= e.current_position
      and public.is_event_participant(w.event_id)
  );
$$;

-- Nur authentifizierte Nutzer dürfen die Helfer aufrufen.
revoke execute on function public.is_admin()                    from public, anon;
revoke execute on function public.is_event_participant(uuid)    from public, anon;
revoke execute on function public.is_event_host(uuid)           from public, anon;
revoke execute on function public.event_status_of(uuid)         from public, anon;
revoke execute on function public.is_event_closed(uuid)         from public, anon;
revoke execute on function public.can_rate_whisky(uuid)         from public, anon;

grant execute on function public.is_admin()                     to authenticated;
grant execute on function public.is_event_participant(uuid)     to authenticated;
grant execute on function public.is_event_host(uuid)            to authenticated;
grant execute on function public.event_status_of(uuid)          to authenticated;
grant execute on function public.is_event_closed(uuid)          to authenticated;
grant execute on function public.can_rate_whisky(uuid)          to authenticated;

commit;
