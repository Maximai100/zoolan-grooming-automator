import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';

export const useStaff = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<any>(null);

  // Получаем профиль пользователя для получения salon_id
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('salon_id, role')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
    };

    fetchProfile();
  }, [user?.id]);

  // Получение всех сотрудников салона
  const getStaff = useQuery({
    queryKey: ['staff', profile?.salon_id],
    queryFn: async () => {
      if (!profile?.salon_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.salon_id,
    staleTime: 5 * 60 * 1000,
  });

  // Получение смен
  const getShifts = useQuery({
    queryKey: ['shifts', profile?.salon_id],
    queryFn: async () => {
      if (!profile?.salon_id) return [];

      const { data, error } = await supabase
        .from('staff_shifts')
        .select(`
          *,
          profiles!inner(first_name, last_name, role)
        `)
        .eq('salon_id', profile.salon_id)
        .gte('shift_date', new Date().toISOString().split('T')[0])
        .order('shift_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.salon_id,
    staleTime: 2 * 60 * 1000,
  });

  // Получение задач
  const getTasks = useQuery({
    queryKey: ['staff-tasks', profile?.salon_id],
    queryFn: async () => {
      if (!profile?.salon_id) return [];

      const { data, error } = await supabase
        .from('staff_tasks')
        .select(`
          *,
          assigned_profiles:profiles!staff_tasks_assigned_to_fkey(first_name, last_name),
          created_profiles:profiles!staff_tasks_created_by_fkey(first_name, last_name)
        `)
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.salon_id,
    staleTime: 1 * 60 * 1000,
  });

  // Получение сообщений
  const getMessages = useQuery({
    queryKey: ['staff-messages', profile?.salon_id],
    queryFn: async () => {
      if (!profile?.salon_id) return [];

      const { data, error } = await supabase
        .from('staff_messages')
        .select(`
          *,
          sender_profiles:profiles!staff_messages_sender_id_fkey(first_name, last_name),
          recipient_profiles:profiles!staff_messages_recipient_id_fkey(first_name, last_name)
        `)
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.salon_id,
    staleTime: 30 * 1000, // 30 секунд для чата
  });

  // Добавление смены
  const addShift = useMutation({
    mutationFn: async (shiftData: any) => {
      if (!profile?.salon_id) throw new Error('Salon ID not found');

      const { data, error } = await supabase
        .from('staff_shifts')
        .insert({
          ...shiftData,
          salon_id: profile.salon_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  // Добавление задачи
  const addTask = useMutation({
    mutationFn: async (taskData: any) => {
      if (!profile?.salon_id) throw new Error('Salon ID not found');

      const { data, error } = await supabase
        .from('staff_tasks')
        .insert({
          ...taskData,
          salon_id: profile.salon_id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tasks'] });
    },
  });

  // Обновление задачи
  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('staff_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tasks'] });
    },
  });

  // Отправка сообщения
  const sendMessage = useMutation({
    mutationFn: async (messageData: any) => {
      if (!profile?.salon_id) throw new Error('Salon ID not found');

      const { data, error } = await supabase
        .from('staff_messages')
        .insert({
          ...messageData,
          salon_id: profile.salon_id,
          sender_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-messages'] });
    },
  });

  // Отметка времени (часы работы)
  const clockIn = useMutation({
    mutationFn: async (shiftId?: string) => {
      if (!profile?.salon_id) throw new Error('Salon ID not found');

      const { data, error } = await supabase
        .from('time_tracking')
        .insert({
          salon_id: profile.salon_id,
          staff_id: user?.id,
          shift_id: shiftId,
          clock_in: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-tracking'] });
    },
  });

  const clockOut = useMutation({
    mutationFn: async (trackingId: string) => {
      const clockOutTime = new Date();
      
      // Получаем время начала для расчёта общего времени
      const { data: tracking, error: fetchError } = await supabase
        .from('time_tracking')
        .select('clock_in')
        .eq('id', trackingId)
        .single();

      if (fetchError) throw fetchError;

      const clockInTime = new Date(tracking.clock_in);
      const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      const { data, error } = await supabase
        .from('time_tracking')
        .update({
          clock_out: clockOutTime.toISOString(),
          total_hours: Math.round(totalHours * 100) / 100, // Округляем до 2 знаков
        })
        .eq('id', trackingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-tracking'] });
    },
  });

  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: ['staff'] });
    queryClient.invalidateQueries({ queryKey: ['shifts'] });
    queryClient.invalidateQueries({ queryKey: ['staff-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['staff-messages'] });
  };

  return {
    // Данные
    staff: getStaff.data || [],
    shifts: getShifts.data || [],
    tasks: getTasks.data || [],
    messages: getMessages.data || [],
    
    // Статусы загрузки
    isLoadingStaff: getStaff.isLoading,
    isLoadingShifts: getShifts.isLoading,
    isLoadingTasks: getTasks.isLoading,
    isLoadingMessages: getMessages.isLoading,
    
    // Мутации
    addShift,
    addTask,
    updateTask,
    sendMessage,
    clockIn,
    clockOut,
    
    // Утилиты
    refreshAllData,
    profile,
  };
};