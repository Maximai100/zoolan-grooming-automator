import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_clients?: number;
  max_appointments_per_month?: number;
  max_notifications_per_month?: number;
  max_staff_members?: number;
  max_locations: number;
  features: any;
  is_active: boolean;
  sort_order: number;
}

export interface SalonSubscription {
  id: string;
  salon_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at?: string;
  trial_ends_at?: string;
  auto_renew: boolean;
  payment_method?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionUsage {
  id: string;
  salon_id: string;
  period_start: string;
  period_end: string;
  clients_count: number;
  appointments_count: number;
  notifications_sent: number;
  storage_used_mb: number;
}

export const useSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SalonSubscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить тарифные планы",
        variant: "destructive",
      });
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('salon_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('salon_id', profile.salon_id)
        .maybeSingle();

      if (error) throw error;
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию о подписке",
        variant: "destructive",
      });
    }
  };

  const fetchUsage = async () => {
    if (!profile?.salon_id) return;

    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1); // Первый день текущего месяца

    try {
      const { data, error } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .eq('period_start', currentPeriodStart.toISOString().split('T')[0])
        .maybeSingle();

      if (error) throw error;
      setUsage(data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const checkLimit = async (limitType: string, currentCount: number = 1): Promise<boolean> => {
    if (!profile?.salon_id) return false;

    try {
      const { data, error } = await supabase.rpc('check_subscription_limit', {
        _salon_id: profile.salon_id,
        _limit_type: limitType,
        _current_count: currentCount
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking limit:', error);
      return false;
    }
  };

  const subscribeToPlan = async (planId: string, billingPeriod: 'monthly' | 'yearly') => {
    if (!profile?.salon_id) return;

    try {
      const expiresAt = new Date();
      if (billingPeriod === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('salon_subscriptions')
        .upsert({
          salon_id: profile.salon_id,
          plan_id: planId,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          auto_renew: true,
          payment_method: 'manual' // Пока что вручную
        });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Подписка успешно оформлена",
      });

      await fetchCurrentSubscription();
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось оформить подписку",
        variant: "destructive",
      });
    }
  };

  const cancelSubscription = async (reason?: string) => {
    if (!currentSubscription) return;

    try {
      const { error } = await supabase
        .from('salon_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          auto_renew: false
        })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      toast({
        title: "Подписка отменена",
        description: "Ваша подписка была успешно отменена",
      });

      await fetchCurrentSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить подписку",
        variant: "destructive",
      });
    }
  };

  const updateUsage = async (type: 'clients' | 'appointments' | 'notifications', count: number = 1) => {
    if (!profile?.salon_id) return;

    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1);
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    currentPeriodEnd.setDate(0); // Последний день месяца

    try {
      // Сначала получаем текущее использование
      const { data: currentUsage } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .eq('period_start', currentPeriodStart.toISOString().split('T')[0])
        .maybeSingle();

      const updateData: any = {
        salon_id: profile.salon_id,
        period_start: currentPeriodStart.toISOString().split('T')[0],
        period_end: currentPeriodEnd.toISOString().split('T')[0],
      };

      if (currentUsage) {
        // Обновляем существующую запись
        switch (type) {
          case 'clients':
            updateData.clients_count = currentUsage.clients_count + count;
            break;
          case 'appointments':
            updateData.appointments_count = currentUsage.appointments_count + count;
            break;
          case 'notifications':
            updateData.notifications_sent = currentUsage.notifications_sent + count;
            break;
        }

        const { error } = await supabase
          .from('subscription_usage')
          .update(updateData)
          .eq('id', currentUsage.id);

        if (error) throw error;
      } else {
        // Создаем новую запись
        updateData[`${type === 'clients' ? 'clients_count' : type === 'appointments' ? 'appointments_count' : 'notifications_sent'}`] = count;
        
        const { error } = await supabase
          .from('subscription_usage')
          .insert(updateData);

        if (error) throw error;
      }

      await fetchUsage();
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPlans(),
        fetchCurrentSubscription(),
        fetchUsage()
      ]);
      setLoading(false);
    };

    if (profile?.salon_id) {
      fetchData();
    }
  }, [profile?.salon_id]);

  return {
    plans,
    currentSubscription,
    usage,
    loading,
    checkLimit,
    subscribeToPlan,
    cancelSubscription,
    updateUsage,
    refetch: () => {
      fetchCurrentSubscription();
      fetchUsage();
    }
  };
};