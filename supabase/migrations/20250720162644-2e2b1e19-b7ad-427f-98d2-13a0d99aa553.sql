-- Исправляем политику для создания профилей сотрудников
-- Удаляем старую политику
DROP POLICY IF EXISTS "profiles_insert_staff" ON public.profiles;

-- Создаем новую политику, которая позволяет создавать профили для новых пользователей
CREATE POLICY "profiles_insert_new_users" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Разрешаем создание собственного профиля
  auth.uid() = id
  OR
  -- Разрешаем владельцам и менеджерам создавать профили для своего салона
  (salon_id = public.get_current_user_salon_id() 
   AND public.get_current_user_role() IN ('owner', 'manager'))
);

-- Также добавим политику для автоматического создания профилей через триггер
CREATE POLICY "profiles_insert_system" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);