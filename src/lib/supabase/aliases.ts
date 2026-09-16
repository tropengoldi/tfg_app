/**
 * Bequeme Kurzformen für die generierten Datenbank-Typen.
 *
 * Eigene Datei, damit `npm run db:types` (überschreibt `types.ts` komplett)
 * diese Aliase nicht wegräumt.
 */
import type { Tables, TablesInsert, TablesUpdate, Enums } from './types'

export type AppRole = Enums<'app_role'>
export type EventStatus = Enums<'event_status'>

export type Profile = Tables<'profiles'>
/**
 * Das Profil, wie es `requireUser`/`getSessionContext` laden — OHNE `bio` /
 * `favorite_dram` / `favorite_region` (PROJ-14 hat den Direktzugriff auf
 * diese drei Spalten für fremde Zeilen entzogen; die Session lädt bewusst
 * nur noch die unkritischen Spalten, auch für die eigene Zeile, damit ein
 * einziger Lesepfad gilt). Die eigenen drei Felder holt die Profilseite
 * separat über `getOwnStammdaten` (liest `profiles_public`, das für die
 * eigene ID immer den vollen Wert liefert).
 */
export type SessionProfile = Omit<Profile, 'bio' | 'favorite_dram' | 'favorite_region'>
export type TastingEvent = Tables<'tasting_events'>
export type EventParticipant = Tables<'event_participants'>
export type Whisky = Tables<'whiskies'>
export type WhiskyDetail = Tables<'whisky_details'>
export type Rating = Tables<'ratings'>

export type RatingInsert = TablesInsert<'ratings'>
export type RatingUpdate = TablesUpdate<'ratings'>
export type WhiskyDetailUpdate = TablesUpdate<'whisky_details'>
export type ProfileUpdate = TablesUpdate<'profiles'>

// whisky_rankings / past_tastings / whisky_score_breakdown sind Views —
// Tables<> deckt Views mit ab.
export type WhiskyRanking = Tables<'whisky_rankings'>
export type PastTasting = Tables<'past_tastings'>
export type WhiskyScoreBreakdown = Tables<'whisky_score_breakdown'>
export type ProfilePublic = Tables<'profiles_public'>
