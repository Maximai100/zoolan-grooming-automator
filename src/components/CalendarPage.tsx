import { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Heart } from 'lucide-react';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import AppointmentForm from './AppointmentForm';

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments();

  const navigate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    const multiplier = direction === 'next' ? 1 : -1;
    setCurrentDate(prev => addDays(prev, days * multiplier));
  };

  const getViewDates = () => {
    switch (viewMode) {
      case 'day':
        return [currentDate];
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        });
      default:
        return [currentDate];
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.scheduled_date), date)
    ).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'no_show': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getStatusText = (status: string) => {
    const texts = {
      'scheduled': 'Запланирована',
      'confirmed': 'Подтверждена',
      'in_progress': 'В процессе',
      'completed': 'Завершена',
      'cancelled': 'Отменена',
      'no_show': 'Не явился'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleAddAppointment = (date?: Date, time?: string) => {
    setSelectedDate(date || currentDate);
    setSelectedTime(time || '');
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleSubmitAppointment = async (data: any) => {
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, data);
    } else {
      await addAppointment(data);
    }
    setShowAppointmentForm(false);
  };

  const formatDateTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'd MMMM yyyy', { locale: ru });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM yyyy', { locale: ru })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ru });
    }
  };

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Загрузка календаря...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{formatDateTitle()}</h1>
            <p className="text-sm text-muted-foreground">
              {viewMode === 'day' && isToday(currentDate) && 'Сегодня'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">День</SelectItem>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setCurrentDate(new Date())} variant="outline">
            Сегодня
          </Button>

          <Button onClick={() => handleAddAppointment()} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Новая запись
          </Button>
        </div>
      </div>

      {/* Календарь */}
      <div className="space-y-4">
        {viewMode === 'month' ? (
          // Месячный вид
          <div className="grid grid-cols-7 gap-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-muted-foreground border-b">
                {day}
              </div>
            ))}
            {getViewDates().map(date => {
              const dayAppointments = getAppointmentsForDate(date);
              return (
                <Card 
                  key={date.toISOString()} 
                  className={`min-h-24 p-2 cursor-pointer hover:shadow-md transition-shadow ${
                    isToday(date) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleAddAppointment(date)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(date, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div 
                        key={apt.id}
                        className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(apt);
                        }}
                      >
                        {apt.scheduled_time} {apt.client?.first_name}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 3} еще
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          // Дневной и недельный вид
          <div className={`grid gap-4 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
            {getViewDates().map(date => (
              <Card key={date.toISOString()} className={isToday(date) ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{format(date, 'EEE, d MMM', { locale: ru })}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleAddAppointment(date)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {viewMode === 'day' ? (
                    // Временные слоты для дневного вида
                    <div className="grid grid-cols-1 gap-2">
                      {timeSlots.map(time => {
                        const appointment = getAppointmentsForDate(date).find(apt => 
                          apt.scheduled_time.substring(0, 5) === time
                        );
                        
                        return (
                          <div key={time} className="flex items-center gap-3 min-h-12 p-2 border rounded">
                            <div className="text-sm font-medium text-muted-foreground w-16">
                              {time}
                            </div>
                            {appointment ? (
                              <div 
                                className="flex-1 p-2 rounded cursor-pointer hover:shadow-sm transition-shadow"
                                onClick={() => handleEditAppointment(appointment)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      {appointment.client?.first_name} {appointment.client?.last_name}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Heart className="h-3 w-3" />
                                      {appointment.pet?.name} • {appointment.service?.name}
                                    </div>
                                  </div>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {getStatusText(appointment.status)}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="flex-1 p-2 border-dashed border-2 border-muted rounded cursor-pointer hover:border-primary transition-colors"
                                onClick={() => handleAddAppointment(date, time)}
                              >
                                <div className="text-center text-muted-foreground">
                                  <Plus className="h-4 w-4 mx-auto mb-1" />
                                  Свободно
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Список записей для недельного вида
                    <div className="space-y-2">
                      {getAppointmentsForDate(date).map(appointment => (
                        <div 
                          key={appointment.id}
                          className="p-2 border rounded cursor-pointer hover:shadow-sm transition-shadow"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{appointment.scheduled_time.substring(0, 5)}</span>
                          </div>
                          <div className="text-sm mt-1">
                            {appointment.client?.first_name} • {appointment.pet?.name}
                          </div>
                          <Badge className={`mt-1 ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                      ))}
                      {getAppointmentsForDate(date).length === 0 && (
                        <div 
                          className="p-4 border-dashed border-2 border-muted rounded cursor-pointer hover:border-primary transition-colors text-center"
                          onClick={() => handleAddAppointment(date)}
                        >
                          <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <div className="text-muted-foreground">Нет записей</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Форма записи */}
      <AppointmentForm
        appointment={editingAppointment}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        open={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSubmit={handleSubmitAppointment}
        onDelete={deleteAppointment}
      />
    </div>
  );
}