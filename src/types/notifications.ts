export interface MessageTemplate {
  id: string;
  salon_id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'telegram';
  trigger_event: string;
  subject?: string;
  content: string;
  variables?: string[];
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  salon_id: string;
  type: 'sms' | 'email' | 'whatsapp' | 'telegram';
  is_enabled: boolean;
  api_key?: string;
  api_settings?: Record<string, any>;
  daily_limit: number;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  salon_id: string;
  appointment_id?: string;
  client_id: string;
  template_id?: string;
  type: 'sms' | 'email' | 'whatsapp' | 'telegram';
  trigger_event: string;
  recipient: string;
  content: string;
  subject?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  provider_id?: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

// Extended types with joined relations
export interface ClientLoyaltyBalanceWithRelations {
  id: string;
  client_id: string;
  program_id: string;
  current_points: number;
  total_earned: number;
  total_redeemed: number;
  tier_level: string;
  tier_achieved_at: string;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  loyalty_programs?: {
    name: string;
    type: string;
  };
}

export interface LoyaltyTransactionWithRelations {
  id: string;
  client_id: string;
  program_id: string;
  order_id?: string;
  appointment_id?: string;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points_amount: number;
  description?: string;
  reference_id?: string;
  expires_at?: string;
  processed_by?: string;
  created_at: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  loyalty_programs?: {
    name: string;
  };
}

export interface PersonalOfferWithRelations {
  id: string;
  salon_id: string;
  client_id: string;
  offer_type: 'discount' | 'bonus_points' | 'free_service' | 'free_product';
  title: string;
  description?: string;
  discount_value?: number;
  bonus_points?: number;
  free_service_id?: string;
  free_product_id?: string;
  min_order_amount: number;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  is_used: boolean;
  valid_from: string;
  valid_until?: string;
  used_at?: string;
  used_in_order_id?: string;
  trigger_condition?: Record<string, any>;
  created_at: string;
  updated_at: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
}