export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ab_tests: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          results: Json | null
          salon_id: string
          start_date: string | null
          status: string
          success_metric: string | null
          template_a_id: string
          template_b_id: string
          traffic_split: number | null
          trigger_event: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          results?: Json | null
          salon_id: string
          start_date?: string | null
          status?: string
          success_metric?: string | null
          template_a_id: string
          template_b_id: string
          traffic_split?: number | null
          trigger_event: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          results?: Json | null
          salon_id?: string
          start_date?: string | null
          status?: string
          success_metric?: string | null
          template_a_id?: string
          template_b_id?: string
          traffic_split?: number | null
          trigger_event?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_template_a_id_fkey"
            columns: ["template_a_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_template_b_id_fkey"
            columns: ["template_b_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_cache: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          metric_type: string
          period_end: string
          period_start: string
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          metric_type: string
          period_end: string
          period_start: string
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          metric_type?: string
          period_end?: string
          period_start?: string
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_id: string
          created_at: string | null
          deposit_amount: number | null
          duration_minutes: number
          groomer_id: string | null
          id: string
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pet_id: string
          price: number
          reminder_sent: boolean | null
          salon_id: string
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          deposit_amount?: number | null
          duration_minutes: number
          groomer_id?: string | null
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pet_id: string
          price: number
          reminder_sent?: boolean | null
          salon_id: string
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          deposit_amount?: number | null
          duration_minutes?: number
          groomer_id?: string | null
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pet_id?: string
          price?: number
          reminder_sent?: boolean | null
          salon_id?: string
          scheduled_date?: string
          scheduled_time?: string
          service_id?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_groomer_id_fkey"
            columns: ["groomer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_interactions: {
        Row: {
          campaign_id: string
          client_id: string
          created_at: string | null
          id: string
          interaction_data: Json | null
          interaction_type: string
        }
        Insert: {
          campaign_id: string
          client_id: string
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: string
        }
        Update: {
          campaign_id?: string
          client_id?: string
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          click_count: number | null
          created_at: string | null
          delivered_count: number | null
          description: string | null
          failed_count: number | null
          id: string
          name: string
          open_count: number | null
          salon_id: string
          scheduled_at: string | null
          sent_count: number | null
          status: string
          target_audience: Json
          template_id: string
          total_cost: number | null
          total_recipients: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name: string
          open_count?: number | null
          salon_id: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience: Json
          template_id: string
          total_cost?: number | null
          total_recipients?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name?: string
          open_count?: number | null
          salon_id?: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience?: Json
          template_id?: string
          total_cost?: number | null
          total_recipients?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          card_sales: number | null
          cash_sales: number | null
          closed_at: string | null
          closing_amount: number | null
          created_at: string | null
          expected_amount: number | null
          id: string
          notes: string | null
          opened_at: string | null
          opening_amount: number | null
          salon_id: string
          staff_id: string
          status: string | null
          tips_collected: number | null
        }
        Insert: {
          card_sales?: number | null
          cash_sales?: number | null
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string | null
          expected_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opening_amount?: number | null
          salon_id: string
          staff_id: string
          status?: string | null
          tips_collected?: number | null
        }
        Update: {
          card_sales?: number | null
          cash_sales?: number | null
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string | null
          expected_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opening_amount?: number | null
          salon_id?: string
          staff_id?: string
          status?: string | null
          tips_collected?: number | null
        }
        Relationships: []
      }
      client_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          appointment_id: string | null
          campaign_id: string | null
          client_id: string
          created_at: string | null
          id: string
          order_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          appointment_id?: string | null
          campaign_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          order_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          appointment_id?: string | null
          campaign_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          order_id?: string | null
        }
        Relationships: []
      }
      client_loyalty_balances: {
        Row: {
          client_id: string
          created_at: string | null
          current_points: number | null
          id: string
          last_activity_date: string | null
          program_id: string
          tier_achieved_at: string | null
          tier_level: string | null
          total_earned: number | null
          total_redeemed: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          current_points?: number | null
          id?: string
          last_activity_date?: string | null
          program_id: string
          tier_achieved_at?: string | null
          tier_level?: string | null
          total_earned?: number | null
          total_redeemed?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          current_points?: number | null
          id?: string
          last_activity_date?: string | null
          program_id?: string
          tier_achieved_at?: string | null
          tier_level?: string | null
          total_earned?: number | null
          total_redeemed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_memberships: {
        Row: {
          activation_date: string | null
          client_id: string
          created_at: string | null
          expiry_date: string | null
          id: string
          membership_id: string
          purchase_date: string | null
          purchase_price: number
          status: string | null
          updated_at: string | null
          visits_remaining: number | null
        }
        Insert: {
          activation_date?: string | null
          client_id: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          membership_id: string
          purchase_date?: string | null
          purchase_price: number
          status?: string | null
          updated_at?: string | null
          visits_remaining?: number | null
        }
        Update: {
          activation_date?: string | null
          client_id?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          membership_id?: string
          purchase_date?: string | null
          purchase_price?: number
          status?: string | null
          updated_at?: string | null
          visits_remaining?: number | null
        }
        Relationships: []
      }
      client_segment_memberships: {
        Row: {
          added_at: string | null
          client_id: string
          id: string
          last_qualified: string | null
          segment_id: string
        }
        Insert: {
          added_at?: string | null
          client_id: string
          id?: string
          last_qualified?: string | null
          segment_id: string
        }
        Update: {
          added_at?: string | null
          client_id?: string
          id?: string
          last_qualified?: string | null
          segment_id?: string
        }
        Relationships: []
      }
      client_segments: {
        Row: {
          client_count: number | null
          conditions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          name: string
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          client_count?: number | null
          conditions: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          name: string
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          client_count?: number | null
          conditions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          name?: string
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_vip: boolean | null
          last_name: string
          last_visit_date: string | null
          notes: string | null
          phone: string
          salon_id: string
          tags: string[] | null
          total_spent: number | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_vip?: boolean | null
          last_name: string
          last_visit_date?: string | null
          notes?: string | null
          phone: string
          salon_id: string
          tags?: string[] | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_vip?: boolean | null
          last_name?: string
          last_visit_date?: string | null
          notes?: string | null
          phone?: string
          salon_id?: string
          tags?: string[] | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applicable_products: string[] | null
          applicable_services: string[] | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          name: string
          per_client_limit: number | null
          salon_id: string
          type: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          applicable_products?: string[] | null
          applicable_services?: string[] | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name: string
          per_client_limit?: number | null
          salon_id: string
          type: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          applicable_products?: string[] | null
          applicable_services?: string[] | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name?: string
          per_client_limit?: number | null
          salon_id?: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          created_at: string | null
          data: Json
          file_url: string | null
          format: string | null
          generated_by: string | null
          id: string
          name: string
          period_end: string
          period_start: string
          report_type: string
          salon_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          file_url?: string | null
          format?: string | null
          generated_by?: string | null
          id?: string
          name: string
          period_end: string
          period_start: string
          report_type: string
          salon_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          file_url?: string | null
          format?: string | null
          generated_by?: string | null
          id?: string
          name?: string
          period_end?: string
          period_start?: string
          report_type?: string
          salon_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_metrics: {
        Row: {
          calculated_at: string | null
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number | null
          period_end: string
          period_start: string
          salon_id: string
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number | null
          period_end: string
          period_start: string
          salon_id: string
        }
        Update: {
          calculated_at?: string | null
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number | null
          period_end?: string
          period_start?: string
          salon_id?: string
        }
        Relationships: []
      }
      loyalty_programs: {
        Row: {
          bonus_multiplier: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          min_redemption_points: number | null
          name: string
          point_value: number | null
          points_per_ruble: number | null
          points_per_visit: number | null
          salon_id: string
          start_date: string | null
          terms_and_conditions: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          bonus_multiplier?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          min_redemption_points?: number | null
          name: string
          point_value?: number | null
          points_per_ruble?: number | null
          points_per_visit?: number | null
          salon_id: string
          start_date?: string | null
          terms_and_conditions?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          bonus_multiplier?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          min_redemption_points?: number | null
          name?: string
          point_value?: number | null
          points_per_ruble?: number | null
          points_per_visit?: number | null
          salon_id?: string
          start_date?: string | null
          terms_and_conditions?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          appointment_id: string | null
          client_id: string
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          points_amount: number
          processed_by: string | null
          program_id: string
          reference_id: string | null
          transaction_type: string
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_amount: number
          processed_by?: string | null
          program_id: string
          reference_id?: string | null
          transaction_type: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_amount?: number
          processed_by?: string | null
          program_id?: string
          reference_id?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          applicable_services: string[] | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          salon_id: string
          type: string
          updated_at: string | null
          validity_days: number | null
          visits_included: number | null
        }
        Insert: {
          applicable_services?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          salon_id: string
          type: string
          updated_at?: string | null
          validity_days?: number | null
          visits_included?: number | null
        }
        Update: {
          applicable_services?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          salon_id?: string
          type?: string
          updated_at?: string | null
          validity_days?: number | null
          visits_included?: number | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          salon_id: string
          subject: string | null
          trigger_event: string
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          salon_id: string
          subject?: string | null
          trigger_event: string
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          salon_id?: string
          subject?: string | null
          trigger_event?: string
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          api_key: string | null
          api_settings: Json | null
          created_at: string | null
          daily_limit: number | null
          id: string
          is_enabled: boolean | null
          monthly_limit: number | null
          salon_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          api_settings?: Json | null
          created_at?: string | null
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          monthly_limit?: number | null
          salon_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          api_settings?: Json | null
          created_at?: string | null
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          monthly_limit?: number | null
          salon_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          appointment_id: string | null
          client_id: string
          content: string
          cost: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          provider_id: string | null
          read_at: string | null
          recipient: string
          salon_id: string
          sent_at: string | null
          status: string
          subject: string | null
          template_id: string | null
          trigger_event: string
          type: string
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          content: string
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          provider_id?: string | null
          read_at?: string | null
          recipient: string
          salon_id: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          trigger_event: string
          type: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          content?: string
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          provider_id?: string | null
          read_at?: string | null
          recipient?: string
          salon_id?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          trigger_event?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          id: string
          item_type: string
          order_id: string
          product_id: string | null
          quantity: number
          service_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          item_type: string
          order_id: string
          product_id?: string | null
          quantity?: number
          service_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          item_type?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          service_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          created_at: string | null
          discount_amount: number | null
          discount_code_id: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          salon_id: string
          staff_id: string | null
          subtotal: number
          tax_amount: number | null
          tip_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code_id?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          salon_id: string
          staff_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          tip_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          salon_id?: string
          staff_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          tip_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string
          order_id: string
          processed_at: string | null
          provider: string | null
          provider_transaction_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: string
          order_id: string
          processed_at?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          order_id?: string
          processed_at?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      personal_offers: {
        Row: {
          bonus_points: number | null
          client_id: string
          created_at: string | null
          description: string | null
          discount_value: number | null
          free_product_id: string | null
          free_service_id: string | null
          id: string
          is_active: boolean | null
          is_used: boolean | null
          min_order_amount: number | null
          offer_type: string
          salon_id: string
          title: string
          trigger_condition: Json | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          used_at: string | null
          used_in_order_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          bonus_points?: number | null
          client_id: string
          created_at?: string | null
          description?: string | null
          discount_value?: number | null
          free_product_id?: string | null
          free_service_id?: string | null
          id?: string
          is_active?: boolean | null
          is_used?: boolean | null
          min_order_amount?: number | null
          offer_type: string
          salon_id: string
          title: string
          trigger_condition?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          used_at?: string | null
          used_in_order_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          bonus_points?: number | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          discount_value?: number | null
          free_product_id?: string | null
          free_service_id?: string | null
          id?: string
          is_active?: boolean | null
          is_used?: boolean | null
          min_order_amount?: number | null
          offer_type?: string
          salon_id?: string
          title?: string
          trigger_condition?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          used_at?: string | null
          used_in_order_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      pets: {
        Row: {
          age: number | null
          allergies: string | null
          breed: string | null
          client_id: string
          coat_type: string | null
          color: string | null
          created_at: string | null
          gender: string | null
          id: string
          microchip_number: string | null
          name: string
          photo_url: string | null
          special_notes: string | null
          updated_at: string | null
          vaccination_status: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          breed?: string | null
          client_id: string
          coat_type?: string | null
          color?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          microchip_number?: string | null
          name: string
          photo_url?: string | null
          special_notes?: string | null
          updated_at?: string | null
          vaccination_status?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          breed?: string | null
          client_id?: string
          coat_type?: string | null
          color?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          microchip_number?: string | null
          name?: string
          photo_url?: string | null
          special_notes?: string | null
          updated_at?: string | null
          vaccination_status?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_stock_level: number | null
          name: string
          price: number
          salon_id: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock_level?: number | null
          name: string
          price: number
          salon_id: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock_level?: number | null
          name?: string
          price?: number
          salon_id?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          salon_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          salon_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          salon_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_salon"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string
          payment_id: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          fields: Json
          filters: Json | null
          id: string
          is_active: boolean | null
          name: string
          report_type: string
          salon_id: string
          schedule: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          report_type: string
          salon_id: string
          schedule?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          report_type?: string
          salon_id?: string
          schedule?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_forecasts: {
        Row: {
          accuracy_score: number | null
          actual_revenue: number | null
          based_on_data: Json | null
          confidence_level: number | null
          created_at: string | null
          forecast_period: string
          id: string
          period_end: string
          period_start: string
          predicted_revenue: number
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          accuracy_score?: number | null
          actual_revenue?: number | null
          based_on_data?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          forecast_period: string
          id?: string
          period_end: string
          period_start: string
          predicted_revenue?: number
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number | null
          actual_revenue?: number | null
          based_on_data?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          forecast_period?: string
          id?: string
          period_end?: string
          period_start?: string
          predicted_revenue?: number
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      salons: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      social_integrations: {
        Row: {
          access_token: string | null
          account_id: string
          account_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          platform: string
          refresh_token: string | null
          salon_id: string
          settings: Json | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          account_id: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          platform: string
          refresh_token?: string | null
          salon_id: string
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          account_id?: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          platform?: string
          refresh_token?: string | null
          salon_id?: string
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          content: string
          created_at: string | null
          engagement_stats: Json | null
          external_post_id: string | null
          hashtags: string[] | null
          id: string
          integration_id: string
          media_urls: string[] | null
          post_type: string
          posted_at: string | null
          salon_id: string
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          content: string
          created_at?: string | null
          engagement_stats?: Json | null
          external_post_id?: string | null
          hashtags?: string[] | null
          id?: string
          integration_id: string
          media_urls?: string[] | null
          post_type: string
          posted_at?: string | null
          salon_id: string
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          content?: string
          created_at?: string | null
          engagement_stats?: Json | null
          external_post_id?: string | null
          hashtags?: string[] | null
          id?: string
          integration_id?: string
          media_urls?: string[] | null
          post_type?: string
          posted_at?: string | null
          salon_id?: string
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_salon_kpi: {
        Args: { salon_uuid: string; start_date: string; end_date: string }
        Returns: Json
      }
      generate_revenue_forecast: {
        Args: { salon_uuid: string; forecast_days?: number }
        Returns: Json
      }
      send_automatic_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_client_segments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      user_role: "owner" | "manager" | "groomer" | "receptionist"
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
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      payment_status: ["pending", "paid", "refunded", "failed"],
      user_role: ["owner", "manager", "groomer", "receptionist"],
    },
  },
} as const
