import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';

interface PersonalOfferFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const PersonalOfferForm = ({ onSubmit, onCancel }: PersonalOfferFormProps) => {
  const { clients } = useClients();
  const { services } = useServices();
  
  const [formData, setFormData] = useState({
    client_id: '',
    offer_type: 'discount' as 'discount' | 'bonus_points' | 'free_service' | 'free_product',
    title: '',
    description: '',
    discount_value: 0,
    bonus_points: 0,
    free_service_id: '',
    free_product_id: '',
    min_order_amount: 0,
    usage_limit: 1,
    usage_count: 0,
    is_active: true,
    is_used: false,
    valid_from: new Date(),
    valid_until: null as Date | null,
    trigger_condition: {}
  });

  const [clientSearch, setClientSearch] = useState('');
  const [showClientList, setShowClientList] = useState(false);

  const filteredClients = clients.filter(client => 
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === formData.client_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      valid_from: formData.valid_from.toISOString(),
      valid_until: formData.valid_until?.toISOString() || null,
      // Очищаем неиспользуемые поля в зависимости от типа предложения
      discount_value: formData.offer_type === 'discount' ? formData.discount_value : null,
      bonus_points: formData.offer_type === 'bonus_points' ? formData.bonus_points : null,
      free_service_id: formData.offer_type === 'free_service' ? formData.free_service_id : null,
      free_product_id: formData.offer_type === 'free_product' ? formData.free_product_id : null,
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Автоматически генерируем заголовок на основе типа предложения
    if (field === 'offer_type' || field === 'discount_value' || field === 'bonus_points') {
      generateTitle();
    }
  };

  const generateTitle = () => {
    let title = '';
    switch (formData.offer_type) {
      case 'discount':
        title = `Скидка ${formData.discount_value}%`;
        break;
      case 'bonus_points':
        title = `Бонус ${formData.bonus_points} баллов`;
        break;
      case 'free_service':
        title = 'Бесплатная услуга';
        break;
      case 'free_product':
        title = 'Бесплатный товар';
        break;
    }
    
    if (title && !formData.title) {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const selectClient = (client: any) => {
    setFormData(prev => ({ ...prev, client_id: client.id }));
    setClientSearch(`${client.first_name} ${client.last_name}`);
    setShowClientList(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Выбор клиента */}
      <Card>
        <CardHeader>
          <CardTitle>Клиент</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Выберите клиента *</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск клиента..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientList(true);
                  }}
                  onFocus={() => setShowClientList(true)}
                  className="pl-8"
                />
              </div>
              
              {showClientList && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectClient(client)}
                    >
                      <div className="font-medium">{client.first_name} {client.last_name}</div>
                      <div className="text-sm text-muted-foreground">{client.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedClient && (
              <div className="p-3 bg-gray-50 rounded border">
                <div className="font-medium">{selectedClient.first_name} {selectedClient.last_name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedClient.phone} • {selectedClient.total_visits} визитов • потрачено {selectedClient.total_spent} ₽
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Тип предложения */}
      <Card>
        <CardHeader>
          <CardTitle>Тип предложения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer_type">Тип предложения *</Label>
            <Select
              value={formData.offer_type}
              onValueChange={(value) => handleInputChange('offer_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Скидка в процентах</SelectItem>
                <SelectItem value="bonus_points">Бонусные баллы</SelectItem>
                <SelectItem value="free_service">Бесплатная услуга</SelectItem>
                <SelectItem value="free_product">Бесплатный товар</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Параметры в зависимости от типа */}
          {formData.offer_type === 'discount' && (
            <div className="space-y-2">
              <Label htmlFor="discount_value">Размер скидки (%) *</Label>
              <Input
                id="discount_value"
                type="number"
                min="1"
                max="100"
                value={formData.discount_value}
                onChange={(e) => handleInputChange('discount_value', parseInt(e.target.value))}
                required
              />
            </div>
          )}

          {formData.offer_type === 'bonus_points' && (
            <div className="space-y-2">
              <Label htmlFor="bonus_points">Количество бонусных баллов *</Label>
              <Input
                id="bonus_points"
                type="number"
                min="1"
                value={formData.bonus_points}
                onChange={(e) => handleInputChange('bonus_points', parseInt(e.target.value))}
                required
              />
            </div>
          )}

          {formData.offer_type === 'free_service' && (
            <div className="space-y-2">
              <Label htmlFor="free_service_id">Бесплатная услуга *</Label>
              <Select
                value={formData.free_service_id}
                onValueChange={(value) => handleInputChange('free_service_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.price} ₽
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Детали предложения */}
      <Card>
        <CardHeader>
          <CardTitle>Детали предложения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Например: Скидка 20%"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min_order_amount">Минимальная сумма заказа (₽)</Label>
              <Input
                id="min_order_amount"
                type="number"
                min="0"
                value={formData.min_order_amount}
                onChange={(e) => handleInputChange('min_order_amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Подробное описание предложения..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usage_limit">Лимит использований</Label>
              <Input
                id="usage_limit"
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) => handleInputChange('usage_limit', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Период действия */}
      <Card>
        <CardHeader>
          <CardTitle>Период действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Действует с *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.valid_from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.valid_from ? (
                      format(formData.valid_from, "PPP", { locale: ru })
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.valid_from}
                    onSelect={(date) => handleInputChange('valid_from', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Действует до</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.valid_until && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.valid_until ? (
                      format(formData.valid_until, "PPP", { locale: ru })
                    ) : (
                      <span>Без ограничений</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.valid_until}
                    onSelect={(date) => handleInputChange('valid_until', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={!formData.client_id || !formData.title}>
          Создать предложение
        </Button>
      </div>
    </form>
  );
};

export default PersonalOfferForm;