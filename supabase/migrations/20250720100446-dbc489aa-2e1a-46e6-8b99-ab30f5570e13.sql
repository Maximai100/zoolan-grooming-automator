-- Создаем таблицу для настроек салона
CREATE TABLE public.salon_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, setting_key)
);

-- Включаем RLS
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;

-- Политика для доступа участников салона
CREATE POLICY "Salon members can manage salon settings"
ON public.salon_settings
FOR ALL
USING (
  salon_id IN (
    SELECT salon_id FROM profiles WHERE id = auth.uid()
  )
);

-- Триггер для обновления updated_at
CREATE TRIGGER update_salon_settings_updated_at
    BEFORE UPDATE ON public.salon_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();