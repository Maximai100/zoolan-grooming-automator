import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Mail
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
  // Статистика (заглушка)
  clients_count?: number;
  appointments_count?: number;
  monthly_revenue?: number;
}

export default function MultiLocationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      
      // Заглушка данных пока типы не обновлены
      setSalons([
        {
          id: "1",
          name: "Главный салон",
          description: "Основной салон груминга",
          address: "г. Москва, ул. Примерная, д. 1",
          phone: "+7 (495) 123-45-67",
          email: "main@salon.ru",
          website: "https://salon.ru",
          timezone: "Europe/Moscow",
          currency: "RUB",
          parent_salon_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          clients_count: 245,
          appointments_count: 89,
          monthly_revenue: 450000
        },
        {
          id: "2", 
          name: "Филиал \"Север\"",
          description: "Северный филиал",
          address: "г. Москва, ул. Северная, д. 10",
          phone: "+7 (495) 123-45-68",
          email: "north@salon.ru",
          website: "https://salon.ru/north",
          timezone: "Europe/Moscow",
          currency: "RUB",
          parent_salon_id: "1",
          is_active: true,
          created_at: new Date().toISOString(),
          clients_count: 156,
          appointments_count: 67,
          monthly_revenue: 280000
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

    try {
      // Временная заглушка
      const newSalon: Salon = {
        id: Date.now().toString(),
        name,
        description,
        address, 
        phone,
        email,
        website: "",
        timezone: "Europe/Moscow",
        currency: "RUB",
        parent_salon_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        clients_count: 0,
        appointments_count: 0,
        monthly_revenue: 0
      };

      setSalons(prev => [...prev, newSalon]);
      setShowCreateDialog(false);
      
      toast({
        title: "Успех",
        description: "Новый салон создан"
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

  const copyApiUrl = (salonId: string) => {
    const apiUrl = `https://d82e03d1-52f4-4dab-96e8-6e6c67ad8ae0.lovableproject.com/api/v1/salons/${salonId}`;
    navigator.clipboard.writeText(apiUrl);
    toast({
      title: "Скопировано",
      description: "API URL скопирован в буфер обмена"
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Мультилокации</h1>
          <p className="text-muted-foreground">Управление филиалами и сетью салонов</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить салон
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый салон</DialogTitle>
              <DialogDescription>Добавьте новый филиал или партнерский салон</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSalon(new FormData(e.currentTarget));
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Название салона</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div>
                  <Label htmlFor="address">Адрес</Label>
                  <Input id="address" name="address" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Создать</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="management">Управление</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <Card key={salon.id} className={`relative ${salon.parent_salon_id ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Building2 className="h-8 w-8 text-primary" />
                    <Badge variant={salon.is_active ? "default" : "secondary"}>
                      {salon.is_active ? "Активен" : "Неактивен"}
                    </Badge>
                  </div>
                  <CardTitle>{salon.name}</CardTitle>
                  <CardDescription>{salon.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span className="text-muted-foreground">{salon.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span className="text-muted-foreground">{salon.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span className="text-muted-foreground">{salon.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
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
                    <div className="text-center">
                      <BarChart3 className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="text-lg font-bold">₽{salon.monthly_revenue?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Выручка</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
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

        <TabsContent value="management">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Централизованное управление</CardTitle>
                <CardDescription>Настройки, применяемые ко всем салонам</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Settings className="h-6 w-6 mb-2" />
                    Синхронизировать услуги
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Перенести клиентов
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Globe className="h-6 w-6 mb-2" />
                    Единые настройки бренда
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Сводная отчетность
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Общая выручка</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₽{salons.reduce((sum, salon) => sum + (salon.monthly_revenue || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">За текущий месяц</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Всего клиентов</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{salons.reduce((sum, salon) => sum + (salon.clients_count || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Уникальных клиентов</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Активные записи</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{salons.reduce((sum, salon) => sum + (salon.appointments_count || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">На эту неделю</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Активных салонов</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{salons.filter(s => s.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Из {salons.length} общих</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}