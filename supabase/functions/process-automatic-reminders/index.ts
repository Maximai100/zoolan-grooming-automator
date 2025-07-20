
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const processReminders = async () => {
  console.log('Запуск обработки автоматических напоминаний...');
  
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  // Получаем записи для напоминаний за 24 часа
  const { data: appointments24h } = await supabase
    .from('appointments')
    .select(`
      *,
      clients(first_name, last_name, phone, email),
      pets(name),
      services(name),
      salons(name, address, phone)
    `)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_date', now.toISOString().split('T')[0])
    .lte('scheduled_date', in24Hours.toISOString().split('T')[0]);

  // Получаем записи для напоминаний за 2 часа
  const { data: appointments2h } = await supabase
    .from('appointments')
    .select(`
      *,
      clients(first_name, last_name, phone, email),
      pets(name),
      services(name),
      salons(name, address, phone)
    `)
    .in('status', ['scheduled', 'confirmed'])
    .eq('scheduled_date', now.toISOString().split('T')[0]);

  let processed = 0;

  // Обработка напоминаний за 24 часа
  if (appointments24h) {
    for (const appointment of appointments24h) {
      const appointmentDateTime = new Date(`${appointment.scheduled_date}T${appointment.scheduled_time}`);
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);

      // Проверяем, что запись через 23-25 часов
      if (hoursUntil >= 23 && hoursUntil <= 25) {
        // Проверяем, не отправляли ли уже напоминание
        const { data: existingReminder } = await supabase
          .from('notifications')
          .select('id')
          .eq('appointment_id', appointment.id)
          .eq('trigger_event', 'reminder_24h')
          .neq('status', 'failed');

        if (!existingReminder || existingReminder.length === 0) {
          // Получаем шаблон для напоминания за 24 часа
          const { data: template } = await supabase
            .from('message_templates')
            .select('*')
            .eq('salon_id', appointment.salon_id)
            .eq('type', 'sms')
            .eq('trigger_event', 'reminder_24h')
            .eq('is_active', true)
            .single();

          const content = template?.content || 
            `Напоминание: завтра в ${appointment.scheduled_time} у вас запись на ${appointment.services?.name} для ${appointment.pets?.name}. Салон: ${appointment.salons?.name}, ${appointment.salons?.address}`;

          // Создаем уведомление
          await supabase
            .from('notifications')
            .insert({
              salon_id: appointment.salon_id,
              appointment_id: appointment.id,
              client_id: appointment.client_id,
              type: 'sms',
              trigger_event: 'reminder_24h',
              template_id: template?.id,
              recipient: appointment.clients?.phone,
              content,
              status: 'pending'
            });

          processed++;
        }
      }
    }
  }

  // Обработка напоминаний за 2 часа
  if (appointments2h) {
    for (const appointment of appointments2h) {
      const appointmentDateTime = new Date(`${appointment.scheduled_date}T${appointment.scheduled_time}`);
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);

      // Проверяем, что запись через 1.5-2.5 часа
      if (hoursUntil >= 1.5 && hoursUntil <= 2.5) {
        // Проверяем, не отправляли ли уже напоминание
        const { data: existingReminder } = await supabase
          .from('notifications')
          .select('id')
          .eq('appointment_id', appointment.id)
          .eq('trigger_event', 'reminder_2h')
          .neq('status', 'failed');

        if (!existingReminder || existingReminder.length === 0) {
          // Получаем шаблон для напоминания за 2 часа
          const { data: template } = await supabase
            .from('message_templates')
            .select('*')
            .eq('salon_id', appointment.salon_id)
            .eq('type', 'sms')
            .eq('trigger_event', 'reminder_2h')
            .eq('is_active', true)
            .single();

          const content = template?.content || 
            `Напоминание: через 2 часа у вас запись на ${appointment.services?.name} для ${appointment.pets?.name}. Время: ${appointment.scheduled_time}. Адрес: ${appointment.salons?.address}`;

          // Создаем уведомление
          await supabase
            .from('notifications')
            .insert({
              salon_id: appointment.salon_id,
              appointment_id: appointment.id,
              client_id: appointment.client_id,
              type: 'sms',
              trigger_event: 'reminder_2h',
              template_id: template?.id,
              recipient: appointment.clients?.phone,
              content,
              status: 'pending'
            });

          processed++;
        }
      }
    }
  }

  console.log(`Обработано ${processed} автоматических напоминаний`);
  return processed;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const processed = await processReminders();
    
    return new Response(JSON.stringify({
      success: true,
      processed,
      message: `Обработано ${processed} напоминаний`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Ошибка обработки напоминаний:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
