
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppointments } from '../hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';
import AppointmentForm from './AppointmentForm';
import { 
  Plus, Calendar as CalendarIcon, Clock, Users, 
  CheckCircle, XCircle, AlertCircle, RefreshCw,
  Filter, Eye, Edit, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Настройка локализации
moment.locale('ru');
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment, refetch } = useAppointments();
  const { toast } = useToast();
  
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  // Преобразование записей для календаря
  const calendarEvents = appointments.map(appointment => ({
    ...appointment,
    title: `${appointment.clients?.first_name} ${appointment.clients?.last_name} - ${appointment.services?.name}`,
    start: new Date(`${appointment.scheduled_date}T${appointment.scheduled_time}`),
    end: new Date(new Date(`${appointment.scheduled_date}T${appointment.scheduled_time}`).getTime() + appointment.duration_minutes * 60000),
    resource: appointment
  }));

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource);
    setShowAppointmentDetails(true);
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      await addAppointment(appointmentData);
      setShowAppointmentForm(false);
      setSelectedSlot(null);
      toast({
        title: 'Успешно',
        description: 'Запись добавлена',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateAppointment = async (appointmentData) => {
    try {
      await updateAppointment(selectedAppointment.id, appointmentData);
      setShowAppointmentForm(false);
      setSelectedAppointment(null);
      toast({
        title: 'Успешно',
        description: 'Запись обновлена',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAppointment = async () => {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await deleteAppointment(selectedAppointment.id);
        setShowAppointmentDetails(false);
        setSelectedAppointment(null);
        toast({
          title: 'Успешно',
          description: 'Запись удалена',
        });
      } catch (error: any) {
        toast({
          title: 'Ошибка',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'no_show': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusName = (status) => {
    const names = {
      'scheduled': 'Запланировано',
      'confirmed': 'Подтверждено',
      'completed': 'Выполнено',
      'cancelled': 'Отменено',
      'no_show': 'Не явился'
    };
    return names[status] || status;
  };

  // Статистика
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.scheduled_date).toDateString();
    return today === aptDate;
  });

  const appointmentStats = {
    today: todayAppointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length,
    cancelled: appointments.filter(a => ['cancelled', 'no_show'].includes(a.status)).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Загрузка расписания...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Расписание</h1>
          <p className="text-muted-foreground">Управление записями и календарем</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button 
            onClick={() => {
              setSelectedSlot(null);
              setSelectedAppointment(null);
              setShowAppointmentForm(true);
            }}
            className="bg-gradient-primary text-white shadow-soft hover:shadow-glow"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Новая запись
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{appointmentStats.today}</div>
                <div className="text-sm text-muted-foreground">Сегодня</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{appointmentStats.completed}</div>
                <div className="text-sm text-muted-foreground">Выполнено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{appointmentStats.pending}</div>
                <div className="text-sm text-muted-foreground">Запланировано</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{appointmentStats.cancelled}</div>
                <div className="text-sm text-muted-foreground">Отменено</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Календарь */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              popup
              views={['month', 'week', 'day']}
              messages={{
                next: 'Следующий',
                previous: 'Предыдущий',
                today: 'Сегодня',
                month: 'Месяц',
                week: 'Неделя',
                day: 'День'
              }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.resource.status === 'completed' ? '#10b981' :
                                  event.resource.status === 'cancelled' ? '#ef4444' :
                                  event.resource.status === 'confirmed' ? '#3b82f6' : '#f59e0b',
                  borderRadius: '4px',
                  border: 'none',
                  color: 'white'
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Диалог добавления/редактирования записи */}
      <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Редактировать запись' : 'Новая запись'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о записи
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            appointment={selectedAppointment}
            selectedSlot={selectedSlot}
            onSubmit={selectedAppointment ? handleUpdateAppointment : handleAddAppointment}
            onCancel={() => {
              setShowAppointmentForm(false);
              setSelectedSlot(null);
              setSelectedAppointment(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Диалог деталей записи */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Детали записи</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedAppointment.status)}
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {getStatusName(selectedAppointment.status)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div><strong>Клиент:</strong> {selectedAppointment.clients?.first_name} {selectedAppointment.clients?.last_name}</div>
                <div><strong>Питомец:</strong> {selectedAppointment.pets?.name}</div>
                <div><strong>Услуга:</strong> {selectedAppointment.services?.name}</div>
                <div><strong>Дата:</strong> {format(new Date(selectedAppointment.scheduled_date), 'dd.MM.yyyy', { locale: ru })}</div>
                <div><strong>Время:</strong> {selectedAppointment.scheduled_time}</div>
                <div><strong>Длительность:</strong> {selectedAppointment.duration_minutes} мин</div>
                <div><strong>Цена:</strong> ₽{selectedAppointment.price}</div>
                {selectedAppointment.notes && (
                  <div><strong>Заметки:</strong> {selectedAppointment.notes}</div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => {
                    setShowAppointmentDetails(false);
                    setShowAppointmentForm(true);
                  }}
                  className="flex-1 bg-gradient-primary text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteAppointment}
                  className="bg-card text-foreground border-input hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
