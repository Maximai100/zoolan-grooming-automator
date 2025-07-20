import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SuperAdminMetrics {
  totalSalons: number;
  activeSalons: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  totalUsers: number;
}

interface SalonData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  owner_name: string;
  subscription_status: string;
  subscription_plan: string;
  total_revenue: number;
  last_activity: string;
}

interface SubscriptionData {
  id: string;
  salon_name: string;
  plan_name: string;
  status: string;
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  price: number;
}

export function useSuperAdmin() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<SuperAdminMetrics | null>(null);
  const [salons, setSalons] = useState<SalonData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchSuperAdminData();
    }
  }, [user, isSuperAdmin]);

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем метрики
      const [
        salonsResult,
        subscriptionsResult,
        usersResult,
        revenueResult
      ] = await Promise.all([
        supabase.from('salons').select('*'),
        supabase.from('salon_subscriptions').select(`
          *,
          subscription_plans(name, price),
          salons(name)
        `),
        supabase.from('profiles').select('id, role, created_at'),
        supabase.from('orders').select('total_amount, created_at').eq('payment_status', 'paid')
      ]);

      if (salonsResult.error) throw salonsResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;
      if (usersResult.error) throw usersResult.error;
      if (revenueResult.error) throw revenueResult.error;

      const salonsData = salonsResult.data || [];
      const subscriptionsData = subscriptionsResult.data || [];
      const usersData = usersResult.data || [];
      const revenueData = revenueResult.data || [];

      // Вычисляем метрики
      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const totalRevenue = revenueData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const monthlyRevenue = revenueData
        .filter(order => new Date(order.created_at) >= currentMonth)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      const activeSubscriptions = subscriptionsData.filter(sub => sub.status === 'active').length;
      const trialSubscriptions = subscriptionsData.filter(sub => sub.status === 'trial').length;
      const expiredSubscriptions = subscriptionsData.filter(sub => sub.status === 'expired').length;

      setMetrics({
        totalSalons: salonsData.length,
        activeSalons: salonsData.filter(salon => {
          const hasActiveSubscription = subscriptionsData.some(
            sub => sub.salon_id === salon.id && (sub.status === 'active' || sub.status === 'trial')
          );
          return hasActiveSubscription;
        }).length,
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        trialSubscriptions,
        expiredSubscriptions,
        totalUsers: usersData.length
      });

      // Подготавливаем данные салонов
      const salonsWithData = salonsData.map(salon => {
        const subscription = subscriptionsData.find(sub => sub.salon_id === salon.id);
        const owner = usersData.find(user => user.role === 'owner'); // Simplified
        
        return {
          id: salon.id,
          name: salon.name,
          email: salon.email || '',
          phone: salon.phone || '',
          address: salon.address || '',
          created_at: salon.created_at,
          owner_name: `${salon.name} Owner`, // Simplified
          subscription_status: subscription?.status || 'none',
          subscription_plan: (subscription as any)?.subscription_plans?.name || 'Нет подписки',
          total_revenue: 0, // TODO: Calculate from orders
          last_activity: salon.created_at // Simplified
        };
      });

      setSalons(salonsWithData);

      // Подготавливаем данные подписок
      const subscriptionsWithData = subscriptionsData.map(subscription => ({
        id: subscription.id,
        salon_name: (subscription as any).salons?.name || 'Unknown',
        plan_name: (subscription as any).subscription_plans?.name || 'Unknown',
        status: subscription.status,
        started_at: subscription.started_at,
        expires_at: subscription.expires_at,
        auto_renew: subscription.auto_renew,
        price: (subscription as any).subscription_plans?.price || 0
      }));

      setSubscriptions(subscriptionsWithData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      console.error('Super admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (subscriptionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('salon_subscriptions')
        .update({ status })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Обновляем локальные данные
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === subscriptionId ? { ...sub, status } : sub
        )
      );

      // Обновляем метрики
      await fetchSuperAdminData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления подписки');
      throw err;
    }
  };

  return {
    metrics,
    salons,
    subscriptions,
    loading,
    error,
    isSuperAdmin,
    refetch: fetchSuperAdminData,
    updateSubscriptionStatus
  };
}