-- Создаем таблицу для интеграций мессенджеров
CREATE TABLE public.messenger_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram', 'viber')),
  is_active BOOLEAN DEFAULT false,
  api_token TEXT,
  webhook_url TEXT,
  phone_number TEXT, -- Для WhatsApp Business API
  bot_username TEXT, -- Для Telegram
  settings JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, platform)
);

-- Создаем таблицу для чатов и контактов мессенджеров
CREATE TABLE public.messenger_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  client_id UUID,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL, -- ID пользователя в мессенджере
  phone_number TEXT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_photo_url TEXT,
  is_blocked BOOLEAN DEFAULT false,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, platform, external_id)
);

-- Создаем таблицу для сообщений мессенджеров
CREATE TABLE public.messenger_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.messenger_contacts(id),
  client_id UUID,
  appointment_id UUID,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'document', 'location', 'contact', 'template')),
  content TEXT,
  media_url TEXT,
  template_id UUID,
  is_outgoing BOOLEAN NOT NULL,
  external_message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для шаблонов сообщений мессенджеров
CREATE TABLE public.messenger_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  integration_id UUID NOT NULL REFERENCES public.messenger_integrations(id),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('appointment_reminder', 'appointment_confirmation', 'promotional', 'follow_up', 'birthday')),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  media_type TEXT CHECK (media_type IN ('none', 'image', 'document')),
  media_url TEXT,
  is_active BOOLEAN DEFAULT true,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  external_template_id TEXT, -- ID шаблона в мессенджере
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для автоматических правил отправки
CREATE TABLE public.messenger_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  integration_id UUID NOT NULL REFERENCES public.messenger_integrations(id),
  rule_name TEXT NOT NULL,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('appointment_created', 'appointment_reminder_24h', 'appointment_reminder_2h', 'appointment_completed', 'client_birthday', 'no_show')),
  template_id UUID REFERENCES public.messenger_templates(id),
  conditions JSONB DEFAULT '{}', -- Условия для применения правила
  is_active BOOLEAN DEFAULT true,
  delay_minutes INTEGER DEFAULT 0, -- Задержка перед отправкой
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.messenger_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messenger_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messenger_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messenger_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messenger_automation_rules ENABLE ROW LEVEL SECURITY;

-- Политики для интеграций мессенджеров
CREATE POLICY "Salon members can manage messenger integrations" 
ON public.messenger_integrations 
FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Политики для контактов мессенджеров
CREATE POLICY "Salon members can manage messenger contacts" 
ON public.messenger_contacts 
FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Политики для сообщений мессенджеров
CREATE POLICY "Salon members can manage messenger messages" 
ON public.messenger_messages 
FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Политики для шаблонов мессенджеров
CREATE POLICY "Salon members can manage messenger templates" 
ON public.messenger_templates 
FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Политики для правил автоматизации
CREATE POLICY "Salon members can manage automation rules" 
ON public.messenger_automation_rules 
FOR ALL 
USING (salon_id IN (
  SELECT profiles.salon_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Триггеры для обновления updated_at
CREATE TRIGGER update_messenger_integrations_updated_at
  BEFORE UPDATE ON public.messenger_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_messenger_contacts_updated_at
  BEFORE UPDATE ON public.messenger_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_messenger_templates_updated_at
  BEFORE UPDATE ON public.messenger_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_messenger_automation_rules_updated_at
  BEFORE UPDATE ON public.messenger_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Функция для отправки сообщений через мессенджеры
CREATE OR REPLACE FUNCTION public.send_messenger_notification(
  _salon_id UUID,
  _client_id UUID,
  _platform TEXT,
  _template_id UUID,
  _variables JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  integration_record RECORD;
  contact_record RECORD;
  template_record RECORD;
  message_content TEXT;
  message_id UUID;
BEGIN
  -- Получаем интеграцию
  SELECT * INTO integration_record
  FROM public.messenger_integrations
  WHERE salon_id = _salon_id
  AND platform = _platform
  AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Активная интеграция % не найдена для салона %', _platform, _salon_id;
  END IF;
  
  -- Получаем контакт клиента
  SELECT * INTO contact_record
  FROM public.messenger_contacts
  WHERE salon_id = _salon_id
  AND client_id = _client_id
  AND platform = _platform
  AND is_blocked = false;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Контакт клиента в % не найден или заблокирован', _platform;
  END IF;
  
  -- Получаем шаблон сообщения
  SELECT * INTO template_record
  FROM public.messenger_templates
  WHERE id = _template_id
  AND is_active = true
  AND approval_status = 'approved';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Активный шаблон сообщения не найден';
  END IF;
  
  -- Заменяем переменные в шаблоне
  message_content := template_record.content;
  
  -- Простая замена переменных (можно улучшить)
  IF _variables ? 'client_name' THEN
    message_content := replace(message_content, '{client_name}', _variables->>'client_name');
  END IF;
  
  IF _variables ? 'appointment_date' THEN
    message_content := replace(message_content, '{appointment_date}', _variables->>'appointment_date');
  END IF;
  
  IF _variables ? 'appointment_time' THEN
    message_content := replace(message_content, '{appointment_time}', _variables->>'appointment_time');
  END IF;
  
  IF _variables ? 'service_name' THEN
    message_content := replace(message_content, '{service_name}', _variables->>'service_name');
  END IF;
  
  -- Создаем запись сообщения
  INSERT INTO public.messenger_messages (
    salon_id, contact_id, client_id, message_type, content,
    template_id, is_outgoing, status
  ) VALUES (
    _salon_id, contact_record.id, _client_id, 'template', message_content,
    _template_id, true, 'pending'
  ) RETURNING id INTO message_id;
  
  -- Здесь будет вызов edge функции для отправки сообщения
  -- TODO: Реализовать edge функцию для отправки
  
  RETURN message_id;
END;
$$;

-- Функция для обработки входящих webhook'ов
CREATE OR REPLACE FUNCTION public.process_messenger_webhook(
  _salon_id UUID,
  _platform TEXT,
  _webhook_data JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contact_id UUID;
  message_id UUID;
BEGIN
  -- Здесь будет логика обработки входящих сообщений
  -- В зависимости от платформы (_platform) парсим данные webhook'а
  
  -- Пример для Telegram (упрощенно)
  IF _platform = 'telegram' THEN
    -- Создаем/обновляем контакт
    INSERT INTO public.messenger_contacts (
      salon_id, platform, external_id, first_name, username
    ) VALUES (
      _salon_id, 
      _platform,
      (_webhook_data->'message'->'from'->>'id'),
      (_webhook_data->'message'->'from'->>'first_name'),
      (_webhook_data->'message'->'from'->>'username')
    )
    ON CONFLICT (salon_id, platform, external_id)
    DO UPDATE SET
      first_name = EXCLUDED.first_name,
      username = EXCLUDED.username,
      last_message_at = now()
    RETURNING id INTO contact_id;
    
    -- Создаем запись входящего сообщения
    INSERT INTO public.messenger_messages (
      salon_id, contact_id, message_type, content, is_outgoing,
      external_message_id, status
    ) VALUES (
      _salon_id,
      contact_id,
      'text',
      (_webhook_data->'message'->>'text'),
      false,
      (_webhook_data->'message'->>'message_id'),
      'delivered'
    ) RETURNING id INTO message_id;
  END IF;
  
  RETURN message_id;
END;
$$;

-- Индексы для производительности
CREATE INDEX idx_messenger_contacts_salon_platform ON public.messenger_contacts(salon_id, platform);
CREATE INDEX idx_messenger_contacts_client_id ON public.messenger_contacts(client_id);
CREATE INDEX idx_messenger_messages_contact_id ON public.messenger_messages(contact_id);
CREATE INDEX idx_messenger_messages_created_at ON public.messenger_messages(created_at);
CREATE INDEX idx_messenger_templates_salon_type ON public.messenger_templates(salon_id, template_type);