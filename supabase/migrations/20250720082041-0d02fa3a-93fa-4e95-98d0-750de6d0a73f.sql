
-- Создаем таблицы для платежных интеграций и системы подписок

-- Таблица планов подписок
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  max_clients INTEGER,
  max_appointments_per_month INTEGER,
  max_notifications_per_month INTEGER,
  max_staff_members INTEGER,
  max_locations INTEGER DEFAULT 1,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица подписок салонов
CREATE TABLE public.salon_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, cancelled, expired
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица использования ресурсов по подпискам
CREATE TABLE public.subscription_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  appointments_count INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для экспорта данных
CREATE TABLE public.data_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  export_type TEXT NOT NULL, -- clients, appointments, financial, analytics
  format TEXT NOT NULL DEFAULT 'csv', -- csv, excel, pdf
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  file_url TEXT,
  requested_by UUID NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Таблица системных настроек и feature flags
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  is_global BOOLEAN DEFAULT false, -- глобальные настройки для всей системы
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица комиссий персонала
CREATE TABLE public.staff_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,
  salon_id UUID NOT NULL,
  order_id UUID,
  appointment_id UUID,
  commission_rate NUMERIC(5,2) NOT NULL, -- процент комиссии
  commission_amount NUMERIC(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица учета рабочего времени
CREATE TABLE public.time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,
  salon_id UUID NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_start TIMESTAMP WITH TIME ZONE,
  break_end TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC(4,2),
  overtime_hours NUMERIC(4,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;

-- Политики RLS
CREATE POLICY "Everyone can view active subscription plans" 
ON public.subscription_plans FOR SELECT USING (is_active = true);

CREATE POLICY "Salon members can view their subscription" 
ON public.salon_subscriptions FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

CREATE POLICY "Salon owners can manage subscriptions" 
ON public.salon_subscriptions FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
));

CREATE POLICY "Salon members can view usage" 
ON public.subscription_usage FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

CREATE POLICY "System can update usage" 
ON public.subscription_usage FOR ALL USING (true);

CREATE POLICY "Salon members can manage exports" 
ON public.data_exports FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
));

CREATE POLICY "Salon members can view settings" 
ON public.system_settings FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
) OR is_global = true);

CREATE POLICY "Salon owners can manage settings" 
ON public.system_settings FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
));

CREATE POLICY "Salon staff can view their commissions" 
ON public.staff_commissions FOR SELECT 
USING (staff_id = auth.uid() OR salon_id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'manager')
));

CREATE POLICY "Salon managers can manage commissions" 
ON public.staff_commissions FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'manager')
));

CREATE POLICY "Staff can manage their time tracking" 
ON public.time_tracking FOR ALL 
USING (staff_id = auth.uid() OR salon_id IN (
  SELECT profiles.salon_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'manager')
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

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Добавляем базовые планы подписок
INSERT INTO public.subscription_plans (name, description, price, billing_period, max_clients, max_appointments_per_month, max_notifications_per_month, max_staff_members, features) VALUES
('Стартовый', 'Идеально для небольших салонов', 2990, 'monthly', 100, 500, 1000, 3, '{"analytics": true, "basic_reports": true, "email_support": true}'),
('Профессиональный', 'Для растущего бизнеса', 5990, 'monthly', 500, 2000, 5000, 10, '{"analytics": true, "advanced_reports": true, "api_access": true, "priority_support": true, "multi_location": false}'),
('Бизнес', 'Для больших салонов и сетей', 9990, 'monthly', null, null, null, null, '{"analytics": true, "advanced_reports": true, "api_access": true, "priority_support": true, "multi_location": true, "white_label": true}');

-- Индексы для производительности
CREATE INDEX idx_salon_subscriptions_salon_id ON public.salon_subscriptions(salon_id);
CREATE INDEX idx_salon_subscriptions_status ON public.salon_subscriptions(status);
CREATE INDEX idx_subscription_usage_salon_period ON public.subscription_usage(salon_id, period_start);
CREATE INDEX idx_data_exports_salon_status ON public.data_exports(salon_id, status);
CREATE INDEX idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX idx_staff_commissions_staff_period ON public.staff_commissions(staff_id, period_start);
CREATE INDEX idx_time_tracking_staff_date ON public.time_tracking(staff_id, clock_in);
