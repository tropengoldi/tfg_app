-- PROJ-1 · Trigger
--   1. handle_new_user  — jeder neue Auth-Nutzer bekommt automatisch ein Profil
--                          mit Rolle 'teilnehmer'
--   2. ratings-Sperre    — nach dem Abschluss des Events ist keine Bewertung mehr
--                          änder- oder löschbar (zweite Verteidigungslinie neben RLS)

begin;

-- ---------------------------------------------------------------------------
-- Profil-Anlage bei neuem Auth-Nutzer
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    'teilnehmer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Bewertungssperre nach Event-Abschluss
--   Custom SQLSTATE 'PT001' → src/lib/errors.ts mappt es auf eine deutsche Meldung.
-- ---------------------------------------------------------------------------
create or replace function public.tg_ratings_lock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event uuid := coalesce(new.event_id, old.event_id);
begin
  if public.event_status_of(v_event) = 'closed' then
    raise exception 'Das Tasting ist abgeschlossen — Bewertungen lassen sich nicht mehr ändern.'
      using errcode = 'PT001';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger ratings_lock
  before insert or update or delete on public.ratings
  for each row execute function public.tg_ratings_lock();

commit;
