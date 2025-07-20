
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClients } from '../hooks/useClients';
import { usePets } from '@/hooks/usePets';
import { useToast } from '@/hooks/use-toast';
import ClientForm from './ClientForm';
import PetsModal from './PetsModal';
import ClientCard from './ClientCard';
import AppointmentFormDialog from './AppointmentFormDialog';
import { 
  Plus, Search, Filter, Users, Phone, Mail, 
  Calendar, MapPin, Edit, Trash2, Eye, Star,
  UserPlus, Tag, Grid, List, Heart, TrendingUp,
  AlertTriangle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ClientsPage = () => {
  const { clients, loading, addClient, updateClient, deleteClient, refetch } = useClients();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("cards");
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);

  const handleAddClient = async (clientData: any) => {
    try {
      await addClient(clientData);
      setShowClientForm(false);
      toast({
        title: 'Успешно',
        description: 'Клиент добавлен',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateClient = async (clientData: any) => {
    try {
      await updateClient(editingClient.id, clientData);
      setEditingClient(null);
      setShowClientForm(false);
      toast({
        title: 'Успешно',
        description: 'Данные клиента обновлены',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        await deleteClient(clientId);
        toast({
          title: 'Успешно',
          description: 'Клиент удален',
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

  const handleScheduleAppointment = (client: any) => {
    setSelectedClient(client);
    setShowAppointmentForm(true);
  };

  // Получаем всех питомцев для подсчета и фильтрации по породам
  const allPets = clients.flatMap(client => client.pets || []);
  const uniqueBreeds = [...new Set(allPets.map(pet => pet.breed).filter(Boolean))];

  const filteredClients = clients
    .filter(client => {
      // Фильтр по статусу
      if (statusFilter === 'vip' && !client.is_vip) return false;
      if (statusFilter === 'regular' && client.is_vip) return false;
      if (statusFilter === 'new') {
        const createdDate = new Date(client.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (createdDate <= monthAgo) return false;
      }
      if (statusFilter === 'inactive' && client.last_visit_date) return false;

      // Фильтр по тегам
      if (tagFilter !== 'all' && !client.tags?.includes(tagFilter)) return false;

      // Фильтр по породам питомцев
      if (breedFilter !== 'all') {
        const clientPets = client.pets || [];
        if (!clientPets.some(pet => pet.breed === breedFilter)) return false;
      }

      // Поиск
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
        const pets = client.pets || [];
        const petNames = pets.map(pet => pet.name.toLowerCase()).join(' ');
        
        if (!fullName.includes(searchLower) && 
            !client.phone.includes(searchTerm) && 
            !client.email?.toLowerCase().includes(searchLower) &&
            !petNames.includes(searchLower)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'visits':
          return (b.total_visits || 0) - (a.total_visits || 0);
        case 'spent':
          return (b.total_spent || 0) - (a.total_spent || 0);
        case 'recent':
        default:
          if (!a.last_visit_date && !b.last_visit_date) return 0;
          if (!a.last_visit_date) return 1;
          if (!b.last_visit_date) return -1;
          return new Date(b.last_visit_date).getTime() - new Date(a.last_visit_date).getTime();
      }
    });

  const uniqueTags = [...new Set(clients.flatMap(client => client.tags || []))];

  const clientStats = {
    total: clients.length,
    vip: clients.filter(c => c.is_vip).length,
    new: clients.filter(c => {
      const createdDate = new Date(c.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return createdDate > monthAgo;
    }).length,
    active: clients.filter(c => c.last_visit_date).length,
    problems: clients.filter(c => c.tags?.includes('Проблемный')).length,
    totalPets: allPets.length,
    avgSpent: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.total_spent || 0), 0) / clients.length) : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="ml-3 text-lg text-muted-foreground">Загрузка клиентов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Клиенты</h1>
          <p className="text-muted-foreground">Управление базой клиентов и их питомцами</p>
        </div>
        <Button 
          onClick={() => setShowClientForm(true)}
          className="btn-primary shadow-soft hover:shadow-glow animate-bounce-in"
          size="lg"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      {/* Расширенная статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="metric-icon">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">{clientStats.total}</div>
                <div className="text-xs text-muted-foreground">Всего клиентов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="metric-icon">
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <div className="text-xl font-bold">{clientStats.vip}</div>
                <div className="text-xs text-muted-foreground">VIP клиенты</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="metric-icon">
                <UserPlus className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="text-xl font-bold">{clientStats.new}</div>
                <div className="text-xs text-muted-foreground">Новые (месяц)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="metric-icon">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-xl font-bold">{clientStats.active}</div>
                <div className="text-xs text-muted-foreground">Активные</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="metric-icon">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <div className="text-xl font-bold">{clientStats.totalPets}</div>
                <div className="text-xs text-muted-foreground">Питомцев</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="metric-icon">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-xl font-bold">₽{clientStats.avgSpent}</div>
                <div className="text-xs text-muted-foreground">Средний чек</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="metric-icon">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="text-xl font-bold">{clientStats.problems}</div>
                <div className="text-xs text-muted-foreground">Проблемные</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Поиск и фильтры */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону, email или кличке питомца..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все клиенты</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="regular">Обычные</SelectItem>
                  <SelectItem value="new">Новые</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
              
              {uniqueTags.length > 0 && (
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Теги" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все теги</SelectItem>
                    {uniqueTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {uniqueBreeds.length > 0 && (
                <Select value={breedFilter} onValueChange={setBreedFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Порода" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все породы</SelectItem>
                    {uniqueBreeds.map(breed => (
                      <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">По визитам</SelectItem>
                  <SelectItem value="name">По имени</SelectItem>
                  <SelectItem value="visits">По визитам</SelectItem>
                  <SelectItem value="spent">По трате</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Список клиентов */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Клиенты не найдены</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || tagFilter !== 'all' || breedFilter !== 'all'
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Добавьте первого клиента в базу'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && tagFilter === 'all' && breedFilter === 'all' && (
                <Button 
                  onClick={() => setShowClientForm(true)}
                  className="btn-primary"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Добавить клиента
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                petsCount={client.pets?.length || 0}
                onEdit={(client) => {
                  setEditingClient(client);
                  setShowClientForm(true);
                }}
                onDelete={handleDeleteClient}
                onViewPets={(client) => {
                  setSelectedClientId(client.id);
                  setShowPetsModal(true);
                }}
                onScheduleAppointment={handleScheduleAppointment}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredClients.map((client, index) => (
                  <div key={client.id} className={`p-4 hover:bg-muted/50 transition-colors animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                          {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium">{client.first_name} {client.last_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{client.phone}</span>
                            {client.email && <span>{client.email}</span>}
                            <span>{client.pets?.length || 0} питомцев</span>
                            <span>{client.total_visits || 0} визитов</span>
                            <span>₽{client.total_spent || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {client.is_vip && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        {client.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setShowPetsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingClient(client);
                            setShowClientForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Диалог добавления/редактирования клиента */}
      <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Редактировать клиента' : 'Добавить клиента'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о клиенте
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            client={editingClient}
            open={showClientForm}
            onClose={() => {
              setShowClientForm(false);
              setEditingClient(null);
            }}
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
          />
        </DialogContent>
      </Dialog>

      {/* Модальное окно питомцев */}
      <PetsModal
        client={selectedClientId ? clients.find(c => c.id === selectedClientId) : null}
        open={showPetsModal}
        onClose={() => {
          setShowPetsModal(false);
          setSelectedClientId(null);
        }}
        onScheduleGrooming={(client, pet) => {
          setSelectedClient(client);
          setSelectedPet(pet);
          setShowAppointmentForm(true);
          setShowPetsModal(false);
        }}
      />

      {/* Диалог записи на прием */}
      <AppointmentFormDialog
        open={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false);
          setSelectedClient(null);
          setSelectedPet(null);
        }}
        preselectedClient={selectedClient}
        preselectedPet={selectedPet}
      />
    </div>
  );
};

export default ClientsPage;
