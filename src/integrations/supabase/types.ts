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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          admin_level: string
          created_at: string
          department: string
          id: string
          permissions: Json | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          admin_level?: string
          created_at?: string
          department?: string
          id?: string
          permissions?: Json | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          admin_level?: string
          created_at?: string
          department?: string
          id?: string
          permissions?: Json | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          target_level: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          target_level?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          target_level?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string
          daily_roi_rate: number
          description: string | null
          duration_days: number
          id: string
          maximum_amount: number | null
          minimum_amount: number
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_roi_rate: number
          description?: string | null
          duration_days: number
          id?: string
          maximum_amount?: number | null
          minimum_amount: number
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_roi_rate?: number
          description?: string | null
          duration_days?: number
          id?: string
          maximum_amount?: number | null
          minimum_amount?: number
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_summaries: {
        Row: {
          created_at: string | null
          created_by: string
          id: number
          model: string
          summary: string
          thread_id: number
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: never
          model: string
          summary: string
          thread_id: number
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: never
          model?: string
          summary?: string
          thread_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_summaries_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: number
          metadata: Json | null
          sender_id: string
          thread_id: number
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          metadata?: Json | null
          sender_id: string
          thread_id: number
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          metadata?: Json | null
          sender_id?: string
          thread_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_balance: number | null
          created_at: string | null
          full_name: string | null
          id: string
          investment_experience: string | null
          investment_goals: string[] | null
          level: string | null
          matric_number: string | null
          monthly_income_range: string | null
          phone_number: string | null
          risk_tolerance: string | null
          role: Database["public"]["Enums"]["user_role"]
          total_invested: number | null
          total_withdrawn: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_balance?: number | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string[] | null
          level?: string | null
          matric_number?: string | null
          monthly_income_range?: string | null
          phone_number?: string | null
          risk_tolerance?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          total_invested?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_balance?: number | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string[] | null
          level?: string | null
          matric_number?: string | null
          monthly_income_range?: string | null
          phone_number?: string | null
          risk_tolerance?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          total_invested?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          course_code: string
          course_title: string
          created_at: string | null
          credit_unit: number
          grade: string
          id: string
          level: string
          point: number
          semester: string
          session: string
          student_id: string
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string | null
          credit_unit: number
          grade: string
          id?: string
          level: string
          point: number
          semester: string
          session: string
          student_id: string
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string | null
          credit_unit?: number
          grade?: string
          id?: string
          level?: string
          point?: number
          semester?: string
          session?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          carryovers: number | null
          cgp: number | null
          created_at: string | null
          fee_status: string | null
          id: string
          level: string
          matric_number: string
          pin: string | null
          pin_hash: string | null
          profile_id: string
          total_gp: number | null
          updated_at: string | null
        }
        Insert: {
          carryovers?: number | null
          cgp?: number | null
          created_at?: string | null
          fee_status?: string | null
          id?: string
          level: string
          matric_number: string
          pin?: string | null
          pin_hash?: string | null
          profile_id: string
          total_gp?: number | null
          updated_at?: string | null
        }
        Update: {
          carryovers?: number | null
          cgp?: number | null
          created_at?: string | null
          fee_status?: string | null
          id?: string
          level?: string
          matric_number?: string
          pin?: string | null
          pin_hash?: string | null
          profile_id?: string
          total_gp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          created_at: string | null
          created_by: string
          id: number
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: never
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: never
          title?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          investment_id: string | null
          metadata: Json | null
          reference_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          investment_id?: string | null
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          investment_id?: string | null
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string
          end_date: string
          id: string
          last_profit_calculation: string | null
          plan_id: string
          start_date: string
          status: string
          total_profit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date: string
          id?: string
          last_profit_calculation?: string | null
          plan_id: string
          start_date?: string
          status?: string
          total_profit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string
          id?: string
          last_profit_calculation?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          total_profit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_student: {
        Args: {
          p_full_name: string
          p_level: string
          p_matric_number: string
          p_phone_number?: string
          p_pin?: string
        }
        Returns: Json
      }
      authenticate_student: {
        Args: { p_matric_number: string; p_pin: string }
        Returns: {
          full_name: string
          level: string
          profile_id: string
          student_id: string
          user_id: string
        }[]
      }
      calculate_investment_profit: {
        Args: { investment_id: string }
        Returns: number
      }
      check_user_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      create_admin_user: {
        Args: { p_email: string; p_full_name: string; p_password: string }
        Returns: Json
      }
      generate_secure_pin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hash_pin: {
        Args: { pin_text: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_record_id?: string
          p_table_name?: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: "student" | "admin"
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
      user_role: ["student", "admin"],
    },
  },
} as const
