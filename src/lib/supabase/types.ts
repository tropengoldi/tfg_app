/**
 * Datenbank-Typen für die Whisky-Tasting App (PROJ-1).
 *
 * HANDGEPFLEGT als Fallback, damit `npm run build` ohne DB-Zugang läuft.
 * Nach jeder Migration neu generieren und diese Datei ersetzen:
 *
 *     npm run db:types
 *
 * (ruft `supabase gen types typescript --project-id ogwuwisutgaxxpknkgpg --schema public`)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'admin' | 'teilnehmer'
export type EventStatus = 'draft' | 'active' | 'closed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          role: AppRole
          avatar_url: string | null
          bio: string | null
          favorite_dram: string | null
          favorite_region: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          role?: AppRole
          avatar_url?: string | null
          bio?: string | null
          favorite_dram?: string | null
          favorite_region?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          favorite_dram?: string | null
          favorite_region?: string | null
        }
        Relationships: []
      }
      tasting_events: {
        Row: {
          id: string
          event_date: string
          location: string
          theme: string | null
          food_info: string | null
          host_notes: string | null
          host_id: string
          created_by: string
          max_whiskies_per_participant: number | null
          status: EventStatus
          current_position: number
          started_at: string | null
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
        Relationships: [
          {
            foreignKeyName: 'tasting_events_host_id_fkey'
            columns: ['host_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasting_events_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: string
          profile_id: string
          created_at: string
        }
        Insert: never
        Update: never
        Relationships: [
          {
            foreignKeyName: 'event_participants_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'tasting_events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_participants_profile_id_fkey'
            columns: ['profile_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      whiskies: {
        Row: {
          id: string
          event_id: string
          position: number
        }
        Insert: never
        Update: never
        Relationships: [
          {
            foreignKeyName: 'whiskies_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'tasting_events'
            referencedColumns: ['id']
          },
        ]
      }
      whisky_details: {
        Row: {
          whisky_id: string
          event_id: string
          brought_by: string
          name: string
          distillery: string | null
          region: string | null
          age_years: number | null
          abv: number | null
          cask_type: string | null
          bottler: string | null
          price_eur: number | null
          owner_notes: string | null
          video_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: {
          name?: string
          distillery?: string | null
          region?: string | null
          age_years?: number | null
          abv?: number | null
          cask_type?: string | null
          bottler?: string | null
          price_eur?: number | null
          owner_notes?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'whisky_details_whisky_id_fkey'
            columns: ['whisky_id']
            referencedRelation: 'whiskies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'whisky_details_brought_by_fkey'
            columns: ['brought_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ratings: {
        Row: {
          id: string
          whisky_id: string
          event_id: string
          profile_id: string
          nose_points: number
          taste_points: number
          total_points: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          whisky_id: string
          event_id: string
          profile_id: string
          nose_points: number
          taste_points: number
          notes?: string | null
        }
        Update: {
          nose_points?: number
          taste_points?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ratings_whisky_id_fkey'
            columns: ['whisky_id']
            referencedRelation: 'whiskies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ratings_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'tasting_events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ratings_profile_id_fkey'
            columns: ['profile_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      whisky_rankings: {
        Row: {
          event_id: string | null
          whisky_id: string | null
          position: number | null
          name: string | null
          distillery: string | null
          region: string | null
          video_url: string | null
          brought_by: string | null
          nose_total: number | null
          taste_total: number | null
          total_points: number | null
          rating_count: number | null
          rank: number | null
        }
        Relationships: []
      }
      past_tastings: {
        Row: {
          event_id: string | null
          event_date: string | null
          location: string | null
          theme: string | null
          host_id: string | null
          host_name: string | null
          winner_whisky_id: string | null
          winner_name: string | null
          winner_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_event_participant: {
        Args: { p_event: string }
        Returns: boolean
      }
      is_event_host: {
        Args: { p_event: string }
        Returns: boolean
      }
      event_status_of: {
        Args: { p_event: string }
        Returns: EventStatus
      }
      is_event_closed: {
        Args: { p_event: string }
        Returns: boolean
      }
      can_rate_whisky: {
        Args: { p_whisky: string }
        Returns: boolean
      }
      create_event: {
        Args: {
          p_event_date: string
          p_location: string
          p_host_id: string
          p_theme?: string | null
          p_food_info?: string | null
          p_max_whiskies?: number | null
        }
        Returns: string
      }
      update_event: {
        Args: {
          p_event: string
          p_event_date: string
          p_location: string
          p_host_id: string
          p_theme?: string | null
          p_food_info?: string | null
          p_max_whiskies?: number | null
        }
        Returns: undefined
      }
      update_event_host_fields: {
        Args: {
          p_event: string
          p_theme: string | null
          p_food_info: string | null
          p_host_notes: string | null
        }
        Returns: undefined
      }
      set_event_participants: {
        Args: { p_event: string; p_profile_ids: string[] }
        Returns: undefined
      }
      add_whisky: {
        Args: {
          p_event: string
          p_name: string
          p_distillery?: string | null
          p_region?: string | null
          p_age_years?: number | null
          p_abv?: number | null
          p_cask_type?: string | null
          p_bottler?: string | null
          p_price_eur?: number | null
          p_owner_notes?: string | null
          p_video_url?: string | null
        }
        Returns: string
      }
      remove_whisky: {
        Args: { p_whisky: string }
        Returns: undefined
      }
      set_whisky_order: {
        Args: { p_event: string; p_ordered: string[] }
        Returns: undefined
      }
      start_event: {
        Args: { p_event: string }
        Returns: undefined
      }
      close_round: {
        Args: { p_event: string; p_expected_position: number }
        Returns: undefined
      }
      close_event: {
        Args: { p_event: string }
        Returns: undefined
      }
      rating_progress: {
        Args: { p_event: string }
        Returns: {
          whisky_position: number
          rating_count: number
          participant_count: number
        }[]
      }
    }
    Enums: {
      app_role: AppRole
      event_status: EventStatus
    }
    CompositeTypes: Record<string, never>
  }
}

// --- Bequeme Kurzformen -----------------------------------------------------
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

export type Profile = Tables<'profiles'>
export type TastingEvent = Tables<'tasting_events'>
export type EventParticipant = Tables<'event_participants'>
export type Whisky = Tables<'whiskies'>
export type WhiskyDetail = Tables<'whisky_details'>
export type Rating = Tables<'ratings'>
export type WhiskyRanking = Views<'whisky_rankings'>
export type PastTasting = Views<'past_tastings'>
