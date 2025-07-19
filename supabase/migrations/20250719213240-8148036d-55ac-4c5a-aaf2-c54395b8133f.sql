-- Этап 6: Маркетинг и лояльность

-- Таблица для программы лояльности и баллов
CREATE TABLE public.loyalty_programs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('points', 'visits', 'amount_spent')),
    points_per_ruble NUMERIC(10,2) DEFAULT 1, -- баллы за рубль
    points_per_visit INTEGER DEFAULT 1, -- баллы за визит
    min_redemption_points INTEGER DEFAULT 100, -- минимум баллов для списания
    point_value NUMERIC(10,4) DEFAULT 0.01, -- стоимость одного балла в рублях
    bonus_multiplier NUMERIC(3,2) DEFAULT 1.0, -- множитель для особых акций
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    terms_and_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для баланса баллов клиентов
CREATE TABLE public.client_loyalty_balances (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    program_id UUID NOT NULL,
    current_points INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_redeemed INTEGER DEFAULT 0,
    tier_level TEXT DEFAULT 'bronze' CHECK (tier_level IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(client_id, program_id)
);

-- Таблица для транзакций по баллам
CREATE TABLE public.loyalty_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    program_id UUID NOT NULL,
    order_id UUID, -- связь с заказом, если применимо
    appointment_id UUID, -- связь с записью, если применимо
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjustment')),
    points_amount INTEGER NOT NULL,
    description TEXT,
    reference_id TEXT, -- внешний ID для трекинга
    processed_by UUID, -- кто обработал (для adjustment)
    expires_at TIMESTAMP WITH TIME ZONE, -- когда истекают заработанные баллы
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для персональных предложений и купонов
CREATE TABLE public.personal_offers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    client_id UUID NOT NULL,
    offer_type TEXT NOT NULL CHECK (offer_type IN ('discount_percentage', 'discount_fixed', 'free_service', 'bonus_points', 'free_product')),
    title TEXT NOT NULL,
    description TEXT,
    discount_value NUMERIC(10,2), -- процент или фиксированная сумма
    bonus_points INTEGER, -- количество бонусных баллов
    free_service_id UUID, -- бесплатная услуга
    free_product_id UUID, -- бесплатный товар
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    usage_limit INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
    valid_until TIMESTAMP WITH TIME ZONE,
    trigger_condition JSONB, -- условия срабатывания (день рождения, n-й визит и т.д.)
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    used_in_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для сегментации клиентов
CREATE TABLE public.client_segments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- JSON с условиями сегментации
    client_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Связующая таблица для клиентов в сегментах
CREATE TABLE public.client_segment_memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    segment_id UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_qualified TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(client_id, segment_id)
);

-- Таблица для отслеживания активности клиентов (для аналитики поведения)
CREATE TABLE public.client_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('appointment_booked', 'appointment_completed', 'appointment_cancelled', 'purchase_made', 'loyalty_redeemed', 'profile_updated', 'email_opened', 'sms_clicked')),
    activity_data JSONB, -- дополнительные данные активности
    appointment_id UUID,
    order_id UUID,
    campaign_id UUID, -- если активность связана с кампанией
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для отслеживания взаимодействий с маркетинговыми кампаниями
CREATE TABLE public.campaign_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL,
    client_id UUID NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('sent', 'delivered', 'opened', 'clicked', 'converted', 'bounced', 'unsubscribed')),
    interaction_data JSONB, -- дополнительные данные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для социальных интеграций
CREATE TABLE public.social_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'vkontakte', 'telegram', 'whatsapp')),
    account_id TEXT NOT NULL, -- ID аккаунта в социальной сети
    account_name TEXT,
    access_token TEXT, -- зашифрованный токен доступа
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}', -- настройки автопубликации и т.д.
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(salon_id, platform, account_id)
);

-- Таблица для автоматических постов в социальных сетях
CREATE TABLE public.social_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    integration_id UUID NOT NULL,
    post_type TEXT NOT NULL CHECK (post_type IN ('appointment_reminder', 'before_after', 'promotion', 'birthday', 'review_thanks', 'custom')),
    content TEXT NOT NULL,
    media_urls TEXT[], -- ссылки на изображения/видео
    hashtags TEXT[],
    scheduled_at TIMESTAMP WITH TIME ZONE,
    posted_at TIMESTAMP WITH TIME ZONE,
    external_post_id TEXT, -- ID поста в социальной сети
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')),
    engagement_stats JSONB, -- лайки, комментарии, просмотры
    appointment_id UUID, -- если пост связан с записью
    client_id UUID, -- если пост связан с клиентом
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_loyalty_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Salon members can manage loyalty programs" ON public.loyalty_programs
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can view client loyalty balances" ON public.client_loyalty_balances
    FOR ALL USING (client_id IN (SELECT c.id FROM clients c JOIN profiles p ON p.salon_id = c.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can view loyalty transactions" ON public.loyalty_transactions
    FOR ALL USING (client_id IN (SELECT c.id FROM clients c JOIN profiles p ON p.salon_id = c.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can manage personal offers" ON public.personal_offers
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage client segments" ON public.client_segments
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can view segment memberships" ON public.client_segment_memberships
    FOR ALL USING (client_id IN (SELECT c.id FROM clients c JOIN profiles p ON p.salon_id = c.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can view client activities" ON public.client_activities
    FOR ALL USING (client_id IN (SELECT c.id FROM clients c JOIN profiles p ON p.salon_id = c.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can view campaign interactions" ON public.campaign_interactions
    FOR ALL USING (campaign_id IN (SELECT cam.id FROM campaigns cam JOIN profiles p ON p.salon_id = cam.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can manage social integrations" ON public.social_integrations
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage social posts" ON public.social_posts
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_loyalty_programs_updated_at
    BEFORE UPDATE ON public.loyalty_programs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_client_loyalty_balances_updated_at
    BEFORE UPDATE ON public.client_loyalty_balances
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_personal_offers_updated_at
    BEFORE UPDATE ON public.personal_offers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_client_segments_updated_at
    BEFORE UPDATE ON public.client_segments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_social_integrations_updated_at
    BEFORE UPDATE ON public.social_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON public.social_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Функция для автоматического начисления баллов
CREATE OR REPLACE FUNCTION process_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    program_record RECORD;
    points_to_add INTEGER;
    balance_record RECORD;
BEGIN
    -- Только для оплаченных заказов
    IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
        -- Получаем активную программу лояльности для салона
        SELECT * INTO program_record 
        FROM public.loyalty_programs 
        WHERE salon_id = NEW.salon_id AND is_active = true
        LIMIT 1;
        
        IF program_record.id IS NOT NULL THEN
            -- Рассчитываем количество баллов
            IF program_record.type = 'points' THEN
                points_to_add := FLOOR(NEW.total_amount * program_record.points_per_ruble);
            ELSIF program_record.type = 'visits' THEN
                points_to_add := program_record.points_per_visit;
            ELSE
                points_to_add := 0;
            END IF;
            
            IF points_to_add > 0 THEN
                -- Обновляем или создаем баланс клиента
                INSERT INTO public.client_loyalty_balances (client_id, program_id, current_points, total_earned)
                VALUES (NEW.client_id, program_record.id, points_to_add, points_to_add)
                ON CONFLICT (client_id, program_id)
                DO UPDATE SET 
                    current_points = client_loyalty_balances.current_points + points_to_add,
                    total_earned = client_loyalty_balances.total_earned + points_to_add,
                    last_activity_date = now();
                
                -- Создаем транзакцию по баллам
                INSERT INTO public.loyalty_transactions (
                    client_id, program_id, order_id, transaction_type, 
                    points_amount, description, expires_at
                ) VALUES (
                    NEW.client_id, program_record.id, NEW.id, 'earned',
                    points_to_add, 'Баллы за заказ #' || NEW.order_number,
                    now() + INTERVAL '1 year'
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для начисления баллов при оплате заказа
CREATE TRIGGER loyalty_points_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION process_loyalty_points();

-- Функция для обновления сегментов клиентов
CREATE OR REPLACE FUNCTION update_client_segments()
RETURNS void AS $$
DECLARE
    segment_record RECORD;
    client_record RECORD;
    conditions JSONB;
    meets_criteria BOOLEAN;
BEGIN
    -- Проходим по всем активным сегментам
    FOR segment_record IN 
        SELECT * FROM public.client_segments WHERE is_active = true
    LOOP
        conditions := segment_record.conditions;
        
        -- Проходим по всем клиентам салона
        FOR client_record IN 
            SELECT c.* FROM public.clients c 
            WHERE c.salon_id = segment_record.salon_id
        LOOP
            meets_criteria := false;
            
            -- Проверяем критерии сегментации
            -- Примеры критериев (можно расширить):
            
            -- VIP клиенты (потратили больше определенной суммы)
            IF conditions ? 'min_total_spent' THEN
                IF client_record.total_spent >= (conditions->>'min_total_spent')::NUMERIC THEN
                    meets_criteria := true;
                END IF;
            END IF;
            
            -- Количество визитов
            IF conditions ? 'min_visits' THEN
                IF client_record.total_visits >= (conditions->>'min_visits')::INTEGER THEN
                    meets_criteria := true;
                END IF;
            END IF;
            
            -- Теги клиента
            IF conditions ? 'required_tags' THEN
                IF client_record.tags && (conditions->'required_tags')::TEXT[] THEN
                    meets_criteria := true;
                END IF;
            END IF;
            
            -- Обновляем членство в сегменте
            IF meets_criteria THEN
                INSERT INTO public.client_segment_memberships (client_id, segment_id)
                VALUES (client_record.id, segment_record.id)
                ON CONFLICT (client_id, segment_id) 
                DO UPDATE SET last_qualified = now();
            ELSE
                DELETE FROM public.client_segment_memberships 
                WHERE client_id = client_record.id AND segment_id = segment_record.id;
            END IF;
        END LOOP;
        
        -- Обновляем количество клиентов в сегменте
        UPDATE public.client_segments 
        SET client_count = (
            SELECT COUNT(*) 
            FROM public.client_segment_memberships 
            WHERE segment_id = segment_record.id
        ),
        last_updated = now()
        WHERE id = segment_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;