import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DiscountCode {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'freebie';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  per_client_limit: number;
  valid_from: string;
  valid_until?: string;
  applicable_services?: string[];
  applicable_products?: string[];
  is_active: boolean;
}

export const useDiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDiscountCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscountCodes((data || []) as DiscountCode[]);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить промокоды',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateDiscountCode = async (code: string): Promise<{
    valid: boolean;
    discountCode?: DiscountCode;
    error?: string;
  }> => {
    if (!code.trim()) {
      return { valid: false, error: 'Введите промокод' };
    }

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Промокод не найден' };
      }

      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (now < validFrom) {
        return { valid: false, error: 'Промокод еще не активен' };
      }

      if (validUntil && now > validUntil) {
        return { valid: false, error: 'Промокод истек' };
      }

      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        return { valid: false, error: 'Лимит использования исчерпан' };
      }

      return { valid: true, discountCode: data as DiscountCode };
    } catch (error) {
      console.error('Error validating discount code:', error);
      return { valid: false, error: 'Ошибка проверки промокода' };
    }
  };

  const calculateDiscount = (
    discountCode: DiscountCode, 
    subtotal: number, 
    items: any[]
  ): { discountAmount: number; error?: string } => {
    if (discountCode.min_order_amount && subtotal < discountCode.min_order_amount) {
      return { 
        discountAmount: 0, 
        error: `Минимальная сумма заказа: ${discountCode.min_order_amount}₽` 
      };
    }

    let discountAmount = 0;

    switch (discountCode.type) {
      case 'percentage':
        discountAmount = (subtotal * discountCode.value) / 100;
        if (discountCode.max_discount_amount) {
          discountAmount = Math.min(discountAmount, discountCode.max_discount_amount);
        }
        break;
      case 'fixed':
        discountAmount = Math.min(discountCode.value, subtotal);
        break;
      case 'freebie':
        // Для промокодов с бесплатным товаром/услугой
        discountAmount = 0;
        break;
      default:
        return { discountAmount: 0, error: 'Неизвестный тип промокода' };
    }

    return { discountAmount: Math.round(discountAmount * 100) / 100 };
  };

  const markDiscountCodeUsed = async (codeId: string) => {
    try {
      // Получаем текущий счетчик использования
      const { data: currentData } = await supabase
        .from('discount_codes')
        .select('usage_count')
        .eq('id', codeId)
        .single();

      if (currentData) {
        const { error } = await supabase
          .from('discount_codes')
          .update({ 
            usage_count: currentData.usage_count + 1
          })
          .eq('id', codeId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error marking discount code as used:', error);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  return {
    discountCodes,
    loading,
    validateDiscountCode,
    calculateDiscount,
    markDiscountCodeUsed,
    refetch: fetchDiscountCodes
  };
};