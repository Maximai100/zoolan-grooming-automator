import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { CheckCircle, XCircle, Clock, Users, Calendar, MessageSquare, MapPin, Zap } from 'lucide-react';

const SubscriptionPage = () => {
  const { plans, currentSubscription, usage, loading, subscribeToPlan, cancelSubscription } = useSubscriptions();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [cancellationReason, setCancellationReason] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'trial':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'trial':
        return 'Пробный период';
      case 'cancelled':
        return 'Отменена';
      case 'expired':
        return 'Истекла';
      default:
        return status;
    }
  };

  const calculateUsagePercentage = (current: number, max?: number) => {
    if (!max) return 0; // Unlimited
    return Math.min((current / max) * 100, 100);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'basic_calendar':
      case 'advanced_calendar':
        return <Calendar className="w-4 h-4" />;
      case 'client_management':
        return <Users className="w-4 h-4" />;
      case 'basic_notifications':
      case 'advanced_notifications':
        return <MessageSquare className="w-4 h-4" />;
      case 'multi_location':
        return <MapPin className="w-4 h-4" />;
      case 'all_features':
        return <Zap className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getFeatureName = (feature: string) => {
    const featureNames: { [key: string]: string } = {
      'basic_calendar': 'Базовый календарь',
      'advanced_calendar': 'Расширенный календарь',
      'client_management': 'Управление клиентами',
      'basic_notifications': 'Базовые уведомления',
      'advanced_notifications': 'Расширенные уведомления',
      'basic_analytics': 'Базовая аналитика',
      'analytics': 'Полная аналитика',
      'loyalty_programs': 'Программы лояльности',
      'inventory': 'Управление складом',
      'staff_management': 'Управление персоналом',
      'all_features': 'Все возможности',
      'multi_location': 'Несколько локаций',
      'api_access': 'API доступ',
      'priority_support': 'Приоритетная поддержка',
      'custom_branding': 'Персональный брендинг'
    };
    return featureNames[feature] || feature;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление подпиской</h1>
        <p className="text-muted-foreground">
          Управляйте вашим тарифным планом и отслеживайте использование
        </p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Текущая подписка</TabsTrigger>
          <TabsTrigger value="plans">Тарифные планы</TabsTrigger>
          <TabsTrigger value="usage">Использование</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {currentSubscription ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(currentSubscription.status)}
                      {currentSubscription.plan?.name}
                    </CardTitle>
                    <CardDescription>
                      Статус: {getStatusText(currentSubscription.status)}
                    </CardDescription>
                  </div>
                  <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                    {getStatusText(currentSubscription.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Дата начала</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(currentSubscription.started_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {currentSubscription.expires_at && (
                    <div>
                      <p className="text-sm font-medium">Дата окончания</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentSubscription.expires_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  )}
                  {currentSubscription.trial_ends_at && (
                    <div>
                      <p className="text-sm font-medium">Окончание пробного периода</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentSubscription.trial_ends_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Автопродление</p>
                    <p className="text-sm text-muted-foreground">
                      {currentSubscription.auto_renew ? 'Включено' : 'Отключено'}
                    </p>
                  </div>
                </div>

                {currentSubscription.status === 'active' && (
                  <div className="pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Отменить подписку</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Отменить подписку</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите отменить подписку? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                          <Label htmlFor="reason">Причина отмены (необязательно)</Label>
                          <Textarea
                            id="reason"
                            placeholder="Расскажите, почему вы отменяете подписку..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelSubscription(cancellationReason)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Отменить подписку
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Подписка не активна</CardTitle>
                <CardDescription>
                  У вас нет активной подписки. Выберите тарифный план для продолжения работы.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => {
                  const plansTab = document.querySelector('[value="plans"]') as HTMLButtonElement;
                  plansTab?.click();
                }}>
                  Выбрать тарифный план
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4 bg-muted p-1 rounded-lg">
              <Button
                variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingPeriod('monthly')}
              >
                Ежемесячно
              </Button>
              <Button
                variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingPeriod('yearly')}
              >
                Ежегодно
                <Badge variant="secondary" className="ml-2">-17%</Badge>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${currentSubscription?.plan_id === plan.id ? 'ring-2 ring-primary' : ''}`}>
                {currentSubscription?.plan_id === plan.id && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge>Текущий план</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {formatPrice(billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{billingPeriod === 'monthly' ? 'мес' : 'год'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Лимиты:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Клиенты: {plan.max_clients ? plan.max_clients : 'Неограниченно'}</li>
                      <li>Записи в месяц: {plan.max_appointments_per_month || 'Неограниченно'}</li>
                      <li>Уведомления в месяц: {plan.max_notifications_per_month || 'Неограниченно'}</li>
                      <li>Сотрудники: {plan.max_staff_members || 'Неограниченно'}</li>
                      <li>Локации: {plan.max_locations}</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Возможности:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          {getFeatureIcon(feature)}
                          {getFeatureName(feature)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    disabled={currentSubscription?.plan_id === plan.id}
                    onClick={() => subscribeToPlan(plan.id, billingPeriod)}
                  >
                    {currentSubscription?.plan_id === plan.id ? 'Текущий план' : 'Выбрать план'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {currentSubscription && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Клиенты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Использовано</span>
                      <span>
                        {usage?.clients_count || 0} / {currentSubscription.plan?.max_clients || '∞'}
                      </span>
                    </div>
                    <Progress
                      value={calculateUsagePercentage(
                        usage?.clients_count || 0,
                        currentSubscription.plan?.max_clients
                      )}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Записи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>В этом месяце</span>
                      <span>
                        {usage?.appointments_count || 0} / {currentSubscription.plan?.max_appointments_per_month || '∞'}
                      </span>
                    </div>
                    <Progress
                      value={calculateUsagePercentage(
                        usage?.appointments_count || 0,
                        currentSubscription.plan?.max_appointments_per_month
                      )}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Уведомления
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>В этом месяце</span>
                      <span>
                        {usage?.notifications_sent || 0} / {currentSubscription.plan?.max_notifications_per_month || '∞'}
                      </span>
                    </div>
                    <Progress
                      value={calculateUsagePercentage(
                        usage?.notifications_sent || 0,
                        currentSubscription.plan?.max_notifications_per_month
                      )}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Локации
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Доступно</span>
                      <span>1 / {currentSubscription.plan?.max_locations || 1}</span>
                    </div>
                    <Progress
                      value={calculateUsagePercentage(1, currentSubscription.plan?.max_locations)}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!currentSubscription && (
            <Card>
              <CardHeader>
                <CardTitle>Нет активной подписки</CardTitle>
                <CardDescription>
                  Для просмотра статистики использования необходима активная подписка.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionPage;