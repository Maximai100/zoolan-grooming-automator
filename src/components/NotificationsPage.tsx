import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import NotificationChannelSettings from './NotificationChannelSettings';
import { 
  Send, MessageSquare, Mail, Phone, Settings, Plus, 
  Clock, CheckCircle, XCircle, AlertCircle, Search,
  Bell, Smartphone, Calendar, Users, BarChart3, Edit3,
  Trash2, Eye, Play, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const NotificationsPage = () => {
  const { 
    notifications, templates, settings, 
    loading, addTemplate, updateTemplate, updateSettings, 
    sendTestNotification, getAvailableVariables, refetch 
  } = useNotifications();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Новое уведомление
  const [newNotification, setNewNotification] = useState({
    type: 'sms',
    recipient: '',
    content: '',
    template_id: ''
  });
  
  // Новый шаблон
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'sms',
    trigger_event: 'appointment_confirmation',
    subject: '',
    content: '',
    is_active: true,
    is_default: false
  });
  
  // Состояние диалогов
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [channelSettings, setChannelSettings] = useState({});

  const handleSendTestNotification = async () => {
    if (!newNotification.recipient || !newNotification.content) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      await sendTestNotification(newNotification.type, newNotification.recipient, newNotification.content);
      setNewNotification({
        type: 'sms',
        recipient: '',
        content: '',
        template_id: ''
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка отправки',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и содержание шаблона',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          name: newTemplate.name,
          type: newTemplate.type as any,
          trigger_event: newTemplate.trigger_event as any,
          subject: newTemplate.subject,
          content: newTemplate.content,
          is_active: newTemplate.is_active,
          is_default: newTemplate.is_default
        });
        toast({
          title: 'Шаблон обновлен',
          description: 'Изменения сохранены успешно'
        });
      } else {
        await addTemplate({
          name: newTemplate.name,
          type: newTemplate.type as any,
          trigger_event: newTemplate.trigger_event as any,
          subject: newTemplate.subject,
          content: newTemplate.content,
          variables: [],
          is_active: newTemplate.is_active,
          is_default: newTemplate.is_default
        });
        toast({
          title: 'Шаблон создан',
          description: 'Новый шаблон добавлен успешно'
        });
      }
      
      setNewTemplate({
        name: '',
        type: 'sms',
        trigger_event: 'appointment_confirmation',
        subject: '',
        content: '',
        is_active: true,
        is_default: false
      });
      setEditingTemplate(null);
      setShowTemplateForm(false);
    } catch (error: any) {
      toast({
        title: editingTemplate ? 'Ошибка обновления' : 'Ошибка создания',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': 
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'read': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': 
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'read': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
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

  const filteredNotifications = notifications.filter(notification => {
    if (statusFilter !== 'all' && notification.status !== statusFilter) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    if (searchTerm && !notification.content.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.recipient.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Статистика
  const stats = {
    total: notifications.length,
    delivered: notifications.filter(n => ['sent', 'delivered'].includes(n.status)).length,
    pending: notifications.filter(n => n.status === 'pending').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    totalCost: notifications.reduce((sum, n) => sum + Number(n.cost), 0)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Центр уведомлений</h1>
          <p className="text-muted-foreground">Управление уведомлениями, шаблонами и автоматическими напоминаниями</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={() => setShowTemplateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать шаблон
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Всего уведомлений</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.delivered}</div>
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
              <div className="h-5 w-5 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-xs">₽</span>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalCost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Потрачено</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MessageSquare className="w-4 h-4 mr-2" />
            Шаблоны
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="w-4 h-4 mr-2" />
            Отправить
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Поиск и фильтры */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по содержанию или получателю..."
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
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">В ожидании</SelectItem>
                  <SelectItem value="sent">Отправлено</SelectItem>
                  <SelectItem value="delivered">Доставлено</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Попробуйте изменить параметры поиска'
                      : 'Отправьте первое уведомление'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{notification.recipient}</span>
                            <Badge className={getStatusColor(notification.status)}>
                              {getStatusIcon(notification.status)}
                              <span className="ml-1">
                                {notification.status === 'sent' ? 'Отправлено' :
                                 notification.status === 'delivered' ? 'Доставлено' :
                                 notification.status === 'failed' ? 'Ошибка' :
                                 notification.status === 'pending' ? 'В ожидании' : notification.status}
                              </span>
                            </Badge>
                            <Badge variant="outline">{getTypeName(notification.type)}</Badge>
                            <Badge variant="secondary">{getEventName(notification.trigger_event)}</Badge>
                          </div>
                          {notification.subject && (
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              {notification.subject}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground mb-2">
                            {notification.content.length > 100 
                              ? `${notification.content.substring(0, 100)}...`
                              : notification.content
                            }
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground space-x-4">
                            <span>
                              Создано: {format(new Date(notification.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                            </span>
                            {notification.sent_at && (
                              <span>
                                Отправлено: {format(new Date(notification.sent_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                              </span>
                            )}
                            {notification.cost > 0 && (
                              <span>Стоимость: ₽{notification.cost}</span>
                            )}
                          </div>
                          {notification.error_message && (
                            <div className="text-xs text-red-600 mt-1">
                              Ошибка: {notification.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Шаблоны сообщений</h2>
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать шаблон
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Нет шаблонов</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте первый шаблон для автоматизации уведомлений
                  </p>
                  <Button onClick={() => setShowTemplateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать шаблон
                  </Button>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{getTypeName(template.type)}</Badge>
                          {template.is_default && <Badge>По умолчанию</Badge>}
                          {!template.is_active && <Badge variant="destructive">Неактивен</Badge>}
                        </div>
                        {template.subject && (
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Тема: {template.subject}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground mb-2">
                          {template.content.length > 150 
                            ? `${template.content.substring(0, 150)}...`
                            : template.content
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Триггер: {getEventName(template.trigger_event)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => {
                             setEditingTemplate(template);
                             setNewTemplate({
                               name: template.name,
                               type: template.type,
                               trigger_event: template.trigger_event,
                               subject: template.subject || '',
                               content: template.content,
                               is_active: template.is_active,
                               is_default: template.is_default
                             });
                             setShowTemplateForm(true);
                           }}
                         >
                           <Edit3 className="h-4 w-4" />
                         </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setNewNotification({
                              ...newNotification,
                              type: template.type,
                              content: template.content,
                              template_id: template.id
                            });
                            setActiveTab('send');
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отправить тестовое уведомление</CardTitle>
              <CardDescription>
                Создайте и отправьте тестовое уведомление
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notification-type">Тип уведомления</Label>
                  <Select value={newNotification.type} onValueChange={(value) => setNewNotification({...newNotification, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notification-recipient">Получатель</Label>
                  <Input
                    id="notification-recipient"
                    value={newNotification.recipient}
                    onChange={(e) => setNewNotification({...newNotification, recipient: e.target.value})}
                    placeholder={newNotification.type === 'email' ? 'email@example.com' : '+7 900 123-45-67'}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notification-content">Сообщение</Label>
                <Textarea
                  id="notification-content"
                  value={newNotification.content}
                  onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                  placeholder="Введите текст сообщения..."
                  rows={6}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSendTestNotification} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Отправить тестовое сообщение
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setNewNotification({
                    type: 'sms',
                    recipient: '',
                    content: '',
                    template_id: ''
                  })}
                >
                  Очистить
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки каналов связи</CardTitle>
              <CardDescription>
                Конфигурация провайдеров уведомлений
              </CardDescription>
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
                       <Button 
                         size="sm" 
                         variant="outline"
                         onClick={() => {
                           setSelectedChannel(getTypeName(type));
                           setChannelSettings(setting?.api_settings || {});
                           setShowChannelSettings(true);
                         }}
                       >
                         Настроить
                       </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог создания шаблона */}
      <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Редактировать шаблон' : 'Создать шаблон'}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Внесите изменения в шаблон' : 'Создайте шаблон для автоматических или ручных уведомлений'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Название шаблона</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="Например: Напоминание за 24 часа"
                />
              </div>
              <div>
                <Label htmlFor="template-type">Тип</Label>
                <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="template-event">Событие-триггер</Label>
              <Select value={newTemplate.trigger_event} onValueChange={(value) => setNewTemplate({...newTemplate, trigger_event: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment_confirmation">Подтверждение записи</SelectItem>
                  <SelectItem value="reminder_24h">Напоминание за 24 часа</SelectItem>
                  <SelectItem value="reminder_2h">Напоминание за 2 часа</SelectItem>
                  <SelectItem value="follow_up">Последующий контакт</SelectItem>
                  <SelectItem value="birthday">День рождения</SelectItem>
                  <SelectItem value="no_show">Неявка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(newTemplate.type === 'email') && (
              <div>
                <Label htmlFor="template-subject">Тема (для Email)</Label>
                <Input
                  id="template-subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                  placeholder="Тема письма"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="template-content">Содержание</Label>
              <Textarea
                id="template-content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                placeholder="Текст сообщения. Используйте переменные: {{client_name}}, {{pet_name}}, {{service_name}}, {{appointment_time}}, {{salon_address}}"
                rows={6}
              />
            </div>
            
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <strong>Доступные переменные:</strong><br />
              {getAvailableVariables().join(', ')}
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleCreateTemplate} className="flex-1">
                {editingTemplate ? 'Сохранить изменения' : 'Создать шаблон'}
              </Button>
              <Button variant="outline" onClick={() => setShowTemplateForm(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог настроек канала */}
      <NotificationChannelSettings
        open={showChannelSettings}
        onClose={() => setShowChannelSettings(false)}
        channelType={selectedChannel}
        currentSettings={channelSettings}
        onSave={(newSettings) => {
          // Сохраняем настройки канала
          const channelType = selectedChannel.toLowerCase();
          updateSettings(channelType, {
            api_settings: newSettings,
            is_enabled: true
          });
          setChannelSettings(newSettings);
        }}
      />
    </div>
  );
};

export default NotificationsPage;