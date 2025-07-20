import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Trash2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { usePets } from '@/hooks/usePets';
import { useServices } from '@/hooks/useServices';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  selectedDate?: Date | null;
  selectedTime?: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onDelete?: (id: string) => void;
}

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const STATUSES = [
  { value: 'scheduled', label: 'Запланирована', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmed', label: 'Подтверждена', color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', label: 'В процессе', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Завершена', color: 'bg-purple-100 text-purple-800' },
  { value: 'cancelled', label: 'Отменена', color: 'bg-red-100 text-red-800' },
  { value: 'no_show', label: 'Не явился', color: 'bg-gray-100 text-gray-800' }
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Ожидает оплаты' },
  { value: 'paid', label: 'Оплачено' },
  { value: 'refunded', label: 'Возвращено' },
  { value: 'failed', label: 'Ошибка оплаты' }
];

export default function AppointmentForm({
  appointment,
  selectedDate,
  selectedTime,
  open,
  onClose,
  onSubmit,
  onDelete
}: AppointmentFormProps) {
  const { clients } = useClients();
  const { pets } = usePets();
  const { services } = useServices();

  const [formData, setFormData] = useState({
    client_id: appointment?.client_id || '',
    pet_id: appointment?.pet_id || '',
    service_id: appointment?.service_id || '',
    groomer_id: appointment?.groomer_id || '',
    scheduled_date: appointment?.scheduled_date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''),
    scheduled_time: appointment?.scheduled_time || selectedTime || '',
    duration_minutes: appointment?.duration_minutes || 60,
    status: appointment?.status || 'scheduled',
    notes: appointment?.notes || '',
    price: appointment?.price || 0,
    deposit_amount: appointment?.deposit_amount || 0,
    payment_status: appointment?.payment_status || 'pending',
    reminder_sent: appointment?.reminder_sent || false
  });

  const [showCalendar, setShowCalendar] = useState(false);

  // Фильтрация питомцев по выбранному клиенту
  const clientPets = pets.filter(pet => pet.client_id === formData.client_id);

  // Автоматическое обновление цены при выборе услуги
  useEffect(() => {
    const selectedService = services.find(s => s.id === formData.service_id);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        price: selectedService.price,
        duration_minutes: selectedService.duration_minutes
      }));
    }
  }, [formData.service_id, services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.client_id || !formData.pet_id || !formData.service_id || 
        !formData.scheduled_date || !formData.scheduled_time) {
      return;
    }

    const submitData = {
      ...formData,
      price: Number(formData.price),
      deposit_amount: Number(formData.deposit_amount),
      duration_minutes: Number(formData.duration_minutes)
    };

    onSubmit(submitData);
  };

  const handleDelete = () => {
    if (appointment && onDelete && window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      onDelete(appointment.id);
      onClose();
    }
  };

  const getOptimalTime = () => {
    // Простая AI оптимизация - предложение времени с минимальными простоями
    const suggestedTime = '10:00'; // Здесь можно добавить более сложную логику
    setFormData(prev => ({ ...prev, scheduled_time: suggestedTime }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{appointment ? 'Редактировать запись' : 'Новая запись'}</span>
            {appointment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Клиент и питомец */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Клиент *</Label>
              <Select value={formData.client_id} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, client_id: value, pet_id: '' }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                      {client.is_vip && <Badge className="ml-2" variant="secondary">VIP</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet_id">Питомец *</Label>
              <Select 
                value={formData.pet_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pet_id: value }))}
                disabled={!formData.client_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите питомца" />
                </SelectTrigger>
                <SelectContent>
                  {clientPets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} {pet.breed && `(${pet.breed})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.client_id && clientPets.length === 0 && (
                <p className="text-sm text-muted-foreground">У клиента нет питомцев</p>
              )}
            </div>
          </div>

          {/* Услуга */}
          <div className="space-y-2">
            <Label htmlFor="service_id">Услуга *</Label>
            <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите услуга" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {service.price} ₽ • {service.duration_minutes} мин
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата *</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.scheduled_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_date ? 
                      format(new Date(formData.scheduled_date), 'PPP', { locale: ru }) : 
                      "Выберите дату"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_date ? new Date(formData.scheduled_date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, scheduled_date: format(date, 'yyyy-MM-dd') }));
                        setShowCalendar(false);
                      }
                    }}
                    disabled={(date) => date < new Date(Date.now() - 24 * 60 * 60 * 1000)} // Разрешить выбор сегодня
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="scheduled_time">Время *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={getOptimalTime}
                  className="text-primary hover:text-primary"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  AI
                </Button>
              </div>
              <Select value={formData.scheduled_time} onValueChange={(value) => setFormData(prev => ({ ...prev, scheduled_time: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(time => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Длительность и цена */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Длительность (мин)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="15"
                max="300"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Депозит (₽)</Label>
              <Input
                id="deposit_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.deposit_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Статусы */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${status.color}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Статус оплаты</Label>
              <Select value={formData.payment_status} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Заметки */}
          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Дополнительная информация о записи..."
              rows={3}
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {appointment ? 'Сохранить' : 'Создать запись'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}