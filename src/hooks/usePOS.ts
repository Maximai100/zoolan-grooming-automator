
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category?: string;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category?: string;
  is_active: boolean;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  client_id?: string;
}

interface CreateOrderData {
  clientId: string | null;
  items: CartItem[];
  paymentMethod: string;
  discountCode?: string;
  tipAmount: number;
  notes?: string;
  subtotal: number;
  discountAmount: number;
  total: number;
}

export const usePOS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Загрузка данных
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки услуг:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, phone, email')
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки клиентов:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки заказов:', error);
    }
  };

  // Управление корзиной
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id && i.type === item.type);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    setCart(prev => {
      const newCart = [...prev];
      newCart[index].quantity = quantity;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Расчеты
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 0; // TODO: Implement discount calculation
    const total = subtotal - discount;
    
    return {
      subtotal,
      discount,
      total
    };
  };

  // Применение скидки
  const applyDiscount = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // TODO: Implement discount logic
      return data;
    } catch (error: any) {
      throw new Error('Промокод не найден или недействителен');
    }
  };

  // Обработка платежа
  const processPayment = async (paymentData: {
    client_id?: string;
    payment_method: string;
    tip_amount?: number;
    discount_code?: string;
  }) => {
    if (cart.length === 0) {
      throw new Error('Корзина пуста');
    }

    setLoading(true);
    
    try {
      // Get user's salon_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError || !profile?.salon_id) {
        throw new Error('Не удалось определить салон');
      }

      const total = calculateTotal();
      
      // Создаем заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          salon_id: profile.salon_id,
          client_id: paymentData.client_id,
          subtotal: total.subtotal,
          discount_amount: total.discount,
          tip_amount: paymentData.tip_amount || 0,
          total_amount: total.total + (paymentData.tip_amount || 0),
          payment_method: paymentData.payment_method,
          payment_status: 'paid',
          order_number: `ORD-${Date.now()}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Добавляем товары в заказ
      const orderItems = cart.map(item => ({
        order_id: order.id,
        item_type: item.type,
        service_id: item.type === 'service' ? item.id : null,
        product_id: item.type === 'product' ? item.id : null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Обновляем остатки товаров
      for (const item of cart) {
        if (item.type === 'product') {
          const product = products.find(p => p.id === item.id);
          if (product) {
            const { error: stockError } = await supabase
              .from('products')
              .update({ 
                stock_quantity: Math.max(0, product.stock_quantity - item.quantity)
              })
              .eq('id', item.id);
            
            if (stockError) console.error('Ошибка обновления остатков:', stockError);
          }
        }
      }

      await fetchOrders();
      await fetchProducts();
      
      return order;
    } catch (error: any) {
      console.error('Ошибка обработки платежа:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderData) => {
    setLoading(true);
    try {
      // Get user's salon_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id, id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.salon_id) {
        throw new Error('Не удалось определить салон пользователя');
      }

      // Create the main order (order_number will be auto-generated by trigger)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          salon_id: profile.salon_id,
          client_id: orderData.clientId,
          staff_id: profile.id,
          subtotal: orderData.subtotal,
          discount_amount: orderData.discountAmount,
          tip_amount: orderData.tipAmount,
          total_amount: orderData.total,
          payment_method: orderData.paymentMethod,
          payment_status: 'paid',
          notes: orderData.notes,
          order_number: `ORD-${Date.now()}` // Temporary until trigger generates it
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        item_type: item.type,
        service_id: item.type === 'service' ? item.id : null,
        product_id: item.type === 'product' ? item.id : null,
        quantity: item.quantity,
        unit_price: item.price,
        discount_amount: (item.discount || 0) * item.quantity,
        total_price: (item.price * item.quantity) - ((item.discount || 0) * item.quantity)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount: orderData.total,
          method: orderData.paymentMethod,
          status: 'completed',
          processed_at: new Date().toISOString()
        });

      if (paymentError) throw paymentError;

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyDiscountCode = async (code: string) => {
    try {
      const { data: discount } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (!discount) {
        throw new Error('Промокод не найден или неактивен');
      }

      // Check if discount is still valid
      if (discount.valid_until && new Date(discount.valid_until) < new Date()) {
        throw new Error('Промокод истек');
      }

      // Check usage limits
      if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
        throw new Error('Промокод достиг лимита использований');
      }

      return discount;
    } catch (error) {
      console.error('Error applying discount code:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchServices();
    fetchClients();
    fetchOrders();
  }, []);

  return {
    cart,
    products,
    services,
    clients,
    orders,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    calculateTotal,
    applyDiscount,
    processPayment,
    createOrder,
    applyDiscountCode
  };
};
