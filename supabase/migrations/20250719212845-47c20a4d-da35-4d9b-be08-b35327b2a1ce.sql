-- Этап 5: Финансовый учет и POS система

-- Таблица для товаров (корма, аксессуары и т.д.)
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT, -- артикул
    category TEXT,
    price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2), -- себестоимость
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0, -- минимальный остаток для алерта
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    barcode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для промокодов и скидок
CREATE TABLE public.discount_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    value NUMERIC(10,2) NOT NULL, -- процент или фиксированная сумма
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    max_discount_amount NUMERIC(10,2), -- максимальная сумма скидки
    usage_limit INTEGER, -- общий лимит использования
    usage_count INTEGER DEFAULT 0,
    per_client_limit INTEGER DEFAULT 1, -- лимит на клиента
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_services UUID[], -- применимо к услугам
    applicable_products UUID[], -- применимо к товарам
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(salon_id, code)
);

-- Таблица для абонементов/подписок
CREATE TABLE public.memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('visits', 'time_period', 'unlimited')),
    visits_included INTEGER, -- количество посещений (для type = 'visits')
    validity_days INTEGER, -- срок действия в днях
    price NUMERIC(10,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0, -- процент скидки на услуги
    applicable_services UUID[], -- применимые услуги
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для абонементов клиентов
CREATE TABLE public.client_memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    membership_id UUID NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    activation_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    visits_remaining INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'used')),
    purchase_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для заказов/чеков
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    client_id UUID,
    appointment_id UUID, -- связь с записью, если применимо
    staff_id UUID, -- кто оформил заказ
    order_number TEXT UNIQUE NOT NULL, -- номер чека
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    discount_code_id UUID, -- использованный промокод
    tax_amount NUMERIC(10,2) DEFAULT 0,
    tip_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'mixed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для позиций заказа
CREATE TABLE public.order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
    service_id UUID, -- если это услуга
    product_id UUID, -- если это товар
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для платежей
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'bank_transfer', 'online')),
    provider TEXT, -- Stripe, РБК Money и т.д.
    provider_transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для возвратов
CREATE TABLE public.refunds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    payment_id UUID,
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    processed_by UUID, -- кто оформил возврат
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для кассовых смен
CREATE TABLE public.cash_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    opening_amount NUMERIC(10,2) DEFAULT 0, -- сумма в кассе на начало смены
    closing_amount NUMERIC(10,2), -- сумма в кассе на конец смены
    expected_amount NUMERIC(10,2), -- ожидаемая сумма
    cash_sales NUMERIC(10,2) DEFAULT 0,
    card_sales NUMERIC(10,2) DEFAULT 0,
    tips_collected NUMERIC(10,2) DEFAULT 0,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Salon members can manage products" ON public.products
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage discount codes" ON public.discount_codes
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage memberships" ON public.memberships
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can view client memberships" ON public.client_memberships
    FOR ALL USING (client_id IN (SELECT c.id FROM clients c JOIN profiles p ON p.salon_id = c.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can manage orders" ON public.orders
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Salon members can manage order items" ON public.order_items
    FOR ALL USING (order_id IN (SELECT o.id FROM orders o JOIN profiles p ON p.salon_id = o.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can manage payments" ON public.payments
    FOR ALL USING (order_id IN (SELECT o.id FROM orders o JOIN profiles p ON p.salon_id = o.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon members can manage refunds" ON public.refunds
    FOR ALL USING (order_id IN (SELECT o.id FROM orders o JOIN profiles p ON p.salon_id = o.salon_id WHERE p.id = auth.uid()));

CREATE POLICY "Salon staff can manage cash sessions" ON public.cash_sessions
    FOR ALL USING (salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON public.discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_client_memberships_updated_at
    BEFORE UPDATE ON public.client_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON public.refunds
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Функция для генерации номера заказа
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NEW.created_at)::TEXT, 10, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации номера заказа
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Функция для автоматического обновления totals в заказе
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_subtotal NUMERIC(10,2);
    order_total NUMERIC(10,2);
BEGIN
    -- Пересчитываем subtotal
    SELECT COALESCE(SUM(total_price), 0) INTO order_subtotal
    FROM public.order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Обновляем заказ
    UPDATE public.orders 
    SET 
        subtotal = order_subtotal,
        total_amount = order_subtotal - COALESCE(discount_amount, 0) + COALESCE(tax_amount, 0) + COALESCE(tip_amount, 0)
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Триггер для пересчета суммы заказа при изменении позиций
CREATE TRIGGER update_order_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals();