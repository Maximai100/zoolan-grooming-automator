import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Bell, BarChart3, DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Сегодняшние записи",
      value: "12",
      change: "+3 с вчера",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Доход за месяц",
      value: "₽340,000",
      change: "+12% к прошлому месяцу",
      icon: DollarSign,
      color: "text-accent"
    },
    {
      title: "Активные клиенты",
      value: "248",
      change: "+18 новых",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Загруженность",
      value: "85%",
      change: "Оптимальная",
      icon: TrendingUp,
      color: "text-primary"
    }
  ];

  const todayAppointments = [
    {
      time: "09:00",
      client: "Анна Петрова",
      pet: "Макс (Золотистый ретривер)",
      service: "Полный груминг",
      duration: "2 часа",
      status: "confirmed"
    },
    {
      time: "11:30",
      client: "Игорь Смирнов", 
      pet: "Белла (Йоркширский терьер)",
      service: "Стрижка когтей",
      duration: "30 мин",
      status: "in-progress"
    },
    {
      time: "14:00",
      client: "Елена Козлова",
      pet: "Рекс (Немецкая овчарка)",
      service: "Мытье и сушка",
      duration: "1 час",
      status: "upcoming"
    },
    {
      time: "16:30",
      client: "Михаил Волков",
      pet: "Люся (Персидская кошка)",
      service: "Полный груминг",
      duration: "1.5 часа",
      status: "upcoming"
    }
  ];

  const recentActivity = [
    {
      action: "Новая запись",
      details: "Мария Иванова записала Бобика на завтра",
      time: "5 мин назад",
      type: "booking"
    },
    {
      action: "Платеж получен",
      details: "₽3,500 от Анны Петровой",
      time: "15 мин назад", 
      type: "payment"
    },
    {
      action: "Напоминание отправлено",
      details: "SMS Игорю Смирнову о записи",
      time: "1 час назад",
      type: "reminder"
    },
    {
      action: "Новый отзыв",
      details: "⭐⭐⭐⭐⭐ от Елены Козловой",
      time: "2 часа назад",
      type: "review"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-primary/10 text-primary">Подтверждено</Badge>;
      case "in-progress":
        return <Badge className="bg-accent/10 text-accent">В процессе</Badge>;
      case "upcoming":
        return <Badge variant="outline">Ожидает</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-4 h-4 text-primary" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-accent" />;
      case "reminder":
        return <Bell className="w-4 h-4 text-muted-foreground" />;
      case "review":
        return <BarChart3 className="w-4 h-4 text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Добро пожаловать обратно! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Сегодня отличный день для ухода за питомцами
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Новая запись
          </Button>
          <Button variant="hero">
            <Users className="w-4 h-4 mr-2" />
            Добавить клиента
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card className="shadow-card hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Записи на сегодня
              </CardTitle>
              <CardDescription>
                Всего записей: {todayAppointments.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-lg text-foreground">
                          {appointment.time}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="font-medium text-foreground">{appointment.client}</div>
                        <div>{appointment.pet}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span>{appointment.service}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {appointment.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Детали
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="shadow-card hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Последняя активность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {activity.action}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.details}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые функции для ускорения работы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="premium" className="h-20 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span>Календарь</span>
            </Button>
            <Button variant="premium" className="h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Клиенты</span>
            </Button>
            <Button variant="premium" className="h-20 flex-col gap-2">
              <Bell className="w-6 h-6" />
              <span>Напоминания</span>
            </Button>
            <Button variant="premium" className="h-20 flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>Отчеты</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;