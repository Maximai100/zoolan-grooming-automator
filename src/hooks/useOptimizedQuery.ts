import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse, LoadingState, PaginationParams, SortParams, FilterParams } from '@/types/common';

interface UseOptimizedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

interface UseOptimizedQueryResult<T> extends LoadingState {
  data: T | undefined;
  refetch: () => void;
  invalidate: () => void;
}

// Оптимизированный хук для работы с запросами
export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 минут
  cacheTime = 10 * 60 * 1000, // 10 минут
  refetchOnWindowFocus = false,
  refetchOnMount = true,
  enabled = true,
  onError,
  onSuccess
}: UseOptimizedQueryOptions<T>): UseOptimizedQueryResult<T> {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
    dataUpdatedAt
  } = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus,
    refetchOnMount,
    enabled,
    retry: (failureCount, error) => {
      // Не повторяем запросы при ошибках авторизации
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Колбэки
  useMemo(() => {
    if (error && onError) {
      onError(error as Error);
    }
  }, [error, onError]);

  useMemo(() => {
    if (data && onSuccess) {
      onSuccess(data);
    }
  }, [data, onSuccess]);

  const refetch = useCallback(() => {
    queryRefetch();
  }, [queryRefetch]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    data,
    loading: isLoading,
    error: error?.message || null,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refetch,
    invalidate
  };
}

// Хук для работы с пагинированными данными
export function usePaginatedQuery<T>({
  baseQueryKey,
  queryFn,
  initialPage = 1,
  pageSize = 20,
  ...options
}: {
  baseQueryKey: string[];
  queryFn: (params: PaginationParams & SortParams & FilterParams) => Promise<{ data: T[]; total: number }>;
  initialPage?: number;
  pageSize?: number;
} & Partial<UseOptimizedQueryOptions<{ data: T[]; total: number }>>) {
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<FilterParams>({});
  const [sort, setSort] = useState<SortParams>({ field: 'created_at', direction: 'desc' });

  const queryKey = useMemo(() => [
    ...baseQueryKey,
    'paginated',
    `page-${page}-size-${pageSize}-filters-${JSON.stringify(filters)}-sort-${JSON.stringify(sort)}`
  ], [baseQueryKey, page, pageSize, filters, sort]);

  const result = useOptimizedQuery({
    queryKey,
    queryFn: () => queryFn({ page, limit: pageSize, offset: (page - 1) * pageSize, ...sort, ...filters }),
    ...options
  });

  const totalPages = result.data ? Math.ceil(result.data.total / pageSize) : 0;

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  const updateFilters = useCallback((newFilters: FilterParams) => {
    setFilters(newFilters);
    setPage(1); // Сброс на первую страницу при изменении фильтров
  }, []);

  const updateSort = useCallback((newSort: SortParams) => {
    setSort(newSort);
    setPage(1); // Сброс на первую страницу при изменении сортировки
  }, []);

  return {
    ...result,
    items: result.data?.data || [],
    total: result.data?.total || 0,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    goToPage,
    nextPage,
    prevPage,
    filters,
    updateFilters,
    sort,
    updateSort
  };
}

// Хук для работы с real-time подписками
export function useRealtimeQuery<T>(
  queryOptions: UseOptimizedQueryOptions<T>,
  realtimeConfig: {
    table: string;
    filter?: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  }
) {
  const result = useOptimizedQuery(queryOptions);

  // Закомментировано до исправления типов Supabase realtime
  // useMemo(() => {
  //   if (!realtimeConfig.table) return;
  //   // Real-time функциональность будет добавлена позже
  // }, [realtimeConfig.table]);

  return result;
}