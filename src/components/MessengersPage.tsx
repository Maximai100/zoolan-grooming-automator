import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMessengers, MessengerIntegration, MessengerTemplate } from '@/hooks/useMessengers';
import { 
  MessageSquare, 
  Phone, 
  Send, 
  Settings, 
  Plus, 
  Trash2, 
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Bot,
  Smartphone,
  Users,
  FileText,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MessengersPage = () => {
  const {
    integrations,
    contacts,
    messages,
    templates,
    loading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    createTemplate,
    updateTemplate,
    sendMessage,
    testIntegration
  } = useMessengers();

  const [newIntegration, setNewIntegration] = useState<Partial<MessengerIntegration>>({
    platform: 'telegram',
    is_active: false
  });
  const [newTemplate, setNewTemplate] = useState<Partial<MessengerTemplate>>({
    template_type: 'appointment_reminder',
    is_active: true,
    approval_status: 'approved'
  });
  const [editingTemplate, setEditingTemplate] = useState<MessengerTemplate | null>(null);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'viber':
        return <Smartphone className="w-5 h-5 text-purple-500" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return 'Telegram';
      case 'whatsapp':
        return 'WhatsApp';
      case 'viber':
        return 'Viber';
      default:
        return platform;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Подтверждена';
      case 'failed':
        return 'Ошибка';
      case 'pending':
        return 'Ожидает проверки';
      default:
        return status;
    }
  };

  const getTemplateTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'appointment_reminder': 'Напоминание о записи',
      'appointment_confirmation': 'Подтверждение записи',
      'promotional': 'Промо-сообщение',
      'follow_up': 'Отзыв о посещении',
      'birthday': 'Поздравление с днем рождения'
    };
    return types[type] || type;
  };

  const getMessageStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает отправки';
      case 'sent':
        return 'Отправлено';
      case 'delivered':
        return 'Доставлено';
      case 'read':
        return 'Прочитано';
      case 'failed':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const handleCreateIntegration = async () => {
    if (!newIntegration.platform) return;

    const result = await createIntegration(newIntegration);
    if (result) {
      setNewIntegration({ platform: 'telegram', is_active: false });
      setShowIntegrationDialog(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content || !newTemplate.integration_id) return;

    const result = await createTemplate(newTemplate);
    if (result) {
      setNewTemplate({ template_type: 'appointment_reminder', is_active: true, approval_status: 'approved' });
      setShowTemplateDialog(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    const result = await updateTemplate(editingTemplate.id, editingTemplate);
    if (result) {
      setEditingTemplate(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Мессенджеры</h1>
        <p className="text-muted-foreground">
          Интеграция с WhatsApp, Telegram и другими мессенджерами для автоматических уведомлений
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Интеграции</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="contacts">Контакты</TabsTrigger>
          <TabsTrigger value="messages">Сообщения</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Интеграции мессенджеров</h2>
            <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить интеграцию
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая интеграция</DialogTitle>
                  <DialogDescription>
                    Добавьте новую интеграцию с мессенджером
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Платформа</Label>
                    <Select 
                      value={newIntegration.platform} 
                      onValueChange={(value) => setNewIntegration({ ...newIntegration, platform: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите платформу" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="viber">Viber</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newIntegration.platform === 'telegram' && (
                    <>
                      <div>
                        <Label htmlFor="api_token">Bot Token</Label>
                        <Input
                          id="api_token"
                          placeholder="Введите Bot Token от @BotFather"
                          value={newIntegration.api_token || ''}
                          onChange={(e) => setNewIntegration({ ...newIntegration, api_token: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bot_username">Username бота</Label>
                        <Input
                          id="bot_username"
                          placeholder="@your_bot"
                          value={newIntegration.bot_username || ''}
                          onChange={(e) => setNewIntegration({ ...newIntegration, bot_username: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {newIntegration.platform === 'whatsapp' && (
                    <>
                      <div>
                        <Label htmlFor="api_token">Access Token</Label>
                        <Input
                          id="api_token"
                          placeholder="WhatsApp Business API Token"
                          value={newIntegration.api_token || ''}
                          onChange={(e) => setNewIntegration({ ...newIntegration, api_token: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone_number">Phone Number ID</Label>
                        <Input
                          id="phone_number"
                          placeholder="ID номера телефона"
                          value={newIntegration.phone_number || ''}
                          onChange={(e) => setNewIntegration({ ...newIntegration, phone_number: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <Button onClick={handleCreateIntegration} className="w-full">
                    Создать интеграцию
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlatformIcon(integration.platform)}
                    {getPlatformName(integration.platform)}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.verification_status)}
                      {getStatusText(integration.verification_status)}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Статус:</span>
                    <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                      {integration.is_active ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>

                  {integration.bot_username && (
                    <div className="text-sm">
                      <span className="font-medium">Бот:</span> {integration.bot_username}
                    </div>
                  )}

                  {integration.last_sync_at && (
                    <div className="text-sm text-muted-foreground">
                      Последняя синхронизация: {format(new Date(integration.last_sync_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testIntegration(integration.id)}
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Тест
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateIntegration(integration.id, { is_active: !integration.is_active })}
                    >
                      {integration.is_active ? 'Отключить' : 'Включить'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить интеграцию?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Все связанные шаблоны и сообщения будут удалены.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteIntegration(integration.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            {integrations.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет интеграций</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Добавьте интеграцию с мессенджером для автоматической отправки уведомлений
                  </p>
                  <Button onClick={() => setShowIntegrationDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить интеграцию
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Шаблоны сообщений</h2>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button disabled={integrations.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать шаблон
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Новый шаблон сообщения</DialogTitle>
                  <DialogDescription>
                    Создайте шаблон для автоматической отправки уведомлений
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="integration">Интеграция</Label>
                    <Select 
                      value={newTemplate.integration_id} 
                      onValueChange={(value) => setNewTemplate({ ...newTemplate, integration_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите интеграцию" />
                      </SelectTrigger>
                      <SelectContent>
                        {integrations.filter(i => i.is_active).map((integration) => (
                          <SelectItem key={integration.id} value={integration.id}>
                            {getPlatformName(integration.platform)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">Название шаблона</Label>
                    <Input
                      id="name"
                      placeholder="Введите название"
                      value={newTemplate.name || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template_type">Тип шаблона</Label>
                    <Select 
                      value={newTemplate.template_type} 
                      onValueChange={(value) => setNewTemplate({ ...newTemplate, template_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment_reminder">Напоминание о записи</SelectItem>
                        <SelectItem value="appointment_confirmation">Подтверждение записи</SelectItem>
                        <SelectItem value="promotional">Промо-сообщение</SelectItem>
                        <SelectItem value="follow_up">Отзыв о посещении</SelectItem>
                        <SelectItem value="birthday">Поздравление с днем рождения</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content">Текст сообщения</Label>
                    <Textarea
                      id="content"
                      placeholder="Введите текст сообщения. Используйте переменные: {client_name}, {appointment_date}, {appointment_time}, {service_name}"
                      rows={4}
                      value={newTemplate.content || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Доступные переменные: {'{client_name}, {appointment_date}, {appointment_time}, {service_name}'}
                    </p>
                  </div>

                  <Button onClick={handleCreateTemplate} className="w-full">
                    Создать шаблон
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {template.name}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                      <Badge variant={template.approval_status === 'approved' ? 'default' : 'destructive'}>
                        {template.approval_status === 'approved' ? 'Одобрен' : 'Ожидает одобрения'}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {getTemplateTypeText(template.template_type)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{template.content}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      Редактировать
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTemplate(template.id, { is_active: !template.is_active })}
                    >
                      {template.is_active ? 'Отключить' : 'Включить'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {templates.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет шаблонов</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Создайте шаблоны сообщений для автоматической отправки уведомлений
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Dialog для редактирования шаблона */}
          <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Редактировать шаблон</DialogTitle>
              </DialogHeader>
              {editingTemplate && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit_name">Название шаблона</Label>
                    <Input
                      id="edit_name"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit_content">Текст сообщения</Label>
                    <Textarea
                      id="edit_content"
                      rows={4}
                      value={editingTemplate.content}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleUpdateTemplate} className="w-full">
                    Сохранить изменения
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Контакты мессенджеров</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Контакт</TableHead>
                <TableHead>Платформа</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Последнее сообщение</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {contact.profile_photo_url && (
                        <img src={contact.profile_photo_url} alt="" className="w-8 h-8 rounded-full" />
                      )}
                      <div>
                        <div className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </div>
                        {contact.username && (
                          <div className="text-sm text-muted-foreground">@{contact.username}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(contact.platform)}
                      {getPlatformName(contact.platform)}
                    </div>
                  </TableCell>
                  <TableCell>{contact.phone_number}</TableCell>
                  <TableCell>
                    {contact.last_message_at && format(new Date(contact.last_message_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={contact.is_blocked ? 'destructive' : 'default'}>
                      {contact.is_blocked ? 'Заблокирован' : 'Активен'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {contacts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет контактов</h3>
                <p className="text-muted-foreground text-center">
                  Контакты появятся после первых сообщений от клиентов
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">История сообщений</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Контакт</TableHead>
                <TableHead>Сообщение</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    {message.contact_id}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {message.content}
                  </TableCell>
                  <TableCell>
                    <Badge variant={message.is_outgoing ? 'default' : 'secondary'}>
                      {message.is_outgoing ? 'Исходящее' : 'Входящее'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      {getMessageStatusText(message.status)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {messages.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет сообщений</h3>
                <p className="text-muted-foreground text-center">
                  История сообщений появится после настройки интеграций
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessengersPage;