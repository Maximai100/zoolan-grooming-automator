import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Phone, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { useWaitlists } from '@/hooks/useWaitlists';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';

export function WaitlistPage() {
  const { waitlists, loading, addToWaitlist, updateWaitlistStatus, removeFromWaitlist } = useWaitlists();
  const { clients } = useClients();
  const { services } = useServices();
  const [isAddingToWaitlist, setIsAddingToWaitlist] = useState(false);

  const [newWaitlist, setNewWaitlist] = useState({
    client_id: '',
    service_id: '',
    preferred_date: '',
    preferred_time_start: '',
    preferred_time_end: '',
    notes: '',
    priority: 1,
  });

  const handleAddToWaitlist = async () => {
    if (!newWaitlist.client_id || !newWaitlist.service_id) return;

    await addToWaitlist(newWaitlist);
    setNewWaitlist({
      client_id: '',
      service_id: '',
      preferred_date: '',
      preferred_time_start: '',
      preferred_time_end: '',
      notes: '',
      priority: 1,
    });
    setIsAddingToWaitlist(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активный', variant: 'default' as const },
      notified: { label: 'Уведомлен', variant: 'secondary' as const },
      booked: { label: 'Записан', variant: 'default' as const },
      cancelled: { label: 'Отменен', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка листов ожидания...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Листы ожидания</h1>
        <Dialog open={isAddingToWaitlist} onOpenChange={setIsAddingToWaitlist}>
          <DialogTrigger asChild>
            <Button>Добавить в лист ожидания</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить клиента в лист ожидания</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Клиент</Label>
                <Select value={newWaitlist.client_id} onValueChange={(value) => 
                  setNewWaitlist(prev => ({ ...prev, client_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service">Услуга</Label>
                <Select value={newWaitlist.service_id} onValueChange={(value) => 
                  setNewWaitlist(prev => ({ ...prev, service_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите услугу" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferred_date">Предпочитаемая дата</Label>
                <Input
                  id="preferred_date"
                  type="date"
                  value={newWaitlist.preferred_date}
                  onChange={(e) => setNewWaitlist(prev => ({ ...prev, preferred_date: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_start">Время с</Label>
                  <Input
                    id="time_start"
                    type="time"
                    value={newWaitlist.preferred_time_start}
                    onChange={(e) => setNewWaitlist(prev => ({ ...prev, preferred_time_start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time_end">Время до</Label>
                  <Input
                    id="time_end"
                    type="time"
                    value={newWaitlist.preferred_time_end}
                    onChange={(e) => setNewWaitlist(prev => ({ ...prev, preferred_time_end: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Приоритет</Label>
                <Select value={newWaitlist.priority.toString()} onValueChange={(value) => 
                  setNewWaitlist(prev => ({ ...prev, priority: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Низкий</SelectItem>
                    <SelectItem value="2">Средний</SelectItem>
                    <SelectItem value="3">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Примечания</Label>
                <Textarea
                  id="notes"
                  value={newWaitlist.notes}
                  onChange={(e) => setNewWaitlist(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Дополнительные пожелания клиента..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddToWaitlist}>Добавить</Button>
                <Button variant="outline" onClick={() => setIsAddingToWaitlist(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {waitlists.map((waitlist) => (
          <Card key={waitlist.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {waitlist.client?.first_name} {waitlist.client?.last_name}
                    {getStatusBadge(waitlist.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Услуга: {waitlist.service?.name}
                  </p>
                  {waitlist.pet && (
                    <p className="text-sm text-muted-foreground">
                      Питомец: {waitlist.pet.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {waitlist.status === 'active' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateWaitlistStatus(waitlist.id, 'notified')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Уведомить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromWaitlist(waitlist.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {waitlist.preferred_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Дата: {new Date(waitlist.preferred_date).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
                
                {waitlist.preferred_time_start && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Время: {waitlist.preferred_time_start}
                      {waitlist.preferred_time_end && ` - ${waitlist.preferred_time_end}`}
                    </span>
                  </div>
                )}

                {waitlist.client?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{waitlist.client.phone}</span>
                  </div>
                )}
              </div>

              {waitlist.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">{waitlist.notes}</p>
                </div>
              )}

              <div className="mt-4 text-xs text-muted-foreground">
                Добавлен: {new Date(waitlist.created_at).toLocaleDateString('ru-RU')}
                {' • '}
                Приоритет: {waitlist.priority === 3 ? 'Высокий' : waitlist.priority === 2 ? 'Средний' : 'Низкий'}
              </div>
            </CardContent>
          </Card>
        ))}

        {waitlists.length === 0 && (
          <Card>
            <CardContent className="text-center p-8">
              <p className="text-muted-foreground">Листы ожидания пусты</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}