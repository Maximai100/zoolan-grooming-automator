import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import TemplateForm from './TemplateForm';
import NotificationSettingsForm from './NotificationSettingsForm';

export default function NotificationsPage() {
  const { 
    templates, 
    settings, 
    notifications, 
    loading, 
    updateSettings,
    sendTestNotification 
  } = useNotifications();

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedNotificationType, setSelectedNotificationType] = useState('sms');

  // Статистика
  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    totalCost: notifications.reduce((sum, n) => sum + Number(n.cost), 0)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'read':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'sent': 'bg-green-100 text-green-800',
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'read': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'whatsapp':
      case 'telegram':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getTypeName = (type: string) => {
    const names = {
      'sms': 'SMS',
      'email': 'Email',
      'whatsapp': 'WhatsApp',
      'telegram': 'Telegram'
    };
    return names[type as keyof typeof names] || type;
  };

  const getEventName = (event: string) => {
    const names = {
      'appointment_confirmation': 'Подтверждение записи',
      'reminder_24h': 'Напоминание за 24 часа',
      'reminder_2h': 'Напоминание за 2 часа',
      'follow_up': 'Последующий контакт',
      'birthday': 'День рождения',
      'no_show': 'Неявка',
      'test': 'Тестовое сообщение'
    };
    return names[event as keyof typeof names] || event;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Загрузка уведомлений...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Уведомления и напоминания</h1>
          <p className="text-muted-foreground">Автоматические коммуникации с клиентами</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowTemplateForm(true)} 
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Шаблон
          </Button>
          <Button 
            onClick={() => setShowSettingsForm(true)} 
            className="bg-gradient-primary"
          >
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Всего отправлено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.sent}</div>
                <div className="text-sm text-muted-foreground">Доставлено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">В очереди</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">Ошибки</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalCost.toFixed(2)}₽</div>
                <div className="text-sm text-muted-foreground">Потрачено</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основное содержимое */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="test">Тест</TabsTrigger>
        </TabsList>

        {/* История уведомлений */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История отправки</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Пока нет уведомлений</h3>
                  <p className="text-muted-foreground">
                    Уведомления будут отображаться здесь после отправки
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(notification.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getTypeName(notification.type)}
                            </span>
                            <Badge variant="secondary">
                              {getEventName(notification.trigger_event)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {notification.recipient}
                          </div>
                          <div className="text-sm text-muted-foreground max-w-md truncate">
                            {notification.content}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(notification.status)}
                            <Badge className={getStatusColor(notification.status)}>
                              {notification.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </div>
                          {notification.cost > 0 && (
                            <div className="text-xs text-green-600">
                              {notification.cost}₽
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Шаблоны */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Шаблоны сообщений</CardTitle>
              <Button onClick={() => setShowTemplateForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Новый шаблон
              </Button>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Нет шаблонов</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте первый шаблон для автоматических уведомлений
                  </p>
                  <Button onClick={() => setShowTemplateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать шаблон
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(template.type)}
                            <span className="font-medium">{template.name}</span>
                          </div>
                          {template.is_default && (
                            <Badge variant="secondary">По умолчанию</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getTypeName(template.type)}
                          </Badge>
                          <Badge variant="outline">
                            {getEventName(template.trigger_event)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {template.content.substring(0, 100)}...
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Switch 
                            checked={template.is_active}
                            onCheckedChange={(checked) => {
                              // updateTemplate(template.id, { is_active: checked });
                            }}
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTemplate(template);
                                setShowTemplateForm(true);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки провайдеров</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {['sms', 'email', 'whatsapp', 'telegram'].map((type) => {
                const setting = settings.find(s => s.type === type);
                return (
                  <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(type)}
                      <div>
                        <div className="font-medium">{getTypeName(type)}</div>
                        <div className="text-sm text-muted-foreground">
                          {setting?.is_enabled ? 'Активен' : 'Отключен'}
                          {setting && ` • Лимит: ${setting.daily_limit}/день`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={setting?.is_enabled || false}
                        onCheckedChange={(checked) => {
                          updateSettings(type, { is_enabled: checked });
                        }}
                      />
                      <Button size="sm" variant="outline">
                        Настроить
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Тестирование */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Тестовая отправка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип уведомления</Label>
                  <Select 
                    value={selectedNotificationType} 
                    onValueChange={setSelectedNotificationType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Получатель</Label>
                  <Input 
                    placeholder={
                      selectedNotificationType === 'email' 
                        ? 'email@example.com' 
                        : '+7 (999) 999-99-99'
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Сообщение</Label>
                <Textarea 
                  placeholder="Введите текст тестового сообщения..."
                  rows={3}
                />
              </div>
              
              <Button className="bg-gradient-primary">
                <Send className="h-4 w-4 mr-2" />
                Отправить тест
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модальные окна */}
      <TemplateForm
        template={editingTemplate}
        open={showTemplateForm}
        onClose={() => {
          setShowTemplateForm(false);
          setEditingTemplate(null);
        }}
      />

      <NotificationSettingsForm
        open={showSettingsForm}
        onClose={() => setShowSettingsForm(false)}
      />
    </div>
  );
}