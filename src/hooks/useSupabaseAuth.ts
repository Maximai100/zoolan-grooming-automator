import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  };

  return {
    getCurrentUser,
    getUserProfile,
    supabase
  };
};