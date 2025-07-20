-- Удаляем ВСЕ существующие политики для таблицы profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Salon owners can create staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Salon members can view salon profiles" ON public.profiles;
DROP POLICY IF EXISTS "Salon members can view colleagues profiles" ON public.profiles;

-- Создаем security definer функции
CREATE OR REPLACE FUNCTION public.get_current_user_salon_id()
RETURNS UUID AS $$
  SELECT salon_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Создаем новые корректные политики
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "profiles_select_salon_members" 
ON public.profiles 
FOR SELECT 
USING (
  salon_id = public.get_current_user_salon_id()
);

CREATE POLICY "profiles_insert_staff" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  salon_id = public.get_current_user_salon_id() 
  AND public.get_current_user_role() IN ('owner', 'manager')
);