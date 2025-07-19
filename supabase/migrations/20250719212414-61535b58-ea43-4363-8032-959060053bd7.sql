-- Добавление базовых шаблонов сообщений для демонстрации
DO $$
DECLARE
    salon_uuid UUID;
BEGIN
    -- Получаем первый салон
    SELECT id INTO salon_uuid FROM public.salons LIMIT 1;
    
    IF salon_uuid IS NOT NULL THEN
        -- Добавляем базовые шаблоны сообщений
        INSERT INTO public.message_templates (salon_id, name, type, trigger_event, content, variables, is_active, is_default) VALUES
        (salon_uuid, 'SMS: Подтверждение записи', 'sms', 'appointment_confirmation', 
         'Здравствуйте, {{client_name}}! Ваша запись {{pet_name}} подтверждена на {{appointment_date}} в {{appointment_time}}. Стоимость: {{price}}. {{salon_name}}', 
         '["{{client_name}}", "{{pet_name}}", "{{appointment_date}}", "{{appointment_time}}", "{{price}}", "{{salon_name}}"]'::jsonb, 
         true, true),
         
        (salon_uuid, 'SMS: Напоминание за 24 часа', 'sms', 'reminder_24h',
         'Напоминаем: завтра в {{appointment_time}} запись {{pet_name}} на {{service_name}}. Адрес: {{salon_address}}. {{salon_phone}}',
         '["{{pet_name}}", "{{appointment_time}}", "{{service_name}}", "{{salon_address}}", "{{salon_phone}}"]'::jsonb,
         true, true),
         
        (salon_uuid, 'SMS: Напоминание за 2 часа', 'sms', 'reminder_2h',
         'Через 2 часа запись {{pet_name}} на {{service_name}}. Будем ждать вас в {{appointment_time}}! {{salon_name}}',
         '["{{pet_name}}", "{{service_name}}", "{{appointment_time}}", "{{salon_name}}"]'::jsonb,
         true, true),
         
        (salon_uuid, 'Email: Подтверждение записи', 'email', 'appointment_confirmation',
         'Здравствуйте, {{client_name}}!

Ваша запись успешно подтверждена:

🐾 Питомец: {{pet_name}}
📅 Дата: {{appointment_date}}
⏰ Время: {{appointment_time}}
💇‍♀️ Услуга: {{service_name}}
💰 Стоимость: {{price}}

📍 Адрес: {{salon_address}}
📞 Телефон: {{salon_phone}}

С нетерпением ждем вас!
{{salon_name}}',
         '["{{client_name}}", "{{pet_name}}", "{{appointment_date}}", "{{appointment_time}}", "{{service_name}}", "{{price}}", "{{salon_address}}", "{{salon_phone}}", "{{salon_name}}"]'::jsonb,
         true, true),
         
        (salon_uuid, 'Email: Напоминание за 24 часа', 'email', 'reminder_24h',
         'Здравствуйте, {{client_name}}!

Напоминаем о завтрашней записи:

🐾 {{pet_name}} ждем завтра в {{appointment_time}}
💇‍♀️ Услуга: {{service_name}}
👨‍⚕️ Мастер: {{groomer_name}}

📍 {{salon_address}}
📞 {{salon_phone}}

Если нужно перенести запись, звоните!

С уважением,
{{salon_name}}',
         '["{{client_name}}", "{{pet_name}}", "{{appointment_time}}", "{{service_name}}", "{{groomer_name}}", "{{salon_address}}", "{{salon_phone}}", "{{salon_name}}"]'::jsonb,
         true, true),
         
        (salon_uuid, 'SMS: День рождения питомца', 'sms', 'birthday',
         '🎉 С днем рождения, {{pet_name}}! Поздравляем с праздником! Скидка 15% на любую услугу в этом месяце. {{salon_name}}',
         '["{{pet_name}}", "{{salon_name}}"]'::jsonb,
         true, true),
         
        (salon_uuid, 'WhatsApp: Последующий контакт', 'whatsapp', 'follow_up',
         'Здравствуйте! Как себя чувствует {{pet_name}} после груминга? Будем рады видеть вас снова! {{salon_name}}',
         '["{{pet_name}}", "{{salon_name}}"]'::jsonb,
         true, true);
         
        -- Добавляем базовые настройки уведомлений
        INSERT INTO public.notification_settings (salon_id, type, is_enabled, daily_limit, monthly_limit) VALUES
        (salon_uuid, 'sms', true, 100, 3000),
        (salon_uuid, 'email', true, 500, 15000),
        (salon_uuid, 'whatsapp', false, 50, 1500),
        (salon_uuid, 'telegram', false, 200, 6000);
    END IF;
END $$;