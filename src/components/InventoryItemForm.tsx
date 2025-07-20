import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryItem } from '@/hooks/useInventory';

interface InventoryItemFormProps {
  item?: InventoryItem | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Шампуни и кондиционеры',
  'Инструменты для стрижки',
  'Щетки и расчески',
  'Аксессуары',
  'Средства для ухода',
  'Дезинфекция',
  'Косметика для животных',
  'Игрушки',
  'Корм и лакомства',
  'Одежда и аксессуары',
  'Прочее'
];

const InventoryItemForm = ({ item, onSubmit, onCancel }: InventoryItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    barcode: '',
    current_stock: 0,
    min_stock_level: 0,
    unit_cost: 0,
    unit_price: 0,
    is_active: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        sku: item.sku || '',
        barcode: item.barcode || '',
        current_stock: item.current_stock,
        min_stock_level: item.min_stock_level,
        unit_cost: item.unit_cost,
        unit_price: item.unit_price || item.unit_cost,
        is_active: item.is_active
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название товара *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Название товара"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Описание товара"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">Артикул (SKU)</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="SKU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Штрихкод</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Штрихкод"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Товар активен</Label>
          </div>
        </CardContent>
      </Card>

      {/* Остатки и учет */}
      <Card>
        <CardHeader>
          <CardTitle>Остатки и учет</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Текущий остаток *</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Минимальный остаток *</Label>
              <Input
                id="min_stock_level"
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Себестоимость (₽) *</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Цена продажи (₽)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          {item ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};

export default InventoryItemForm;