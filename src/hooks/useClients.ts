
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  salon_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  address?: string;
  notes?: string;
  tags: string[];
  is_vip: boolean;
  total_visits: number;
  total_spent: number;
  last_visit_date?: string;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchClients = async () => {
    console.log('🔄 Starting to fetch clients...');
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.email);
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }
      
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('Пользователь не аутентифицирован');
      }

      // Check user profile
      console.log('🔄 Checking user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('salon_id, role')
        .eq('id', user.id)
        .single();

      console.log('👤 User profile:', profile);
      
      if (profileError) {
        console.error('❌ Profile error:', profileError);
        throw profileError;
      }

      if (!profile?.salon_id) {
        console.error('❌ No salon_id in profile');
        throw new Error('Не удалось определить салон пользователя');
      }

      console.log('🔄 Fetching clients for salon:', profile.salon_id);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false });

      console.log('📊 Clients query result:', { data, error });

      if (error) {
        console.error('❌ Clients fetch error:', error);
        throw error;
      }
      
      console.log('✅ Successfully fetched clients:', data?.length || 0);
      setClients(data || []);
    } catch (error) {
      console.error('❌ Error in fetchClients:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить клиентов',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      console.log('✅ fetchClients completed, loading set to false');
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'salon_id' | 'created_at' | 'updated_at' | 'total_visits' | 'total_spent'>) => {
    console.log('➕ Adding new client:', clientData);
    try {
      // Get user's salon_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.salon_id) {
        throw new Error('Не удалось определить салон пользователя');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, salon_id: profile.salon_id }])
        .select()
        .single();

      if (error) throw error;
      
      setClients(prev => [data, ...prev]);
      toast({
        title: 'Успешно',
        description: 'Клиент добавлен'
      });
      console.log('✅ Client added successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error adding client:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить клиента',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...data } : client
      ));

      toast({
        title: 'Успешно',
        description: 'Данные клиента обновлены'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные клиента',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
      toast({
        title: 'Успешно',
        description: 'Клиент удален'
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить клиента',
        variant: 'destructive'
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => {
    console.log('🔄 useClients useEffect triggered');
    fetchClients();
  }, []);

  console.log('📊 useClients state:', { 
    clientsCount: clients.length, 
    loading, 
    filteredCount: filteredClients.length 
  });

  return {
    clients: filteredClients,
    loading,
    searchTerm,
    setSearchTerm,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
};
