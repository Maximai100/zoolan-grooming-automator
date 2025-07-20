-- Создаем таблицу для двухфакторной аутентификации
CREATE TABLE public.user_two_factor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу журналов аудита
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для попыток входа
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  user_agent TEXT,
  location_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицы для сессий безопасности
CREATE TABLE public.security_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  location_data JSONB,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.user_two_factor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_sessions ENABLE ROW LEVEL SECURITY;

-- Политики для 2FA
CREATE POLICY "Users can manage their own 2FA" 
ON public.user_two_factor 
FOR ALL 
USING (user_id = auth.uid());

-- Политики для журналов аудита
CREATE POLICY "Salon members can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "System can create audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true); -- Любой может создавать логи

-- Политики для попыток входа (только для админов салона)
CREATE POLICY "Salon owners can view login attempts" 
ON public.login_attempts 
FOR SELECT 
USING (email IN (
  SELECT p.email 
  FROM profiles p 
  WHERE p.salon_id IN (
    SELECT profiles.salon_id 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
));

-- Политики для сессий безопасности
CREATE POLICY "Users can view their own sessions" 
ON public.security_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" 
ON public.security_sessions 
FOR UPDATE 
USING (user_id = auth.uid());

-- Триггеры для обновления updated_at
CREATE TRIGGER update_user_two_factor_updated_at
  BEFORE UPDATE ON public.user_two_factor
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Создаем функцию для логирования действий
CREATE OR REPLACE FUNCTION public.log_audit_action(
  _salon_id UUID,
  _user_id UUID,
  _action TEXT,
  _resource_type TEXT,
  _resource_id UUID DEFAULT NULL,
  _old_values JSONB DEFAULT NULL,
  _new_values JSONB DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    salon_id, user_id, action, resource_type, resource_id,
    old_values, new_values, ip_address, user_agent
  ) VALUES (
    _salon_id, _user_id, _action, _resource_type, _resource_id,
    _old_values, _new_values, _ip_address::INET, _user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Создаем функцию для очистки старых логов (хранить только последние 6 месяцев)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - INTERVAL '6 months';
  
  DELETE FROM public.login_attempts 
  WHERE created_at < now() - INTERVAL '3 months';
  
  DELETE FROM public.security_sessions 
  WHERE expires_at < now() OR (is_active = false AND created_at < now() - INTERVAL '1 month');
END;
$$;

-- Создаем функцию для проверки подозрительной активности
CREATE OR REPLACE FUNCTION public.check_suspicious_activity(
  _user_id UUID,
  _ip_address TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_attempts INTEGER;
  different_locations INTEGER;
  result JSONB := '{}';
BEGIN
  -- Проверяем количество неудачных попыток за последний час
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_attempts la
  JOIN profiles p ON p.email = la.email
  WHERE p.id = _user_id
  AND la.success = false
  AND la.created_at > now() - INTERVAL '1 hour';
  
  -- Проверяем входы с разных локаций за последние 24 часа
  SELECT COUNT(DISTINCT ip_address) INTO different_locations
  FROM public.login_attempts la
  JOIN profiles p ON p.email = la.email
  WHERE p.id = _user_id
  AND la.success = true
  AND la.created_at > now() - INTERVAL '24 hours';
  
  result := jsonb_build_object(
    'failed_attempts', failed_attempts,
    'different_locations', different_locations,
    'is_suspicious', (failed_attempts > 5 OR different_locations > 3),
    'risk_level', 
      CASE 
        WHEN failed_attempts > 10 OR different_locations > 5 THEN 'high'
        WHEN failed_attempts > 5 OR different_locations > 3 THEN 'medium'
        ELSE 'low'
      END
  );
  
  RETURN result;
END;
$$;

-- Индексы для производительности
CREATE INDEX idx_audit_logs_salon_id ON public.audit_logs(salon_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at);

CREATE INDEX idx_security_sessions_user_id ON public.security_sessions(user_id);
CREATE INDEX idx_security_sessions_token ON public.security_sessions(session_token);
CREATE INDEX idx_security_sessions_expires_at ON public.security_sessions(expires_at);