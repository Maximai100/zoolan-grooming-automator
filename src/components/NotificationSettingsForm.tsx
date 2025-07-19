import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Send } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationSettingsFormProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationSettingsForm({ open, onClose }: NotificationSettingsFormProps) {
  const { settings, updateSettings } = useNotifications();

  const [smsSettings, setSmsSettings] = useState({
    is_enabled: settings.find(s => s.type === 'sms')?.is_enabled || false,
    api_key: '',
    daily_limit: settings.find(s => s.type === 'sms')?.daily_limit || 1000,
    monthly_limit: settings.find(s => s.type === 'sms')?.monthly_limit || 30000
  });

  const [emailSettings, setEmailSettings] = useState({
    is_enabled: settings.find(s => s.type === 'email')?.is_enabled || false,
    api_key: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
    daily_limit: settings.find(s => s.type === 'email')?.daily_limit || 1000,
    monthly_limit: settings.find(s => s.type === 'email')?.monthly_limit || 30000
  });

  const [whatsappSettings, setWhatsappSettings] = useState({
    is_enabled: settings.find(s => s.type === 'whatsapp')?.is_enabled || false,
    api_key: '',
    phone_number: '',
    daily_limit: settings.find(s => s.type === 'whatsapp')?.daily_limit || 1000,
    monthly_limit: settings.find(s => s.type === 'whatsapp')?.monthly_limit || 30000
  });

  const [telegramSettings, setTelegramSettings] = useState({
    is_enabled: settings.find(s => s.type === 'telegram')?.is_enabled || false,
    bot_token: '',
    daily_limit: settings.find(s => s.type === 'telegram')?.daily_limit || 1000,
    monthly_limit: settings.find(s => s.type === 'telegram')?.monthly_limit || 30000
  });

  const handleSaveSettings = async (type: string, settingsData: any) => {
    await updateSettings(type, {
      is_enabled: settingsData.is_enabled,
      daily_limit: settingsData.daily_limit,
      monthly_limit: settingsData.monthly_limit,
      api_settings: settingsData
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройки уведомлений</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Telegram
            </TabsTrigger>
          </TabsList>

          {/* SMS настройки */}
          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Настройки SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={smsSettings.is_enabled}
                    onCheckedChange={(checked) => setSmsSettings(prev => ({ ...prev, is_enabled: checked }))}
                  />
                  <Label>Включить SMS уведомления</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API ключ провайдера</Label>
                    <Input
                      type="password"
                      value={smsSettings.api_key}
                      onChange={(e) => setSmsSettings(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="Введите API ключ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Провайдер</Label>
                    <Input value="Twilio" disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дневной лимит</Label>
                    <Input
                      type="number"
                      value={smsSettings.daily_limit}
                      onChange={(e) => setSmsSettings(prev => ({ ...prev, daily_limit: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Месячный лимит</Label>
                    <Input
                      type="number"
                      value={smsSettings.monthly_limit}
                      onChange={(e) => setSmsSettings(prev => ({ ...prev, monthly_limit: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('sms', smsSettings)}
                  className="bg-gradient-primary"
                >
                  Сохранить настройки SMS
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email настройки */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Настройки Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={emailSettings.is_enabled}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, is_enabled: checked }))}
                  />
                  <Label>Включить Email уведомления</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP хост</Label>
                    <Input
                      value={emailSettings.smtp_host}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP порт</Label>
                    <Input
                      type="number"
                      value={emailSettings.smtp_port}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_port: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Пользователь</Label>
                    <Input
                      value={emailSettings.smtp_user}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Пароль</Label>
                    <Input
                      type="password"
                      value={emailSettings.smtp_password}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                      placeholder="Пароль приложения"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>От кого (email)</Label>
                    <Input
                      value={emailSettings.from_email}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, from_email: e.target.value }))}
                      placeholder="noreply@salon.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>От кого (имя)</Label>
                    <Input
                      value={emailSettings.from_name}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, from_name: e.target.value }))}
                      placeholder="Салон груминга 'Лапки'"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дневной лимит</Label>
                    <Input
                      type="number"
                      value={emailSettings.daily_limit}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, daily_limit: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Месячный лимит</Label>
                    <Input
                      type="number"
                      value={emailSettings.monthly_limit}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, monthly_limit: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('email', emailSettings)}
                  className="bg-gradient-primary"
                >
                  Сохранить настройки Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp настройки */}
          <TabsContent value="whatsapp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Настройки WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={whatsappSettings.is_enabled}
                    onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, is_enabled: checked }))}
                  />
                  <Label>Включить WhatsApp уведомления</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API ключ WhatsApp Business</Label>
                    <Input
                      type="password"
                      value={whatsappSettings.api_key}
                      onChange={(e) => setWhatsappSettings(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="Введите API ключ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Номер телефона</Label>
                    <Input
                      value={whatsappSettings.phone_number}
                      onChange={(e) => setWhatsappSettings(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+7 (999) 999-99-99"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дневной лимит</Label>
                    <Input
                      type="number"
                      value={whatsappSettings.daily_limit}
                      onChange={(e) => setWhatsappSettings(prev => ({ ...prev, daily_limit: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Месячный лимит</Label>
                    <Input
                      type="number"
                      value={whatsappSettings.monthly_limit}
                      onChange={(e) => setWhatsappSettings(prev => ({ ...prev, monthly_limit: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('whatsapp', whatsappSettings)}
                  className="bg-gradient-primary"
                >
                  Сохранить настройки WhatsApp
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Telegram настройки */}
          <TabsContent value="telegram" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Настройки Telegram
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={telegramSettings.is_enabled}
                    onCheckedChange={(checked) => setTelegramSettings(prev => ({ ...prev, is_enabled: checked }))}
                  />
                  <Label>Включить Telegram уведомления</Label>
                </div>

                <div className="space-y-2">
                  <Label>Bot Token</Label>
                  <Input
                    type="password"
                    value={telegramSettings.bot_token}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, bot_token: e.target.value }))}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дневной лимит</Label>
                    <Input
                      type="number"
                      value={telegramSettings.daily_limit}
                      onChange={(e) => setTelegramSettings(prev => ({ ...prev, daily_limit: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Месячный лимит</Label>
                    <Input
                      type="number"
                      value={telegramSettings.monthly_limit}
                      onChange={(e) => setTelegramSettings(prev => ({ ...prev, monthly_limit: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('telegram', telegramSettings)}
                  className="bg-gradient-primary"
                >
                  Сохранить настройки Telegram
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}