-- Удаляем проблемные политики, которые создают рекурсию
DROP POLICY IF EXISTS "Salon owners can create staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Salon members can view salon profiles" ON public.profiles;

-- Создаем security definer функцию для получения salon_id текущего пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_salon_id()
RETURNS UUID AS $$
  SELECT salon_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Создаем security definer функцию для получения роли текущего пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Теперь создаем корректные политики без рекурсии
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Salon members can view colleagues profiles" 
ON public.profiles 
FOR SELECT 
USING (
  salon_id = public.get_current_user_salon_id()
);

CREATE POLICY "Salon owners can create staff profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  salon_id = public.get_current_user_salon_id() 
  AND public.get_current_user_role() IN ('owner', 'manager')
);