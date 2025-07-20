-- Создаем систему мультилокаций и салонов

-- Таблица салонов (расширенная)
CREATE TABLE IF NOT EXISTS public.salons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT DEFAULT 'Europe/Moscow',
  currency TEXT DEFAULT 'RUB',
  parent_salon_id UUID REFERENCES public.salons(id), -- для франшизы
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}', -- логотип, цвета, etc
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица API ключей для публичного API
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]', -- ['read:clients', 'write:appointments', etc]
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица API логов
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  request_data JSONB,
  response_data JSONB,
  ip_address INET,
  user_agent TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица системных feature flags
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}', -- условия включения
  rollout_percentage INTEGER DEFAULT 0, -- процент пользователей
  target_salons UUID[] DEFAULT '{}', -- конкретные салоны
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица пользовательских feature flags для салонов
CREATE TABLE public.salon_feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  enabled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, feature_name)
);

-- Включаем RLS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_feature_flags ENABLE ROW LEVEL SECURITY;

-- Политики RLS для салонов
CREATE POLICY "Salon members can view their salons" 
ON public.salons FOR SELECT 
USING (id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
) OR parent_salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

CREATE POLICY "Salon owners can manage salons" 
ON public.salons FOR ALL 
USING (owner_id = auth.uid() OR id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
));

-- Политики для API ключей
CREATE POLICY "Salon owners can manage API keys" 
ON public.api_keys FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'manager')
));

-- Политики для API логов
CREATE POLICY "Salon members can view API logs" 
ON public.api_logs FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

-- Политики для feature flags
CREATE POLICY "Everyone can view global feature flags" 
ON public.feature_flags FOR SELECT USING (true);

CREATE POLICY "Salon members can view their feature flags" 
ON public.salon_feature_flags FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

CREATE POLICY "Salon owners can manage feature flags" 
ON public.salon_feature_flags FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'manager')
));

-- Триггеры для updated_at
CREATE TRIGGER update_salons_updated_at
  BEFORE UPDATE ON public.salons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_salon_feature_flags_updated_at
  BEFORE UPDATE ON public.salon_feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Функция для проверки API ключа
CREATE OR REPLACE FUNCTION public.validate_api_key(_key_hash TEXT, _permissions TEXT[])
RETURNS TABLE(salon_id UUID, is_valid BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_record RECORD;
BEGIN
  SELECT * INTO key_record 
  FROM public.api_keys 
  WHERE key_hash = _key_hash 
  AND is_active = true 
  AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, false;
    RETURN;
  END IF;
  
  -- Проверяем права доступа
  IF _permissions && (key_record.permissions::TEXT[]) THEN
    -- Обновляем последнее использование
    UPDATE public.api_keys 
    SET last_used_at = now() 
    WHERE id = key_record.id;
    
    RETURN QUERY SELECT key_record.salon_id, true;
  ELSE
    RETURN QUERY SELECT key_record.salon_id, false;
  END IF;
END;
$$;

-- Функция для получения feature flags салона
CREATE OR REPLACE FUNCTION public.get_salon_features(_salon_id UUID)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  global_flag RECORD;
  salon_flag RECORD;
BEGIN
  -- Получаем глобальные feature flags
  FOR global_flag IN 
    SELECT name, is_enabled, rollout_percentage, target_salons
    FROM public.feature_flags
    WHERE is_enabled = true
  LOOP
    -- Проверяем условия включения
    IF global_flag.rollout_percentage = 100 
       OR _salon_id = ANY(global_flag.target_salons)
       OR (random() * 100) < global_flag.rollout_percentage THEN
      result := result || jsonb_build_object(global_flag.name, true);
    ELSE
      result := result || jsonb_build_object(global_flag.name, false);
    END IF;
  END LOOP;
  
  -- Переопределяем салонными настройками
  FOR salon_flag IN
    SELECT feature_name, is_enabled
    FROM public.salon_feature_flags
    WHERE salon_id = _salon_id
  LOOP
    result := result || jsonb_build_object(salon_flag.feature_name, salon_flag.is_enabled);
  END LOOP;
  
  RETURN result;
END;
$$;

-- Индексы для производительности
CREATE INDEX idx_salons_parent ON public.salons(parent_salon_id);
CREATE INDEX idx_salons_owner ON public.salons(owner_id);
CREATE INDEX idx_api_keys_salon ON public.api_keys(salon_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_logs_salon_date ON public.api_logs(salon_id, created_at);
CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_salon_feature_flags_salon ON public.salon_feature_flags(salon_id);