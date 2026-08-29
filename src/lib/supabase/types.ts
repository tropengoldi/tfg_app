export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event_participants: {
        Row: {
          created_at: string
          event_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "past_tastings"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tasting_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          favorite_dram: string | null
          favorite_region: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          favorite_dram?: string | null
          favorite_region?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          favorite_dram?: string | null
          favorite_region?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          event_id: string
          id: string
          nose_points: number
          notes: string | null
          profile_id: string
          taste_points: number
          total_points: number | null
          updated_at: string
          whisky_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          nose_points: number
          notes?: string | null
          profile_id: string
          taste_points: number
          total_points?: number | null
          updated_at?: string
          whisky_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          nose_points?: number
          notes?: string | null
          profile_id?: string
          taste_points?: number
          total_points?: number | null
          updated_at?: string
          whisky_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "past_tastings"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "ratings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tasting_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_whisky_id_event_id_fkey"
            columns: ["whisky_id", "event_id"]
            isOneToOne: false
            referencedRelation: "whiskies"
            referencedColumns: ["id", "event_id"]
          },
          {
            foreignKeyName: "ratings_whisky_id_event_id_fkey"
            columns: ["whisky_id", "event_id"]
            isOneToOne: false
            referencedRelation: "whisky_rankings"
            referencedColumns: ["whisky_id", "event_id"]
          },
          {
            foreignKeyName: "ratings_whisky_id_fkey"
            columns: ["whisky_id"]
            isOneToOne: false
            referencedRelation: "past_tastings"
            referencedColumns: ["winner_whisky_id"]
          },
          {
            foreignKeyName: "ratings_whisky_id_fkey"
            columns: ["whisky_id"]
            isOneToOne: false
            referencedRelation: "whiskies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_whisky_id_fkey"
            columns: ["whisky_id"]
            isOneToOne: false
            referencedRelation: "whisky_rankings"
            referencedColumns: ["whisky_id"]
          },
        ]
      }
      tasting_events: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string
          current_position: number
          event_date: string
          food_info: string | null
          host_id: string
          host_notes: string | null
          id: string
          location: string
          max_whiskies_per_participant: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["event_status"]
          theme: string | null
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by: string
          current_position?: number
          event_date: string
          food_info?: string | null
          host_id: string
          host_notes?: string | null
          id?: string
          location: string
          max_whiskies_per_participant?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          theme?: string | null
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          current_position?: number
          event_date?: string
          food_info?: string | null
          host_id?: string
          host_notes?: string | null
          id?: string
          location?: string
          max_whiskies_per_participant?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasting_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasting_events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whiskies: {
        Row: {
          event_id: string
          id: string
          position: number
        }
        Insert: {
          event_id: string
          id?: string
          position: number
        }
        Update: {
          event_id?: string
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "whiskies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "past_tastings"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "whiskies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tasting_events"
            referencedColumns: ["id"]
          },
        ]
      }
      whisky_details: {
        Row: {
          abv: number | null
          age_years: number | null
          bottler: string | null
          brought_by: string
          cask_type: string | null
          created_at: string
          distillery: string | null
          event_id: string
          name: string
          owner_notes: string | null
          price_eur: number | null
          region: string | null
          updated_at: string
          video_url: string | null
          whisky_id: string
        }
        Insert: {
          abv?: number | null
          age_years?: number | null
          bottler?: string | null
          brought_by: string
          cask_type?: string | null
          created_at?: string
          distillery?: string | null
          event_id: string
          name: string
          owner_notes?: string | null
          price_eur?: number | null
          region?: string | null
          updated_at?: string
          video_url?: string | null
          whisky_id: string
        }
        Update: {
          abv?: number | null
          age_years?: number | null
          bottler?: string | null
          brought_by?: string
          cask_type?: string | null
          created_at?: string
          distillery?: string | null
          event_id?: string
          name?: string
          owner_notes?: string | null
          price_eur?: number | null
          region?: string | null
          updated_at?: string
          video_url?: string | null
          whisky_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whisky_details_brought_by_fkey"
            columns: ["brought_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whisky_details_whisky_id_event_id_fkey"
            columns: ["whisky_id", "event_id"]
            isOneToOne: false
            referencedRelation: "whiskies"
            referencedColumns: ["id", "event_id"]
          },
          {
            foreignKeyName: "whisky_details_whisky_id_event_id_fkey"
            columns: ["whisky_id", "event_id"]
            isOneToOne: false
            referencedRelation: "whisky_rankings"
            referencedColumns: ["whisky_id", "event_id"]
          },
          {
            foreignKeyName: "whisky_details_whisky_id_fkey"
            columns: ["whisky_id"]
            isOneToOne: true
            referencedRelation: "past_tastings"
            referencedColumns: ["winner_whisky_id"]
          },
          {
            foreignKeyName: "whisky_details_whisky_id_fkey"
            columns: ["whisky_id"]
            isOneToOne: true
            referencedRelation: "whiskies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whisky_details_whisky_id_fkey"
            columns: ["whisky_id"]
            isOneToOne: true
            referencedRelation: "whisky_rankings"
            referencedColumns: ["whisky_id"]
          },
        ]
      }
    }
    Views: {
      past_tastings: {
        Row: {
          event_date: string | null
          event_id: string | null
          host_id: string | null
          host_name: string | null
          location: string | null
          theme: string | null
          winner_name: string | null
          winner_points: number | null
          winner_whisky_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasting_events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whisky_rankings: {
        Row: {
          brought_by: string | null
          distillery: string | null
          event_id: string | null
          name: string | null
          nose_total: number | null
          position: number | null
          rank: number | null
          rating_count: number | null
          region: string | null
          taste_total: number | null
          total_points: number | null
          video_url: string | null
          whisky_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whiskies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "past_tastings"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "whiskies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tasting_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whisky_details_brought_by_fkey"
            columns: ["brought_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_whisky: {
        Args: {
          p_abv?: number
          p_age_years?: number
          p_bottler?: string
          p_cask_type?: string
          p_distillery?: string
          p_event: string
          p_name: string
          p_owner_notes?: string
          p_price_eur?: number
          p_region?: string
          p_video_url?: string
        }
        Returns: string
      }
      admin_list_events: {
        Args: never
        Returns: {
          event_date: string
          host_id: string
          host_name: string
          id: string
          location: string
          max_whiskies_per_participant: number
          participant_count: number
          status: Database["public"]["Enums"]["event_status"]
          theme: string
          whisky_count: number
        }[]
      }
      admin_list_members: {
        Args: never
        Returns: {
          display_name: string
          email: string
          has_signed_in: boolean
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      can_rate_whisky: { Args: { p_whisky: string }; Returns: boolean }
      close_event: { Args: { p_event: string }; Returns: undefined }
      close_round: {
        Args: { p_event: string; p_expected_position: number }
        Returns: undefined
      }
      create_event: {
        Args: {
          p_event_date: string
          p_food_info?: string
          p_host_id: string
          p_location: string
          p_max_whiskies?: number
          p_theme?: string
        }
        Returns: string
      }
      deactivate_member: { Args: { p_target: string }; Returns: undefined }
      delete_event: { Args: { p_event: string }; Returns: undefined }
      event_status_of: {
        Args: { p_event: string }
        Returns: Database["public"]["Enums"]["event_status"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_event_closed: { Args: { p_event: string }; Returns: boolean }
      is_event_host: { Args: { p_event: string }; Returns: boolean }
      is_event_participant: { Args: { p_event: string }; Returns: boolean }
      rating_progress: {
        Args: { p_event: string }
        Returns: {
          participant_count: number
          rating_count: number
          whisky_position: number
        }[]
      }
      reactivate_member: { Args: { p_target: string }; Returns: undefined }
      remove_whisky: { Args: { p_whisky: string }; Returns: undefined }
      set_event_participants: {
        Args: { p_event: string; p_profile_ids: string[] }
        Returns: undefined
      }
      set_member_admin: {
        Args: { p_make_admin: boolean; p_target: string }
        Returns: undefined
      }
      set_whisky_order: {
        Args: { p_event: string; p_ordered: string[] }
        Returns: undefined
      }
      start_event: { Args: { p_event: string }; Returns: undefined }
      update_event: {
        Args: {
          p_event: string
          p_event_date: string
          p_food_info?: string
          p_host_id: string
          p_location: string
          p_max_whiskies?: number
          p_theme?: string
        }
        Returns: undefined
      }
      update_event_host_fields: {
        Args: {
          p_event: string
          p_food_info: string
          p_host_notes: string
          p_theme: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "teilnehmer"
      event_status: "draft" | "active" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teilnehmer"],
      event_status: ["draft", "active", "closed"],
    },
  },
} as const
