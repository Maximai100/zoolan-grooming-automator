
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useClients } from '../hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import ClientForm from './ClientForm';
import PetsModal from './PetsModal';
import { 
  Plus, Search, Filter, Users, Phone, Mail, 
  Calendar, MapPin, Edit, Trash2, Eye, Star,
  UserPlus, Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ClientsPage = () => {
  const { clients, loading, addClient, updateClient, deleteClient, refetch } = useClients();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

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

  const filteredClients = clients.filter(client => {
    if (statusFilter !== 'all' && (statusFilter === 'vip' ? !client.is_vip : client.is_vip)) return false;
    if (tagFilter !== 'all' && !client.tags?.includes(tagFilter)) return false;
    if (searchTerm && !client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !client.phone.includes(searchTerm) && 
        !client.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
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
    active: clients.filter(c => c.last_visit_date).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Загрузка клиентов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Клиенты</h1>
          <p className="text-muted-foreground">Управление базой клиентов и их питомцами</p>
        </div>
        <Button 
          onClick={() => setShowClientForm(true)}
          className="bg-gradient-primary text-white shadow-soft hover:shadow-glow"
          size="lg"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{clientStats.total}</div>
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
                <div className="text-2xl font-bold">{clientStats.vip}</div>
                <div className="text-sm text-muted-foreground">VIP клиенты</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{clientStats.new}</div>
                <div className="text-sm text-muted-foreground">Новые (месяц)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{clientStats.active}</div>
                <div className="text-sm text-muted-foreground">Активные</div>
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
            placeholder="Поиск по имени, телефону или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все клиенты</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="regular">Обычные</SelectItem>
            </SelectContent>
          </Select>
          
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
        </div>
      </div>

      {/* Список клиентов */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет клиентов</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || tagFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Добавьте первого клиента в базу'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && tagFilter === 'all' && (
                <Button 
                  onClick={() => setShowClientForm(true)}
                  className="bg-gradient-primary text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Добавить клиента
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {client.first_name} {client.last_name}
                      </h3>
                      {client.is_vip && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                      {client.tags?.map(tag => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Визитов: {client.total_visits || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Потрачено: ₽{client.total_spent || 0}</span>
                      </div>
                    </div>
                    
                    {client.address && (
                      <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{client.address}</span>
                      </div>
                    )}
                    
                    {client.last_visit_date && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Последний визит: {format(new Date(client.last_visit_date), 'dd.MM.yyyy', { locale: ru })}
                      </div>
                    )}
                    
                    {client.notes && (
                      <div className="mt-2 text-sm bg-muted p-2 rounded">
                        <strong>Заметки:</strong> {client.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setShowPetsModal(true);
                      }}
                      className="bg-card text-foreground border-input hover:bg-accent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingClient(client);
                        setShowClientForm(true);
                      }}
                      className="bg-card text-foreground border-input hover:bg-accent"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                      className="bg-card text-foreground border-input hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
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
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
            onCancel={() => {
              setShowClientForm(false);
              setEditingClient(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Модальное окно питомцев */}
      <PetsModal
        isOpen={showPetsModal}
        onClose={() => {
          setShowPetsModal(false);
          setSelectedClientId(null);
        }}
        clientId={selectedClientId}
      />
    </div>
  );
};

export default ClientsPage;
