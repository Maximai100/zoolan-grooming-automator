-- Обновляем функцию создания профиля для автоматической привязки к салону
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    default_salon_id UUID;
BEGIN
    -- Находим первый доступный салон или создаем новый
    SELECT id INTO default_salon_id FROM public.salons ORDER BY created_at LIMIT 1;
    
    -- Если салонов нет, создаем тестовый
    IF default_salon_id IS NULL THEN
        INSERT INTO public.salons (name, description, address, phone, email, owner_id)
        VALUES (
            'Салон груминга "Лапки"',
            'Профессиональный груминг для ваших питомцев',
            'г. Москва, ул. Примерная, д. 1',
            '+7 (495) 123-45-67',
            'info@lapki-salon.ru',
            new.id
        )
        RETURNING id INTO default_salon_id;
    END IF;
    
    -- Создаем профиль пользователя с привязкой к салону
    INSERT INTO public.profiles (id, email, first_name, last_name, salon_id, role)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        default_salon_id,
        'owner'
    );
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;