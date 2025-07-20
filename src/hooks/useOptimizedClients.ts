// Оптимизированный хук для работы с клиентами
import { useOptimizedQuery } from './useOptimizedQuery';
import { createSimpleApi } from '@/utils/api-simple';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  salon_id: string;
  total_visits: number;
  total_spent: number;
  is_vip: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

const clientsApi = createSimpleApi('clients');

export const useOptimizedClients = (filters?: Record<string, any>) => {
  return useOptimizedQuery<Client[]>({
    queryKey: ['clients', JSON.stringify(filters || {})],
    queryFn: async () => {
      const result = await clientsApi.getAll(filters);
      if (result.error) throw new Error(result.error);
      return (result.data || []) as unknown as Client[];
    },
    staleTime: 2 * 60 * 1000, // 2 минуты для клиентов
  });
};