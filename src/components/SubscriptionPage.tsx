import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { CreditCard, Crown, Zap, Building2, Users, Calendar, Bell, CheckCircle } from "lucide-react";

export default function SubscriptionPage() {
  const { toast } = useToast();
  const { currentSubscription, plans, usage, loading } = useSubscriptions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Стартовый')) return <Zap className="h-5 w-5" />;
    if (planName.includes('Профессиональный')) return <Crown className="h-5 w-5" />;
    if (planName.includes('Бизнес')) return <Building2 className="h-5 w-5" />;
    return <CreditCard className="h-5 w-5" />;
  };

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Подписка</h1>
          <p className="text-muted-foreground">Управление тарифным планом и использованием ресурсов</p>
        </div>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPlanIcon(currentSubscription.plan_name)}
                <CardTitle>{currentSubscription.plan_name}</CardTitle>
                <Badge variant={getStatusColor(currentSubscription.status)}>
                  {currentSubscription.status === 'active' ? 'Активна' : 
                   currentSubscription.status === 'trial' ? 'Пробная' :
                   currentSubscription.status === 'cancelled' ? 'Отменена' : 'Истекла'}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₽{currentSubscription.plan_price}</p>
                <p className="text-sm text-muted-foreground">в месяц</p>
              </div>
            </div>
            <CardDescription>{currentSubscription.plan_description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentSubscription.expires_at && (
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Истекает</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentSubscription.expires_at).toLocaleDateString('ru')}
                  </p>
                </div>
              )}
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Сотрудники</p>
                <p className="text-sm text-muted-foreground">
                  до {currentSubscription.max_staff_members || '∞'}
                </p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <Bell className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Уведомления</p>
                <p className="text-sm text-muted-foreground">
                  до {currentSubscription.max_notifications_per_month || '∞'} в месяц
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>Использование ресурсов</CardTitle>
            <CardDescription>Текущий период: {new Date().toLocaleDateString('ru', { month: 'long', year: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Записи в этом месяце</span>
                <span>{usage.appointments_count} / {currentSubscription?.max_appointments_per_month || '∞'}</span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.appointments_count, currentSubscription?.max_appointments_per_month)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Отправлено уведомлений</span>
                <span>{usage.notifications_sent} / {currentSubscription?.max_notifications_per_month || '∞'}</span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.notifications_sent, currentSubscription?.max_notifications_per_month)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Доступные планы</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.name.includes('Профессиональный') ? 'border-primary shadow-lg' : ''}`}>
              {plan.name.includes('Профессиональный') && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">Популярный</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getPlanIcon(plan.name)}
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="text-3xl font-bold">₽{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">До {plan.max_clients || '∞'} клиентов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">До {plan.max_appointments_per_month || '∞'} записей/месяц</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">До {plan.max_staff_members || '∞'} сотрудников</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">До {plan.max_notifications_per_month || '∞'} уведомлений/месяц</span>
                  </div>
                  {plan.features?.analytics && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Аналитика и отчеты</span>
                    </div>
                  )}
                  {plan.features?.api_access && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">API доступ</span>
                    </div>
                  )}
                  {plan.features?.multi_location && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Мультилокации</span>
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full" 
                  variant={currentSubscription?.plan_id === plan.id ? "outline" : "default"}
                  disabled={currentSubscription?.plan_id === plan.id}
                >
                  {currentSubscription?.plan_id === plan.id ? 'Текущий план' : 'Выбрать план'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}