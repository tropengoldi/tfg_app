-- PROJ-16 · Nachrichten an Teilnehmer
--
-- Erste Ausbaustufe: E-Mail-Versand, keine In-App-Inbox. Die Datenbank
-- speichert trotzdem, was verschickt wurde (Text + Empfänger + Zeitpunkt) —
-- Grundlage für die spätere Push-Ausbaustufe und für die "Gesendet"-Liste
-- des Absenders. Der eigentliche E-Mail-Versand passiert außerhalb der DB
-- (Nodemailer in der App); Postgres kann keine Mails verschicken.
--
-- Zwei RPCs statt einer (Abweichung vom ursprünglichen Architecture-Entwurf,
-- siehe Implementation Notes der Spec): eine Nachricht darf nie als
-- "gesendet" in der DB stehen, wenn der E-Mail-Versand komplett fehlschlägt.
--   1. resolve_message_recipients — validiert (aktives Mitglied, bei
--      Tasting-Bezug: Absender + jeder Empfänger wirklich beteiligt) und
--      löst die E-Mail-Adressen auf. Schreibt nichts. Inaktive Empfänger
--      und der Absender selbst werden still herausgefiltert (kein Fehler);
--      ein Empfänger, der nicht zum gewählten Tasting gehört, löst dagegen
--      einen Fehler aus (nur über eine manipulierte Anfrage erreichbar,
--      die ehrliche UI bietet das nie an).
--   2. record_sent_message — ruft intern erneut resolve_message_recipients
--      auf (dieselbe Validierung, kein doppelt gepflegter Code) und
--      speichert Nachricht + Empfängerliste nur für die tatsächlich noch
--      gültigen Empfänger. Wird von der App erst aufgerufen, nachdem
--      mindestens ein E-Mail-Versand geglückt ist.
--
-- Custom SQLSTATE (Klasse 'TS', siehe src/lib/errors.ts):
--   TS018 not_event_member     — Absender ist an diesem Tasting nicht beteiligt
--   TS019 recipient_not_member — ein gewählter Empfänger gehört nicht zum Tasting
--   TS020 no_recipients_left   — nach Filterung bleibt niemand übrig

begin;

-- ===========================================================================
-- 1 · Tabellen
-- ===========================================================================
create table public.messages (
  id         uuid        primary key default gen_random_uuid(),
  sender_id  uuid        not null references public.profiles (id) on delete restrict,
  event_id   uuid        references public.tasting_events (id) on delete cascade,
  body       text        not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index idx_messages_sender on public.messages (sender_id, created_at desc);
create index idx_messages_event  on public.messages (event_id);

create table public.message_recipients (
  message_id uuid        not null references public.messages (id) on delete cascade,
  profile_id uuid        not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create index idx_message_recipients_profile on public.message_recipients (profile_id);

-- ===========================================================================
-- 2 · Helfer-Funktion für die RLS-Sicht auf message_recipients
--   (SECURITY DEFINER + STABLE — Projekt-Konvention: keine Policy referenziert
--   eine andere Tabelle direkt, das läuft immer über eine Funktion.)
-- ===========================================================================
create or replace function public.is_own_message(p_message uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.messages
    where id = p_message and sender_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_own_message(uuid) from public, anon;
grant  execute on function public.is_own_message(uuid) to authenticated;

-- ===========================================================================
-- 3 · RLS — nur der Absender darf seine eigenen Nachrichten/Empfängerlisten
--   lesen. Kein INSERT/UPDATE/DELETE-Policy für `authenticated`: ohne Policy
--   ist das per Default verboten, jeder Schreibvorgang läuft ausschließlich
--   über die beiden SECURITY-DEFINER-RPCs unten (die RLS umgehen). Damit ist
--   "kein Bearbeiten/Löschen nach dem Versand" (Spec-Entscheidung) strukturell
--   erzwungen, nicht nur eine UI-Konvention.
-- ===========================================================================
revoke all on public.messages           from anon;
revoke all on public.message_recipients from anon;
alter table public.messages           enable row level security;
alter table public.message_recipients enable row level security;

create policy messages_select_own on public.messages
  for select to authenticated
  using (sender_id = (select auth.uid()));

create policy message_recipients_select_own on public.message_recipients
  for select to authenticated
  using ((select public.is_own_message(message_id)));

-- ===========================================================================
-- 4 · resolve_message_recipients — validieren + E-Mail-Adressen auflösen,
--   OHNE etwas zu speichern.
-- ===========================================================================
create function public.resolve_message_recipients(
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

  -- Dedup + Absender selbst raus (still, kein Fehler — die UI wählt sich
  -- ohnehin nie selbst vor, das ist nur das Sicherheitsnetz).
  select coalesce(array_agg(distinct x), array[]::uuid[]) into v_ids
  from unnest(p_recipient_ids) x
  where x <> v_uid;

  if array_length(v_ids, 1) is null then
    return; -- leere Ergebnismenge, kein Fehler — der Aufrufer meldet "keiner erreichbar"
  end if;

  if p_event_id is not null then
    if exists (
      select 1 from unnest(v_ids) rid
      where not exists (
        select 1 from public.event_participants ep
        where ep.event_id = p_event_id and ep.profile_id = rid
      )
    ) then
      raise exception 'Mindestens einer der gewählten Empfänger gehört nicht zu diesem Tasting.'
        using errcode = 'TS019';
    end if;
  end if;

  return query
  select p.id, u.email::text, p.display_name
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = any (v_ids)
    and p.is_active;
end;
$$;

revoke execute on function public.resolve_message_recipients(uuid[], uuid) from public, anon;
grant  execute on function public.resolve_message_recipients(uuid[], uuid) to authenticated;

-- ===========================================================================
-- 5 · record_sent_message — nach mindestens einem geglückten Versand
--   aufgerufen; validiert über denselben Weg wie oben (kein doppelt
--   gepflegter Code) und speichert nur für die dabei noch gültigen
--   Empfänger.
-- ===========================================================================
create function public.record_sent_message(
  p_body          text,
  p_recipient_ids uuid[],
  p_event_id      uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_msg_id uuid;
  v_valid  uuid[];
begin
  select coalesce(array_agg(r.recipient_id), array[]::uuid[]) into v_valid
  from public.resolve_message_recipients(p_recipient_ids, p_event_id) r;

  if array_length(v_valid, 1) is null then
    raise exception 'Keiner der gewählten Empfänger ist noch erreichbar.' using errcode = 'TS020';
  end if;

  insert into public.messages (sender_id, event_id, body)
  values (v_uid, p_event_id, trim(p_body))
  returning id into v_msg_id;

  insert into public.message_recipients (message_id, profile_id)
  select v_msg_id, x from unnest(v_valid) x;

  return v_msg_id;
end;
$$;

revoke execute on function public.record_sent_message(text, uuid[], uuid) from public, anon;
grant  execute on function public.record_sent_message(text, uuid[], uuid) to authenticated;

commit;
