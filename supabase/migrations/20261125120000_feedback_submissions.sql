-- PROJ-30 · Feedback-Formular (Fehler & Wünsche) — Stundenlimit
--
--   Der INHALT einer Einreichung wird nirgends gespeichert (er existiert nur
--   in der E-Mail an den Admin). Diese Tabelle ist ein reiner Zähler:
--   wer hat wann gesendet. Sie ist für Mitglieder weder lesbar noch
--   beschreibbar; einziger Weg ist register_feedback().
--
--   register_feedback():
--     - aktives Mitglied, sonst TS004
--     - serialisiert pro Person (Advisory-Lock), damit parallele Klicks das
--       Limit nicht überholen
--     - löscht Einträge, die älter als einen Tag sind (Tabelle bleibt winzig)
--     - schon 5 Einträge in der letzten Stunde → TS029
--     - legt sonst einen Eintrag an
--
-- Neuer Fehlercode TS029 (TS018–TS028 vergeben, PT-Klasse tabu).

begin;

create table public.feedback_submissions (
  id          bigint generated always as identity primary key,
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

comment on table public.feedback_submissions is
  'PROJ-30: Zähler für das Feedback-Stundenlimit (nur wer + wann, kein Inhalt). Einträge > 1 Tag werden von register_feedback() gelöscht.';

create index idx_feedback_submissions_profile_time
  on public.feedback_submissions (profile_id, created_at);

alter table public.feedback_submissions enable row level security;
-- Bewusst KEINE Policy: Direktzugriff für anon/authenticated ist komplett gesperrt.
revoke all on public.feedback_submissions from anon, authenticated;

create or replace function public.register_feedback()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_count integer;
begin
  if v_uid is null or not public.is_active_member() then
    raise exception 'Dazu fehlt dir die Berechtigung.' using errcode = 'TS004';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('feedback:' || v_uid::text, 0));

  delete from public.feedback_submissions
  where created_at < now() - interval '1 day';

  select count(*) into v_count
  from public.feedback_submissions
  where profile_id = v_uid
    and created_at > now() - interval '1 hour';

  if v_count >= 5 then
    raise exception 'Du hast gerade viele Nachrichten geschickt – bitte versuch es später noch einmal.'
      using errcode = 'TS029';
  end if;

  insert into public.feedback_submissions (profile_id) values (v_uid);
end;
$$;

comment on function public.register_feedback() is
  'PROJ-30: reserviert einen Feedback-Versand (max. 5 pro Person und Stunde, sonst TS029).';

revoke execute on function public.register_feedback() from public, anon;
grant  execute on function public.register_feedback() to authenticated;

commit;
