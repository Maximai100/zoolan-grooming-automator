import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { 
  Send, MessageSquare, Mail, Phone, Settings,
  Bell, Calendar, Users, AlertCircle
} from 'lucide-react';

const NotificationsPageSimple = () => {
  const { toast } = useToast();
  const { clients } = useClients();
  
  const [notificationData, setNotificationData] = useState({
    type: 'sms',
    recipient: '',
    content: '',
    subject: ''
  });

  const handleSendNotification = async () => {
    if (!notificationData.recipient || !notificationData.content) {
      toast({
        title: 'Ошибка',
        description: 'Заполните получателя и сообщение',
        variant: 'destructive'
      });
      return;
    }

    // Имитация отправки
    toast({
      title: 'Уведомление отправлено',
      description: `${notificationData.type.toUpperCase()} отправлено на ${notificationData.recipient}`,
    });

    // Очищаем форму
    setNotificationData({
      type: 'sms',
      recipient: '',
      content: '',
      subject: ''
    });
  };

  const predefinedTemplates = [
    {
      name: 'Напоминание о записи',
      content: 'Здравствуйте! Напоминаем о вашей записи на груминг завтра в {время}. Ждем вас по адресу {адрес}.'
    },
    {
      name: 'Подтверждение записи',
      content: 'Ваша запись на {дата} в {время} подтверждена. Ждем вас и вашего питомца!'
    },
    {
      name: 'Отмена записи',
      content: 'К сожалению, нам пришлось отменить вашу запись на {дата}. Свяжитесь с нами для переноса.'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          Уведомления
        </h1>
        <p className="text-muted-foreground mt-2">
          Отправка уведомлений клиентам
        </p>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Отправить
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Шаблоны
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Отправить уведомление</CardTitle>
              <CardDescription>
                Отправьте персональное уведомление клиенту
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Тип уведомления
                  </label>
                  <Select 
                    value={notificationData.type} 
                    onValueChange={(value) => setNotificationData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          SMS
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="call">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Звонок
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="recipient" className="text-sm font-medium">
                    Получатель
                  </label>
                  <Select 
                    value={notificationData.recipient} 
                    onValueChange={(value) => setNotificationData(prev => ({ ...prev, recipient: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите клиента" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.phone || client.email || ''}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {notificationData.type === 'email' && (
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Тема письма
                  </label>
                  <Input
                    id="subject"
                    value={notificationData.subject}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Введите тему письма"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Сообщение
                </label>
                <Textarea
                  id="content"
                  value={notificationData.content}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Введите текст сообщения..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSendNotification} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Отправить уведомление
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Готовые шаблоны</CardTitle>
              <CardDescription>
                Используйте готовые шаблоны для быстрой отправки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predefinedTemplates.map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{template.name}</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setNotificationData(prev => ({ 
                          ...prev, 
                          content: template.content 
                        }))}
                      >
                        Использовать
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {template.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Базовые настройки системы уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Настройки не реализованы</h3>
                  <p className="text-muted-foreground">
                    Расширенные настройки уведомлений будут доступны в следующих обновлениях
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPageSimple;