import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  category: string;
  sku?: string;
  barcode?: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level?: number;
  unit_cost: number;
  unit_price?: number;
  supplier?: string;
  supplier_contact?: string;
  last_order_date?: string;
  last_order_quantity?: number;
  expiry_date?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  salon_id: string;
  item_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'expired' | 'damaged';
  quantity: number;
  reference_number?: string;
  reason?: string;
  performed_by: string;
  notes?: string;
  created_at: string;
}

export interface SupplierOrder {
  id: string;
  salon_id: string;
  supplier_name: string;
  supplier_contact?: string;
  order_number: string;
  status: 'draft' | 'pending' | 'ordered' | 'delivered' | 'cancelled';
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity?: number;
}

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getUserSalonId = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    return profile?.salon_id;
  };

  const fetchInventoryItems = async () => {
    try {
      const salonId = await getUserSalonId();
      if (!salonId) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const inventoryItems = (data || []).map(item => ({
        ...item,
        current_stock: item.stock_quantity || 0,
        min_stock_level: item.min_stock_level || 0,
        max_stock_level: null,
        unit_cost: item.cost_price || 0,
        unit_price: item.price,
        supplier: null,
        supplier_contact: null,
        last_order_date: null,
        last_order_quantity: null,
        expiry_date: null,
        location: null
      })) as InventoryItem[];

      setItems(inventoryItems);
      
      // Определяем товары с низким остатком
      const lowStock = inventoryItems.filter(item => 
        item.current_stock <= item.min_stock_level
      );
      setLowStockItems(lowStock);

    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить инвентарь',
        variant: 'destructive'
      });
    }
  };

  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'salon_id' | 'created_at' | 'updated_at'>) => {
    try {
      const salonId = await getUserSalonId();
      if (!salonId) throw new Error('Не удалось определить салон');

      // Добавляем в таблицу products с соответствующим маппингом
      const { data, error } = await supabase
        .from('products')
        .insert([{
          salon_id: salonId,
          name: itemData.name,
          description: itemData.description,
          category: itemData.category,
          sku: itemData.sku,
          barcode: itemData.barcode,
          stock_quantity: itemData.current_stock,
          min_stock_level: itemData.min_stock_level,
          cost_price: itemData.unit_cost,
          price: itemData.unit_price || itemData.unit_cost,
          is_active: itemData.is_active
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchInventoryItems();
      toast({
        title: 'Успешно',
        description: 'Товар добавлен в инвентарь'
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding inventory item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          sku: updates.sku,
          barcode: updates.barcode,
          stock_quantity: updates.current_stock,
          min_stock_level: updates.min_stock_level,
          cost_price: updates.unit_cost,
          price: updates.unit_price,
          is_active: updates.is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchInventoryItems();
      toast({
        title: 'Успешно',
        description: 'Товар обновлен'
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить товар',
        variant: 'destructive'
      });
      return { data: null, error };
    }
  };

  const adjustStock = async (
    itemId: string, 
    quantity: number, 
    movementType: StockMovement['movement_type'], 
    reason?: string,
    notes?: string
  ) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error('Товар не найден');

      const newStock = movementType === 'out' || movementType === 'expired' || movementType === 'damaged'
        ? Math.max(0, item.current_stock - Math.abs(quantity))
        : item.current_stock + Math.abs(quantity);

      // Обновляем остаток
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Можно также создать запись о движении товара (если есть такая таблица)
      // Пока просто обновляем инвентарь
      await fetchInventoryItems();

      toast({
        title: 'Успешно',
        description: `Остаток товара ${movementType === 'in' ? 'увеличен' : 'уменьшен'}`
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить остаток',
        variant: 'destructive'
      });
      return { error };
    }
  };

  const generateLowStockReport = () => {
    return lowStockItems.map(item => ({
      name: item.name,
      category: item.category,
      currentStock: item.current_stock,
      minLevel: item.min_stock_level,
      shortfall: item.min_stock_level - item.current_stock,
      unitCost: item.unit_cost,
      estimatedOrderCost: (item.min_stock_level - item.current_stock + 10) * item.unit_cost
    }));
  };

  const generateInventoryValue = () => {
    return items.reduce((total, item) => {
      return total + (item.current_stock * item.unit_cost);
    }, 0);
  };

  const searchItems = (searchTerm: string, category?: string) => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    return filtered;
  };

  const getCategories = () => {
    const categories = [...new Set(items.map(item => item.category))];
    return categories.sort();
  };

  const refetch = async () => {
    setLoading(true);
    await fetchInventoryItems();
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    items,
    movements,
    orders,
    lowStockItems,
    loading,
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    generateLowStockReport,
    generateInventoryValue,
    searchItems,
    getCategories,
    refetch
  };
};