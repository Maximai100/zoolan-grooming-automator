import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  pet_id: string;
  service_id: string;
  groomer_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  price: number;
  deposit_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  clients?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  pets?: {
    name: string;
    breed?: string;
  };
  services?: {
    name: string;
    category?: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
  // Legacy compatibility
  client?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  pet?: {
    name: string;
    breed?: string;
  };
  service?: {
    name: string;
    category?: string;
  };
  groomer?: {
    first_name: string;
    last_name: string;
  };
}

export const useAppointments = (date?: Date) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
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

      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients!inner(first_name, last_name, phone),
          pets!inner(name, breed),
          services!inner(name, category),
          profiles(first_name, last_name)
        `)
        .eq('salon_id', profile.salon_id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query = query.eq('scheduled_date', dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить записи',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'salon_id' | 'created_at' | 'updated_at' | 'clients' | 'pets' | 'services' | 'profiles' | 'client' | 'pet' | 'service' | 'groomer'>) => {
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
        .from('appointments')
        .insert([{ ...appointmentData, salon_id: profile.salon_id }])
        .select(`
          *,
          clients!inner(first_name, last_name, phone),
          pets!inner(name, breed),
          services!inner(name, category),
          profiles(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      
      setAppointments(prev => [...prev, data]);
      toast({
        title: 'Успешно',
        description: 'Запись создана'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать запись',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          clients!inner(first_name, last_name, phone),
          pets!inner(name, breed),
          services!inner(name, category),
          profiles(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => prev.map(appointment => 
        appointment.id === id ? { ...appointment, ...data } : appointment
      ));

      toast({
        title: 'Успешно',
        description: 'Запись обновлена'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить запись',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      toast({
        title: 'Успешно',
        description: 'Запись удалена'
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись',
        variant: 'destructive'
      });
    }
  };

  // AI оптимизация слотов
  const findOptimalSlot = (date: Date, duration: number, groomerId?: string) => {
    const workingHours = { start: 9, end: 18 }; // 9:00 - 18:00
    const slotInterval = 30; // 30 минут
    const dayAppointments = appointments.filter(apt => 
      apt.scheduled_date === date.toISOString().split('T')[0] &&
      (!groomerId || apt.groomer_id === groomerId)
    );

    const occupiedSlots = dayAppointments.map(apt => ({
      start: new Date(`${apt.scheduled_date}T${apt.scheduled_time}`).getHours() * 60 + 
             new Date(`${apt.scheduled_date}T${apt.scheduled_time}`).getMinutes(),
      end: new Date(`${apt.scheduled_date}T${apt.scheduled_time}`).getHours() * 60 + 
           new Date(`${apt.scheduled_date}T${apt.scheduled_time}`).getMinutes() + apt.duration_minutes
    }));

    // Поиск свободного слота
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotStart = hour * 60 + minute;
        const slotEnd = slotStart + duration;
        
        // Проверка, что слот не выходит за рабочее время
        if (slotEnd > workingHours.end * 60) continue;
        
        // Проверка пересечений с существующими записями
        const hasConflict = occupiedSlots.some(occupied => 
          (slotStart < occupied.end && slotEnd > occupied.start)
        );
        
        if (!hasConflict) {
          return {
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            available: true
          };
        }
      }
    }
    
    return { time: null, available: false };
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    findOptimalSlot,
    refetch: fetchAppointments
  };
};