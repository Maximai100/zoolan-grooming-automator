import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ClientLoyaltyBalanceWithRelations, 
  LoyaltyTransactionWithRelations, 
  PersonalOfferWithRelations 
} from '@/types/notifications';

export interface LoyaltyProgram {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  type: 'points' | 'visits';
  points_per_ruble: number;
  points_per_visit: number;
  point_value: number;
  min_redemption_points: number;
  bonus_multiplier: number;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  terms_and_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientLoyaltyBalance {
  id: string;
  client_id: string;
  program_id: string;
  current_points: number;
  total_earned: number;
  total_redeemed: number;
  tier_level: string;
  tier_achieved_at: string;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  client_id: string;
  program_id: string;
  order_id?: string;
  appointment_id?: string;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points_amount: number;
  description?: string;
  reference_id?: string;
  expires_at?: string;
  processed_by?: string;
  created_at: string;
}

export interface PersonalOffer {
  id: string;
  salon_id: string;
  client_id: string;
  offer_type: 'discount' | 'bonus_points' | 'free_service' | 'free_product';
  title: string;
  description?: string;
  discount_value?: number;
  bonus_points?: number;
  free_service_id?: string;
  free_product_id?: string;
  min_order_amount: number;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  is_used: boolean;
  valid_from: string;
  valid_until?: string;
  used_at?: string;
  used_in_order_id?: string;
  trigger_condition?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useLoyalty = () => {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [balances, setBalances] = useState<ClientLoyaltyBalanceWithRelations[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransactionWithRelations[]>([]);
  const [offers, setOffers] = useState<PersonalOfferWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getUserSalonId = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    return profile?.salon_id;
  };

  const fetchPrograms = async () => {
    try {
      const salonId = await getUserSalonId();
      if (!salonId) return;

      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms((data || []) as LoyaltyProgram[]);
    } catch (error: any) {
      console.error('Error fetching loyalty programs:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить программы лояльности',
        variant: 'destructive'
      });
    }
  };

  const fetchClientBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('client_loyalty_balances')
        .select(`
          *,
          clients:client_id(first_name, last_name),
          loyalty_programs:program_id(name, type)
        `)
        .order('last_activity_date', { ascending: false });

      if (error) throw error;
      setBalances((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching client balances:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select(`
          *,
          clients:client_id(first_name, last_name),
          loyalty_programs:program_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPersonalOffers = async () => {
    try {
      const salonId = await getUserSalonId();
      if (!salonId) return;

      const { data, error } = await supabase
        .from('personal_offers')
        .select(`
          *,
          clients:client_id(first_name, last_name)
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching personal offers:', error);
    }
  };

  const createProgram = async (programData: Omit<LoyaltyProgram, 'id' | 'salon_id' | 'created_at' | 'updated_at'>) => {
    try {
      const salonId = await getUserSalonId();
      if (!salonId) throw new Error('Не удалось определить салон');

      const { data, error } = await supabase
        .from('loyalty_programs')
        .insert([{ ...programData, salon_id: salonId }])
        .select()
        .single();

      if (error) throw error;

      await fetchPrograms();
      toast({
        title: 'Успешно',
        description: 'Программа лояльности создана'
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating loyalty program:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать программу лояльности',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updateProgram = async (id: string, updates: Partial<LoyaltyProgram>) => {
    try {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchPrograms();
      toast({
        title: 'Успешно',
        description: 'Программа лояльности обновлена'
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating loyalty program:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить программу лояльности',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const createPersonalOffer = async (offerData: Omit<PersonalOffer, 'id' | 'salon_id' | 'created_at' | 'updated_at'>) => {
    try {
      const salonId = await getUserSalonId();
      if (!salonId) throw new Error('Не удалось определить салон');

      const { data, error } = await supabase
        .from('personal_offers')
        .insert([{ ...offerData, salon_id: salonId }])
        .select()
        .single();

      if (error) throw error;

      await fetchPersonalOffers();
      toast({
        title: 'Успешно',
        description: 'Персональное предложение создано'
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating personal offer:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать персональное предложение',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const adjustClientPoints = async (clientId: string, programId: string, pointsAmount: number, description: string) => {
    try {
      // Создаем транзакцию корректировки
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert([{
          client_id: clientId,
          program_id: programId,
          transaction_type: 'adjusted',
          points_amount: pointsAmount,
          description: description
        }]);

      if (transactionError) throw transactionError;

      // Обновляем баланс клиента напрямую
      const { data: currentBalance } = await supabase
        .from('client_loyalty_balances')
        .select('current_points')
        .eq('client_id', clientId)
        .eq('program_id', programId)
        .single();

      const newPoints = (currentBalance?.current_points || 0) + pointsAmount;
      
      const { error: balanceError } = await supabase
        .from('client_loyalty_balances')
        .upsert({
          client_id: clientId,
          program_id: programId,
          current_points: Math.max(0, newPoints),
          last_activity_date: new Date().toISOString()
        });

      if (balanceError) throw balanceError;

      await Promise.all([fetchClientBalances(), fetchTransactions()]);
      
      toast({
        title: 'Успешно',
        description: `Баланс клиента ${pointsAmount > 0 ? 'увеличен' : 'уменьшен'} на ${Math.abs(pointsAmount)} баллов`
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error adjusting client points:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить баланс клиента',
        variant: 'destructive'
      });
      return { error };
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([
      fetchPrograms(),
      fetchClientBalances(),
      fetchTransactions(),
      fetchPersonalOffers()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    programs,
    balances,
    transactions,
    offers,
    loading,
    createProgram,
    updateProgram,
    createPersonalOffer,
    adjustClientPoints,
    refetch
  };
};