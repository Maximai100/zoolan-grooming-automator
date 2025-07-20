
-- Создание таблиц для расширенной автоматизации маркетинга
CREATE TABLE public.behavioral_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('first_visit', 'inactive_client', 'birthday', 'abandoned_booking', 'post_service')),
  conditions JSONB NOT NULL DEFAULT '{}',
  delay_hours INTEGER DEFAULT 0,
  template_id UUID REFERENCES public.message_templates(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблиц для intake форм
CREATE TABLE public.intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.intake_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.intake_forms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблиц для листов ожидания
CREATE TABLE public.waitlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  notes TEXT,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'notified', 'booked', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблиц для отслеживания незавершенных бронирований
CREATE TABLE public.abandoned_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  client_data JSONB,
  pet_data JSONB,
  service_id UUID REFERENCES public.services(id),
  selected_date DATE,
  selected_time TIME,
  step_completed INTEGER DEFAULT 1,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recovered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблиц для системы рейтингов и отзывов
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание расширенных таблиц аналитики
CREATE TABLE public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  config JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.conversion_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  medium TEXT,
  campaign TEXT,
  client_id UUID REFERENCES public.clients(id),
  appointment_id UUID REFERENCES public.appointments(id),
  conversion_type TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включение RLS для всех новых таблиц
ALTER TABLE public.behavioral_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_tracking ENABLE ROW LEVEL SECURITY;

-- Создание RLS политик
CREATE POLICY "Salon members can manage behavioral triggers"
  ON public.behavioral_triggers FOR ALL
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage intake forms"
  ON public.intake_forms FOR ALL
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can view intake responses"
  ON public.intake_form_responses FOR ALL
  USING (form_id IN (SELECT id FROM intake_forms WHERE salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Salon members can manage waitlists"
  ON public.waitlists FOR ALL
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can view abandoned bookings"
  ON public.abandoned_bookings FOR ALL
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage reviews"
  ON public.reviews FOR ALL
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage dashboard widgets"
  ON public.dashboard_widgets FOR ALL
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can view conversion tracking"
  ON public.conversion_tracking FOR ALL
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

-- Создание триггеров для обновления updated_at
CREATE TRIGGER handle_updated_at_behavioral_triggers
  BEFORE UPDATE ON public.behavioral_triggers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_intake_forms
  BEFORE UPDATE ON public.intake_forms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_waitlists
  BEFORE UPDATE ON public.waitlists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_abandoned_bookings
  BEFORE UPDATE ON public.abandoned_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_reviews
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_dashboard_widgets
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
