import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import * as OTPAuth from 'otplib';
import QRCode from 'qrcode';

export interface TwoFactorAuth {
  id: string;
  user_id: string;
  secret: string;
  backup_codes: string[];
  is_enabled: boolean;
  enabled_at?: string;
  last_used_at?: string;
}

export interface AuditLog {
  id: string;
  salon_id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface SecuritySession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  location_data?: any;
  is_active: boolean;
  expires_at: string;
  last_activity_at: string;
  created_at: string;
}

export const useSecurity = () => {
  const [twoFactor, setTwoFactor] = useState<TwoFactorAuth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchTwoFactor = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_two_factor')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setTwoFactor(data);
    } catch (error) {
      console.error('Error fetching 2FA:', error);
    }
  };

  const fetchAuditLogs = async (limit = 50) => {
    if (!profile?.salon_id) return;

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles!user_id(first_name, last_name, email)
        `)
        .eq('salon_id', profile.salon_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAuditLogs((data as any) || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить журнал аудита",
        variant: "destructive",
      });
    }
  };

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('security_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      setSessions((data as any) || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const generateTwoFactorSecret = async () => {
    if (!user || !profile) return null;

    try {
      const secret = OTPAuth.authenticator.generateSecret();
      const appName = 'Зооплан';
      const accountName = profile.email;
      
      const otpUri = OTPAuth.authenticator.keyuri(accountName, appName, secret);
      const qrCodeUrl = await QRCode.toDataURL(otpUri);

      // Генерируем backup коды
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      const { error } = await supabase
        .from('user_two_factor')
        .upsert({
          user_id: user.id,
          secret,
          backup_codes: backupCodes,
          is_enabled: false
        });

      if (error) throw error;

      await fetchTwoFactor();
      
      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать секретный ключ",
        variant: "destructive",
      });
      return null;
    }
  };

  const enableTwoFactor = async (token: string) => {
    if (!twoFactor) return false;

    try {
      const isValid = OTPAuth.authenticator.verify({ token, secret: twoFactor.secret });
      
      if (!isValid) {
        toast({
          title: "Неверный код",
          description: "Введенный код неверен. Попробуйте еще раз.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('user_two_factor')
        .update({
          is_enabled: true,
          enabled_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        })
        .eq('id', twoFactor.id);

      if (error) throw error;

      await logAuditAction('enable_2fa', 'security', null, null, { enabled: true });
      await fetchTwoFactor();

      toast({
        title: "2FA включена",
        description: "Двухфакторная аутентификация успешно включена",
      });

      return true;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось включить двухфакторную аутентификацию",
        variant: "destructive",
      });
      return false;
    }
  };

  const disableTwoFactor = async () => {
    if (!twoFactor) return;

    try {
      const { error } = await supabase
        .from('user_two_factor')
        .update({
          is_enabled: false
        })
        .eq('id', twoFactor.id);

      if (error) throw error;

      await logAuditAction('disable_2fa', 'security', null, null, { enabled: false });
      await fetchTwoFactor();

      toast({
        title: "2FA отключена",
        description: "Двухфакторная аутентификация отключена",
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отключить двухфакторную аутентификацию",
        variant: "destructive",
      });
    }
  };

  const verifyTwoFactor = async (token: string) => {
    if (!twoFactor) return false;

    try {
      const isValid = OTPAuth.authenticator.verify({ token, secret: twoFactor.secret });
      
      if (isValid) {
        await supabase
          .from('user_two_factor')
          .update({
            last_used_at: new Date().toISOString()
          })
          .eq('id', twoFactor.id);
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return false;
    }
  };

  const logAuditAction = async (
    action: string,
    resourceType: string,
    resourceId?: string | null,
    oldValues?: any,
    newValues?: any
  ) => {
    if (!profile?.salon_id || !user) return;

    try {
      await supabase.rpc('log_audit_action', {
        _salon_id: profile.salon_id,
        _user_id: user.id,
        _action: action,
        _resource_type: resourceType,
        _resource_id: resourceId,
        _old_values: oldValues,
        _new_values: newValues,
        _ip_address: null, // В браузере нет доступа к IP
        _user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('security_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      await logAuditAction('terminate_session', 'security_session', sessionId);
      await fetchSessions();

      toast({
        title: "Сессия завершена",
        description: "Сессия успешно завершена",
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить сессию",
        variant: "destructive",
      });
    }
  };

  const terminateAllOtherSessions = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('security_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('session_token', 'current'); // Исключаем текущую сессию

      if (error) throw error;

      await logAuditAction('terminate_all_sessions', 'security_session');
      await fetchSessions();

      toast({
        title: "Все сессии завершены",
        description: "Все остальные сессии успешно завершены",
      });
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить все сессии",
        variant: "destructive",
      });
    }
  };

  const regenerateBackupCodes = async () => {
    if (!twoFactor) return null;

    try {
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      const { error } = await supabase
        .from('user_two_factor')
        .update({
          backup_codes: backupCodes
        })
        .eq('id', twoFactor.id);

      if (error) throw error;

      await logAuditAction('regenerate_backup_codes', 'security');
      await fetchTwoFactor();

      toast({
        title: "Коды восстановления обновлены",
        description: "Новые коды восстановления сгенерированы",
      });

      return backupCodes;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить коды восстановления",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTwoFactor(),
        fetchAuditLogs(),
        fetchSessions()
      ]);
      setLoading(false);
    };

    if (user && profile?.salon_id) {
      fetchData();
    }
  }, [user, profile?.salon_id]);

  return {
    twoFactor,
    auditLogs,
    sessions,
    loading,
    generateTwoFactorSecret,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    logAuditAction,
    terminateSession,
    terminateAllOtherSessions,
    regenerateBackupCodes,
    refetch: () => {
      fetchTwoFactor();
      fetchAuditLogs();
      fetchSessions();
    }
  };
};