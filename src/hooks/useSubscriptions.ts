import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: string;
  max_clients: number | null;
  max_appointments_per_month: number | null;
  max_notifications_per_month: number | null;
  max_staff_members: number | null;
  max_locations: number;
  features: any;
  is_active: boolean;
}

interface CurrentSubscription {
  id: string;
  salon_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  plan_name: string;
  plan_description: string;
  plan_price: number;
  max_clients: number | null;
  max_appointments_per_month: number | null;
  max_notifications_per_month: number | null;
  max_staff_members: number | null;
}

interface Usage {
  appointments_count: number;
  notifications_sent: number;
  period_start: string;
  period_end: string;
}

export function useSubscriptions() {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // Temporarily set dummy data until types are updated
      setCurrentSubscription({
        id: "1",
        salon_id: "1", 
        plan_id: "1",
        status: "trial",
        started_at: new Date().toISOString(),
        expires_at: null,
        auto_renew: true,
        plan_name: "Стартовый",
        plan_description: "Идеально для небольших салонов",
        plan_price: 2990,
        max_clients: 100,
        max_appointments_per_month: 500,
        max_notifications_per_month: 1000,
        max_staff_members: 3,
      });

      // Fetch all available plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (plansError) {
        console.error('Error fetching plans:', plansError);
      } else {
        setPlans(plansData as unknown as SubscriptionPlan[] || []);
      }

      // Set dummy usage data
      setUsage({
        appointments_count: 45,
        notifications_sent: 128,
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentSubscription,
    plans,
    usage,
    loading,
    refetch: fetchSubscriptionData
  };
}