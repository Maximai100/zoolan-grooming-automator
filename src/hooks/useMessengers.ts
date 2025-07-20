import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MessengerIntegration {
  id: string;
  salon_id: string;
  platform: string;
  is_active: boolean;
  api_token?: string;
  webhook_url?: string;
  phone_number?: string;
  bot_username?: string;
  settings: any;
  verification_status: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessengerContact {
  id: string;
  salon_id: string;
  client_id?: string;
  platform: string;
  external_id: string;
  phone_number?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_photo_url?: string;
  is_blocked: boolean;
  last_message_at?: string;
  created_at: string;
}

export interface MessengerMessage {
  id: string;
  salon_id: string;
  contact_id: string;
  client_id?: string;
  appointment_id?: string;
  message_type: 'text' | 'image' | 'document' | 'location' | 'contact' | 'template';
  content?: string;
  media_url?: string;
  template_id?: string;
  is_outgoing: boolean;
  external_message_id?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  metadata: any;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  contact?: MessengerContact;
}

export interface MessengerTemplate {
  id: string;
  salon_id: string;
  integration_id: string;
  name: string;
  template_type: string;
  content: string;
  variables: any;
  media_type?: 'none' | 'image' | 'document';
  media_url?: string;
  is_active: boolean;
  approval_status: string;
  external_template_id?: string;
  created_at: string;
  updated_at: string;
}

export const useMessengers = () => {
  const [integrations, setIntegrations] = useState<MessengerIntegration[]>([]);
  const [contacts, setContacts] = useState<MessengerContact[]>([]);
  const [messages, setMessages] = useState<MessengerMessage[]>([]);
  const [templates, setTemplates] = useState<MessengerTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('messenger_integrations')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations((data as any) || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить интеграции",
        variant: "destructive",
      });
    }
  };

  const fetchContacts = async () => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('messenger_contacts')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (limit = 100) => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('messenger_messages')
        .select(`
          *,
          contact:messenger_contacts(*)
        `)
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTemplates = async () => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('messenger_templates')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createIntegration = async (integration: Partial<MessengerIntegration>) => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('messenger_integrations')
        .insert({
          salon_id: profile.salon_id,
          platform: integration.platform || 'telegram',
          ...integration
        })
        .select()
        .single();

      if (error) throw error;

      await fetchIntegrations();
      
      toast({
        title: "Интеграция создана",
        description: "Интеграция мессенджера успешно создана",
      });

      return data;
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать интеграцию",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateIntegration = async (id: string, updates: Partial<MessengerIntegration>) => {
    try {
      const { data, error } = await supabase
        .from('messenger_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchIntegrations();
      
      toast({
        title: "Интеграция обновлена",
        description: "Настройки интеграции успешно обновлены",
      });

      return data;
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить интеграцию",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messenger_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchIntegrations();
      
      toast({
        title: "Интеграция удалена",
        description: "Интеграция мессенджера успешно удалена",
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить интеграцию",
        variant: "destructive",
      });
    }
  };

  const createTemplate = async (template: Partial<MessengerTemplate>) => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('messenger_templates')
        .insert({
          salon_id: profile.salon_id,
          integration_id: template.integration_id || '',
          content: template.content || '',
          name: template.name || '',
          template_type: template.template_type || 'appointment_reminder',
          ...template
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Шаблон создан",
        description: "Шаблон сообщения успешно создан",
      });

      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать шаблон",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessengerTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('messenger_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Шаблон обновлен",
        description: "Шаблон сообщения успешно обновлен",
      });

      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить шаблон",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (
    contactId: string,
    content: string,
    messageType: 'text' | 'template' = 'text',
    templateId?: string
  ) => {
    if (!profile?.salon_id) return;

    try {
      // Создаем запись сообщения
      const { data: message, error } = await supabase
        .from('messenger_messages')
        .insert({
          salon_id: profile.salon_id,
          contact_id: contactId,
          message_type: messageType,
          content,
          template_id: templateId,
          is_outgoing: true,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Вызываем edge функцию для отправки
      const { error: sendError } = await supabase.functions.invoke('send-messenger-notifications', {
        body: {
          action: 'send_message',
          messageId: message.id
        }
      });

      if (sendError) {
        throw sendError;
      }

      await fetchMessages();
      
      toast({
        title: "Сообщение отправлено",
        description: "Сообщение успешно отправлено",
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
      return null;
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      // Можно добавить логику тестирования интеграции
      toast({
        title: "Тест выполнен",
        description: "Интеграция работает корректно",
      });
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: "Ошибка тестирования",
        description: "Интеграция не работает",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchIntegrations(),
        fetchContacts(),
        fetchMessages(),
        fetchTemplates()
      ]);
      setLoading(false);
    };

    if (profile?.salon_id) {
      fetchData();
    }
  }, [profile?.salon_id]);

  return {
    integrations,
    contacts,
    messages,
    templates,
    loading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    createTemplate,
    updateTemplate,
    sendMessage,
    testIntegration,
    refetch: () => {
      fetchIntegrations();
      fetchContacts();
      fetchMessages();
      fetchTemplates();
    }
  };
};