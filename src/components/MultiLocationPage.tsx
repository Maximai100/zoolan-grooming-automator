import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  Calendar,
  BarChart3,
  Settings,
  Copy,
  ExternalLink,
  Globe,
  Phone,
  Mail,
  Zap,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Store,
  Network,
  Shield,
  ArrowUpDown,
  Target,
  Clock
} from "lucide-react";

interface Salon {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  currency: string;
  parent_salon_id: string | null;
  is_active: boolean;
  created_at: string;
  // Расширенная статистика
  clients_count?: number;
  appointments_count?: number;
  monthly_revenue?: number;
  staff_count?: number;
  utilization_rate?: number;
  avg_rating?: number;
  growth_rate?: number;
}

export default function MultiLocationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      
      // Расширенные данные салонов
      setSalons([
        {
          id: "main",
          name: "Зооплан • Главный",
          description: "Флагманский салон сети Зооплан",
          address: "г. Москва, ул. Тверская, д. 15",
          phone: "+7 (495) 123-45-67",
          email: "main@zooplan.ru",
          website: "https://zooplan.ru",
          timezone: "Europe/Moscow",
          currency: "RUB",
          parent_salon_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          clients_count: 1247,
          appointments_count: 156,
          monthly_revenue: 890000,
          staff_count: 8,
          utilization_rate: 89,
          avg_rating: 4.8,
          growth_rate: 15.2
        },
        {
          id: "north", 
          name: "Зооплан • Север",
          description: "Северный филиал",
          address: "г. Москва, Ленинградский проспект, д. 45",
          phone: "+7 (495) 123-45-68",
          email: "north@zooplan.ru",
          website: "https://zooplan.ru/north",
          timezone: "Europe/Moscow",
          currency: "RUB",
          parent_salon_id: "main",
          is_active: true,
          created_at: new Date().toISOString(),
          clients_count: 834,
          appointments_count: 98,
          monthly_revenue: 567000,
          staff_count: 6,
          utilization_rate: 82,
          avg_rating: 4.7,
          growth_rate: 12.8
        },
        {
          id: "south",
          name: "Зооплан • Юг",
          description: "Южный филиал",
          address: "г. Москва, Каширское шоссе, д. 78",
          phone: "+7 (495) 123-45-69",
          email: "south@zooplan.ru",
          website: "https://zooplan.ru/south",
          timezone: "Europe/Moscow",
          currency: "RUB",
          parent_salon_id: "main",
          is_active: true,
          created_at: new Date().toISOString(),
          clients_count: 692,
          appointments_count: 76,
          monthly_revenue: 445000,
          staff_count: 5,
          utilization_rate: 78,
          avg_rating: 4.6,
          growth_rate: 8.9
        },
        {
          id: "west",
          name: "Зооплан • Запад",
          description: "Западный филиал (в разработке)",
          address: "г. Москва, Кутузовский проспект, д. 32",
          phone: "+7 (495) 123-45-70",
          email: "west@zooplan.ru",
          website: "",
          timezone: "Europe/Moscow",
          currency: "RUB",
          parent_salon_id: "main",
          is_active: false,
          created_at: new Date().toISOString(),
          clients_count: 0,
          appointments_count: 0,
          monthly_revenue: 0,
          staff_count: 2,
          utilization_rate: 0,
          avg_rating: 0,
          growth_rate: 0
        }
      ]);
    } catch (error) {
      console.error('Error fetching salons:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о салонах",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSalon = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const parentSalonId = formData.get('parent_salon_id') as string;

    try {
      const newSalon: Salon = {
        id: Date.now().toString(),
        name: `Зооплан • ${name}`,
        description,
        address, 
        phone,
        email,
        website: "",
        timezone: "Europe/Moscow",
        currency: "RUB",
        parent_salon_id: parentSalonId || "main",
        is_active: false,
        created_at: new Date().toISOString(),
        clients_count: 0,
        appointments_count: 0,
        monthly_revenue: 0,
        staff_count: 0,
        utilization_rate: 0,
        avg_rating: 0,
        growth_rate: 0
      };

      setSalons(prev => [...prev, newSalon]);
      setShowCreateDialog(false);
      
      toast({
        title: "Успех",
        description: "Новый салон создан и готов к настройке"
      });
    } catch (error) {
      console.error('Error creating salon:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать салон",
        variant: "destructive"
      });
    }
  };

  const switchToSalon = (salonId: string) => {
    setSelectedSalon(salonId);
    const salon = salons.find(s => s.id === salonId);
    toast({
      title: "Переключение салона",
      description: `Переключились на ${salon?.name}`,
    });
  };

  const copyApiUrl = (salonId: string) => {
    const apiUrl = `https://api.zooplan.ru/v1/salons/${salonId}`;
    navigator.clipboard.writeText(apiUrl);
    toast({
      title: "Скопировано",
      description: "API URL скопирован в буфер обмена"
    });
  };

  const syncSettings = (fromSalonId: string, toSalonId: string) => {
    toast({
      title: "Синхронизация",
      description: "Настройки синхронизированы между салонами",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const getTotalStats = () => {
    const activeSalons = salons.filter(s => s.is_active);
    return {
      totalRevenue: activeSalons.reduce((sum, s) => sum + (s.monthly_revenue || 0), 0),
      totalClients: activeSalons.reduce((sum, s) => sum + (s.clients_count || 0), 0),
      totalAppointments: activeSalons.reduce((sum, s) => sum + (s.appointments_count || 0), 0),
      totalStaff: activeSalons.reduce((sum, s) => sum + (s.staff_count || 0), 0),
      avgUtilization: activeSalons.length > 0 
        ? activeSalons.reduce((sum, s) => sum + (s.utilization_rate || 0), 0) / activeSalons.length 
        : 0,
      avgRating: activeSalons.length > 0 
        ? activeSalons.reduce((sum, s) => sum + (s.avg_rating || 0), 0) / activeSalons.length 
        : 0
    };
  };

  const totalStats = getTotalStats();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Сеть салонов Зооплан</h1>
          <p className="text-muted-foreground">Централизованное управление всеми локациями</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedSalon} onValueChange={setSelectedSalon}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Выберите салон" />
            </SelectTrigger>
            <SelectContent>
              {salons.filter(s => s.is_active).map((salon) => (
                <SelectItem key={salon.id} value={salon.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {salon.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить салон
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новый салон</DialogTitle>
                <DialogDescription>Добавьте новый филиал в сеть Зооплан</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSalon(new FormData(e.currentTarget));
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Название локации</Label>
                      <Input id="name" name="name" placeholder="Например: Центр" required />
                    </div>
                    <div>
                      <Label htmlFor="parent_salon_id">Родительский салон</Label>
                      <Select name="parent_salon_id">
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {salons.filter(s => !s.parent_salon_id).map((salon) => (
                            <SelectItem key={salon.id} value={salon.id}>
                              {salon.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea id="description" name="description" placeholder="Краткое описание филиала" />
                  </div>
                  <div>
                    <Label htmlFor="address">Полный адрес</Label>
                    <Input id="address" name="address" placeholder="г. Москва, ул. Примерная, д. 1" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+7 (495) 123-45-67" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="salon@zooplan.ru" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">Создать салон</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Сводная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Общая выручка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">За месяц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Клиенты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Уникальных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Записи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Активных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4 text-orange-600" />
              Салоны
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {salons.filter(s => s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Активных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              Загрузка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {totalStats.avgUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Средняя</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-yellow-600" />
              Рейтинг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {totalStats.avgRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Средний</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор локаций</TabsTrigger>
          <TabsTrigger value="management">Централизованное управление</TabsTrigger>
          <TabsTrigger value="analytics">Сравнительная аналитика</TabsTrigger>
          <TabsTrigger value="operations">Операционное управление</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {salons.map((salon) => (
              <Card key={salon.id} className={`relative transition-all hover:shadow-lg ${
                salon.is_active 
                  ? 'border-l-4 border-l-green-500' 
                  : 'border-l-4 border-l-gray-400 opacity-75'
              } ${selectedSalon === salon.id ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className={`h-8 w-8 ${salon.is_active ? 'text-primary' : 'text-gray-400'}`} />
                      <div>
                        <Badge variant={salon.is_active ? "default" : "secondary"} className="mb-1">
                          {salon.is_active ? "Активен" : "В разработке"}
                        </Badge>
                        {salon.parent_salon_id && (
                          <Badge variant="outline" className="ml-1">Филиал</Badge>
                        )}
                      </div>
                    </div>
                    {salon.is_active && (
                      <Button 
                        size="sm" 
                        variant={selectedSalon === salon.id ? "default" : "outline"}
                        onClick={() => switchToSalon(salon.id)}
                      >
                        {selectedSalon === salon.id ? "Текущий" : "Переключиться"}
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-xl">{salon.name}</CardTitle>
                  <CardDescription>{salon.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{salon.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{salon.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{salon.email}</span>
                    </div>
                  </div>

                  {salon.is_active && (
                    <>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                          <p className="text-lg font-bold">{salon.clients_count}</p>
                          <p className="text-xs text-muted-foreground">Клиенты</p>
                        </div>
                        <div className="text-center">
                          <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                          <p className="text-lg font-bold">{salon.appointments_count}</p>
                          <p className="text-xs text-muted-foreground">Записи</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Выручка за месяц</span>
                          <span className="font-semibold">{formatCurrency(salon.monthly_revenue || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Загруженность</span>
                          <span className="font-semibold">{salon.utilization_rate}%</span>
                        </div>
                        <Progress value={salon.utilization_rate} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{salon.avg_rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">+{salon.growth_rate}%</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => copyApiUrl(salon.id)} className="flex-1">
                      <Copy className="h-3 w-3 mr-1" />
                      API
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingSalon(salon)}>
                      <Settings className="h-3 w-3 mr-1" />
                      Настроить
                    </Button>
                    {salon.website && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={salon.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Синхронизация данных
                </CardTitle>
                <CardDescription>Синхронизируйте настройки между салонами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Услуги и цены</span>
                    <Button size="sm" variant="outline">Синхронизировать</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Шаблоны уведомлений</span>
                    <Button size="sm" variant="outline">Синхронизировать</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Настройки бренда</span>
                    <Button size="sm" variant="outline">Синхронизировать</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Программы лояльности</span>
                    <Button size="sm" variant="outline">Синхронизировать</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Перенос данных
                </CardTitle>
                <CardDescription>Перемещение клиентов и записей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Из салона</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите салон" />
                      </SelectTrigger>
                      <SelectContent>
                        {salons.filter(s => s.is_active).map((salon) => (
                          <SelectItem key={salon.id} value={salon.id}>
                            {salon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>В салон</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите салон" />
                      </SelectTrigger>
                      <SelectContent>
                        {salons.filter(s => s.is_active).map((salon) => (
                          <SelectItem key={salon.id} value={salon.id}>
                            {salon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Перенести выбранные</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Права доступа
                </CardTitle>
                <CardDescription>Управление ролями и доступом</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Администраторы сети</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Менеджеры филиалов</span>
                    <Badge variant="outline">4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Общие сотрудники</span>
                    <Badge variant="outline">19</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Управление ролями
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Единые настройки сети
              </CardTitle>
              <CardDescription>Настройки, применяемые ко всем салонам сети</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Часовой пояс</Label>
                  <Select defaultValue="Europe/Moscow">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                      <SelectItem value="Europe/Kaliningrad">Калининград (UTC+2)</SelectItem>
                      <SelectItem value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Валюта</Label>
                  <Select defaultValue="RUB">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUB">Российский рубль</SelectItem>
                      <SelectItem value="EUR">Евро</SelectItem>
                      <SelectItem value="USD">Доллар США</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Язык интерфейса</Label>
                  <Select defaultValue="ru">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Формат даты</Label>
                  <Select defaultValue="DD.MM.YYYY">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD.MM.YYYY">ДД.ММ.ГГГГ</SelectItem>
                      <SelectItem value="MM/DD/YYYY">ММ/ДД/ГГГГ</SelectItem>
                      <SelectItem value="YYYY-MM-DD">ГГГГ-ММ-ДД</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Сравнение по выручке</CardTitle>
                <CardDescription>Месячная выручка по салонам</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salons.filter(s => s.is_active).map((salon) => {
                    const percentage = totalStats.totalRevenue > 0 
                      ? ((salon.monthly_revenue || 0) / totalStats.totalRevenue) * 100 
                      : 0;
                    return (
                      <div key={salon.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{salon.name}</span>
                          <span className="text-sm">{formatCurrency(salon.monthly_revenue || 0)}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% от общей выручки
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Эффективность по локациям</CardTitle>
                <CardDescription>Ключевые метрики производительности</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salons.filter(s => s.is_active).map((salon) => (
                    <div key={salon.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{salon.name}</h4>
                        <Badge variant="outline">{salon.avg_rating}/5.0</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{salon.clients_count}</p>
                          <p className="text-muted-foreground">Клиенты</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{salon.utilization_rate}%</p>
                          <p className="text-muted-foreground">Загрузка</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-green-600">+{salon.growth_rate}%</p>
                          <p className="text-muted-foreground">Рост</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Детальное сравнение</CardTitle>
              <CardDescription>Подробная аналитика по всем показателям</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Салон</th>
                      <th className="text-right p-2">Выручка</th>
                      <th className="text-right p-2">Клиенты</th>
                      <th className="text-right p-2">Записи</th>
                      <th className="text-right p-2">Загрузка</th>
                      <th className="text-right p-2">Рейтинг</th>
                      <th className="text-right p-2">Рост</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salons.filter(s => s.is_active).map((salon) => (
                      <tr key={salon.id} className="border-b">
                        <td className="p-2 font-medium">{salon.name}</td>
                        <td className="p-2 text-right">{formatCurrency(salon.monthly_revenue || 0)}</td>
                        <td className="p-2 text-right">{salon.clients_count}</td>
                        <td className="p-2 text-right">{salon.appointments_count}</td>
                        <td className="p-2 text-right">{salon.utilization_rate}%</td>
                        <td className="p-2 text-right">{salon.avg_rating}</td>
                        <td className="p-2 text-right text-green-600">+{salon.growth_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Управление расписанием
                </CardTitle>
                <CardDescription>Координация работы всех салонов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Единое расписание
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Перераспределение записей
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Управление сменами
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Персонал
                </CardTitle>
                <CardDescription>Управление сотрудниками сети</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Ротация персонала
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Обучение и аттестация
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Система мотивации
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Автоматизация
                </CardTitle>
                <CardDescription>Автоматические процессы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Авто-распределение клиентов</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Балансировка нагрузки</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Умные уведомления</span>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Оперативная сводка</CardTitle>
              <CardDescription>Текущее состояние всех салонов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {salons.filter(s => s.is_active).map((salon) => (
                  <div key={salon.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{salon.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Записи сегодня:</span>
                        <span className="font-medium">{Math.floor((salon.appointments_count || 0) / 7)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Свободных слотов:</span>
                        <span className="font-medium text-green-600">
                          {Math.floor(Math.random() * 10) + 5}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Сотрудников на смене:</span>
                        <span className="font-medium">{salon.staff_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Статус:</span>
                        <Badge variant="default" className="text-xs">Работает</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}