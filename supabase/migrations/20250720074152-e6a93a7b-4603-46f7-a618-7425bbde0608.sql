-- Создаем таблицу тарифных планов
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_clients INTEGER DEFAULT NULL, -- NULL = unlimited
  max_appointments_per_month INTEGER DEFAULT NULL,
  max_notifications_per_month INTEGER DEFAULT NULL,
  max_staff_members INTEGER DEFAULT NULL,
  max_locations INTEGER DEFAULT 1,
  features JSONB DEFAULT '[]'::JSONB, -- список доступных функций
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу подписок салонов
CREATE TABLE public.salon_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id)
);

-- Создаем таблицу для отслеживания использования лимитов
CREATE TABLE public.subscription_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  clients_count INTEGER DEFAULT 0,
  appointments_count INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, period_start)
);

-- Включаем RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Политики для тарифных планов (публичное чтение)
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Политики для подписок салонов
CREATE POLICY "Salon members can view their subscription" 
ON public.salon_subscriptions 
FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Salon owners can manage their subscription" 
ON public.salon_subscriptions 
FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'owner'
));

-- Политики для использования подписок
CREATE POLICY "Salon members can view their usage" 
ON public.subscription_usage 
FOR SELECT 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "System can manage subscription usage" 
ON public.subscription_usage 
FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('owner', 'manager')
));

-- Триггеры для обновления updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_salon_subscriptions_updated_at
  BEFORE UPDATE ON public.salon_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscription_usage_updated_at
  BEFORE UPDATE ON public.subscription_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Добавляем базовые тарифные планы
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_clients, max_appointments_per_month, max_notifications_per_month, max_staff_members, features, sort_order) VALUES
('Стартовый', 'Идеальный план для небольших салонов', 990, 9900, 100, 500, 1000, 3, '["basic_calendar", "client_management", "basic_notifications", "basic_analytics"]', 1),
('Профессиональный', 'Для растущих салонов с расширенными возможностями', 2990, 29900, 500, 2000, 5000, 10, '["advanced_calendar", "client_management", "advanced_notifications", "analytics", "loyalty_programs", "inventory", "staff_management"]', 2),
('Премиум', 'Все возможности для сетей салонов', 5990, 59900, NULL, NULL, NULL, NULL, '["all_features", "multi_location", "api_access", "priority_support", "custom_branding"]', 3);

-- Создаем функцию для проверки лимитов подписки
CREATE OR REPLACE FUNCTION public.check_subscription_limit(
  _salon_id UUID,
  _limit_type TEXT,
  _current_count INTEGER DEFAULT 1
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
  plan_record RECORD;
  usage_record RECORD;
  current_period_start DATE;
  limit_value INTEGER;
BEGIN
  -- Получаем активную подписку салона
  SELECT * INTO subscription_record
  FROM public.salon_subscriptions
  WHERE salon_id = _salon_id
  AND status = 'active'
  AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN false; -- Нет активной подписки
  END IF;
  
  -- Получаем план подписки
  SELECT * INTO plan_record
  FROM public.subscription_plans
  WHERE id = subscription_record.plan_id;
  
  -- Определяем лимит в зависимости от типа
  CASE _limit_type
    WHEN 'clients' THEN limit_value := plan_record.max_clients;
    WHEN 'appointments' THEN limit_value := plan_record.max_appointments_per_month;
    WHEN 'notifications' THEN limit_value := plan_record.max_notifications_per_month;
    WHEN 'staff' THEN limit_value := plan_record.max_staff_members;
    WHEN 'locations' THEN limit_value := plan_record.max_locations;
    ELSE RETURN true; -- Неизвестный тип лимита
  END CASE;
  
  -- NULL означает неограниченно
  IF limit_value IS NULL THEN
    RETURN true;
  END IF;
  
  -- Для месячных лимитов проверяем текущий период
  IF _limit_type IN ('appointments', 'notifications') THEN
    current_period_start := date_trunc('month', now())::DATE;
    
    SELECT * INTO usage_record
    FROM public.subscription_usage
    WHERE salon_id = _salon_id
    AND period_start = current_period_start;
    
    IF NOT FOUND THEN
      -- Создаем запись использования для текущего периода
      INSERT INTO public.subscription_usage (salon_id, period_start, period_end)
      VALUES (_salon_id, current_period_start, (current_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE);
      
      SELECT * INTO usage_record
      FROM public.subscription_usage
      WHERE salon_id = _salon_id
      AND period_start = current_period_start;
    END IF;
    
    -- Проверяем лимит
    CASE _limit_type
      WHEN 'appointments' THEN 
        RETURN (usage_record.appointments_count + _current_count) <= limit_value;
      WHEN 'notifications' THEN 
        RETURN (usage_record.notifications_sent + _current_count) <= limit_value;
    END CASE;
  ELSE
    -- Для общих лимитов проверяем текущее количество
    CASE _limit_type
      WHEN 'clients' THEN
        RETURN (SELECT COUNT(*) FROM public.clients WHERE salon_id = _salon_id) + _current_count <= limit_value;
      WHEN 'staff' THEN
        RETURN (SELECT COUNT(*) FROM public.profiles WHERE salon_id = _salon_id) + _current_count <= limit_value;
      WHEN 'locations' THEN
        RETURN 1 <= limit_value; -- Пока поддерживаем только одну локацию
    END CASE;
  END IF;
  
  RETURN true;
END;
$$;