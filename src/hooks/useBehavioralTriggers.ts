import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BehavioralTrigger {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  trigger_type: 'first_visit' | 'inactive_client' | 'birthday' | 'abandoned_booking' | 'post_service';
  conditions: Record<string, any>;
  delay_hours: number;
  template_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template?: {
    name: string;
    content: string;
  };
}

export function useBehavioralTriggers() {
  const [triggers, setTriggers] = useState<BehavioralTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from('behavioral_triggers')
        .select(`
          *,
          template:message_templates(name, content)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTriggers(data as BehavioralTrigger[] || []);
    } catch (error) {
      console.error('Error fetching behavioral triggers:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить поведенческие триггеры",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrigger = async (triggerData: any) => {
    try {
      const { data, error } = await supabase
        .from('behavioral_triggers')
        .insert(triggerData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Поведенческий триггер создан",
      });

      await fetchTriggers();
      return data;
    } catch (error) {
      console.error('Error creating trigger:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать триггер",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTrigger = async (id: string, updates: Partial<BehavioralTrigger>) => {
    try {
      const { error } = await supabase
        .from('behavioral_triggers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Триггер обновлен",
      });

      await fetchTriggers();
    } catch (error) {
      console.error('Error updating trigger:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить триггер",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTrigger = async (id: string) => {
    try {
      const { error } = await supabase
        .from('behavioral_triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Триггер удален",
      });

      await fetchTriggers();
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить триггер",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, []);

  return {
    triggers,
    loading,
    createTrigger,
    updateTrigger,
    deleteTrigger,
    refetch: fetchTriggers,
  };
}