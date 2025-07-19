
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Filter, Users, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import ClientCard from './ClientCard';
import ClientForm from './ClientForm';
import PetsModal from './PetsModal';

export default function ClientsPage() {
  console.log('🎨 ClientsPage component rendering...');
  
  const { clients, loading, searchTerm, setSearchTerm, addClient, updateClient, deleteClient } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  console.log('📊 ClientsPage state:', { 
    clientsCount: clients.length, 
    loading, 
    showForm, 
    editingClient: !!editingClient 
  });

  // Получаем уникальные теги для фильтра
  const allTags = Array.from(new Set(clients.flatMap(client => client.tags)));

  // Фильтрация и сортировка
  const filteredAndSortedClients = clients
    .filter(client => {
      if (tagFilter && !client.tags.includes(tagFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.first_name.localeCompare(b.first_name);
        case 'visits':
          return b.total_visits - a.total_visits;
        case 'spent':
          return b.total_spent - a.total_spent;
        default:
          return 0;
      }
    });

  const handleAddClient = () => {
    console.log('➕ Add client button clicked');
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client) => {
    console.log('✏️ Edit client:', client.id);
    setEditingClient(client);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    console.log('💾 Submitting client data:', formData);
    if (editingClient) {
      await updateClient(editingClient.id, formData);
    } else {
      await addClient(formData);
    }
    setShowForm(false);
  };

  const handleViewPets = (client) => {
    setSelectedClient(client);
    setShowPetsModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      await deleteClient(id);
    }
  };

  // Статистика
  const stats = {
    total: clients.length,
    vip: clients.filter(c => c.is_vip).length,
    newThisMonth: clients.filter(c => {
      const created = new Date(c.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    totalRevenue: clients.reduce((sum, c) => sum + Number(c.total_spent), 0)
  };

  if (loading) {
    console.log('⏳ ClientsPage showing loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg text-muted-foreground">Загрузка клиентов...</div>
          <div className="text-sm text-muted-foreground">
            Если загрузка затянулась, проверьте консоль браузера
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ ClientsPage rendering main content');

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground">
        <div>Debug Info:</div>
        <div>• Клиентов загружено: {clients.length}</div>
        <div>• Фильтрованных клиентов: {filteredAndSortedClients.length}</div>
        <div>• Состояние загрузки: {loading ? 'загружается' : 'завершено'}</div>
        <div>• Форма открыта: {showForm ? 'да' : 'нет'}</div>
      </div>

      {/* Заголовок и статистика */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">База клиентов</h1>
          <p className="text-muted-foreground">Управление клиентами и их питомцами</p>
        </div>
        
        <Button onClick={handleAddClient} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Новый клиент
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Всего клиентов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.vip}</div>
                <div className="text-sm text-muted-foreground">VIP клиентов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.newThisMonth}</div>
                <div className="text-sm text-muted-foreground">Новых в месяце</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-xs">₽</span>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Общая выручка</div>
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
            placeholder="Поиск по имени, телефону, email или тегам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="По тегам" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все теги</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Новые</SelectItem>
              <SelectItem value="oldest">Старые</SelectItem>
              <SelectItem value="name">По имени</SelectItem>
              <SelectItem value="visits">По визитам</SelectItem>
              <SelectItem value="spent">По тратам</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Активные фильтры */}
      {(tagFilter || searchTerm) && (
        <div className="flex gap-2 flex-wrap">
          {tagFilter && (
            <Badge variant="secondary" className="px-3 py-1">
              Тег: {tagFilter}
              <button
                onClick={() => setTagFilter('')}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <span className="sr-only">Удалить фильтр</span>
                ×
              </button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="px-3 py-1">
              Поиск: "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <span className="sr-only">Очистить поиск</span>
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Список клиентов */}
      {filteredAndSortedClients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || tagFilter ? 'Клиенты не найдены' : 'Пока нет клиентов'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || tagFilter 
                ? 'Попробуйте изменить параметры поиска'
                : 'Добавьте первого клиента для начала работы'
              }
            </p>
            {!searchTerm && !tagFilter && (
              <Button onClick={handleAddClient} className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Добавить клиента
              </Button>
            )}
            
            {/* Дополнительная информация для диагностики */}
            <div className="mt-6 p-4 bg-muted/50 rounded text-sm text-left">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Информация для диагностики:</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <div>• Всего клиентов в базе: {clients.length}</div>
                <div>• После фильтрации: {filteredAndSortedClients.length}</div>
                <div>• Поисковый запрос: "{searchTerm}"</div>
                <div>• Фильтр по тегам: "{tagFilter}"</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onViewPets={handleViewPets}
            />
          ))}
        </div>
      )}

      {/* Модальные окна */}
      <ClientForm
        client={editingClient}
        open={showForm}
        onClose={() => {
          console.log('❌ Closing client form');
          setShowForm(false);
          setEditingClient(null);
        }}
        onSubmit={handleSubmit}
      />

      <PetsModal
        client={selectedClient}
        open={showPetsModal}
        onClose={() => {
          setShowPetsModal(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
}
