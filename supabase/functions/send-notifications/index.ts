
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
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioFrom = Deno.env.get('TWILIO_FROM_NUMBER');
  
  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.log(`Демо SMS на ${phone}: ${message}`);
    return {
      success: true,
      provider_id: `demo_sms_${Date.now()}`,
      cost: 0.05
    };
  }
  
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: twilioFrom,
        Body: message,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Ошибка отправки SMS');
    }

    return {
      success: true,
      provider_id: data.sid,
      cost: 0.05
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error.message,
      cost: 0
    };
  }
};

const sendEmail = async (email: string, subject: string, content: string) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Зооплан <noreply@zooplan.ru>';
  
  if (!resendApiKey) {
    console.log(`Демо Email на ${email}: ${subject} - ${content}`);
    return {
      success: true,
      provider_id: `demo_email_${Date.now()}`,
      cost: 0.01
    };
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: subject,
        html: content.replace(/\n/g, '<br>'),
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Ошибка отправки Email');
    }

    return {
      success: true,
      provider_id: data.id,
      cost: 0.01
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message,
      cost: 0
    };
  }
};

const sendWhatsApp = async (phone: string, message: string) => {
  const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  
  if (!whatsappToken || !phoneNumberId) {
    console.log(`Демо WhatsApp на ${phone}: ${message}`);
    return {
      success: true,
      provider_id: `demo_wa_${Date.now()}`,
      cost: 0.03
    };
  }
  
  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Ошибка отправки WhatsApp');
    }

    return {
      success: true,
      provider_id: data.messages[0].id,
      cost: 0.03
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return {
      success: false,
      error: error.message,
      cost: 0
    };
  }
};

const sendTelegram = async (chatId: string, message: string) => {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  if (!botToken) {
    console.log(`Демо Telegram в ${chatId}: ${message}`);
    return {
      success: true,
      provider_id: `demo_tg_${Date.now()}`,
      cost: 0.01
    };
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Ошибка отправки Telegram');
    }

    return {
      success: true,
      provider_id: data.result.message_id.toString(),
      cost: 0.01
    };
  } catch (error) {
    console.error('Telegram send error:', error);
    return {
      success: false,
      error: error.message,
      cost: 0
    };
  }
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
