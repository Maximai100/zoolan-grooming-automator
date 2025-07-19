import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  AlertTriangle
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
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

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Аналитика и отчётность</h1>
          <p className="text-muted-foreground">
            Ключевые показатели эффективности вашего салона
          </p>
        </div>
        <Button onClick={refreshAllData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Обновить данные
        </Button>
      </div>

      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-6">
        <TabsList>
          <TabsTrigger value="7d">7 дней</TabsTrigger>
          <TabsTrigger value="30d">30 дней</TabsTrigger>
          <TabsTrigger value="90d">90 дней</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* KPI Метрики */}
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
                  За последние {selectedPeriod}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Записи</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpiLoading ? '...' : kpiMetrics?.completed_appointments || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Выполнено из {kpiMetrics?.total_appointments || 0}
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
                  На одну запись
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Неявки</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpiLoading ? '...' : formatPercentage(kpiMetrics?.no_show_percentage || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {kpiMetrics?.no_show_appointments || 0} из {kpiMetrics?.total_appointments || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Прогноз выручки */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Прогноз выручки на месяц
                </CardTitle>
                <CardDescription>
                  Прогнозируемая выручка на основе текущих бронирований и исторических данных
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
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Запланированная выручка</span>
                        <span>{formatCurrency(revenueForecast.scheduled_revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Средняя дневная выручка</span>
                        <span>{formatCurrency(revenueForecast.historical_daily_avg)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Уровень уверенности</span>
                        <Badge variant="secondary">
                          {formatPercentage(revenueForecast.confidence_level * 100)}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={revenueForecast.confidence_level * 100} 
                      className="h-2"
                    />
                  </>
                ) : (
                  <div>Недостаточно данных для прогноза</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Клиенты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Новые клиенты</span>
                    <span className="font-medium">{kpiMetrics?.new_clients || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Постоянные клиенты</span>
                    <span className="font-medium">{kpiMetrics?.repeat_clients || 0}</span>
                  </div>
                </div>
                <Progress 
                  value={
                    kpiMetrics?.new_clients && kpiMetrics?.repeat_clients
                      ? (kpiMetrics.repeat_clients / (kpiMetrics.new_clients + kpiMetrics.repeat_clients)) * 100
                      : 0
                  } 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Процент постоянных клиентов
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Топ услуги и породы */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Топ услуги
                </CardTitle>
                <CardDescription>По выручке за выбранный период</CardDescription>
              </CardHeader>
              <CardContent>
                {topServicesLoading ? (
                  <div>Загрузка...</div>
                ) : topServices.length > 0 ? (
                  <div className="space-y-3">
                    {topServices.map((service, index) => (
                      <div key={service.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
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
                ) : (
                  <div className="text-center text-muted-foreground">
                    Нет данных об услугах
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5" />
                  Популярные породы
                </CardTitle>
                <CardDescription>Топ пород питомцев по количеству записей</CardDescription>
              </CardHeader>
              <CardContent>
                {kpiLoading ? (
                  <div>Загрузка...</div>
                ) : kpiMetrics?.top_breeds && kpiMetrics.top_breeds.length > 0 ? (
                  <div className="space-y-3">
                    {kpiMetrics.top_breeds.map((breed, index) => (
                      <div key={breed.breed} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{breed.breed}</span>
                        </div>
                        <span className="font-semibold">{breed.count} записей</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Нет данных о породах
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* График недельной выручки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Динамика выручки за неделю
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyRevenueLoading ? (
                <div>Загрузка графика...</div>
              ) : weeklyRevenue.length > 0 ? (
                <div className="space-y-4">
                  {weeklyRevenue.map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="font-medium">{day.date}</span>
                      <span className="font-semibold">{formatCurrency(day.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Нет данных о выручке за последнюю неделю
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}