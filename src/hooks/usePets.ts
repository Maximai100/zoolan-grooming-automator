import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pet {
  id: string;
  client_id: string;
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  coat_type?: string;
  color?: string;
  gender?: string;
  allergies?: string;
  special_notes?: string;
  vaccination_status?: string;
  photo_url?: string;
  microchip_number?: string;
  created_at: string;
  updated_at: string;
}

export const usePets = (clientId?: string) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPets = async () => {
    try {
      let query = supabase.from('pets').select('*');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить питомцев',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (petData: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([petData])
        .select()
        .single();

      if (error) throw error;
      
      setPets(prev => [data, ...prev]);
      toast({
        title: 'Успешно',
        description: 'Питомец добавлен'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error adding pet:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить питомца',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPets(prev => prev.map(pet => 
        pet.id === id ? { ...pet, ...data } : pet
      ));

      toast({
        title: 'Успешно',
        description: 'Данные питомца обновлены'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating pet:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные питомца',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const deletePet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPets(prev => prev.filter(pet => pet.id !== id));
      toast({
        title: 'Успешно',
        description: 'Питомец удален'
      });
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить питомца',
        variant: 'destructive'
      });
    }
  };

  // AI алгоритм расчета времени по породе
  const calculateServiceTime = (breed?: string, coatType?: string) => {
    let baseTime = 60; // минут
    
    // Длинношерстные породы требуют больше времени
    if (coatType?.toLowerCase().includes('длинн') || 
        coatType?.toLowerCase().includes('кудряв')) {
      baseTime += 30;
    }
    
    // Крупные породы
    const largeBreedsKeywords = ['овчарка', 'лабрадор', 'ретривер', 'хаски', 'маламут'];
    if (breed && largeBreedsKeywords.some(keyword => 
        breed.toLowerCase().includes(keyword))) {
      baseTime += 20;
    }
    
    // Мелкие породы обычно быстрее
    const smallBreedsKeywords = ['чихуахуа', 'той', 'йорк', 'мальтийск'];
    if (breed && smallBreedsKeywords.some(keyword => 
        breed.toLowerCase().includes(keyword))) {
      baseTime -= 15;
    }
    
    return Math.max(30, baseTime); // минимум 30 минут
  };

  useEffect(() => {
    fetchPets();
  }, [clientId]);

  return {
    pets,
    loading,
    addPet,
    updatePet,
    deletePet,
    calculateServiceTime,
    refetch: fetchPets
  };
};