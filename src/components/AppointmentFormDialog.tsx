import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Heart } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useStaff } from '@/hooks/useStaff';
import { usePets } from '@/hooks/usePets';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  preselectedClient?: any;
  preselectedPet?: any;
  preselectedDate?: string;
  preselectedTime?: string;
}

// Генерируем временные слоты от 08:00 до 22:00 с интервалом 30 минут
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function AppointmentFormDialog({
  open,
  onClose,
  preselectedClient,
  preselectedPet,
  preselectedDate,
  preselectedTime
}: AppointmentFormDialogProps) {
  const { clients } = useClients();
  const { services } = useServices();
  const { staff } = useStaff();
  const { addAppointment } = useAppointments();
  const { toast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState(preselectedClient?.id || '');
  const [selectedPetId, setSelectedPetId] = useState(preselectedPet?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedGroomerId, setSelectedGroomerId] = useState('');
  const [date, setDate] = useState(preselectedDate || '');
  const [time, setTime] = useState(preselectedTime || '');
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Получаем питомцев выбранного клиента
  const { pets } = usePets(selectedClientId);

  // Устанавливаем предварительно выбранные значения
  useEffect(() => {
    if (preselectedClient?.id) {
      setSelectedClientId(preselectedClient.id);
    }
    if (preselectedPet?.id) {
      setSelectedPetId(preselectedPet.id);
    }
    if (preselectedDate) {
      setDate(preselectedDate);
    }
    if (preselectedTime) {
      setTime(preselectedTime);
    }
  }, [preselectedClient, preselectedPet, preselectedDate, preselectedTime]);

  // Обновляем цену при выборе услуги
  useEffect(() => {
    const selectedService = services.find(s => s.id === selectedServiceId);
    if (selectedService) {
      setPrice(selectedService.price);
      setDuration(selectedService.duration_minutes);
    }
  }, [selectedServiceId, services]);

  const handleSubmit = async () => {
    if (!selectedClientId || !selectedPetId || !selectedServiceId || !date || !time) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await addAppointment({
        client_id: selectedClientId,
        pet_id: selectedPetId,
        service_id: selectedServiceId,
        groomer_id: selectedGroomerId || null,
        scheduled_date: date,
        scheduled_time: time,
        duration_minutes: duration,
        price,
        notes,
        status: 'scheduled',
        payment_status: 'pending',
        deposit_amount: 0,
        reminder_sent: false
      });

      toast({
        title: 'Успешно',
        description: 'Запись создана'
      });

      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать запись',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClientId(preselectedClient?.id || '');
    setSelectedPetId(preselectedPet?.id || '');
    setSelectedServiceId('');
    setSelectedGroomerId('');
    setDate(preselectedDate || '');
    setTime(preselectedTime || '');
    setDuration(60);
    setPrice(0);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Новая запись на груминг
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Клиент *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {client.first_name} {client.last_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet">Питомец *</Label>
            <Select 
              value={selectedPetId} 
              onValueChange={setSelectedPetId}
              disabled={!selectedClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите питомца" />
              </SelectTrigger>
              <SelectContent>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {pet.name} {pet.breed && `(${pet.breed})`}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Услуга *</Label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                {services.filter(s => s.is_active).map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {service.price}₽ • {service.duration_minutes}мин
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="groomer">Грумер</Label>
            <Select value={selectedGroomerId} onValueChange={setSelectedGroomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите грумера" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Любой доступный</SelectItem>
                {staff.filter(s => s.role === 'groomer' || s.role === 'manager').map(groomer => (
                  <SelectItem key={groomer.id} value={groomer.id}>
                    {groomer.first_name} {groomer.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Дата *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Время *</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите время" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {TIME_SLOTS.map(timeSlot => (
                  <SelectItem key={timeSlot} value={timeSlot}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {timeSlot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Длительность (мин)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="15"
              step="15"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Цена (₽)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Заметки</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Дополнительная информация о записи"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-primary">
            {loading ? 'Создание...' : 'Создать запись'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}