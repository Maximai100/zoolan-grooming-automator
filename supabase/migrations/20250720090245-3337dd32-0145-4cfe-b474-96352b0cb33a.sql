
-- Сначала проверим текущие значения enum
SELECT unnest(enum_range(NULL::user_role)) as role_values;

-- Если super_admin еще нет в enum, добавляем его
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'super_admin';
    END IF;
END $$;

-- Назначаем роль super_admin одному из существующих пользователей-владельцев
-- Выберем первого пользователя с ролью owner
UPDATE profiles 
SET role = 'super_admin'::user_role 
WHERE id = (
    SELECT id FROM profiles 
    WHERE role = 'owner'::user_role 
    LIMIT 1
);

-- Проверяем результат
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE role = 'super_admin'::user_role;
