
-- Добавляем роль super_admin в enum user_role
ALTER TYPE user_role ADD VALUE 'super_admin';

-- Создаем таблицу тарифных планов подписок (если не существует)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  max_clients INTEGER,
  max_appointments_per_month INTEGER,
  max_notifications_per_month INTEGER,
  max_staff_members INTEGER,
  max_locations INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу подписок салонов (если не существует)
CREATE TABLE IF NOT EXISTS public.salon_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, cancelled, expired
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу использования подписок
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  appointments_count INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, period_start)
);

-- Включаем RLS для новых таблиц
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Политики для суперадмина
CREATE POLICY "Super admins can manage subscription plans" 
ON public.subscription_plans FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
));

CREATE POLICY "Super admins can view all subscriptions" 
ON public.salon_subscriptions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
));

CREATE POLICY "Salon members can view their subscriptions" 
ON public.salon_subscriptions FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

CREATE POLICY "Super admins can view all usage data" 
ON public.subscription_usage FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
));

CREATE POLICY "Salon members can view their usage" 
ON public.subscription_usage FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

-- Триггеры для updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_salon_subscriptions_updated_at
  BEFORE UPDATE ON public.salon_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscription_usage_updated_at
  BEFORE UPDATE ON public.subscription_usage
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Добавляем начальные тарифные планы
INSERT INTO public.subscription_plans (name, description, price, billing_period, max_clients, max_appointments_per_month, max_notifications_per_month, max_staff_members, features) VALUES
('Стартовый', 'Идеально для небольших салонов', 2990.00, 'monthly', 100, 500, 1000, 3, '{"analytics": false, "multi_location": false, "api_access": false}'),
('Профессиональный', 'Для растущих салонов', 4990.00, 'monthly', 500, 2000, 5000, 10, '{"analytics": true, "multi_location": false, "api_access": true}'),
('Премиум', 'Для сетей салонов', 9990.00, 'monthly', null, null, null, null, '{"analytics": true, "multi_location": true, "api_access": true}')
ON CONFLICT DO NOTHING;

-- Обновляем политики для салонов, чтобы суперадмин мог видеть все
CREATE POLICY "Super admins can view all salons" 
ON public.salons FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
));

-- Обновляем политики для профилей
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'super_admin'
));

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_salon_subscriptions_salon_id ON public.salon_subscriptions(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_subscriptions_status ON public.salon_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_salon_period ON public.subscription_usage(salon_id, period_start);
