-- Создаем таблицы для учета рабочего времени
CREATE TABLE IF NOT EXISTS public.staff_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to UUID,
  created_by UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  content TEXT NOT NULL,
  channel_type TEXT DEFAULT 'general',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  shift_id UUID,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  break_time_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS политики для staff_shifts
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon members can manage shifts"
ON public.staff_shifts
FOR ALL
USING (salon_id IN (
  SELECT salon_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS политики для staff_tasks
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon members can manage tasks"
ON public.staff_tasks
FOR ALL
USING (salon_id IN (
  SELECT salon_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS политики для staff_messages
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon members can manage messages"
ON public.staff_messages
FOR ALL
USING (salon_id IN (
  SELECT salon_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS политики для time_tracking
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon members can manage time tracking"
ON public.time_tracking
FOR ALL
USING (salon_id IN (
  SELECT salon_id FROM public.profiles WHERE id = auth.uid()
));

-- Триггеры для updated_at
CREATE TRIGGER update_staff_shifts_updated_at
BEFORE UPDATE ON public.staff_shifts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_staff_tasks_updated_at
BEFORE UPDATE ON public.staff_tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_time_tracking_updated_at
BEFORE UPDATE ON public.time_tracking
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();