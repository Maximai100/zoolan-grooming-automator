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
import { Search, Building2, Mail, Phone, MapPin, Calendar, Eye } from 'lucide-react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Loading } from '@/components/ui/loading';

export default function SuperAdminSalons() {
  const { salons, loading, error, isSuperAdmin } = useSuperAdmin();
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

  const filteredSalons = salons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salon.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salon.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || salon.subscription_status === statusFilter;
    
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
        return <Badge variant="outline">Нет подписки</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Управление салонами</h1>
        <p className="text-muted-foreground">
          Просмотр и управление всеми салонами в системе
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
                placeholder="Название, email или телефон салона..."
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
                  <SelectItem value="none">Нет подписки</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица салонов */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Салоны ({filteredSalons.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Салон</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Подписка</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalons.map((salon) => (
                  <TableRow key={salon.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{salon.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {salon.address || 'Адрес не указан'}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {salon.email || 'Email не указан'}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {salon.phone || 'Телефон не указан'}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(salon.subscription_status)}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{salon.subscription_plan}</span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(salon.created_at)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredSalons.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Салоны не найдены</h3>
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