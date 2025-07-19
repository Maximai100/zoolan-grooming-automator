import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MessageTemplate {
  id: string;
  salon_id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'telegram';
  trigger_event: 'appointment_confirmation' | 'reminder_24h' | 'reminder_2h' | 'follow_up' | 'birthday' | 'no_show';
  subject?: string;
  content: string;
  variables: string[];
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
  api_settings: any;
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
  type: 'sms' | 'email' | 'whatsapp' | 'telegram';
  trigger_event: string;
  template_id?: string;
  recipient: string;
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  provider_id?: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as MessageTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить шаблоны',
        variant: 'destructive'
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('type');

      if (error) throw error;
      setSettings((data || []) as NotificationSettings[]);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки',
        variant: 'destructive'
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить уведомления',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'salon_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get user's salon_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.salon_id) {
        throw new Error('Не удалось определить салон пользователя');
      }

      const { data, error } = await supabase
        .from('message_templates')
        .insert([{ ...templateData, salon_id: profile.salon_id }])
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data as MessageTemplate, ...prev]);
      toast({
        title: 'Успешно',
        description: 'Шаблон создан'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error adding template:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать шаблон',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(template => 
        template.id === id ? { ...template, ...(data as MessageTemplate) } : template
      ));

      toast({
        title: 'Успешно',
        description: 'Шаблон обновлен'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить шаблон',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updateSettings = async (type: string, updates: Partial<NotificationSettings>) => {
    try {
      // Get user's salon_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.salon_id) {
        throw new Error('Не удалось определить салон пользователя');
      }

      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({ 
          ...updates, 
          salon_id: profile.salon_id,
          type 
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => {
        const index = prev.findIndex(s => s.type === type);
        if (index >= 0) {
          return prev.map(s => s.type === type ? { ...s, ...(data as NotificationSettings) } : s);
        } else {
          return [...prev, data as NotificationSettings];
        }
      });

      toast({
        title: 'Успешно',
        description: 'Настройки обновлены'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить настройки',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const sendTestNotification = async (type: string, recipient: string, content: string) => {
    try {
      // Get user's salon_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.salon_id) {
        throw new Error('Не удалось определить салон пользователя');
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          salon_id: profile.salon_id,
          client_id: profile.salon_id, // Используем salon_id как client_id для тестовых сообщений
          type,
          trigger_event: 'test',
          recipient,
          content,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => [data as Notification, ...prev]);
      toast({
        title: 'Успешно',
        description: 'Тестовое сообщение отправлено'
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить тестовое сообщение',
        variant: 'destructive'
      });
    }
  };

  // Переменные для шаблонов
  const getAvailableVariables = () => [
    '{{client_name}}',
    '{{pet_name}}',
    '{{service_name}}',
    '{{appointment_date}}',
    '{{appointment_time}}',
    '{{salon_name}}',
    '{{salon_address}}',
    '{{salon_phone}}',
    '{{price}}',
    '{{groomer_name}}'
  ];

  useEffect(() => {
    Promise.all([
      fetchTemplates(),
      fetchSettings(),
      fetchNotifications()
    ]);
  }, []);

  return {
    templates,
    settings,
    notifications,
    loading,
    addTemplate,
    updateTemplate,
    updateSettings,
    sendTestNotification,
    getAvailableVariables,
    refetch: () => Promise.all([fetchTemplates(), fetchSettings(), fetchNotifications()])
  };
};