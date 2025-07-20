
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useServices } from '../hooks/useServices';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Search, Scissors, Clock, DollarSign, 
  Edit, Trash2, Package, Settings, Star,
  Filter, RefreshCw, Grid, List
} from 'lucide-react';

const ServicesPage = () => {
  const { services, loading, addService, updateService, deleteService, refetch } = useServices();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Форма услуги
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration_minutes: '60',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      duration_minutes: '60',
      is_active: true
    });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes)
      };

      if (editingService) {
        await updateService(editingService.id, serviceData);
        toast({
          title: 'Успешно',
          description: 'Услуга обновлена',
        });
      } else {
        await addService(serviceData);
        toast({
          title: 'Успешно',
          description: 'Услуга добавлена',
        });
      }
      
      setShowServiceForm(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      is_active: service.is_active
    });
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        await deleteService(serviceId);
        toast({
          title: 'Успешно',
          description: 'Услуга удалена',
        });
      } catch (error: any) {
        toast({
          title: 'Ошибка',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  
  const filteredServices = services.filter(service => {
    if (categoryFilter !== 'all' && service.category !== categoryFilter) return false;
    if (searchTerm && !service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !service.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const serviceStats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    categories: categories.length,
    avgPrice: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Загрузка услуг...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Услуги</h1>
          <p className="text-muted-foreground">Управление прайс-листом и услугами салона</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button 
            onClick={() => setShowServiceForm(true)}
            className="bg-gradient-primary text-white shadow-soft hover:shadow-glow"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить услугу
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{serviceStats.total}</div>
                <div className="text-sm text-muted-foreground">Всего услуг</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{serviceStats.active}</div>
                <div className="text-sm text-muted-foreground">Активных</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{serviceStats.categories}</div>
                <div className="text-sm text-muted-foreground">Категорий</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">₽{serviceStats.avgPrice}</div>
                <div className="text-sm text-muted-foreground">Средняя цена</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск услуг..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Список услуг */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
        {filteredServices.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет услуг</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Попробуйте изменить параметры поиска'
                    : 'Добавьте первую услугу в прайс-лист'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <Button 
                    onClick={() => setShowServiceForm(true)}
                    className="bg-gradient-primary text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить услугу
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredServices.map((service) => (
            viewMode === 'grid' ? (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {service.category && (
                        <Badge variant="secondary" className="mt-1">
                          {service.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {!service.is_active && (
                        <Badge variant="destructive">Неактивна</Badge>
                      )}
                    </div>
                  </div>
                  {service.description && (
                    <CardDescription className="mt-2">
                      {service.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration_minutes} мин</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-foreground">₽{service.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="flex-1 bg-card text-foreground border-input hover:bg-accent"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="bg-card text-foreground border-input hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{service.name}</h3>
                          {service.category && (
                            <Badge variant="secondary">{service.category}</Badge>
                          )}
                          {!service.is_active && (
                            <Badge variant="destructive">Неактивна</Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_minutes} мин</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-foreground">₽{service.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                        className="bg-card text-foreground border-input hover:bg-accent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="bg-card text-foreground border-input hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))
        )}
      </div>

      {/* Диалог добавления/редактирования услуги */}
      <Dialog open={showServiceForm} onOpenChange={(open) => {
        setShowServiceForm(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Редактировать услугу' : 'Добавить услугу'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию об услуге
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название услуги *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Стрижка собак"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Груминг"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="1500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Длительность (мин)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                  placeholder="60"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Описание услуги..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Услуга активна</Label>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-primary text-white">
                {editingService ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowServiceForm(false)}
                className="bg-card text-foreground border-input"
              >
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
