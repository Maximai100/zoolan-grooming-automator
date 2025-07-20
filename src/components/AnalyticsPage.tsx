import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  PawPrint,
  RefreshCw,
  Target,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  UserCheck,
  Award,
  Building2,
  FileText,
  Calculator
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('kpi');
  
  const {
    kpiMetrics,
    kpiLoading,
    revenueForecast,
    forecastLoading,
    weeklyRevenue,
    weeklyRevenueLoading,
    topServices,
    topServicesLoading,
    refreshAllData
  } = useAnalytics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Моковые данные для демонстрации
  const staffPerformance = [
    { name: 'Анна Петрова', revenue: 145000, appointments: 67, rating: 4.9, efficiency: 95 },
    { name: 'Мария Иванова', revenue: 132000, appointments: 59, rating: 4.8, efficiency: 92 },
    { name: 'Елена Сидорова', revenue: 118000, appointments: 52, rating: 4.7, efficiency: 88 },
    { name: 'Ольга Козлова', revenue: 104000, appointments: 46, rating: 4.6, efficiency: 85 }
  ];

  const profitLossData = [
    { period: 'Янв', revenue: 450000, expenses: 320000, profit: 130000 },
    { period: 'Фев', revenue: 520000, expenses: 350000, profit: 170000 },
    { period: 'Мар', revenue: 480000, expenses: 340000, profit: 140000 },
    { period: 'Апр', revenue: 590000, expenses: 380000, profit: 210000 },
    { period: 'Май', revenue: 670000, expenses: 420000, profit: 250000 },
    { period: 'Июн', revenue: 720000, expenses: 450000, profit: 270000 }
  ];

  const clientRetentionData = [
    { month: 'Янв', newClients: 45, returningClients: 123, churnRate: 8.5 },
    { month: 'Фев', newClients: 52, returningClients: 134, churnRate: 7.2 },
    { month: 'Мар', newClients: 38, returningClients: 145, churnRate: 6.8 },
    { month: 'Апр', newClients: 61, returningClients: 156, churnRate: 5.9 },
    { month: 'Май', newClients: 48, returningClients: 167, churnRate: 5.2 },
    { month: 'Июн', newClients: 44, returningClients: 178, churnRate: 4.8 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Продвинутая аналитика</h1>
          <p className="text-muted-foreground">
            Детальные отчеты и KPI метрики вашего салона
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Экспорт
          </Button>
          <Button onClick={refreshAllData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kpi">KPI Метрики</TabsTrigger>
          <TabsTrigger value="forecast">Прогнозирование</TabsTrigger>
          <TabsTrigger value="staff">Отчеты по персоналу</TabsTrigger>
          <TabsTrigger value="financial">Финансовые отчеты</TabsTrigger>
        </TabsList>

        {/* KPI Метрики */}
        <TabsContent value="kpi" className="space-y-6">
          {/* Основные KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpiLoading ? '...' : formatCurrency(kpiMetrics?.total_revenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% от прошлого месяца
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Конверсия записей</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpiLoading ? '...' : '87.3%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Выполнено из запланированных
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpiLoading ? '...' : formatCurrency(kpiMetrics?.avg_ticket || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8.2% от прошлого месяца
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Повторные клиенты</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73.4%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% от прошлого месяца
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Детальная аналитика */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Динамика выручки</CardTitle>
                <CardDescription>За последние 6 месяцев</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitLossData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Удержание клиентов</CardTitle>
                <CardDescription>Новые vs возвращающиеся клиенты</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientRetentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newClients" fill="#8884d8" />
                    <Bar dataKey="returningClients" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Топ услуги с диаграммой */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение услуг</CardTitle>
              <CardDescription>По количеству записей и выручке</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={topServices}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {topServices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(service.revenue)}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.count} записей
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Прогнозирование */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Прогноз выручки на 30 дней
                </CardTitle>
                <CardDescription>
                  Машинное обучение на основе исторических данных и текущих трендов
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {forecastLoading ? (
                  <div>Загрузка прогноза...</div>
                ) : revenueForecast ? (
                  <>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(revenueForecast.predicted_revenue)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Запланированная выручка</span>
                        <span className="font-semibold">{formatCurrency(revenueForecast.scheduled_revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Прогнозируемая дополнительная</span>
                        <span className="font-semibold text-green-600">
                          +{formatCurrency(revenueForecast.predicted_revenue - revenueForecast.scheduled_revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Средняя дневная выручка</span>
                        <span className="font-semibold">{formatCurrency(revenueForecast.historical_daily_avg)}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span>Точность прогноза</span>
                          <Badge variant="secondary">
                            {formatPercentage(revenueForecast.confidence_level * 100)}
                          </Badge>
                        </div>
                        <Progress 
                          value={revenueForecast.confidence_level * 100} 
                          className="h-2 mt-2"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>Недостаточно данных для прогноза</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Факторы влияния</CardTitle>
                <CardDescription>Что влияет на прогноз</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Сезонность</span>
                    <Badge variant="outline">+15%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Тренд роста</span>
                    <Badge variant="outline">+8%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Маркетинг</span>
                    <Badge variant="outline">+5%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Новые услуги</span>
                    <Badge variant="outline">+12%</Badge>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Прогноз учитывает исторические данные, текущие бронирования и внешние факторы
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Сценарии прогноза */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Оптимистичный сценарий</CardTitle>
                <CardDescription>При росте на 20%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency((revenueForecast?.predicted_revenue || 0) * 1.2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Вероятность: 25%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Реалистичный сценарий</CardTitle>
                <CardDescription>Базовый прогноз</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(revenueForecast?.predicted_revenue || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Вероятность: 50%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Пессимистичный сценарий</CardTitle>
                <CardDescription>При снижении на 15%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency((revenueForecast?.predicted_revenue || 0) * 0.85)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Вероятность: 25%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Отчеты по персоналу */}
        <TabsContent value="staff" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Эффективность сотрудников
                </CardTitle>
                <CardDescription>Рейтинг по выручке и качеству работы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffPerformance.map((staff, index) => (
                    <div key={staff.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <h4 className="font-medium">{staff.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {staff.appointments} записей
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(staff.revenue)}</div>
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm">{staff.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Эффективность</span>
                          <span>{staff.efficiency}%</span>
                        </div>
                        <Progress value={staff.efficiency} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Сводная статистика</CardTitle>
                <CardDescription>По всем сотрудникам</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Общая выручка</span>
                    <span className="font-semibold">
                      {formatCurrency(staffPerformance.reduce((sum, s) => sum + s.revenue, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Всего записей</span>
                    <span className="font-semibold">
                      {staffPerformance.reduce((sum, s) => sum + s.appointments, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Средний рейтинг</span>
                    <span className="font-semibold">
                      {(staffPerformance.reduce((sum, s) => sum + s.rating, 0) / staffPerformance.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Средняя эффективность</span>
                    <span className="font-semibold">
                      {Math.round(staffPerformance.reduce((sum, s) => sum + s.efficiency, 0) / staffPerformance.length)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Детальная статистика по сотрудникам */}
          <Card>
            <CardHeader>
              <CardTitle>Производительность по месяцам</CardTitle>
              <CardDescription>Сравнение эффективности сотрудников</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={staffPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue') return formatCurrency(Number(value));
                    return value;
                  }} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                  <Bar dataKey="appointments" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Финансовые отчеты */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Прибыль за месяц
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(270000)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Маржинальность: 37.5%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <DollarSign className="h-5 w-5" />
                  Операционные расходы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(450000)}
                </div>
                <p className="text-sm text-muted-foreground">
                  62.5% от выручки
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Calculator className="h-5 w-5" />
                  EBITDA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(320000)}
                </div>
                <p className="text-sm text-muted-foreground">
                  44.4% от выручки
                </p>
              </CardContent>
            </Card>
          </div>

          {/* P&L отчет */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Отчет о прибылях и убытках
              </CardTitle>
              <CardDescription>Помесячная динамика за полугодие</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={profitLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#8884d8" name="Выручка" />
                  <Bar dataKey="expenses" fill="#ff8042" name="Расходы" />
                  <Bar dataKey="profit" fill="#00C49F" name="Прибыль" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Детализация расходов */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Структура расходов</CardTitle>
                <CardDescription>Основные категории затрат</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Зарплата персонала', amount: 180000, percent: 40 },
                    { category: 'Аренда помещения', amount: 90000, percent: 20 },
                    { category: 'Материалы и инструменты', amount: 67500, percent: 15 },
                    { category: 'Коммунальные услуги', amount: 45000, percent: 10 },
                    { category: 'Маркетинг и реклама', amount: 36000, percent: 8 },
                    { category: 'Прочие расходы', amount: 31500, percent: 7 }
                  ].map((expense) => (
                    <div key={expense.category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{expense.category}</span>
                          <span className="text-sm">{formatCurrency(expense.amount)}</span>
                        </div>
                        <Progress value={expense.percent} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Денежный поток</CardTitle>
                <CardDescription>Поступления и расходы по дням</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Поступления"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}