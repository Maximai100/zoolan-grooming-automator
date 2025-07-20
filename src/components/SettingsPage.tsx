import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Building2, 
  Clock, 
  DollarSign, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Настройки профиля
  const [profileSettings, setProfileSettings] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    role: 'owner',
    avatarUrl: ''
  });

  // Настройки салона
  const [salonSettings, setSalonSettings] = useState({
    name: 'Салон груминга "Лапки"',
    description: 'Профессиональный груминг для ваших питомцев',
    address: 'г. Москва, ул. Примерная, д. 1',
    phone: '+7 (495) 123-45-67',
    email: 'info@lapki-salon.ru',
    website: 'https://lapki-salon.ru',
    workingHours: {
      start: '09:00',
      end: '18:00',
      weekends: true
    }
  });

  // Бизнес настройки
  const [businessSettings, setBusinessSettings] = useState({
    currency: 'RUB',
    timezone: 'Europe/Moscow',
    taxRate: 20,
    defaultServiceDuration: 60,
    bookingAdvance: 30, // дней вперед
    cancellationPolicy: '24', // часов до записи
    autoConfirmBookings: false,
    requireDeposit: false,
    depositPercentage: 50
  });

  // Настройки уведомлений
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    reminderSettings: {
      enabled: true,
      reminder24h: true,
      reminder2h: true,
      followUp: false
    },
    marketingEmails: false
  });

  // Настройки безопасности
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 480, // минут
    passwordExpiry: 90, // дней
    allowMultipleSessions: true
  });

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileSettings.firstName,
          last_name: profileSettings.lastName,
          phone: profileSettings.phone
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Профиль сохранен',
        description: 'Настройки профиля успешно обновлены'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки профиля',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSalon = async () => {
    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: salonSettings.name,
          description: salonSettings.description,
          address: salonSettings.address,
          phone: salonSettings.phone,
          email: salonSettings.email,
          website: salonSettings.website
        })
        .eq('owner_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Настройки салона сохранены',
        description: 'Информация о салоне успешно обновлена'
      });
    } catch (error) {
      console.error('Error saving salon settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки салона',
        variant: 'destructive'
      });
    }
  };

  const handleSaveBusiness = async () => {
    try {
      // Получаем salon_id из профиля
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.salon_id) throw new Error('Salon ID not found');

      // Сохраняем в базу данных
      const { error } = await supabase
        .from('salon_settings')
        .upsert({
          salon_id: profile.salon_id,
          setting_key: 'business_settings',
          setting_value: businessSettings
        });

      if (error) throw error;
      
      toast({
        title: 'Бизнес настройки сохранены',
        description: 'Настройки бизнес-процессов обновлены в базе данных'
      });
    } catch (error: any) {
      console.error('Error saving business settings:', error);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // Получаем salon_id из профиля
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.salon_id) throw new Error('Salon ID not found');

      // Сохраняем в базу данных
      const { error } = await supabase
        .from('salon_settings')
        .upsert({
          salon_id: profile.salon_id,
          setting_key: 'notification_settings',
          setting_value: notificationSettings
        });

      if (error) throw error;
      
      toast({
        title: 'Настройки уведомлений сохранены',
        description: 'Параметры уведомлений успешно обновлены в базе данных'
      });
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSaveSecurity = async () => {
    try {
      // Получаем salon_id из профиля
      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.salon_id) throw new Error('Salon ID not found');

      // Сохраняем в базу данных
      const { error } = await supabase
        .from('salon_settings')
        .upsert({
          salon_id: profile.salon_id,
          setting_key: 'security_settings',
          setting_value: securitySettings
        });

      if (error) throw error;
      
      toast({
        title: 'Настройки безопасности сохранены',
        description: 'Параметры безопасности успешно обновлены в базе данных'
      });
    } catch (error: any) {
      console.error('Error saving security settings:', error);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUploadPhoto = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user?.id}_avatar.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('pet-photos') // используем существующий bucket
            .upload(`avatars/${fileName}`, file, {
              upsert: true
            });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(`avatars/${fileName}`);

          // Обновляем профиль с новой ссылкой на аватар
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: data.publicUrl })
            .eq('id', user?.id);

          if (updateError) throw updateError;

          setProfileSettings(prev => ({ ...prev, avatarUrl: data.publicUrl }));
          
          toast({
            title: 'Фото загружено',
            description: 'Ваше фото профиля успешно обновлено'
          });
        } catch (error: any) {
          toast({
            title: 'Ошибка загрузки',
            description: error.message,
            variant: 'destructive'
          });
        }
      }
    };
    input.click();
  };

  const handleChangePassword = async () => {
    try {
      // Используем Supabase для смены пароля через email
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`
      });

      if (error) throw error;

      toast({
        title: 'Ссылка отправлена',
        description: 'Проверьте email для смены пароля'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEndSessions = async () => {
    try {
      // Завершаем текущую сессию пользователя
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;

      toast({
        title: 'Сессии завершены',
        description: 'Все активные сессии были завершены'
      });
      
      // Перенаправляем на страницу входа
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDownloadData = async () => {
    try {
      // Собираем данные пользователя из разных таблиц
      const [profileData, clientsData, appointmentsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user?.id).single(),
        supabase.from('clients').select('*'),
        supabase.from('appointments').select('*')
      ]);

      const exportData = {
        profile: profileData.data,
        clients: clientsData.data || [],
        appointments: appointmentsData.data || [],
        exportDate: new Date().toISOString()
      };

      // Создаем и скачиваем файл
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zooplan-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Данные скачаны',
        description: 'Ваши данные успешно экспортированы'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка экспорта',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Вы уверены? Это действие нельзя отменить. Все данные будут удалены.')) {
      return;
    }

    try {
      // Удаляем профиль пользователя (каскадное удаление сработает для связанных данных)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (error) throw error;

      // Удаляем аккаунт в auth
      await supabase.auth.admin.deleteUser(user?.id || '');

      toast({
        title: 'Аккаунт удален',
        description: 'Ваш аккаунт и все данные были удалены'
      });

      // Выходим из системы
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Настройки
        </h1>
        <p className="text-muted-foreground mt-2">
          Управление настройками профиля, салона и системы
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="salon" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Салон
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Бизнес
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
        </TabsList>

        {/* Настройки профиля */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              <CardDescription>
                Управление данными вашего профиля
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileSettings.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'У'}
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={handleUploadPhoto}>
                    <Upload className="h-4 w-4 mr-2" />
                    Загрузить фото
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG до 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Введите имя"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Введите фамилию"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email нельзя изменить
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Роль</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Владелец салона</Badge>
                  <p className="text-sm text-muted-foreground">
                    Полный доступ ко всем функциям
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="bg-gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить профиль
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки салона */}
        <TabsContent value="salon" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о салоне</CardTitle>
              <CardDescription>
                Основная информация и контакты салона
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="salonName">Название салона</Label>
                <Input
                  id="salonName"
                  value={salonSettings.name}
                  onChange={(e) => setSalonSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salonDescription">Описание</Label>
                <Textarea
                  id="salonDescription"
                  value={salonSettings.description}
                  onChange={(e) => setSalonSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salonAddress">Адрес</Label>
                <Textarea
                  id="salonAddress"
                  value={salonSettings.address}
                  onChange={(e) => setSalonSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salonPhone">Телефон</Label>
                  <Input
                    id="salonPhone"
                    value={salonSettings.phone}
                    onChange={(e) => setSalonSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salonEmail">Email</Label>
                  <Input
                    id="salonEmail"
                    type="email"
                    value={salonSettings.email}
                    onChange={(e) => setSalonSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salonWebsite">Сайт</Label>
                  <Input
                    id="salonWebsite"
                    value={salonSettings.website}
                    onChange={(e) => setSalonSettings(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Режим работы
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workStart">Начало работы</Label>
                    <Input
                      id="workStart"
                      type="time"
                      value={salonSettings.workingHours.start}
                      onChange={(e) => setSalonSettings(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, start: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workEnd">Окончание работы</Label>
                    <Input
                      id="workEnd"
                      type="time"
                      value={salonSettings.workingHours.end}
                      onChange={(e) => setSalonSettings(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="weekends"
                    checked={salonSettings.workingHours.weekends}
                    onCheckedChange={(checked) => setSalonSettings(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, weekends: checked }
                    }))}
                  />
                  <Label htmlFor="weekends">Работа в выходные</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSalon} className="bg-gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки салона
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Бизнес настройки */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки бизнес-процессов</CardTitle>
              <CardDescription>
                Управление бронированием, оплатой и политикой салона
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <Input
                    id="currency"
                    value={businessSettings.currency}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, currency: e.target.value }))}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">НДС (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={businessSettings.taxRate}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultDuration">Длительность услуги (мин)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    min="15"
                    max="300"
                    step="15"
                    value={businessSettings.defaultServiceDuration}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, defaultServiceDuration: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Политика бронирования</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingAdvance">Бронирование на (дней вперед)</Label>
                    <Input
                      id="bookingAdvance"
                      type="number"
                      min="1"
                      max="365"
                      value={businessSettings.bookingAdvance}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, bookingAdvance: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellationPolicy">Отмена за (часов)</Label>
                    <Input
                      id="cancellationPolicy"
                      type="number"
                      min="1"
                      max="168"
                      value={businessSettings.cancellationPolicy}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoConfirm"
                      checked={businessSettings.autoConfirmBookings}
                      onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, autoConfirmBookings: checked }))}
                    />
                    <Label htmlFor="autoConfirm">Автоматическое подтверждение записей</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDeposit"
                      checked={businessSettings.requireDeposit}
                      onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, requireDeposit: checked }))}
                    />
                    <Label htmlFor="requireDeposit">Требовать предоплату</Label>
                  </div>

                  {businessSettings.requireDeposit && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="depositPercentage">Размер предоплаты (%)</Label>
                      <Input
                        id="depositPercentage"
                        type="number"
                        min="1"
                        max="100"
                        value={businessSettings.depositPercentage}
                        onChange={(e) => setBusinessSettings(prev => ({ ...prev, depositPercentage: Number(e.target.value) }))}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBusiness} className="bg-gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить бизнес настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки уведомлений */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Управление уведомлениями и напоминаниями
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Типы уведомлений</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                    <Label htmlFor="emailNotifications">Email уведомления</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                    <Label htmlFor="smsNotifications">SMS уведомления</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                    <Label htmlFor="pushNotifications">Push уведомления</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Напоминания клиентам</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remindersEnabled"
                      checked={notificationSettings.reminderSettings.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        reminderSettings: { ...prev.reminderSettings, enabled: checked }
                      }))}
                    />
                    <Label htmlFor="remindersEnabled">Включить напоминания</Label>
                  </div>

                  {notificationSettings.reminderSettings.enabled && (
                    <div className="ml-6 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="reminder24h"
                          checked={notificationSettings.reminderSettings.reminder24h}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            reminderSettings: { ...prev.reminderSettings, reminder24h: checked }
                          }))}
                        />
                        <Label htmlFor="reminder24h">За 24 часа</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="reminder2h"
                          checked={notificationSettings.reminderSettings.reminder2h}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            reminderSettings: { ...prev.reminderSettings, reminder2h: checked }
                          }))}
                        />
                        <Label htmlFor="reminder2h">За 2 часа</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="followUp"
                          checked={notificationSettings.reminderSettings.followUp}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            reminderSettings: { ...prev.reminderSettings, followUp: checked }
                          }))}
                        />
                        <Label htmlFor="followUp">Просьба об отзыве после визита</Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Switch
                  id="marketingEmails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                />
                <Label htmlFor="marketingEmails">Маркетинговые рассылки</Label>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="bg-gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки уведомлений
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки безопасности */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки безопасности</CardTitle>
              <CardDescription>
                Управление безопасностью аккаунта и системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                  <Label htmlFor="twoFactorAuth">Двухфакторная аутентификация</Label>
                  <Badge variant="outline">Рекомендуется</Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowMultipleSessions"
                    checked={securitySettings.allowMultipleSessions}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, allowMultipleSessions: checked }))}
                  />
                  <Label htmlFor="allowMultipleSessions">Разрешить несколько сессий</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Политика паролей</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Время сессии (минут)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="30"
                      max="1440"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Срок действия пароля (дней)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      min="30"
                      max="365"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Действия</h3>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={handleChangePassword}>Изменить пароль</Button>
                  <Button variant="outline" onClick={handleEndSessions}>Завершить все сессии</Button>
                  <Button variant="outline" onClick={handleDownloadData}>Скачать данные аккаунта</Button>
                  <Button variant="destructive" onClick={handleDeleteAccount}>Удалить аккаунт</Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} className="bg-gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки безопасности
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}