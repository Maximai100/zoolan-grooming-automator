-- Add marketing campaigns and client segmentation enhancements

-- Add campaign triggers and automation
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS auto_trigger_event TEXT,
ADD COLUMN IF NOT EXISTS trigger_conditions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS send_at_time TIME;

-- Add marketing automation for birthdays and other events
CREATE TABLE IF NOT EXISTS public.marketing_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.profiles(salon_id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'birthday', 'last_visit', 'no_visits', 'high_value'
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  template_id UUID REFERENCES public.message_templates(id),
  campaign_template JSONB, -- template for creating campaigns
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add automated campaign runs tracking
CREATE TABLE IF NOT EXISTS public.campaign_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES public.marketing_automation(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id),
  target_clients INTEGER NOT NULL DEFAULT 0,
  successful_sends INTEGER DEFAULT 0,
  failed_sends INTEGER DEFAULT 0,
  run_date TIMESTAMP WITH TIME ZONE NOT NULL,
  execution_time_ms INTEGER,
  error_message TEXT,
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS policies for marketing automation
ALTER TABLE public.marketing_automation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon members can manage marketing automation"
  ON public.marketing_automation
  FOR ALL
  USING (salon_id IN (
    SELECT profiles.salon_id FROM profiles 
    WHERE profiles.id = auth.uid()
  ));

ALTER TABLE public.campaign_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon members can view campaign runs"
  ON public.campaign_runs
  FOR ALL
  USING (automation_id IN (
    SELECT ma.id FROM public.marketing_automation ma
    JOIN profiles p ON p.salon_id = ma.salon_id
    WHERE p.id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_marketing_automation_updated_at
  BEFORE UPDATE ON public.marketing_automation
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create automated campaigns for birthdays
CREATE OR REPLACE FUNCTION public.create_birthday_campaigns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  automation_record RECORD;
  birthday_clients RECORD;
  campaign_id UUID;
  client_count INTEGER;
BEGIN
  -- Find active birthday automations
  FOR automation_record IN 
    SELECT * FROM public.marketing_automation 
    WHERE trigger_type = 'birthday' 
    AND is_active = true
    AND (next_run_at IS NULL OR next_run_at <= now())
  LOOP
    client_count := 0;
    
    -- Count clients with birthdays in the next week
    SELECT COUNT(*) INTO client_count
    FROM public.clients c
    WHERE c.salon_id = automation_record.salon_id
    AND EXTRACT(MONTH FROM c.date_of_birth) = EXTRACT(MONTH FROM (now() + INTERVAL '7 days'))
    AND EXTRACT(DAY FROM c.date_of_birth) = EXTRACT(DAY FROM (now() + INTERVAL '7 days'));
    
    IF client_count > 0 THEN
      -- Create birthday campaign
      INSERT INTO public.campaigns (
        salon_id, name, description, type, template_id,
        target_audience, scheduled_at, total_recipients, status
      ) VALUES (
        automation_record.salon_id,
        'День рождения питомцев - ' || to_char(now() + INTERVAL '7 days', 'DD.MM.YYYY'),
        'Автоматическая рассылка поздравлений с днем рождения питомцев',
        'automated_birthday',
        automation_record.template_id,
        jsonb_build_object(
          'segment_type', 'birthday',
          'target_date', (now() + INTERVAL '7 days')::date
        ),
        now() + INTERVAL '7 days',
        client_count,
        'scheduled'
      ) RETURNING id INTO campaign_id;
      
      -- Record the campaign run
      INSERT INTO public.campaign_runs (
        automation_id, campaign_id, target_clients, run_date, status
      ) VALUES (
        automation_record.id, campaign_id, client_count, now(), 'completed'
      );
    END IF;
    
    -- Update next run time (weekly check)
    UPDATE public.marketing_automation 
    SET 
      last_run_at = now(),
      next_run_at = now() + INTERVAL '1 week'
    WHERE id = automation_record.id;
  END LOOP;
END;
$$;

-- Function to create campaigns for clients who haven't visited recently
CREATE OR REPLACE FUNCTION public.create_retention_campaigns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  automation_record RECORD;
  inactive_clients RECORD;
  campaign_id UUID;
  client_count INTEGER;
  days_threshold INTEGER;
BEGIN
  -- Find active retention automations
  FOR automation_record IN 
    SELECT * FROM public.marketing_automation 
    WHERE trigger_type = 'no_visits' 
    AND is_active = true
    AND (next_run_at IS NULL OR next_run_at <= now())
  LOOP
    days_threshold := COALESCE((automation_record.trigger_conditions->>'days_since_last_visit')::INTEGER, 30);
    
    -- Count clients who haven't visited recently
    SELECT COUNT(*) INTO client_count
    FROM public.clients c
    WHERE c.salon_id = automation_record.salon_id
    AND (c.last_visit_date IS NULL OR c.last_visit_date < now() - (days_threshold || ' days')::INTERVAL);
    
    IF client_count > 0 THEN
      -- Create retention campaign
      INSERT INTO public.campaigns (
        salon_id, name, description, type, template_id,
        target_audience, scheduled_at, total_recipients, status
      ) VALUES (
        automation_record.salon_id,
        'Верните клиентов - ' || to_char(now(), 'DD.MM.YYYY'),
        'Автоматическая рассылка для возврата неактивных клиентов',
        'automated_retention',
        automation_record.template_id,
        jsonb_build_object(
          'segment_type', 'inactive_clients',
          'days_threshold', days_threshold
        ),
        now(),
        client_count,
        'scheduled'
      ) RETURNING id INTO campaign_id;
      
      -- Record the campaign run
      INSERT INTO public.campaign_runs (
        automation_id, campaign_id, target_clients, run_date, status
      ) VALUES (
        automation_record.id, campaign_id, client_count, now(), 'completed'
      );
    END IF;
    
    -- Update next run time (monthly check for retention)
    UPDATE public.marketing_automation 
    SET 
      last_run_at = now(),
      next_run_at = now() + INTERVAL '1 month'
    WHERE id = automation_record.id;
  END LOOP;
END;
$$;