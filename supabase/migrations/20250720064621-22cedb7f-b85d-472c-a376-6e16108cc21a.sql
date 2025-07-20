-- Создание bucket для фотографий питомцев
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true);

-- Политики для bucket pet-photos
CREATE POLICY "Pet photos are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can upload pet photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pet photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own pet photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

-- Добавляем поле photo_url в таблицу клиентов для аватаров
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;