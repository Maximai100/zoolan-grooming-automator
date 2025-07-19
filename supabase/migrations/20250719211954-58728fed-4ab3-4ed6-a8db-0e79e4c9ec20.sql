-- Создание таблиц для системы уведомлений и напоминаний

-- Таблица шаблонов сообщений
CREATE TABLE public.message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'whatsapp', 'telegram')),
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('appointment_confirmation', 'reminder_24h', 'reminder_2h', 'follow_up', 'birthday', 'no_show')),
  subject TEXT, -- Для email
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Список доступных переменных
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, type, trigger_event, is_default) -- Только один дефолтный шаблон на тип и событие
);

-- Таблица настроек уведомлений
CREATE TABLE public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'whatsapp', 'telegram')),
  is_enabled BOOLEAN DEFAULT true,
  api_key TEXT, -- Зашифрованный API ключ
  api_settings JSONB DEFAULT '{}'::jsonb, -- Дополнительные настройки для каждого провайдера
  daily_limit INTEGER DEFAULT 1000,
  monthly_limit INTEGER DEFAULT 30000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, type)
);

-- Таблица истории отправленных уведомлений
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'whatsapp', 'telegram')),
  trigger_event TEXT NOT NULL,
  template_id UUID REFERENCES public.message_templates(id),
  recipient TEXT NOT NULL, -- Номер телефона или email
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  provider_id TEXT, -- ID сообщения у провайдера
  cost DECIMAL(10,4) DEFAULT 0, -- Стоимость отправки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица A/B тестирования
CREATE TABLE public.ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'whatsapp', 'telegram')),
  trigger_event TEXT NOT NULL,
  template_a_id UUID REFERENCES public.message_templates(id) NOT NULL,
  template_b_id UUID REFERENCES public.message_templates(id) NOT NULL,
  traffic_split INTEGER DEFAULT 50 CHECK (traffic_split BETWEEN 1 AND 99), -- Процент трафика для варианта A
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  success_metric TEXT DEFAULT 'open_rate' CHECK (success_metric IN ('open_rate', 'click_rate', 'conversion_rate')),
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица массовых рассылок
CREATE TABLE public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'whatsapp', 'telegram')),
  template_id UUID REFERENCES public.message_templates(id) NOT NULL,
  target_audience JSONB NOT NULL, -- Критерии отбора клиентов
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включение RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS политики
CREATE POLICY "Salon members can manage message templates" ON public.message_templates
  FOR ALL USING (salon_id IN (SELECT salon_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage notification settings" ON public.notification_settings
  FOR ALL USING (salon_id IN (SELECT salon_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can view notifications" ON public.notifications
  FOR ALL USING (salon_id IN (SELECT salon_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage AB tests" ON public.ab_tests
  FOR ALL USING (salon_id IN (SELECT salon_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage campaigns" ON public.campaigns
  FOR ALL USING (salon_id IN (SELECT salon_id FROM public.profiles WHERE id = auth.uid()));

-- Триггеры для updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Функция для автоматических напоминаний
CREATE OR REPLACE FUNCTION public.send_automatic_reminders()
RETURNS void AS $$
DECLARE
    appointment_record RECORD;
    reminder_24h TIMESTAMP WITH TIME ZONE;
    reminder_2h TIMESTAMP WITH TIME ZONE;
    current_time TIMESTAMP WITH TIME ZONE := now();
BEGIN
    -- Напоминания за 24 часа
    FOR appointment_record IN 
        SELECT a.*, c.phone, c.email, c.first_name, c.last_name, p.name as pet_name, s.name as service_name
        FROM public.appointments a
        JOIN public.clients c ON a.client_id = c.id
        JOIN public.pets p ON a.pet_id = p.id
        JOIN public.services s ON a.service_id = s.id
        WHERE a.status IN ('scheduled', 'confirmed')
        AND (a.scheduled_date + a.scheduled_time::time) - INTERVAL '24 hours' <= current_time
        AND (a.scheduled_date + a.scheduled_time::time) - INTERVAL '23 hours' > current_time
        AND NOT EXISTS (
            SELECT 1 FROM public.notifications n 
            WHERE n.appointment_id = a.id 
            AND n.trigger_event = 'reminder_24h'
            AND n.status != 'failed'
        )
    LOOP
        -- Здесь будет логика отправки напоминания за 24 часа
        -- Создаем запись в notifications для обработки edge function
        INSERT INTO public.notifications (
            salon_id, appointment_id, client_id, type, trigger_event, 
            recipient, content, status
        ) VALUES (
            appointment_record.salon_id,
            appointment_record.id,
            appointment_record.client_id,
            'sms', -- По умолчанию SMS
            'reminder_24h',
            appointment_record.phone,
            format('Напоминание: завтра в %s запись на %s для %s', 
                appointment_record.scheduled_time, 
                appointment_record.service_name, 
                appointment_record.pet_name),
            'pending'
        );
    END LOOP;

    -- Напоминания за 2 часа
    FOR appointment_record IN 
        SELECT a.*, c.phone, c.email, c.first_name, c.last_name, p.name as pet_name, s.name as service_name
        FROM public.appointments a
        JOIN public.clients c ON a.client_id = c.id
        JOIN public.pets p ON a.pet_id = p.id
        JOIN public.services s ON a.service_id = s.id
        WHERE a.status IN ('scheduled', 'confirmed')
        AND (a.scheduled_date + a.scheduled_time::time) - INTERVAL '2 hours' <= current_time
        AND (a.scheduled_date + a.scheduled_time::time) - INTERVAL '1 hour' > current_time
        AND NOT EXISTS (
            SELECT 1 FROM public.notifications n 
            WHERE n.appointment_id = a.id 
            AND n.trigger_event = 'reminder_2h'
            AND n.status != 'failed'
        )
    LOOP
        -- Создаем запись в notifications для обработки edge function
        INSERT INTO public.notifications (
            salon_id, appointment_id, client_id, type, trigger_event, 
            recipient, content, status
        ) VALUES (
            appointment_record.salon_id,
            appointment_record.id,
            appointment_record.client_id,
            'sms', -- По умолчанию SMS
            'reminder_2h',
            appointment_record.phone,
            format('Напоминание: через 2 часа запись на %s для %s по адресу: %s', 
                appointment_record.service_name, 
                appointment_record.pet_name,
                'г. Москва, ул. Примерная, д. 1'),
            'pending'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;