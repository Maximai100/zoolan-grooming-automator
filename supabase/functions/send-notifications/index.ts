
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'sms' | 'email' | 'whatsapp' | 'telegram';
  recipient: string;
  content: string;
  subject?: string;
  template_id?: string;
  client_id?: string;
  appointment_id?: string;
  trigger_event?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const sendSMS = async (phone: string, message: string) => {
  // Здесь должна быть интеграция с SMS провайдером (например, Twilio)
  console.log(`Отправка SMS на ${phone}: ${message}`);
  
  // Для демо - просто возвращаем успех
  return {
    success: true,
    provider_id: `sms_${Date.now()}`,
    cost: 0.05 // Примерная стоимость SMS
  };
};

const sendEmail = async (email: string, subject: string, content: string) => {
  // Здесь должна быть интеграция с email провайдером (например, Resend)
  console.log(`Отправка Email на ${email}:`);
  console.log(`Тема: ${subject}`);
  console.log(`Содержание: ${content}`);
  
  // Для демо - просто возвращаем успех
  return {
    success: true,
    provider_id: `email_${Date.now()}`,
    cost: 0.01 // Примерная стоимость Email
  };
};

const sendWhatsApp = async (phone: string, message: string) => {
  // Здесь должна быть интеграция с WhatsApp Business API
  console.log(`Отправка WhatsApp на ${phone}: ${message}`);
  
  // Для демо - просто возвращаем успех
  return {
    success: true,
    provider_id: `wa_${Date.now()}`,
    cost: 0.03 // Примерная стоимость WhatsApp
  };
};

const sendTelegram = async (chatId: string, message: string) => {
  // Здесь должна быть интеграция с Telegram Bot API
  console.log(`Отправка Telegram в ${chatId}: ${message}`);
  
  // Для демо - просто возвращаем успех
  return {
    success: true,
    provider_id: `tg_${Date.now()}`,
    cost: 0.01 // Примерная стоимость Telegram
  };
};

const replaceVariables = (content: string, variables: any = {}) => {
  let result = content;
  
  // Замена переменных в тексте
  const variableMap = {
    '{{client_name}}': variables.client_name || '',
    '{{pet_name}}': variables.pet_name || '',
    '{{service_name}}': variables.service_name || '',
    '{{appointment_time}}': variables.appointment_time || '',
    '{{appointment_date}}': variables.appointment_date || '',
    '{{salon_name}}': variables.salon_name || 'Зооплан',
    '{{salon_address}}': variables.salon_address || '',
    '{{salon_phone}}': variables.salon_phone || '',
  };
  
  Object.entries(variableMap).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, 'g'), value);
  });
  
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      recipient, 
      content, 
      subject, 
      template_id,
      client_id,
      appointment_id,
      trigger_event = 'manual'
    }: NotificationRequest = await req.json();

    console.log(`Получен запрос на отправку ${type} уведомления`);

    // Получаем информацию о пользователе из заголовков
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Необходима авторизация');
    }

    // Получаем пользователя
    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !userData.user) {
      throw new Error('Ошибка авторизации');
    }

    // Получаем профиль пользователя для salon_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.salon_id) {
      throw new Error('Салон не найден');
    }

    // Подготавливаем переменные для замены
    let variables = {};
    
    if (appointment_id) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          clients(first_name, last_name),
          pets(name),
          services(name),
          salons(name, address, phone)
        `)
        .eq('id', appointment_id)
        .single();
      
      if (appointment) {
        variables = {
          client_name: `${appointment.clients?.first_name} ${appointment.clients?.last_name}`,
          pet_name: appointment.pets?.name,
          service_name: appointment.services?.name,
          appointment_time: appointment.scheduled_time,
          appointment_date: appointment.scheduled_date,
          salon_name: appointment.salons?.name,
          salon_address: appointment.salons?.address,
          salon_phone: appointment.salons?.phone,
        };
      }
    }

    // Заменяем переменные в тексте
    const processedContent = replaceVariables(content, variables);
    const processedSubject = subject ? replaceVariables(subject, variables) : undefined;

    // Создаем запись уведомления
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        salon_id: profile.salon_id,
        client_id,
        appointment_id,
        type,
        trigger_event,
        template_id,
        recipient,
        subject: processedSubject,
        content: processedContent,
        status: 'pending'
      })
      .select()
      .single();

    if (notificationError) {
      throw new Error(`Ошибка создания уведомления: ${notificationError.message}`);
    }

    // Отправляем уведомление
    let result;
    try {
      switch (type) {
        case 'sms':
          result = await sendSMS(recipient, processedContent);
          break;
        case 'email':
          result = await sendEmail(recipient, processedSubject || 'Уведомление', processedContent);
          break;
        case 'whatsapp':
          result = await sendWhatsApp(recipient, processedContent);
          break;
        case 'telegram':
          result = await sendTelegram(recipient, processedContent);
          break;
        default:
          throw new Error(`Неподдерживаемый тип уведомления: ${type}`);
      }

      // Обновляем статус уведомления
      await supabase
        .from('notifications')
        .update({
          status: result.success ? 'sent' : 'failed',
          provider_id: result.provider_id,
          cost: result.cost,
          sent_at: result.success ? new Date().toISOString() : null,
          error_message: result.success ? null : result.error
        })
        .eq('id', notification.id);

      return new Response(JSON.stringify({
        success: result.success,
        notification_id: notification.id,
        message: result.success ? 'Уведомление отправлено' : 'Ошибка отправки'
      }), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (sendError) {
      // Обновляем статус на ошибку
      await supabase
        .from('notifications')
        .update({
          status: 'failed',
          error_message: sendError.message
        })
        .eq('id', notification.id);

      throw sendError;
    }

  } catch (error) {
    console.error('Ошибка в send-notifications function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
