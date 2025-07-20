-- Добавляем политику для создания профилей сотрудников
CREATE POLICY "Salon owners can create staff profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Разрешаем владельцам салонов создавать профили сотрудников для своего салона
  salon_id IN (
    SELECT salon_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('owner', 'manager')
  )
);

-- Также добавляем политику для просмотра профилей сотрудников того же салона
CREATE POLICY "Salon members can view salon profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Пользователи могут видеть профили сотрудников своего салона
  salon_id IN (
    SELECT salon_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);