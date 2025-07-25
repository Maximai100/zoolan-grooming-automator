-- Создаем bucket для фотографий питомцев
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);

-- Создаем таблицу для фотографий визитов
CREATE TABLE public.appointment_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.appointment_photos ENABLE ROW LEVEL SECURITY;

-- Создаем политики для фотографий
CREATE POLICY "Users can view appointment photos for their salon" 
ON public.appointment_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_photos.appointment_id 
    AND a.salon_id IN (
      SELECT salon_id FROM public.staff WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert appointment photos for their salon" 
ON public.appointment_photos 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_photos.appointment_id 
    AND a.salon_id IN (
      SELECT salon_id FROM public.staff WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete appointment photos for their salon" 
ON public.appointment_photos 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_photos.appointment_id 
    AND a.salon_id IN (
      SELECT salon_id FROM public.staff WHERE user_id = auth.uid()
    )
  )
);

-- Создаем политики для storage
CREATE POLICY "Pet photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can upload pet photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'pet-photos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their pet photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'pet-photos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their pet photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'pet-photos' 
  AND auth.uid() IS NOT NULL
);

-- Добавляем индексы для производительности
CREATE INDEX idx_appointment_photos_appointment_id ON public.appointment_photos(appointment_id);
CREATE INDEX idx_appointment_photos_type ON public.appointment_photos(photo_type);