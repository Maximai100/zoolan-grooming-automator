import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Bell, BarChart3, DollarSign, Clock, TrendingUp, AlertCircle, Plus, ChevronRight, Heart, Star, Phone } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { clients, loading: clientsLoading } = useClients();
  const { services, loading: servicesLoading } = useServices();
  
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentClients, setRecentClients] = useState([]);

  // Загрузка данных о выручке
  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const startDate = startOfMonth(new Date());
        const endDate = endOfMonth(new Date());
        
        const { data, error } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('payment_status', 'paid')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (!error && data) {
          const total = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
          setMonthlyRevenue(total);
        }
      } catch (error) {
        console.error('Error fetching revenue:', error);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  // Фильтрация сегодняшних записей
  useEffect(() => {
    if (!appointmentsLoading && appointments.length > 0) {
      const today = appointments.filter(apt => 
        isToday(new Date(apt.scheduled_date))
      ).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
      setTodayAppointments(today);
    }
  }, [appointments, appointmentsLoading]);

  // Недавние клиенты
  useEffect(() => {
    if (!clientsLoading) {
      if (clients.length > 0) {
        const recent = clients
          .slice()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentClients(recent);
      } else {
        setRecentClients([]);
      }
    }
  }, [clients, clientsLoading]);

  const stats = [
    {
      title: "Сегодняшние записи",
      value: todayAppointments.length.toString(),
      change: todayAppointments.filter(apt => apt.status === 'confirmed').length > 0 
        ? `${todayAppointments.filter(apt => apt.status === 'confirmed').length} подтверждено`
        : "Нет подтвержденных",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Доход за месяц",
      value: `₽${monthlyRevenue.toLocaleString()}`,
      change: monthlyRevenue > 0 ? "Активные продажи" : "Нет продаж",
      icon: DollarSign,
      color: "text-accent"
    },
    {
      title: "Активные клиенты",
      value: clients.length.toString(),
      change: `${recentClients.length} новых`,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Услуг доступно",
      value: services.filter(s => s.is_active).length.toString(),
      change: `${services.length} всего`,
      icon: BarChart3,
      color: "text-primary"
    }
  ];

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

  const loading = appointmentsLoading || clientsLoading || servicesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Загрузка дашборда...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Добро пожаловать в Зооплан! 👋
        </h1>
        <p className="text-muted-foreground">
          Управляйте своим салоном груминга эффективно
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="metric-card group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-0">
              <div className="flex items-center space-x-4">
                <div className="metric-icon group-hover:scale-110 transition-transform duration-200">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <TrendingUp className="h-4 w-4 text-green-500 opacity-70" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold gradient-text">
                      {stat.value}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <div className="status-dot bg-green-500"></div>
                    {stat.change}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Сегодняшние записи */}
        <Card className="enhanced-card animate-slide-up lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Записи на сегодня
              </CardTitle>
              <CardDescription className="text-accent font-medium">
                {format(new Date(), 'EEEE, d MMMM', { locale: ru })}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="btn-secondary hover:scale-105 transition-transform"
              onClick={() => window.location.href = '/calendar'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 6).map((appointment, index) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-all duration-200 hover:shadow-sm bg-gradient-to-r from-card to-card/50 animate-fade-in-left group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm whitespace-nowrap">
                      {appointment.scheduled_time.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm truncate">
                        {appointment.client?.first_name} {appointment.client?.last_name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {appointment.pet?.name}
                      </span>
                      <span className="mx-1">•</span>
                      {appointment.service?.name}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(appointment.status)} transition-all duration-200 hover:scale-105`}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет записей на сегодня</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Создайте первую запись для начала работы
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/calendar'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить запись
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Недавние клиенты */}
        <Card className="enhanced-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Недавние клиенты
              </CardTitle>
              <CardDescription>
                Последние добавленные клиенты
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="btn-secondary hover:scale-105 transition-transform"
              onClick={() => window.location.href = '/clients'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClients.length > 0 ? (
              recentClients.map((client, index) => (
                <div 
                  key={client.id} 
                  className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-all duration-200 hover:shadow-sm bg-gradient-to-r from-card to-card/50 animate-fade-in-left group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium shadow-soft group-hover:shadow-glow transition-shadow">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    {client.is_vip && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                        <Star className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm truncate">
                        {client.first_name} {client.last_name}
                      </span>
                      {client.is_vip && (
                        <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors">VIP</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                      <span className="mx-1">•</span>
                      {client.total_visits} визитов
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium gradient-text">₽{client.total_spent.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">потрачено</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет клиентов</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Добавьте первого клиента для начала работы
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/clients'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить клиента
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые функции для эффективной работы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/calendar'}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Новая запись</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/clients'}
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">Добавить клиента</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/notifications'}
            >
              <Bell className="h-5 w-5" />
              <span className="text-sm">Отправить напоминание</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/analytics'}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Посмотреть аналитика</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Уведомления и задачи */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>Важные уведомления</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
              <div className="font-medium text-sm">Система готова к работе</div>
              <div className="text-xs text-muted-foreground mt-1">
                Все модули CRM настроены и функционируют
              </div>
            </div>
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <div className="font-medium text-sm">Добавьте первых клиентов</div>
              <div className="text-xs text-muted-foreground mt-1">
                Начните с добавления информации о ваших клиентах
              </div>
            </div>
            <div className="p-3 border-l-4 border-green-500 bg-green-50">
              <div className="font-medium text-sm">Настройте напоминания</div>
              <div className="text-xs text-muted-foreground mt-1">
                Автоматические SMS и email для клиентов
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Полезные советы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium text-sm">💡 Оптимизация записей</div>
              <div className="text-xs text-muted-foreground mt-1">
                Используйте AI-помощник для подбора оптимального времени записи
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium text-sm">📊 Аналитика продаж</div>
              <div className="text-xs text-muted-foreground mt-1">
                Отслеживайте KPI и прогнозы доходности в разделе "Аналитика"
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium text-sm">🎯 Программы лояльности</div>
              <div className="text-xs text-muted-foreground mt-1">
                Создавайте персональные предложения для постоянных клиентов
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;