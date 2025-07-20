-- Добавляем базовые услуги в систему

-- Получаем первый салон для добавления услуг
DO $$
DECLARE
    default_salon_id UUID;
BEGIN
    -- Находим первый салон
    SELECT id INTO default_salon_id FROM public.salons ORDER BY created_at LIMIT 1;
    
    -- Если салон найден, добавляем базовые услуги
    IF default_salon_id IS NOT NULL THEN
        INSERT INTO public.services (salon_id, name, description, category, price, duration_minutes, is_active) VALUES
        
        -- Груминг услуги
        (default_salon_id, 'Полный груминг собак', 'Мытье, сушка, стрижка, гигиена когтей и ушей', 'grooming', 3500, 120, true),
        (default_salon_id, 'Полный груминг кошек', 'Мытье, сушка, стрижка, гигиена когтей', 'grooming', 2500, 90, true),
        (default_salon_id, 'Экспресс груминг', 'Базовая стрижка и гигиена', 'grooming', 2000, 60, true),
        
        -- Мытье
        (default_salon_id, 'Мытье собак малых пород', 'Мытье профессиональными шампунями', 'bathing', 800, 30, true),
        (default_salon_id, 'Мытье собак средних пород', 'Мытье профессиональными шампунями', 'bathing', 1200, 45, true),
        (default_salon_id, 'Мытье собак крупных пород', 'Мытье профессиональными шампунями', 'bathing', 1800, 60, true),
        
        -- Стрижка
        (default_salon_id, 'Модельная стрижка', 'Стильная стрижка по стандартам породы', 'trimming', 2500, 90, true),
        (default_salon_id, 'Гигиеническая стрижка', 'Стрижка интимных зон и лап', 'trimming', 800, 30, true),
        (default_salon_id, 'Стрижка когтей', 'Подрезание когтей специальными кусачками', 'trimming', 500, 15, true),
        
        -- SPA процедуры
        (default_salon_id, 'SPA-программа "Релакс"', 'Ароматерапия, массаж, маски для шерсти', 'spa', 4000, 120, true),
        (default_salon_id, 'Чистка зубов', 'Ультразвуковая чистка зубов', 'dental_care', 1500, 45, true),
        (default_salon_id, 'Маска для шерсти', 'Восстанавливающая маска для блеска шерсти', 'spa', 1200, 30, true),
        
        -- Уход за когтями
        (default_salon_id, 'Педикюр для собак', 'Полный уход за лапами и когтями', 'nail_care', 800, 30, true),
        (default_salon_id, 'Покрытие когтей', 'Защитное покрытие для когтей', 'nail_care', 600, 20, true),
        
        -- Дополнительные услуги
        (default_salon_id, 'Вывоз питомца', 'Доставка питомца в салон и обратно', 'additional', 1000, 30, true),
        (default_salon_id, 'Экспресс-сушка', 'Быстрая сушка после мытья', 'additional', 500, 15, true),
        (default_salon_id, 'Фотосессия после груминга', 'Профессиональные фото вашего питомца', 'additional', 1500, 30, true);
    END IF;
END $$;