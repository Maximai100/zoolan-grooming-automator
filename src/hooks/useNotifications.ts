
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки уведомлений:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить уведомления',
        variant: 'destructive'
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки шаблонов:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*');

      if (error) throw error;
      
      // Создаем настройки по умолчанию, если их нет
      const defaultSettings = ['sms', 'email', 'whatsapp', 'telegram'];
      const existingTypes = (data || []).map(s => s.type);
      const missingTypes = defaultSettings.filter(type => !existingTypes.includes(type));
      
      if (missingTypes.length > 0) {
        // Get user's salon_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('salon_id')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (!profile?.salon_id) return;

        const newSettings = missingTypes.map(type => ({
          type,
          salon_id: profile.salon_id,
          is_enabled: false,
          daily_limit: 1000,
          monthly_limit: 30000
        }));
        
        const { data: created } = await supabase
          .from('notification_settings')
          .insert(newSettings)
          .select();
        
        setSettings([...(data || []), ...(created || [])]);
      } else {
        setSettings(data || []);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const addTemplate = async (templateData: any) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTemplates();
      return data;
    } catch (error: any) {
      console.error('Ошибка создания шаблона:', error);
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTemplates();
      return data;
    } catch (error: any) {
      console.error('Ошибка обновления шаблона:', error);
      throw error;
    }
  };

  const updateSettings = async (type: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('type', type)
        .select()
        .single();

      if (error) throw error;
      
      await fetchSettings();
      return data;
    } catch (error: any) {
      console.error('Ошибка обновления настроек:', error);
      throw error;
    }
  };

  const sendTestNotification = async (type: string, recipient: string, content: string, subject?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type,
          recipient,
          content,
          subject,
          trigger_event: 'test'
        }
      });

      if (error) throw error;

      await fetchNotifications();
      
      toast({
        title: 'Успешно',
        description: 'Тестовое уведомление отправлено',
      });

      return data;
    } catch (error: any) {
      console.error('Ошибка отправки уведомления:', error);
      throw new Error(error.message || 'Ошибка отправки уведомления');
    }
  };

  const sendNotificationFromTemplate = async (templateId: string, recipient: string, variables: any = {}) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Шаблон не найден');
      }

      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: template.type,
          recipient,
          content: template.content,
          subject: template.subject,
          template_id: templateId,
          trigger_event: template.trigger_event
        }
      });

      if (error) throw error;

      await fetchNotifications();
      
      toast({
        title: 'Успешно',
        description: 'Уведомление отправлено',
      });

      return data;
    } catch (error: any) {
      console.error('Ошибка отправки уведомления по шаблону:', error);
      throw new Error(error.message || 'Ошибка отправки уведомления');
    }
  };

  const processAutomaticReminders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-automatic-reminders');

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: `Обработано напоминаний: ${data.processed}`,
      });

      await fetchNotifications();
      return data;
    } catch (error: any) {
      console.error('Ошибка обработки автоматических напоминаний:', error);
      throw new Error(error.message || 'Ошибка обработки напоминаний');
    }
  };

  const getAvailableVariables = () => {
    return [
      '{{client_name}}',
      '{{pet_name}}',
      '{{service_name}}',
      '{{appointment_time}}',
      '{{appointment_date}}',
      '{{salon_name}}',
      '{{salon_address}}',
      '{{salon_phone}}'
    ];
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([
      fetchNotifications(),
      fetchTemplates(),
      fetchSettings()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    notifications,
    templates,
    settings,
    loading,
    addTemplate,
    updateTemplate,
    updateSettings,
    sendTestNotification,
    sendNotificationFromTemplate,
    processAutomaticReminders,
    getAvailableVariables,
    refetch
  };
};
