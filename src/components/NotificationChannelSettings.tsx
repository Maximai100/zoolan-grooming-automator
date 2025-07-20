import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings, Check, X } from 'lucide-react';

interface NotificationChannelSettingsProps {
  open: boolean;
  onClose: () => void;
  channelType: string;
  currentSettings: any;
  onSave: (settings: any) => void;
}

export default function NotificationChannelSettings({ 
  open, 
  onClose, 
  channelType, 
  currentSettings, 
  onSave 
}: NotificationChannelSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(currentSettings || {});

  const handleSave = () => {
    onSave(settings);
    toast({
      title: 'Настройки сохранены',
      description: `Настройки ${channelType} успешно обновлены`
    });
    onClose();
  };

  const renderSMSSettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="smsProvider">SMS Провайдер</Label>
        <Input
          id="smsProvider"
          value={settings.provider || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, provider: e.target.value }))}
          placeholder="Например: Twilio, SMS.RU"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="smsApiKey">API Ключ</Label>
        <Input
          id="smsApiKey"
          type="password"
          value={settings.apiKey || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
          placeholder="Введите API ключ"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="smsFrom">Отправитель</Label>
        <Input
          id="smsFrom"
          value={settings.fromNumber || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, fromNumber: e.target.value }))}
          placeholder="+7 (999) 123-45-67"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="smsDailyLimit">Дневной лимит</Label>
        <Input
          id="smsDailyLimit"
          type="number"
          value={settings.dailyLimit || 1000}
          onChange={(e) => setSettings(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
        />
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="smtpHost">SMTP Хост</Label>
        <Input
          id="smtpHost"
          value={settings.smtpHost || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
          placeholder="smtp.gmail.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="smtpPort">Порт</Label>
          <Input
            id="smtpPort"
            type="number"
            value={settings.smtpPort || 587}
            onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtpSecure">Безопасность</Label>
          <select 
            className="w-full px-3 py-2 border rounded-md"
            value={settings.smtpSecure || 'tls'}
            onChange={(e) => setSettings(prev => ({ ...prev, smtpSecure: e.target.value }))}
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">Без шифрования</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="emailUser">Email пользователя</Label>
        <Input
          id="emailUser"
          type="email"
          value={settings.emailUser || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, emailUser: e.target.value }))}
          placeholder="your-email@gmail.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emailPassword">Пароль</Label>
        <Input
          id="emailPassword"
          type="password"
          value={settings.emailPassword || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, emailPassword: e.target.value }))}
          placeholder="Пароль или App Password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emailFrom">Отправитель</Label>
        <Input
          id="emailFrom"
          value={settings.fromEmail || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
          placeholder="Салон Лапки <info@lapki-salon.ru>"
        />
      </div>
    </div>
  );

  const renderPushSettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pushService">Push сервис</Label>
        <select 
          className="w-full px-3 py-2 border rounded-md"
          value={settings.pushService || 'firebase'}
          onChange={(e) => setSettings(prev => ({ ...prev, pushService: e.target.value }))}
        >
          <option value="firebase">Firebase Cloud Messaging</option>
          <option value="onesignal">OneSignal</option>
          <option value="pusher">Pusher</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pushApiKey">API Ключ</Label>
        <Input
          id="pushApiKey"
          type="password"
          value={settings.pushApiKey || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, pushApiKey: e.target.value }))}
          placeholder="Введите API ключ"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pushAppId">App ID</Label>
        <Input
          id="pushAppId"
          value={settings.pushAppId || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, pushAppId: e.target.value }))}
          placeholder="ID приложения"
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки {channelType}
          </DialogTitle>
          <DialogDescription>
            Настройте параметры подключения для {channelType} уведомлений
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {channelType === 'SMS' && renderSMSSettings()}
          {channelType === 'Email' && renderEmailSettings()}
          {channelType === 'Push' && renderPushSettings()}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}