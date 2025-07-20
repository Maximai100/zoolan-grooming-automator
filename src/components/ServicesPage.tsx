import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Scissors,
  Filter,
  Settings
} from 'lucide-react';
import { useServices, Service } from '@/hooks/useServices';
import { useToast } from '@/hooks/use-toast';

const SERVICE_CATEGORIES = [
  { value: 'grooming', label: 'Груминг', color: 'bg-primary text-primary-foreground' },
  { value: 'bathing', label: 'Мытье', color: 'bg-blue-100 text-blue-800' },
  { value: 'trimming', label: 'Стрижка', color: 'bg-green-100 text-green-800' },
  { value: 'spa', label: 'SPA процедуры', color: 'bg-purple-100 text-purple-800' },
  { value: 'nail_care', label: 'Уход за когтями', color: 'bg-orange-100 text-orange-800' },
  { value: 'dental_care', label: 'Уход за зубами', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'additional', label: 'Дополнительные услуги', color: 'bg-gray-100 text-gray-800' }
];

interface ServiceFormProps {
  service?: Service | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function ServiceForm({ service, open, onClose, onSubmit }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || 0,
    duration_minutes: service?.duration_minutes || 60,
    is_active: service?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      return;
    }

    const submitData = {
      ...formData,
      price: Number(formData.price),
      duration_minutes: Number(formData.duration_minutes)
    };

    onSubmit(submitData);
    onClose();
    
    // Сброс формы
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      duration_minutes: 60,
      is_active: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {service ? 'Редактировать услугу' : 'Новая услуга'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название услуги *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Полный груминг"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Подробное описание услуги..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (мин)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="300"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Активная услуга</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {service ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ServicesPage() {
  const { services, loading, addService, updateService } = useServices();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Фильтрация услуг
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Группировка по категориям
  const servicesByCategory = SERVICE_CATEGORIES.map(category => ({
    ...category,
    services: filteredServices.filter(service => service.category === category.value)
  })).filter(category => category.services.length > 0);

  const handleAddService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleSubmitService = async (data: any) => {
    if (editingService) {
      await updateService(editingService.id, data);
    } else {
      await addService(data);
    }
  };

  const getCategoryInfo = (categoryValue: string) => {
    return SERVICE_CATEGORIES.find(cat => cat.value === categoryValue) || SERVICE_CATEGORIES[0];
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
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scissors className="h-8 w-8 text-primary" />
            Услуги
          </h1>
          <p className="text-muted-foreground mt-2">
            Управление услугами салона груминга
          </p>
        </div>

        <Button onClick={handleAddService} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Добавить услугу
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scissors className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{services.length}</div>
                <div className="text-sm text-muted-foreground">Всего услуг</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {services.filter(s => s.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">Активных</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length || 0)} ₽
                </div>
                <div className="text-sm text-muted-foreground">Средняя цена</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(services.reduce((sum, s) => sum + s.duration_minutes, 0) / services.length || 0)} мин
                </div>
                <div className="text-sm text-muted-foreground">Среднее время</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск услуг..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {SERVICE_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Список услуг по категориям */}
      <div className="space-y-6">
        {servicesByCategory.map(category => (
          <Card key={category.value}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge className={category.color}>
                  {category.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {category.services.length} услуг
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {category.services.map(service => (
                  <div 
                    key={service.id} 
                    className={`p-4 border rounded-lg transition-colors ${
                      service.is_active ? 'border-border' : 'border-muted bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-medium ${
                            !service.is_active ? 'text-muted-foreground' : ''
                          }`}>
                            {service.name}
                          </h3>
                          {!service.is_active && (
                            <Badge variant="outline">Неактивна</Badge>
                          )}
                        </div>
                        
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {service.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{service.price} ₽</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{service.duration_minutes} мин</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredServices.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Услуги не найдены</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Попробуйте изменить условия поиска'
                  : 'Добавьте первую услугу для начала работы'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <Button onClick={handleAddService} className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить услугу
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Форма услуги */}
      <ServiceForm
        service={editingService}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmitService}
      />
    </div>
  );
}