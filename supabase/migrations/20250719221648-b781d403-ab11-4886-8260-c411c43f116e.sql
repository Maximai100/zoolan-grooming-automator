-- Этап 8: Управление персоналом

-- Таблица для ролей сотрудников (уже есть enum user_role, расширим функционал)

-- Таблица смен сотрудников
CREATE TABLE public.staff_shifts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    actual_start_time TIME,
    actual_end_time TIME,
    break_minutes INTEGER DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для отработанных часов
CREATE TABLE public.time_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    shift_id UUID,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    total_hours NUMERIC(5,2),
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    hourly_rate NUMERIC(10,2),
    total_pay NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для расчёта зарплат
CREATE TABLE public.payroll (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary NUMERIC(10,2) DEFAULT 0,
    hours_worked NUMERIC(5,2) DEFAULT 0,
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    commission_amount NUMERIC(10,2) DEFAULT 0,
    bonus_amount NUMERIC(10,2) DEFAULT 0,
    deductions NUMERIC(10,2) DEFAULT 0,
    gross_amount NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    net_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для внутренних задач
CREATE TABLE public.staff_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    assigned_to UUID,
    created_by UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('cleaning', 'inventory', 'maintenance', 'admin', 'customer_service', 'general')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для внутреннего чата
CREATE TABLE public.staff_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    recipient_id UUID, -- NULL для общих сообщений
    channel_type TEXT DEFAULT 'general' CHECK (channel_type IN ('general', 'private', 'team', 'announcements')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT NOT NULL,
    file_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    reply_to_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица комиссий с услуг для сотрудников
CREATE TABLE public.staff_commissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    appointment_id UUID,
    order_id UUID,
    service_id UUID,
    commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed', 'tiered')),
    commission_rate NUMERIC(5,2), -- Процент или фиксированная сумма
    service_amount NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Индексы для производительности
CREATE INDEX idx_staff_shifts_salon_staff_date ON public.staff_shifts(salon_id, staff_id, shift_date);
CREATE INDEX idx_time_tracking_salon_staff ON public.time_tracking(salon_id, staff_id, clock_in);
CREATE INDEX idx_payroll_salon_staff_period ON public.payroll(salon_id, staff_id, period_start, period_end);
CREATE INDEX idx_staff_tasks_salon_assigned ON public.staff_tasks(salon_id, assigned_to, status);
CREATE INDEX idx_staff_messages_salon_recipient ON public.staff_messages(salon_id, recipient_id, created_at);
CREATE INDEX idx_staff_commissions_salon_staff ON public.staff_commissions(salon_id, staff_id, period_start);

-- RLS политики
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_commissions ENABLE ROW LEVEL SECURITY;

-- Политики для смен
CREATE POLICY "Salon staff can manage shifts" ON public.staff_shifts
    FOR ALL USING (
        salon_id IN (
            SELECT salon_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Политики для отслеживания времени
CREATE POLICY "Salon staff can manage time tracking" ON public.time_tracking
    FOR ALL USING (
        salon_id IN (
            SELECT salon_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Политики для зарплат (только владельцы и менеджеры)
CREATE POLICY "Salon managers can view payroll" ON public.payroll
    FOR SELECT USING (
        salon_id IN (
            SELECT salon_id FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
        )
    );

CREATE POLICY "Salon owners can manage payroll" ON public.payroll
    FOR ALL USING (
        salon_id IN (
            SELECT salon_id FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'owner'
        )
    );

-- Политики для задач
CREATE POLICY "Salon staff can view tasks" ON public.staff_tasks
    FOR SELECT USING (
        salon_id IN (
            SELECT salon_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Salon staff can create tasks" ON public.staff_tasks
    FOR INSERT WITH CHECK (
        salon_id IN (
            SELECT salon_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Staff can update their assigned tasks" ON public.staff_tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        salon_id IN (
            SELECT salon_id FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
        )
    );

-- Политики для сообщений
CREATE POLICY "Salon staff can view messages" ON public.staff_messages
    FOR SELECT USING (
        salon_id IN (
            SELECT salon_id FROM profiles WHERE id = auth.uid()
        ) AND (
            recipient_id = auth.uid() OR 
            sender_id = auth.uid() OR 
            recipient_id IS NULL -- Общие сообщения
        )
    );

CREATE POLICY "Salon staff can send messages" ON public.staff_messages
    FOR INSERT WITH CHECK (
        salon_id IN (
            SELECT salon_id FROM profiles WHERE id = auth.uid()
        ) AND sender_id = auth.uid()
    );

-- Политики для комиссий
CREATE POLICY "Staff can view their commissions" ON public.staff_commissions
    FOR SELECT USING (
        staff_id = auth.uid() OR
        salon_id IN (
            SELECT salon_id FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
        )
    );

CREATE POLICY "Salon managers can manage commissions" ON public.staff_commissions
    FOR ALL USING (
        salon_id IN (
            SELECT salon_id FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
        )
    );

-- Триггеры для updated_at
CREATE TRIGGER update_staff_shifts_updated_at
    BEFORE UPDATE ON public.staff_shifts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_time_tracking_updated_at
    BEFORE UPDATE ON public.time_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payroll_updated_at
    BEFORE UPDATE ON public.payroll
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_staff_tasks_updated_at
    BEFORE UPDATE ON public.staff_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_staff_messages_updated_at
    BEFORE UPDATE ON public.staff_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Функция для автоматического расчёта зарплат
CREATE OR REPLACE FUNCTION public.calculate_staff_payroll(
    staff_uuid UUID,
    period_start_date DATE,
    period_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    total_hours NUMERIC := 0;
    overtime_hours NUMERIC := 0;
    base_rate NUMERIC := 0;
    commission_total NUMERIC := 0;
    bonus_total NUMERIC := 0;
    gross_amount NUMERIC := 0;
BEGIN
    -- Получаем общие отработанные часы
    SELECT 
        COALESCE(SUM(total_hours), 0),
        COALESCE(SUM(overtime_hours), 0)
    INTO total_hours, overtime_hours
    FROM public.time_tracking
    WHERE staff_id = staff_uuid
    AND DATE(clock_in) BETWEEN period_start_date AND period_end_date;
    
    -- Получаем базовую ставку из профиля (можно расширить)
    base_rate := 500; -- Временно фиксированная ставка
    
    -- Получаем комиссии за период
    SELECT COALESCE(SUM(commission_amount), 0)
    INTO commission_total
    FROM public.staff_commissions
    WHERE staff_id = staff_uuid
    AND period_start BETWEEN period_start_date AND period_end_date;
    
    -- Рассчитываем общую сумму
    gross_amount := (total_hours * base_rate) + (overtime_hours * base_rate * 1.5) + commission_total + bonus_total;
    
    result := jsonb_build_object(
        'staff_id', staff_uuid,
        'period_start', period_start_date,
        'period_end', period_end_date,
        'total_hours', total_hours,
        'overtime_hours', overtime_hours,
        'base_rate', base_rate,
        'commission_amount', commission_total,
        'bonus_amount', bonus_total,
        'gross_amount', gross_amount,
        'calculated_at', now()
    );
    
    RETURN result;
END;
$$;