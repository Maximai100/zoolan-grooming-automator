import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

interface TelegramMessage {
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  message_id: number;
  from?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

interface WhatsAppMessage {
  from: string;
  id: string;
  text?: {
    body: string;
  };
  type: string;
}

const sendTelegramMessage = async (botToken: string, chatId: number, message: string) => {
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }

  return await response.json();
};

const sendWhatsAppMessage = async (accessToken: string, phoneNumberId: string, to: string, message: string) => {
  const whatsappUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const response = await fetch(whatsappUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status}`);
  }

  return await response.json();
};

const processOutgoingMessage = async (messageId: string) => {
  try {
    // Получаем сообщение с контактом и интеграцией
    const { data: message, error: messageError } = await supabase
      .from('messenger_messages')
      .select(`
        *,
        contact:messenger_contacts(*),
        template:messenger_templates(*)
      `)
      .eq('id', messageId)
      .eq('is_outgoing', true)
      .eq('status', 'pending')
      .single();

    if (messageError || !message) {
      console.error('Message not found:', messageError);
      return;
    }

    // Получаем интеграцию
    const { data: integration, error: integrationError } = await supabase
      .from('messenger_integrations')
      .select('*')
      .eq('salon_id', message.salon_id)
      .eq('platform', message.contact.platform)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      await supabase
        .from('messenger_messages')
        .update({
          status: 'failed',
          error_message: 'Integration not found or inactive'
        })
        .eq('id', messageId);
      return;
    }

    let result;
    let externalMessageId;

    // Отправляем сообщение в зависимости от платформы
    if (message.contact.platform === 'telegram') {
      result = await sendTelegramMessage(
        integration.api_token,
        parseInt(message.contact.external_id),
        message.content
      );
      externalMessageId = result.result?.message_id?.toString();
    } else if (message.contact.platform === 'whatsapp') {
      const settings = integration.settings || {};
      result = await sendWhatsAppMessage(
        integration.api_token,
        settings.phone_number_id,
        message.contact.phone_number,
        message.content
      );
      externalMessageId = result.messages?.[0]?.id;
    }

    // Обновляем статус сообщения
    await supabase
      .from('messenger_messages')
      .update({
        status: 'sent',
        external_message_id: externalMessageId,
        sent_at: new Date().toISOString(),
        metadata: { response: result }
      })
      .eq('id', messageId);

    console.log(`Message sent successfully: ${messageId}`);

  } catch (error) {
    console.error('Error sending message:', error);
    
    // Обновляем статус сообщения на failed
    await supabase
      .from('messenger_messages')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', messageId);
  }
};

const processIncomingWebhook = async (platform: string, webhookData: any) => {
  try {
    if (platform === 'telegram') {
      const message: TelegramMessage = webhookData.message;
      if (!message) return;

      // Найти интеграцию по webhook URL или токену
      const { data: integration } = await supabase
        .from('messenger_integrations')
        .select('*')
        .eq('platform', 'telegram')
        .eq('is_active', true)
        .single();

      if (!integration) {
        console.error('Telegram integration not found');
        return;
      }

      // Создать/обновить контакт
      const { data: contact, error: contactError } = await supabase
        .from('messenger_contacts')
        .upsert({
          salon_id: integration.salon_id,
          platform: 'telegram',
          external_id: message.from?.id.toString(),
          first_name: message.from?.first_name,
          last_name: message.from?.last_name,
          username: message.from?.username,
          last_message_at: new Date().toISOString()
        }, {
          onConflict: 'salon_id,platform,external_id'
        })
        .select()
        .single();

      if (contactError) {
        console.error('Error creating contact:', contactError);
        return;
      }

      // Создать входящее сообщение
      if (message.text) {
        await supabase
          .from('messenger_messages')
          .insert({
            salon_id: integration.salon_id,
            contact_id: contact.id,
            message_type: 'text',
            content: message.text,
            is_outgoing: false,
            external_message_id: message.message_id.toString(),
            status: 'delivered'
          });
      }

    } else if (platform === 'whatsapp') {
      const entry = webhookData.entry?.[0];
      const changes = entry?.changes?.[0];
      const messages = changes?.value?.messages;

      if (!messages || !Array.isArray(messages)) return;

      for (const message of messages) {
        const whatsappMessage: WhatsAppMessage = message;
        
        // Найти интеграцию
        const { data: integration } = await supabase
          .from('messenger_integrations')
          .select('*')
          .eq('platform', 'whatsapp')
          .eq('is_active', true)
          .single();

        if (!integration) {
          console.error('WhatsApp integration not found');
          continue;
        }

        // Создать/обновить контакт
        const { data: contact, error: contactError } = await supabase
          .from('messenger_contacts')
          .upsert({
            salon_id: integration.salon_id,
            platform: 'whatsapp',
            external_id: whatsappMessage.from,
            phone_number: whatsappMessage.from,
            last_message_at: new Date().toISOString()
          }, {
            onConflict: 'salon_id,platform,external_id'
          })
          .select()
          .single();

        if (contactError) {
          console.error('Error creating contact:', contactError);
          continue;
        }

        // Создать входящее сообщение
        if (whatsappMessage.text?.body) {
          await supabase
            .from('messenger_messages')
            .insert({
              salon_id: integration.salon_id,
              contact_id: contact.id,
              message_type: 'text',
              content: whatsappMessage.text.body,
              is_outgoing: false,
              external_message_id: whatsappMessage.id,
              status: 'delivered'
            });
        }
      }
    }

  } catch (error) {
    console.error('Error processing incoming webhook:', error);
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messageId, platform, webhookData } = await req.json();

    if (action === 'send_message' && messageId) {
      await processOutgoingMessage(messageId);
      return new Response(
        JSON.stringify({ success: true, messageId }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (action === 'webhook' && platform && webhookData) {
      await processIncomingWebhook(platform, webhookData);
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or missing parameters' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in messenger handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});