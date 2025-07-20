import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Phone, DollarSign, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';

interface OnlineBookingWidgetProps {
  salonId: string;
  embedded?: boolean;
}

const OnlineBookingWidget = ({ salonId, embedded = false }: OnlineBookingWidgetProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    petName: '',
    petBreed: '',
    notes: '',
    depositAmount: 0
  });
  
  const { toast } = useToast();
  const { services } = useServices();
  const { addAppointment, findOptimalSlot } = useAppointments();

  // Доступные дни на 2 недели вперед
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  // Получение доступных слотов для выбранной даты
  useEffect(() => {
    if (selectedDate) {
      generateAvailableSlots();
    }
  }, [selectedDate]);

  const generateAvailableSlots = async () => {
    if (!selectedDate) return;
    
    const slots = [];
    const workingHours = { start: 9, end: 18 };
    
    // Получаем занятые слоты на выбранную дату
    const { data: appointments } = await supabase
      .from('appointments')
      .select('scheduled_time, duration_minutes')
      .eq('salon_id', salonId)
      .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
      .not('status', 'in', '(cancelled,no_show)');

    const occupiedSlots = appointments?.map(apt => ({
      start: parseInt(apt.scheduled_time.split(':')[0]) * 60 + parseInt(apt.scheduled_time.split(':')[1]),
      end: parseInt(apt.scheduled_time.split(':')[0]) * 60 + parseInt(apt.scheduled_time.split(':')[1]) + apt.duration_minutes
    })) || [];

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = hour * 60 + minute;
        const slotDuration = 60; // Минимальная длительность слота
        const slotEnd = slotStart + slotDuration;
        
        if (slotEnd > workingHours.end * 60) continue;
        
        const hasConflict = occupiedSlots.some(occupied => 
          (slotStart < occupied.end && slotEnd > occupied.start)
        );
        
        if (!hasConflict) {
          slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(serviceId);
      setBookingData(prev => ({ 
        ...prev, 
        depositAmount: Math.round(service.price * 0.3) // 30% предоплата
      }));
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Создаем или находим клиента
      let clientId;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', bookingData.clientPhone)
        .eq('salon_id', salonId)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const [firstName, ...lastNameParts] = bookingData.clientName.split(' ');
        const { data: newClient } = await supabase
          .from('clients')
          .insert([{
            salon_id: salonId,
            first_name: firstName,
            last_name: lastNameParts.join(' ') || '',
            phone: bookingData.clientPhone,
            email: bookingData.clientEmail
          }])
          .select('id')
          .single();
        
        clientId = newClient?.id;
      }

      // Создаем питомца
      const { data: pet } = await supabase
        .from('pets')
        .insert([{
          client_id: clientId,
          name: bookingData.petName,
          breed: bookingData.petBreed
        }])
        .select('id')
        .single();

      // Получаем данные услуги
      const service = services.find(s => s.id === selectedService);
      
      // Создаем запись
      await addAppointment({
        client_id: clientId,
        pet_id: pet?.id,
        service_id: selectedService,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: selectedTime,
        duration_minutes: service?.duration_minutes || 60,
        price: service?.price || 0,
        deposit_amount: bookingData.depositAmount,
        status: 'scheduled',
        payment_status: 'pending',
        notes: bookingData.notes,
        reminder_sent: false
      });

      setStep(4); // Переход к экрану подтверждения
      
      toast({
        title: 'Успешно!',
        description: 'Запись создана. Мы свяжемся с вами для подтверждения.',
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать запись. Попробуйте еще раз.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <Card className={`w-full max-w-lg mx-auto ${embedded ? '' : 'shadow-lg'}`}>
      <CardHeader className="bg-gradient-primary text-white">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Онлайн запись
        </CardTitle>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3].map(num => (
            <div
              key={num}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step >= num ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Шаг 1: Выбор услуги */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Выберите услугу</h3>
            <div className="grid gap-3">
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedService === service.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{service.name}</h4>
                    <Badge variant="secondary">{service.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration_minutes} мин
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ₽{service.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => setStep(2)} 
              disabled={!selectedService}
              className="w-full bg-gradient-primary"
            >
              Далее
            </Button>
          </div>
        )}

        {/* Шаг 2: Выбор даты и времени */}
        {step === 2 && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="self-start"
            >
              ← Назад
            </Button>
            
            <h3 className="text-lg font-semibold">Выберите дату и время</h3>
            
            {selectedServiceData && (
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="font-medium">{selectedServiceData.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedServiceData.duration_minutes} мин • ₽{selectedServiceData.price}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label>Дата</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableDates.slice(0, 8).map(date => (
                  <Button
                    key={date.toISOString()}
                    variant={selectedDate?.toDateString() === date.toDateString() ? "default" : "outline"}
                    onClick={() => setSelectedDate(date)}
                    className="text-sm"
                  >
                    {format(date, 'dd.MM', { locale: ru })}
                    <br />
                    <span className="text-xs">
                      {format(date, 'EEE', { locale: ru })}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-3">
                <Label>Время</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(time => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                {availableSlots.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет доступных слотов на эту дату
                  </p>
                )}
              </div>
            )}

            <Button 
              onClick={() => setStep(3)} 
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-gradient-primary"
            >
              Далее
            </Button>
          </div>
        )}

        {/* Шаг 3: Контактная информация */}
        {step === 3 && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
              className="self-start"
            >
              ← Назад
            </Button>
            
            <h3 className="text-lg font-semibold">Контактная информация</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">ФИО владельца *</Label>
                <Input
                  id="clientName"
                  value={bookingData.clientName}
                  onChange={(e) => setBookingData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Телефон *</Label>
                <Input
                  id="clientPhone"
                  value={bookingData.clientPhone}
                  onChange={(e) => setBookingData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={bookingData.clientEmail}
                  onChange={(e) => setBookingData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="ivan@example.com"
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="petName">Кличка питомца *</Label>
                <Input
                  id="petName"
                  value={bookingData.petName}
                  onChange={(e) => setBookingData(prev => ({ ...prev, petName: e.target.value }))}
                  placeholder="Барсик"
                />
              </div>

              <div>
                <Label htmlFor="petBreed">Порода</Label>
                <Input
                  id="petBreed"
                  value={bookingData.petBreed}
                  onChange={(e) => setBookingData(prev => ({ ...prev, petBreed: e.target.value }))}
                  placeholder="Йоркширский терьер"
                />
              </div>

              <div>
                <Label htmlFor="notes">Дополнительные пожелания</Label>
                <Textarea
                  id="notes"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Особенности характера, аллергии, пожелания..."
                  rows={3}
                />
              </div>

              {bookingData.depositAmount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm font-medium text-amber-800">
                    Требуется предоплата: ₽{bookingData.depositAmount}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    Для подтверждения записи необходимо внести предоплату
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleBooking}
              disabled={!bookingData.clientName || !bookingData.clientPhone || !bookingData.petName || loading}
              className="w-full bg-gradient-primary"
            >
              {loading ? 'Создание записи...' : 'Записаться'}
            </Button>
          </div>
        )}

        {/* Шаг 4: Подтверждение */}
        {step === 4 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-green-800">Запись создана!</h3>
            
            <div className="space-y-2 text-sm">
              <p><strong>Дата:</strong> {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: ru })}</p>
              <p><strong>Время:</strong> {selectedTime}</p>
              <p><strong>Услуга:</strong> {selectedServiceData?.name}</p>
              <p><strong>Питомец:</strong> {bookingData.petName}</p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="text-blue-800">
                Мы свяжемся с вами в ближайшее время для подтверждения записи.
                {bookingData.depositAmount > 0 && ' Также отправим ссылку для оплаты предоплаты.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineBookingWidget;