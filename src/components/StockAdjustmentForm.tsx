import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '@/hooks/useInventory';

interface StockAdjustmentFormProps {
  item?: InventoryItem | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const MOVEMENT_TYPES = [
  { value: 'in', label: 'Поступление товара', color: 'bg-green-100 text-green-800' },
  { value: 'out', label: 'Расход товара', color: 'bg-blue-100 text-blue-800' },
  { value: 'adjustment', label: 'Корректировка', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'expired', label: 'Списание (просрочка)', color: 'bg-red-100 text-red-800' },
  { value: 'damaged', label: 'Списание (брак)', color: 'bg-red-100 text-red-800' },
];

const StockAdjustmentForm = ({ item, onSubmit, onCancel }: StockAdjustmentFormProps) => {
  const [formData, setFormData] = useState({
    movementType: 'in' as 'in' | 'out' | 'adjustment' | 'expired' | 'damaged',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedMovementType = MOVEMENT_TYPES.find(type => type.value === formData.movementType);
  
  const calculateNewStock = () => {
    if (!item) return 0;
    
    const { movementType, quantity } = formData;
    if (movementType === 'in' || movementType === 'adjustment') {
      return item.current_stock + Math.abs(quantity);
    } else {
      return Math.max(0, item.current_stock - Math.abs(quantity));
    }
  };

  if (!item) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Информация о товаре */}
      <Card>
        <CardHeader>
          <CardTitle>Товар для корректировки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{item.name}</h3>
            <Badge variant="outline">{item.category}</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Текущий остаток:</span>
              <p className="text-lg font-bold">{item.current_stock} шт</p>
            </div>
            <div>
              <span className="font-medium">Минимальный уровень:</span>
              <p>{item.min_stock_level} шт</p>
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Форма корректировки */}
      <Card>
        <CardHeader>
          <CardTitle>Корректировка остатков</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movementType">Тип операции *</Label>
            <Select
              value={formData.movementType}
              onValueChange={(value) => handleInputChange('movementType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип операции" />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMovementType && (
              <Badge className={selectedMovementType.color}>
                {selectedMovementType.label}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Количество *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              placeholder="Введите количество"
              required
            />
            {formData.quantity > 0 && (
              <div className="text-sm text-muted-foreground">
                Новый остаток будет: <span className="font-medium">{calculateNewStock()} шт</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Причина корректировки</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Укажите причину"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Дополнительные заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Дополнительная информация"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Предупреждения */}
      {formData.quantity > 0 && calculateNewStock() <= item.min_stock_level && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <span className="font-medium">⚠️ Внимание:</span>
              <span>После операции остаток будет ниже минимального уровня</span>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.movementType === 'out' && formData.quantity > item.current_stock && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">❌ Ошибка:</span>
              <span>Нельзя списать больше, чем есть на складе</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопки */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button 
          type="submit" 
          disabled={
            formData.quantity <= 0 || 
            (formData.movementType === 'out' && formData.quantity > item.current_stock)
          }
        >
          Применить корректировку
        </Button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;