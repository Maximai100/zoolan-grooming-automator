// Упрощенная версия API утилит без сложной типизации

import { supabase } from '@/integrations/supabase/client';

export interface SimpleApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Простая обертка для API запросов
export async function simpleApiRequest<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<SimpleApiResponse<T>> {
  try {
    const { data, error } = await operation();

    if (error) {
      console.error('API Error:', error);
      return { data: null, error: error.message || 'Произошла ошибка' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}

// Базовые CRUD операции
export const createSimpleApi = (tableName: string) => ({
  async getAll(filters?: Record<string, any>) {
    let query = supabase.from(tableName as any).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    return simpleApiRequest(async () => await query);
  },

  async getById(id: string) {
    return simpleApiRequest(async () => 
      await supabase.from(tableName as any).select('*').eq('id', id).single()
    );
  },

  async create(data: any) {
    return simpleApiRequest(async () => 
      await supabase.from(tableName as any).insert(data).select().single()
    );
  },

  async update(id: string, data: any) {
    return simpleApiRequest(async () => 
      await supabase.from(tableName as any).update(data).eq('id', id).select().single()
    );
  },

  async delete(id: string) {
    return simpleApiRequest(async () => {
      const { error } = await supabase.from(tableName as any).delete().eq('id', id);
      return { data: !error, error };
    });
  }
});

// Валидация данных
export const validateRequired = (data: Record<string, any>, requiredFields: string[]) => {
  const errors: Record<string, string> = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `Поле "${field}" обязательно для заполнения`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Дебаунс функция
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};