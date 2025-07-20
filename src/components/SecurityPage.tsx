import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSecurity } from '@/hooks/useSecurity';
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  QrCode, 
  Key, 
  Smartphone, 
  Activity, 
  MapPin, 
  Monitor, 
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const SecurityPage = () => {
  const { 
    twoFactor, 
    auditLogs, 
    sessions, 
    loading,
    generateTwoFactorSecret,
    enableTwoFactor,
    disableTwoFactor,
    terminateSession,
    terminateAllOtherSessions,
    regenerateBackupCodes
  } = useSecurity();

  const [qrSetup, setQrSetup] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleGenerate2FA = async () => {
    const setup = await generateTwoFactorSecret();
    if (setup) {
      setQrSetup(setup);
    }
  };

  const handleEnable2FA = async () => {
    if (verificationCode.length === 6) {
      const success = await enableTwoFactor(verificationCode);
      if (success) {
        setQrSetup(null);
        setVerificationCode('');
      }
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const codes = await regenerateBackupCodes();
    if (codes) {
      setShowBackupCodes(true);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <span className="text-green-500">+</span>;
      case 'update':
        return <span className="text-blue-500">✎</span>;
      case 'delete':
        return <span className="text-red-500">×</span>;
      case 'login':
        return <span className="text-green-500">→</span>;
      case 'logout':
        return <span className="text-gray-500">←</span>;
      default:
        return <span className="text-gray-500">•</span>;
    }
  };

  const getActionText = (action: string) => {
    const actions: { [key: string]: string } = {
      'create': 'Создание',
      'update': 'Обновление',
      'delete': 'Удаление',
      'login': 'Вход в систему',
      'logout': 'Выход из системы',
      'enable_2fa': 'Включение 2FA',
      'disable_2fa': 'Отключение 2FA',
      'regenerate_backup_codes': 'Обновление кодов восстановления',
      'terminate_session': 'Завершение сессии',
      'terminate_all_sessions': 'Завершение всех сессий'
    };
    return actions[action] || action;
  };

  const getResourceText = (resourceType: string) => {
    const resources: { [key: string]: string } = {
      'client': 'Клиент',
      'appointment': 'Запись',
      'service': 'Услуга',
      'staff': 'Сотрудник',
      'product': 'Товар',
      'order': 'Заказ',
      'security': 'Безопасность',
      'security_session': 'Сессия безопасности'
    };
    return resources[resourceType] || resourceType;
  };

  const getUserAgent = (userAgent?: string) => {
    if (!userAgent) return 'Неизвестно';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Другой';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Безопасность</h1>
        <p className="text-muted-foreground">
          Управление настройками безопасности и мониторинг активности
        </p>
      </div>

      <Tabs defaultValue="2fa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="2fa">Двухфакторная аутентификация</TabsTrigger>
          <TabsTrigger value="sessions">Активные сессии</TabsTrigger>
          <TabsTrigger value="audit">Журнал аудита</TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {twoFactor?.is_enabled ? (
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <ShieldX className="w-5 h-5 text-red-500" />
                )}
                Двухфакторная аутентификация (2FA)
              </CardTitle>
              <CardDescription>
                Добавьте дополнительный уровень безопасности к вашему аккаунту
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">
                    Статус: {twoFactor?.is_enabled ? 'Включена' : 'Отключена'}
                  </p>
                  {twoFactor?.enabled_at && (
                    <p className="text-sm text-muted-foreground">
                      Включена: {format(new Date(twoFactor.enabled_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </p>
                  )}
                  {twoFactor?.last_used_at && (
                    <p className="text-sm text-muted-foreground">
                      Последнее использование: {format(new Date(twoFactor.last_used_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </p>
                  )}
                </div>
                <Badge variant={twoFactor?.is_enabled ? 'default' : 'secondary'}>
                  {twoFactor?.is_enabled ? 'Активна' : 'Неактивна'}
                </Badge>
              </div>

              {!twoFactor?.is_enabled ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Рекомендуется включить 2FA</h4>
                        <p className="text-sm text-blue-700">
                          Двухфакторная аутентификация значительно повышает безопасность вашего аккаунта.
                          Даже если кто-то узнает ваш пароль, он не сможет получить доступ без вашего устройства.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={handleGenerate2FA}>
                        <QrCode className="w-4 h-4 mr-2" />
                        Настроить 2FA
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Настройка двухфакторной аутентификации</DialogTitle>
                        <DialogDescription>
                          Отсканируйте QR-код с помощью приложения аутентификатора
                        </DialogDescription>
                      </DialogHeader>
                      
                      {qrSetup && (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <img 
                              src={qrSetup.qrCodeUrl} 
                              alt="QR Code" 
                              className="w-48 h-48 border rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Или введите код вручную:</Label>
                            <div className="p-2 bg-muted rounded text-center font-mono text-sm break-all">
                              {qrSetup.secret}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="verification">Код подтверждения из приложения:</Label>
                            <Input
                              id="verification"
                              placeholder="Введите 6-значный код"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              maxLength={6}
                            />
                          </div>

                          <Button 
                            onClick={handleEnable2FA}
                            disabled={verificationCode.length !== 6}
                            className="w-full"
                          >
                            Подтвердить и включить 2FA
                          </Button>

                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <h4 className="font-medium text-yellow-900 flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              Коды восстановления
                            </h4>
                            <p className="text-sm text-yellow-700 mb-2">
                              Сохраните эти коды в безопасном месте. Они помогут восстановить доступ, если вы потеряете устройство.
                            </p>
                            <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                              {qrSetup.backupCodes.map((code, index) => (
                                <div key={index} className="bg-white p-1 rounded border">
                                  {code}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRegenerateBackupCodes}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Обновить коды восстановления
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <ShieldX className="w-4 h-4 mr-2" />
                          Отключить 2FA
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Отключить двухфакторную аутентификацию?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это сделает ваш аккаунт менее защищенным. Вы уверены, что хотите отключить 2FA?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={disableTwoFactor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Отключить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {twoFactor.backup_codes && twoFactor.backup_codes.length > 0 && (
                    <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Коды восстановления</DialogTitle>
                          <DialogDescription>
                            Сохраните эти коды в безопасном месте
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                          {twoFactor.backup_codes.map((code, index) => (
                            <div key={index} className="p-2 bg-muted rounded text-center">
                              {code}
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Активные сессии
              </CardTitle>
              <CardDescription>
                Управление активными сессиями и устройствами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.length > 1 && (
                  <div className="flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Завершить все остальные сессии
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Завершить все остальные сессии?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Все остальные устройства будут отключены и потребуют повторного входа.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={terminateAllOtherSessions}>
                            Завершить все
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {getUserAgent(session.user_agent)} {session.ip_address && `(${session.ip_address})`}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Последняя активность: {format(new Date(session.last_activity_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                            </span>
                            {session.location_data && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {session.location_data.city || 'Неизвестно'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.is_active ? 'default' : 'secondary'}>
                          {session.is_active ? 'Активна' : 'Неактивна'}
                        </Badge>
                        {session.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => terminateSession(session.id)}
                          >
                            Завершить
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет активных сессий
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Журнал аудита
              </CardTitle>
              <CardDescription>
                История действий пользователей в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Ресурс</TableHead>
                    <TableHead>IP адрес</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <p className="font-medium">
                              {log.user.first_name} {log.user.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.user.email}
                            </p>
                          </div>
                        ) : (
                          'Система'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          {getActionText(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getResourceText(log.resource_type)}
                        {log.resource_id && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.resource_id.slice(0, 8)}...
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.ip_address || 'Неизвестно'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Нет записей в журнале аудита
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPage;