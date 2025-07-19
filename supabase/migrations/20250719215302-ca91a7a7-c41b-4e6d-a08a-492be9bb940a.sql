-- Этап 7: Аналитика и отчётность

-- Таблица для кэширования аналитических данных
CREATE TABLE public.analytics_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    metric_type TEXT NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для настроек отчетов
CREATE TABLE public.report_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL, -- 'revenue', 'staff', 'services', 'clients'
    filters JSONB DEFAULT '{}',
    fields JSONB NOT NULL DEFAULT '[]',
    schedule JSONB, -- для автоматической генерации
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для сохраненных отчетов
CREATE TABLE public.generated_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    template_id UUID REFERENCES public.report_templates(id),
    name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    format TEXT DEFAULT 'json', -- 'json', 'csv', 'pdf'
    file_url TEXT,
    generated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для KPI метрик в реальном времени
CREATE TABLE public.kpi_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_data JSONB DEFAULT '{}',
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица для прогнозов
CREATE TABLE public.revenue_forecasts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL,
    forecast_period TEXT NOT NULL, -- 'week', 'month', 'quarter'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_revenue NUMERIC NOT NULL DEFAULT 0,
    confidence_level NUMERIC DEFAULT 0.8,
    based_on_data JSONB DEFAULT '{}', -- базовые данные для прогноза
    actual_revenue NUMERIC, -- заполняется по факту
    accuracy_score NUMERIC, -- точность прогноза
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Salon members can manage analytics cache" ON public.analytics_cache
    FOR ALL USING (salon_id IN (
        SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Salon members can manage report templates" ON public.report_templates
    FOR ALL USING (salon_id IN (
        SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Salon members can view generated reports" ON public.generated_reports
    FOR ALL USING (salon_id IN (
        SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Salon members can view KPI metrics" ON public.kpi_metrics
    FOR ALL USING (salon_id IN (
        SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Salon members can view revenue forecasts" ON public.revenue_forecasts
    FOR ALL USING (salon_id IN (
        SELECT profiles.salon_id FROM profiles WHERE profiles.id = auth.uid()
    ));

-- Триггеры для updated_at
CREATE TRIGGER update_analytics_cache_updated_at BEFORE UPDATE ON public.analytics_cache
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_revenue_forecasts_updated_at BEFORE UPDATE ON public.revenue_forecasts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Функция для расчета KPI метрик
CREATE OR REPLACE FUNCTION public.calculate_salon_kpi(salon_uuid UUID, start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    total_revenue NUMERIC := 0;
    total_appointments INTEGER := 0;
    completed_appointments INTEGER := 0;
    cancelled_appointments INTEGER := 0;
    no_show_appointments INTEGER := 0;
    avg_ticket NUMERIC := 0;
    top_breeds JSONB := '[]';
    calendar_utilization NUMERIC := 0;
    new_clients INTEGER := 0;
    repeat_clients INTEGER := 0;
BEGIN
    -- Общая выручка
    SELECT COALESCE(SUM(o.total_amount), 0) INTO total_revenue
    FROM public.orders o
    WHERE o.salon_id = salon_uuid 
    AND o.created_at BETWEEN start_date AND end_date
    AND o.payment_status = 'paid';
    
    -- Статистика записей
    SELECT 
        COUNT(*),
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END)
    INTO total_appointments, completed_appointments, cancelled_appointments, no_show_appointments
    FROM public.appointments a
    WHERE a.salon_id = salon_uuid
    AND a.scheduled_date BETWEEN start_date::DATE AND end_date::DATE;
    
    -- Средний чек
    IF completed_appointments > 0 THEN
        avg_ticket := total_revenue / completed_appointments;
    END IF;
    
    -- Топ пород (упрощенная версия)
    SELECT json_agg(
        json_build_object(
            'breed', p.breed,
            'count', breed_count
        ) ORDER BY breed_count DESC
    )::JSONB INTO top_breeds
    FROM (
        SELECT p.breed, COUNT(*) as breed_count
        FROM public.pets p
        JOIN public.appointments a ON a.pet_id = p.id
        WHERE a.salon_id = salon_uuid
        AND a.scheduled_date BETWEEN start_date::DATE AND end_date::DATE
        AND p.breed IS NOT NULL
        GROUP BY p.breed
        LIMIT 5
    ) p;
    
    -- Новые vs возвращающиеся клиенты
    SELECT 
        SUM(CASE WHEN c.created_at BETWEEN start_date AND end_date THEN 1 ELSE 0 END),
        SUM(CASE WHEN c.created_at < start_date THEN 1 ELSE 0 END)
    INTO new_clients, repeat_clients
    FROM public.clients c
    JOIN public.appointments a ON a.client_id = c.id
    WHERE a.salon_id = salon_uuid
    AND a.scheduled_date BETWEEN start_date::DATE AND end_date::DATE;
    
    -- Формируем результат
    result := jsonb_build_object(
        'total_revenue', total_revenue,
        'total_appointments', total_appointments,
        'completed_appointments', completed_appointments,
        'cancelled_appointments', cancelled_appointments,
        'no_show_appointments', no_show_appointments,
        'no_show_percentage', CASE WHEN total_appointments > 0 THEN (no_show_appointments::NUMERIC / total_appointments * 100) ELSE 0 END,
        'avg_ticket', avg_ticket,
        'top_breeds', COALESCE(top_breeds, '[]'::JSONB),
        'new_clients', new_clients,
        'repeat_clients', repeat_clients,
        'calculated_at', now()
    );
    
    RETURN result;
END;
$$;

-- Функция для генерации прогноза выручки
CREATE OR REPLACE FUNCTION public.generate_revenue_forecast(salon_uuid UUID, forecast_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    historical_avg NUMERIC := 0;
    scheduled_revenue NUMERIC := 0;
    predicted_revenue NUMERIC := 0;
    confidence NUMERIC := 0.8;
    start_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '1 day' * forecast_days;
BEGIN
    -- Средняя выручка за последние 30 дней
    SELECT COALESCE(AVG(daily_revenue), 0) INTO historical_avg
    FROM (
        SELECT DATE(o.created_at) as date, SUM(o.total_amount) as daily_revenue
        FROM public.orders o
        WHERE o.salon_id = salon_uuid
        AND o.payment_status = 'paid'
        AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(o.created_at)
    ) daily_stats;
    
    -- Выручка от уже запланированных записей
    SELECT COALESCE(SUM(a.price), 0) INTO scheduled_revenue
    FROM public.appointments a
    WHERE a.salon_id = salon_uuid
    AND a.scheduled_date BETWEEN start_date AND end_date
    AND a.status IN ('scheduled', 'confirmed');
    
    -- Простой прогноз: запланированная выручка + средняя историческая * дни
    predicted_revenue := scheduled_revenue + (historical_avg * forecast_days * 0.7); -- коэффициент 0.7 для консерватизма
    
    -- Уровень уверенности на основе количества исторических данных
    SELECT CASE 
        WHEN COUNT(*) >= 30 THEN 0.9
        WHEN COUNT(*) >= 14 THEN 0.8
        WHEN COUNT(*) >= 7 THEN 0.7
        ELSE 0.6
    END INTO confidence
    FROM public.orders o
    WHERE o.salon_id = salon_uuid
    AND o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    result := jsonb_build_object(
        'predicted_revenue', predicted_revenue,
        'scheduled_revenue', scheduled_revenue,
        'historical_daily_avg', historical_avg,
        'confidence_level', confidence,
        'forecast_period', forecast_days,
        'period_start', start_date,
        'period_end', end_date,
        'generated_at', now()
    );
    
    RETURN result;
END;
$$;