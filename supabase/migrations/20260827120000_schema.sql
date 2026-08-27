-- PROJ-1 · Whisky-Tasting App · Schema
-- Enums, Tabellen, Constraints, Indizes, generischer updated_at-Trigger.
-- Reihenfolge der Migrationen:
--   120000 schema      → Tabellen
--   120100 helpers      → SECURITY-DEFINER-Helfer (von RLS + Triggern + RPCs genutzt)
--   120200 triggers     → handle_new_user, ratings-Sperre
--   120300 rls          → RLS aktivieren, Policies, Spalten-GRANTs
--   120400 rpcs         → alle Zustandsübergänge
--   120500 views_realtime→ Ranglisten-Views, Realtime-Publication

begin;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.app_role     as enum ('admin', 'teilnehmer');
create type public.event_status as enum ('draft', 'active', 'closed');

-- ---------------------------------------------------------------------------
-- Generischer updated_at-Trigger
-- ---------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  —  eine Zeile pro Person. KEINE E-Mail-Spalte (PII bleibt in auth.users).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text        not null check (char_length(display_name) between 1 and 80),
  role            public.app_role not null default 'teilnehmer',
  avatar_url      text        check (avatar_url is null or char_length(avatar_url) <= 2048),
  bio             text        check (bio is null or char_length(bio) <= 500),
  favorite_dram   text        check (favorite_dram is null or char_length(favorite_dram) <= 120),
  favorite_region text        check (favorite_region is null or char_length(favorite_region) <= 120),
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- tasting_events  —  eine Zeile pro Abend.
--   host_id / created_by: ON DELETE RESTRICT — ein ausscheidendes Mitglied darf die
--   Historie eines abgeschlossenen Tastings nicht still umschreiben. Ausscheiden
--   läuft über profiles.is_active = false (siehe PROJ-1 Decision Log).
-- ---------------------------------------------------------------------------
create table public.tasting_events (
  id                           uuid primary key default gen_random_uuid(),
  event_date                   date        not null,
  location                     text        not null check (char_length(location) between 1 and 200),
  theme                        text        check (theme is null or char_length(theme) <= 200),
  food_info                    text        check (food_info is null or char_length(food_info) <= 1000),
  host_notes                   text        check (host_notes is null or char_length(host_notes) <= 2000),
  host_id                      uuid        not null references public.profiles (id) on delete restrict,
  created_by                   uuid        not null references public.profiles (id) on delete restrict,
  max_whiskies_per_participant smallint    check (max_whiskies_per_participant is null
                                                  or max_whiskies_per_participant between 1 and 10),
  status                       public.event_status not null default 'draft',
  current_position             smallint    not null default 0 check (current_position >= 0),
  started_at                   timestamptz,
  closed_at                    timestamptz,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now(),
  -- Zeitstempel müssen zum Status passen.
  constraint events_status_timestamps check (
    (status = 'draft'  and started_at is null     and closed_at is null) or
    (status = 'active' and started_at is not null and closed_at is null) or
    (status = 'closed' and started_at is not null and closed_at is not null)
  )
);

-- Höchstens EIN Event gleichzeitig aktiv. Beliebig viele in Vorbereitung / abgeschlossen.
create unique index one_active_event_at_a_time
  on public.tasting_events ((status))
  where status = 'active';

create index idx_events_host       on public.tasting_events (host_id);
create index idx_events_created_by on public.tasting_events (created_by);
create index idx_events_status     on public.tasting_events (status);
create index idx_events_date       on public.tasting_events (event_date desc);

create trigger set_updated_at before update on public.tasting_events
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- event_participants  —  Zuordnung Event ⇄ Profil.
-- ---------------------------------------------------------------------------
create table public.event_participants (
  event_id   uuid not null references public.tasting_events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id)       on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create index idx_participants_profile on public.event_participants (profile_id);

-- ---------------------------------------------------------------------------
-- whiskies  —  SICHTBAR für alle Teilnehmer, aber nur Position.
--   Bewusst OHNE created_at/updated_at: die Tabelle wird über Realtime publiziert,
--   und Realtime setzt keine Spalten-GRANTs durch — ein Zeitstempel hier ließe sich
--   über den Kanal zur Korrelation "wer hat wann eingetragen" missbrauchen.
--   UNIQUE (id, event_id) ist Ziel des zusammengesetzten FK aus whisky_details.
-- ---------------------------------------------------------------------------
create table public.whiskies (
  id       uuid     not null default gen_random_uuid(),
  event_id uuid     not null references public.tasting_events (id) on delete cascade,
  position smallint not null check (position between 1 and 10),
  primary key (id),
  unique (id, event_id),
  constraint whiskies_event_position_key unique (event_id, position)
    deferrable initially immediate
);

create index idx_whiskies_event on public.whiskies (event_id);

-- ---------------------------------------------------------------------------
-- whisky_details  —  GEHEIM bis zum Abschluss. Nur Bringer + Gastgeber sehen das.
--   Der zusammengesetzte FK (whisky_id, event_id) → whiskies(id, event_id) macht es
--   strukturell unmöglich, dass die event_id der Detailzeile von der ihres Whiskies
--   abweicht. brought_by liegt hier (nicht in whiskies), weil "wessen Whisky ist #3"
--   die Blindheit bricht.
-- ---------------------------------------------------------------------------
create table public.whisky_details (
  whisky_id   uuid        primary key references public.whiskies (id) on delete cascade,
  event_id    uuid        not null,
  brought_by  uuid        not null references public.profiles (id) on delete restrict,
  name        text        not null check (char_length(name) between 1 and 200),
  distillery  text        check (distillery is null or char_length(distillery) <= 200),
  region      text        check (region is null or char_length(region) <= 120),
  age_years   smallint    check (age_years is null or age_years between 0 and 100),
  abv         numeric(4,1) check (abv is null or abv between 0 and 100),
  cask_type   text        check (cask_type is null or char_length(cask_type) <= 200),
  bottler     text        check (bottler is null or char_length(bottler) <= 200),
  price_eur   numeric(8,2) check (price_eur is null or price_eur >= 0),
  owner_notes text        check (owner_notes is null or char_length(owner_notes) <= 2000),
  video_url   text        check (video_url is null or video_url ~* '^https?://.+'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  foreign key (whisky_id, event_id)
    references public.whiskies (id, event_id) on delete cascade
);

create index idx_whisky_details_event      on public.whisky_details (event_id);
create index idx_whisky_details_brought_by on public.whisky_details (brought_by);

create trigger set_updated_at before update on public.whisky_details
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- ratings  —  eine Zeile pro Person pro Whisky. total_points = Nase + Geschmack.
-- ---------------------------------------------------------------------------
create table public.ratings (
  id           uuid        primary key default gen_random_uuid(),
  whisky_id    uuid        not null references public.whiskies (id) on delete cascade,
  event_id     uuid        not null references public.tasting_events (id) on delete cascade,
  profile_id   uuid        not null references public.profiles (id) on delete restrict,
  nose_points  smallint    not null check (nose_points between 1 and 5),
  taste_points smallint    not null check (taste_points between 1 and 10),
  total_points smallint    generated always as (nose_points + taste_points) stored,
  notes        text        check (notes is null or char_length(notes) <= 2000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (whisky_id, profile_id),
  foreign key (whisky_id, event_id)
    references public.whiskies (id, event_id) on delete cascade
);

create index idx_ratings_event   on public.ratings (event_id);
create index idx_ratings_profile  on public.ratings (profile_id);
create index idx_ratings_whisky   on public.ratings (whisky_id);

create trigger set_updated_at before update on public.ratings
  for each row execute function public.tg_set_updated_at();

commit;
