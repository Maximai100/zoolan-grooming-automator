import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface KPIMetrics {
  total_revenue: number;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  no_show_percentage: number;
  avg_ticket: number;
  top_breeds: Array<{ breed: string; count: number }>;
  new_clients: number;
  repeat_clients: number;
  calculated_at: string;
}

export interface RevenueForecast {
  predicted_revenue: number;
  scheduled_revenue: number;
  historical_daily_avg: number;
  confidence_level: number;
  forecast_period: number;
  period_start: string;
  period_end: string;
  generated_at: string;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const {
    data: kpiMetrics,
    isLoading: kpiLoading,
    error: kpiError,
    refetch: refetchKPI
  } = useQuery({
    queryKey: ['kpi-metrics', user?.id],
    queryFn: async (): Promise<KPIMetrics | null> => {
      if (!user?.id) return null;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const { data, error } = await supabase.rpc('calculate_salon_kpi', {
        salon_uuid: user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      if (error) {
        console.error('Error calculating KPI:', error);
        throw error;
      }

      return data as unknown as KPIMetrics;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  const {
    data: revenueForecast,
    isLoading: forecastLoading,
    error: forecastError,
    refetch: refetchForecast
  } = useQuery({
    queryKey: ['revenue-forecast', user?.id],
    queryFn: async (): Promise<RevenueForecast | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase.rpc('generate_revenue_forecast', {
        salon_uuid: user.id,
        forecast_days: 30
      });

      if (error) {
        console.error('Error generating forecast:', error);
        throw error;
      }

      return data as unknown as RevenueForecast;
    },
    enabled: !!user?.id,
    staleTime: 60 * 60 * 1000, // 1 час
  });

  const getWeeklyRevenue = useQuery({
    queryKey: ['weekly-revenue', profile?.salon_id],
    queryFn: async () => {
      if (!profile?.salon_id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('salon_id', profile.salon_id)
        .eq('payment_status', 'paid')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Группируем по дням
      const dailyRevenue = data.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + Number(order.total_amount);
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue
      }));
    },
    enabled: !!profile?.salon_id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });

  const getTopServices = useQuery({
    queryKey: ['top-services', profile?.salon_id],
    queryFn: async () => {
      if (!profile?.salon_id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          service_id,
          services!inner(name, price),
          status
        `)
        .eq('salon_id', profile.salon_id)
        .eq('status', 'completed')
        .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) throw error;

      // Группируем по услугам
      const serviceStats = data.reduce((acc, appointment) => {
        const serviceName = appointment.services?.name || 'Неизвестная услуга';
        const servicePrice = Number(appointment.services?.price || 0);
        
        if (!acc[serviceName]) {
          acc[serviceName] = { count: 0, revenue: 0 };
        }
        
        acc[serviceName].count += 1;
        acc[serviceName].revenue += servicePrice;
        
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      return Object.entries(serviceStats)
        .map(([name, stats]) => ({
          name,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
    enabled: !!profile?.salon_id,
    staleTime: 60 * 60 * 1000, // 1 час
  });

  const refreshAllData = () => {
    refetchKPI();
    refetchForecast();
    getWeeklyRevenue.refetch();
    getTopServices.refetch();
  };

  return {
    kpiMetrics,
    kpiLoading,
    kpiError,
    revenueForecast,
    forecastLoading,
    forecastError,
    weeklyRevenue: getWeeklyRevenue.data || [],
    weeklyRevenueLoading: getWeeklyRevenue.isLoading,
    topServices: getTopServices.data || [],
    topServicesLoading: getTopServices.isLoading,
    refreshAllData
  };
};