import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  salon_id: string;
  client_id: string;
  appointment_id?: string;
  service_id?: string;
  rating: number;
  comment?: string;
  is_public: boolean;
  is_featured: boolean;
  response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  service?: {
    name: string;
  };
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          client:clients(first_name, last_name),
          service:services(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отзывы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: any) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Отзыв создан",
      });

      await fetchReviews();
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать отзыв",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Отзыв обновлен",
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить отзыв",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Отзыв удален",
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить отзыв",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return {
    reviews,
    loading,
    createReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
}