-- Добавляем недостающие поля в существующую таблицу салонов
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS parent_salon_id UUID REFERENCES public.salons(id),
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Moscow',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'RUB',
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Таблица API ключей для публичного API
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]', -- ['read:clients', 'write:appointments', etc]
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
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
  conditions JSONB DEFAULT '{}',
  rollout_percentage INTEGER DEFAULT 0,
  target_salons UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица пользовательских feature flags для салонов
CREATE TABLE public.salon_feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  enabled_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, feature_name)
);

-- Включаем RLS для новых таблиц
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_feature_flags ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_salon_feature_flags_updated_at
  BEFORE UPDATE ON public.salon_feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Индексы для производительности
CREATE INDEX idx_salons_parent ON public.salons(parent_salon_id);
CREATE INDEX idx_api_keys_salon ON public.api_keys(salon_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_logs_salon_date ON public.api_logs(salon_id, created_at);
CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_salon_feature_flags_salon ON public.salon_feature_flags(salon_id);

-- Добавляем начальные feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage) VALUES
('advanced_analytics', 'Расширенная аналитика и отчеты', true, 100),
('ai_scheduling', 'AI-оптимизация расписания', false, 20),
('social_media_integration', 'Интеграция с социальными сетями', false, 0),
('multi_location', 'Поддержка мультилокаций', true, 50),
('mobile_app', 'Мобильное приложение', true, 100),
('online_booking_widget', 'Виджет онлайн-записи', true, 100),
('loyalty_program', 'Программа лояльности', true, 80),
('inventory_management', 'Управление инвентарем', true, 60);