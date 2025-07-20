import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useBehavioralTriggers } from '@/hooks/useBehavioralTriggers';
import { useNotifications } from '@/hooks/useNotifications';

export function BehavioralTriggersPage() {
  const { triggers, loading, createTrigger, updateTrigger, deleteTrigger } = useBehavioralTriggers();
  const { templates } = useNotifications();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<any>(null);

  const [newTrigger, setNewTrigger] = useState({
    name: '',
    description: '',
    trigger_type: 'first_visit' as const,
    conditions: {},
    delay_hours: 0,
    template_id: '',
    is_active: true,
  });

  const handleCreateTrigger = async () => {
    if (!newTrigger.name || !newTrigger.trigger_type) return;

    await createTrigger(newTrigger);
    setNewTrigger({
      name: '',
      description: '',
      trigger_type: 'first_visit',
      conditions: {},
      delay_hours: 0,
      template_id: '',
      is_active: true,
    });
    setIsCreating(false);
  };

  const handleToggleActive = async (triggerId: string, isActive: boolean) => {
    await updateTrigger(triggerId, { is_active: !isActive });
  };

  const getTriggerTypeLabel = (type: string) => {
    const types = {
      first_visit: 'Первый визит',
      inactive_client: 'Неактивный клиент',
      birthday: 'День рождения',
      abandoned_booking: 'Незавершенное бронирование',
      post_service: 'После услуги',
    };
    return types[type as keyof typeof types] || type;
  };

  const renderConditionsForm = (triggerType: string, conditions: any, onChange: (conditions: any) => void) => {
    switch (triggerType) {
      case 'inactive_client':
        return (
          <div>
            <Label>Дней неактивности</Label>
            <Input
              type="number"
              value={conditions.days_inactive || 30}
              onChange={(e) => onChange({ ...conditions, days_inactive: parseInt(e.target.value) })}
            />
          </div>
        );
      case 'post_service':
        return (
          <div>
            <Label>После каких услуг</Label>
            <Input
              placeholder="Например: груминг, стрижка"
              value={conditions.service_types?.join(', ') || ''}
              onChange={(e) => onChange({ ...conditions, service_types: e.target.value.split(', ') })}
            />
          </div>
        );
      case 'abandoned_booking':
        return (
          <div>
            <Label>Минут неактивности на форме</Label>
            <Input
              type="number"
              value={conditions.minutes_inactive || 15}
              onChange={(e) => onChange({ ...conditions, minutes_inactive: parseInt(e.target.value) })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка триггеров...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Поведенческие триггеры</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать триггер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Новый поведенческий триггер</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newTrigger.name}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название триггера"
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newTrigger.description}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание триггера"
                />
              </div>

              <div>
                <Label htmlFor="trigger_type">Тип триггера</Label>
                <Select value={newTrigger.trigger_type} onValueChange={(value: any) => 
                  setNewTrigger(prev => ({ ...prev, trigger_type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_visit">Первый визит</SelectItem>
                    <SelectItem value="inactive_client">Неактивный клиент</SelectItem>
                    <SelectItem value="birthday">День рождения</SelectItem>
                    <SelectItem value="abandoned_booking">Незавершенное бронирование</SelectItem>
                    <SelectItem value="post_service">После услуги</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderConditionsForm(
                newTrigger.trigger_type, 
                newTrigger.conditions, 
                (conditions) => setNewTrigger(prev => ({ ...prev, conditions }))
              )}

              <div>
                <Label htmlFor="delay_hours">Задержка (часы)</Label>
                <Input
                  id="delay_hours"
                  type="number"
                  value={newTrigger.delay_hours}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, delay_hours: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="template">Шаблон сообщения</Label>
                <Select value={newTrigger.template_id} onValueChange={(value) => 
                  setNewTrigger(prev => ({ ...prev, template_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите шаблон" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTrigger}>Создать</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {trigger.name}
                    <Badge variant={trigger.is_active ? "default" : "secondary"}>
                      {trigger.is_active ? "Активный" : "Неактивный"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getTriggerTypeLabel(trigger.trigger_type)}
                  </p>
                  {trigger.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {trigger.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={trigger.is_active}
                    onCheckedChange={() => handleToggleActive(trigger.id, trigger.is_active)}
                  />
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteTrigger(trigger.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {trigger.delay_hours > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Задержка: {trigger.delay_hours} ч</span>
                  </div>
                )}
                
                {trigger.template && (
                  <div>
                    <span>Шаблон: {trigger.template.name}</span>
                  </div>
                )}

                <div>
                  <span>Создан: {new Date(trigger.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>

              {Object.keys(trigger.conditions).length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Условия:</p>
                  <pre className="text-xs">{JSON.stringify(trigger.conditions, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {triggers.length === 0 && (
          <Card>
            <CardContent className="text-center p-8">
              <p className="text-muted-foreground">Поведенческие триггеры не настроены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}