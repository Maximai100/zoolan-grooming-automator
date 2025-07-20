import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
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
        .from('services')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить услуги',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = async (serviceData: Omit<Service, 'id' | 'salon_id' | 'created_at' | 'updated_at'>) => {
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
        .from('services')
        .insert([{ ...serviceData, salon_id: profile.salon_id }])
        .select()
        .single();

      if (error) throw error;
      
      setServices(prev => [...prev, data]);
      toast({
        title: 'Успешно',
        description: 'Услуга добавлена'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить услугу',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => prev.map(service => 
        service.id === id ? { ...service, ...data } : service
      ));

      toast({
        title: 'Успешно',
        description: 'Услуга обновлена'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить услугу',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== id));
      toast({
        title: 'Успешно',
        description: 'Услуга удалена'
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить услугу',
        variant: 'destructive'
      });
      return { error };
    }
  };

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    refetch: fetchServices
  };
};