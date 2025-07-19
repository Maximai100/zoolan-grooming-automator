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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      send_automatic_reminders: {
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
