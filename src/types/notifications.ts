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