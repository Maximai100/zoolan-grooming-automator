import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Waitlist {
  id: string;
  salon_id: string;
  client_id: string;
  pet_id?: string;
  service_id: string;
  preferred_date?: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  notes?: string;
  priority: number;
  status: 'active' | 'notified' | 'booked' | 'cancelled';
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  pet?: {
    name: string;
  };
  service?: {
    name: string;
  };
}

export function useWaitlists() {
  const [waitlists, setWaitlists] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWaitlists = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlists')
        .select(`
          *,
          client:clients(first_name, last_name, phone),
          pet:pets(name),
          service:services(name)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWaitlists(data as Waitlist[] || []);
    } catch (error) {
      console.error('Error fetching waitlists:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить листы ожидания",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWaitlist = async (waitlistData: any) => {
    try {
      const { data, error } = await supabase
        .from('waitlists')
        .insert(waitlistData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Клиент добавлен в лист ожидания",
      });

      await fetchWaitlists();
      return data;
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить в лист ожидания",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateWaitlistStatus = async (id: string, status: Waitlist['status']) => {
    try {
      const { error } = await supabase
        .from('waitlists')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Статус обновлен",
      });

      await fetchWaitlists();
    } catch (error) {
      console.error('Error updating waitlist status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeFromWaitlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('waitlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Удалено из листа ожидания",
      });

      await fetchWaitlists();
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить из листа ожидания",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWaitlists();
  }, []);

  return {
    waitlists,
    loading,
    addToWaitlist,
    updateWaitlistStatus,
    removeFromWaitlist,
    refetch: fetchWaitlists,
  };
}