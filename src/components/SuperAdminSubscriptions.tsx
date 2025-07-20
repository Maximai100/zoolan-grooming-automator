import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, CreditCard, Calendar, Building2, Settings, CheckCircle, XCircle } from 'lucide-react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminSubscriptions() {
  const { subscriptions, loading, error, isSuperAdmin, updateSubscriptionStatus } = useSuperAdmin();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.salon_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Активная</Badge>;
      case 'trial':
        return <Badge variant="secondary">Пробная</Badge>;
      case 'expired':
        return <Badge variant="destructive">Истекшая</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Отменена</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleStatusChange = async (subscriptionId: string, newStatus: string) => {
    try {
      await updateSubscriptionStatus(subscriptionId, newStatus);
      toast({
        title: "Статус обновлен",
        description: `Статус подписки успешно изменен на ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус подписки",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Управление подписками</h1>
        <p className="text-muted-foreground">
          Просмотр и управление всеми подписками в системе
        </p>
      </div>

      {/* Фильтры */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Поиск и фильтры</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Поиск</Label>
              <Input
                id="search"
                placeholder="Название салона или тариф..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Статус подписки</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активная</SelectItem>
                  <SelectItem value="trial">Пробная</SelectItem>
                  <SelectItem value="expired">Истекшая</SelectItem>
                  <SelectItem value="cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица подписок */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Подписки ({filteredSubscriptions.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Салон</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Стоимость</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Автопродление</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{subscription.salon_name}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium">{subscription.plan_name}</span>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(subscription.status)}
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium">{formatCurrency(subscription.price)}</span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(subscription.started_at)}
                        </div>
                        {subscription.expires_at && (
                          <div className="text-muted-foreground">
                            до {formatDate(subscription.expires_at)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {subscription.auto_renew ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Да
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <XCircle className="h-4 w-4 mr-1" />
                          Нет
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {subscription.status === 'trial' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Активировать
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Активировать подписку?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы хотите активировать подписку для салона "{subscription.salon_name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleStatusChange(subscription.id, 'active')}
                                >
                                  Активировать
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {subscription.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Отменить
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Отменить подписку?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы хотите отменить подписку для салона "{subscription.salon_name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleStatusChange(subscription.id, 'cancelled')}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Отменить подписку
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Подписки не найдены</h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить параметры поиска
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}