import { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, User, Scissors, Sparkles, TrendingUp } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useToast } from '@/hooks/use-toast';
import AppointmentForm from './AppointmentForm';

// Настройка локализации для календаря
moment.locale('ru');
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'appointment';
    appointmentId: string;
    clientName: string;
    petName: string;
    serviceName: string;
    status: string;
    price: number;
    duration: number;
  };
}

export default function CalendarPage() {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const { appointments, updateAppointment } = useAppointments();
  const { clients } = useClients();
  const { services } = useServices();
  const { toast } = useToast();

  // Преобразование записей в события календаря
  useEffect(() => {
    if (appointments && clients && services) {
      const calendarEvents: CalendarEvent[] = appointments.map(appointment => {
        const client = clients.find(c => c.id === appointment.client_id);
        const service = services.find(s => s.id === appointment.service_id);
        
        const startDateTime = new Date(`${appointment.scheduled_date}T${appointment.scheduled_time}`);
        const endDateTime = new Date(startDateTime.getTime() + (appointment.duration_minutes * 60000));

        return {
          id: appointment.id,
          title: `${client?.first_name || 'Клиент'} - ${service?.name || 'Услуга'}`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            type: 'appointment',
            appointmentId: appointment.id,
            clientName: `${client?.first_name || ''} ${client?.last_name || ''}`.trim(),
            petName: appointment.pet_id || 'Питомец',
            serviceName: service?.name || 'Услуга',
            status: appointment.status,
            price: appointment.price,
            duration: appointment.duration_minutes
          }
        };
      });
      setEvents(calendarEvents);
    }
  }, [appointments, clients, services]);

  // Обработка выбора слота времени
  const handleSelectSlot = useCallback((slotInfo: any) => {
    setSelectedSlot(slotInfo);
    setShowForm(true);
  }, []);

  // Обработка выбора события
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  // Обработка перетаскивания события
  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    try {
      const newDate = moment(start).format('YYYY-MM-DD');
      const newTime = moment(start).format('HH:mm:ss');
      const newDuration = Math.round((end.getTime() - start.getTime()) / 60000);

      await updateAppointment(event.resource.appointmentId, {
        scheduled_date: newDate,
        scheduled_time: newTime,
        duration_minutes: newDuration
      });

      toast({
        title: 'Запись перенесена',
        description: `Новое время: ${moment(start).format('DD.MM.YYYY HH:mm')}`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось перенести запись',
        variant: 'destructive'
      });
    }
  }, [updateAppointment, toast]);

  // Изменение размера события
  const handleEventResize = useCallback(async ({ event, start, end }: any) => {
    try {
      const newDuration = Math.round((end.getTime() - start.getTime()) / 60000);

      await updateAppointment(event.resource.appointmentId, {
        duration_minutes: newDuration
      });

      toast({
        title: 'Длительность изменена',
        description: `Новая длительность: ${newDuration} мин`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить длительность',
        variant: 'destructive'
      });
    }
  }, [updateAppointment, toast]);

  // Определение цвета события по статусу
  const eventStyleGetter = (event: CalendarEvent) => {
    const { status } = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (status) {
      case 'scheduled':
        backgroundColor = '#3b82f6'; // blue
        break;
      case 'confirmed':
        backgroundColor = '#10b981'; // green
        break;
      case 'in_progress':
        backgroundColor = '#f59e0b'; // yellow
        break;
      case 'completed':
        backgroundColor = '#8b5cf6'; // purple
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // red
        break;
      case 'no_show':
        backgroundColor = '#6b7280'; // gray
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '4px'
      }
    };
  };

  // Кастомный компонент события
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="flex flex-col h-full p-1">
      <div className="font-medium text-xs truncate">
        {event.resource.clientName}
      </div>
      <div className="text-xs opacity-90 truncate">
        {event.resource.serviceName}
      </div>
      <div className="text-xs opacity-75">
        {event.resource.price}₽
      </div>
    </div>
  );

  // AI оптимизация - предложение лучших слотов
  const getOptimalSlots = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Простая логика - предлагаем утренние слоты в рабочие дни
    const optimalSlots = [];
    for (let i = 1; i <= 5; i++) { // Пн-Пт
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Утренние слоты 9:00, 10:00, 11:00
      for (let hour = 9; hour <= 11; hour++) {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        
        // Проверяем, что слот свободен
        const hasConflict = events.some(event => 
          event.start <= slot && event.end > slot
        );
        
        if (!hasConflict) {
          optimalSlots.push(slot);
        }
      }
    }
    
    return optimalSlots.slice(0, 6); // Возвращаем до 6 оптимальных слотов
  };

  // Вычисление загрузки календаря
  const getCalendarUtilization = () => {
    const today = new Date();
    const todayEvents = events.filter(e => moment(e.start).isSame(today, 'day'));
    const workingHours = 12; // 8:00 - 20:00
    const busyHours = todayEvents.reduce((sum, e) => sum + e.resource.duration, 0) / 60;
    return Math.round((busyHours / workingHours) * 100);
  };

  const optimalSlots = getOptimalSlots();
  const utilization = getCalendarUtilization();

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Календарь записей</h1>
          <p className="text-muted-foreground">
            Перетаскивайте записи для изменения времени • Изменяйте размер для длительности
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setDate(new Date())}
          >
            Сегодня
          </Button>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Новая запись
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создать запись</DialogTitle>
              </DialogHeader>
              <AppointmentForm 
                selectedDate={selectedSlot?.start}
                open={false}
                onClose={() => setShowForm(false)}
                onSubmit={() => {}}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Статистика и AI оптимизация */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Статистика дня */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Записей сегодня</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => moment(e.start).isSame(new Date(), 'day')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Подтверждено</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => 
                      moment(e.start).isSame(new Date(), 'day') && 
                      e.resource.status === 'confirmed'
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Загрузка</p>
                  <p className="text-2xl font-bold">{utilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gradient-primary rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Выручка</p>
                  <p className="text-2xl font-bold">
                    {events
                      .filter(e => moment(e.start).isSame(new Date(), 'day'))
                      .reduce((sum, e) => sum + e.resource.price, 0)
                    }₽
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Оптимизация */}
        {optimalSlots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI Рекомендации
              </CardTitle>
              <CardDescription>
                Оптимальные свободные слоты
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {optimalSlots.slice(0, 4).map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSlot({ start: slot, end: new Date(slot.getTime() + 60 * 60 * 1000) });
                      setShowForm(true);
                    }}
                    className="w-full justify-start text-xs"
                  >
                    <Clock className="h-3 w-3 mr-2" />
                    {moment(slot).format('dd DD.MM HH:mm')}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Легенда статусов */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Запланировано</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Подтверждено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">В процессе</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Завершено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Отменено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm">Не явились</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основной календарь */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <DragAndDropCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              selectable
              resizable
              draggableAccessor={() => true}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent
              }}
              messages={{
                next: 'Далее',
                previous: 'Назад',
                today: 'Сегодня',
                month: 'Месяц',
                week: 'Неделя',
                day: 'День',
                agenda: 'Повестка',
                date: 'Дата',
                time: 'Время',
                event: 'Событие',
                noEventsInRange: 'Нет записей в этом диапазоне.',
                allDay: 'Весь день'
              }}
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                  localizer?.format(start, 'HH:mm', culture) + ' - ' + localizer?.format(end, 'HH:mm', culture),
                dayFormat: 'dd DD.MM',
                dayHeaderFormat: 'dddd DD.MM.YYYY'
              }}
              min={new Date(2024, 0, 1, 8, 0, 0)} // Начало рабочего дня 8:00
              max={new Date(2024, 0, 1, 20, 0, 0)} // Конец рабочего дня 20:00
              step={30} // Шаг 30 минут
              timeslots={2} // 2 слота по 30 минут = 1 час
            />
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно выбранного события */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Детали записи</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Клиент</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.resource.clientName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Питомец</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.resource.petName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Услуга</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.resource.serviceName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Стоимость</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.resource.price}₽
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Время</label>
                  <p className="text-sm text-muted-foreground">
                    {moment(selectedEvent.start).format('DD.MM.YYYY HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Статус</label>
                  <Badge variant="outline">
                    {selectedEvent.resource.status}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}