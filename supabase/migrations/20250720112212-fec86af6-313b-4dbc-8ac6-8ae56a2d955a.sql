-- Создаем таблицу товаров
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10,2) DEFAULT 0,
  barcode TEXT,
  sku TEXT,
  category TEXT,
  brand TEXT,
  supplier TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_threshold INTEGER DEFAULT 5,
  max_stock_capacity INTEGER,
  unit TEXT DEFAULT 'шт',
  weight NUMERIC(8,3),
  dimensions JSONB,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_trackable BOOLEAN DEFAULT true,
  expiry_date DATE,
  batch_number TEXT,
  location TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS политики для products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon members can manage products"
ON public.products
FOR ALL
USING (salon_id IN (
  SELECT salon_id FROM public.profiles WHERE id = auth.uid()
));

-- Триггер для updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Индексы
CREATE INDEX idx_products_salon_id ON public.products(salon_id);
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_stock ON public.products(stock_quantity);

-- Функция для автоматических уведомлений о низких остатках
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Если остаток товара стал меньше минимального порога
  IF NEW.stock_quantity <= NEW.min_stock_threshold AND OLD.stock_quantity > NEW.min_stock_threshold THEN
    -- Создаем задачу для персонала
    INSERT INTO public.staff_tasks (
      salon_id, 
      title, 
      description, 
      category, 
      priority, 
      status,
      created_by
    ) VALUES (
      NEW.salon_id,
      'Дозаказ товара: ' || NEW.name,
      'Остаток товара "' || NEW.name || '" составляет ' || NEW.stock_quantity || ' ' || NEW.unit || '. Минимальный порог: ' || NEW.min_stock_threshold || ' ' || NEW.unit || '. Необходимо дозаказать товар.',
      'inventory',
      'medium',
      'pending',
      (SELECT id FROM public.profiles WHERE salon_id = NEW.salon_id AND role = 'owner' LIMIT 1)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для проверки низких остатков
CREATE TRIGGER check_low_stock_trigger
AFTER UPDATE OF stock_quantity ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.check_low_stock();