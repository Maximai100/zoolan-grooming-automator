import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CreditCard, Users, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Loading } from '@/components/ui/loading';

export default function SuperAdminDashboard() {
  const { metrics, loading, error, isSuperAdmin } = useSuperAdmin();

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
        <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы</p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive">Ошибка загрузки</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Панель управления Зооплан</h1>
        <p className="text-muted-foreground">
          Общая статистика и управление системой
        </p>
      </div>

      {/* Основные метрики */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего салонов</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalSalons || 0}</div>
            <p className="text-xs text-muted-foreground">
              Активных: {metrics?.activeSalons || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные подписки</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Пробных: {metrics?.trialSubscriptions || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Всего в системе
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка за месяц</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Всего: {formatCurrency(metrics?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Статистика подписок */}
        <Card className="card-elevated animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Статистика подписок</span>
            </CardTitle>
            <CardDescription>
              Распределение подписок по статусам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="default">Активные</Badge>
                <span className="text-sm text-muted-foreground">
                  {metrics?.activeSubscriptions || 0}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Пробные</Badge>
                <span className="text-sm text-muted-foreground">
                  {metrics?.trialSubscriptions || 0}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">Истекшие</Badge>
                <span className="text-sm text-muted-foreground">
                  {metrics?.expiredSubscriptions || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ключевые показатели */}
        <Card className="card-elevated animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Ключевые показатели</span>
            </CardTitle>
            <CardDescription>
              Основные метрики бизнеса
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Конверсия trial → paid</span>
              <Badge variant="outline">
                {metrics?.activeSubscriptions && metrics?.trialSubscriptions 
                  ? Math.round((metrics.activeSubscriptions / (metrics.activeSubscriptions + metrics.trialSubscriptions)) * 100)
                  : 0
                }%
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Средняя выручка на салон</span>
              <Badge variant="outline">
                {formatCurrency(
                  metrics?.totalRevenue && metrics?.totalSalons 
                    ? metrics.totalRevenue / metrics.totalSalons 
                    : 0
                )}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Активность салонов</span>
              <Badge variant="outline">
                {metrics?.activeSalons && metrics?.totalSalons 
                  ? Math.round((metrics.activeSalons / metrics.totalSalons) * 100)
                  : 0
                }%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}