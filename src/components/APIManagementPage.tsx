import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Key, 
  Plus, 
  Copy, 
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Activity,
  Settings,
  Shield,
  AlertTriangle,
  Code,
  Globe,
  Zap
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface FeatureFlag {
  name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  user_enabled?: boolean;
}

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  execution_time_ms: number;
  created_at: string;
}

export default function APIManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Заглушка данных
      setApiKeys([
        {
          id: "1",
          name: "Основной API ключ",
          key_preview: "zp_live_••••••••••••7829",
          permissions: ["read:clients", "write:appointments", "read:analytics"],
          last_used_at: new Date().toISOString(),
          expires_at: null,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          name: "Мобильное приложение",
          key_preview: "zp_live_••••••••••••3451",
          permissions: ["read:clients", "read:appointments"],
          last_used_at: null,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]);

      setFeatureFlags([
        { name: "advanced_analytics", description: "Расширенная аналитика", is_enabled: true, rollout_percentage: 100, user_enabled: true },
        { name: "ai_scheduling", description: "AI-оптимизация расписания", is_enabled: false, rollout_percentage: 20, user_enabled: false },
        { name: "social_media_integration", description: "Интеграция с соцсетями", is_enabled: false, rollout_percentage: 0, user_enabled: false },
        { name: "multi_location", description: "Мультилокации", is_enabled: true, rollout_percentage: 50, user_enabled: true },
        { name: "mobile_app", description: "Мобильное приложение", is_enabled: true, rollout_percentage: 100, user_enabled: true },
        { name: "loyalty_program", description: "Программа лояльности", is_enabled: true, rollout_percentage: 80, user_enabled: true }
      ]);

      setApiLogs([
        { id: "1", endpoint: "/api/v1/clients", method: "GET", status_code: 200, execution_time_ms: 145, created_at: new Date().toISOString() },
        { id: "2", endpoint: "/api/v1/appointments", method: "POST", status_code: 201, execution_time_ms: 89, created_at: new Date().toISOString() },
        { id: "3", endpoint: "/api/v1/analytics/revenue", method: "GET", status_code: 200, execution_time_ms: 234, created_at: new Date().toISOString() }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const permissions = Array.from(formData.getAll('permissions')) as string[];
    const expiresAt = formData.get('expires_at') as string;

    try {
      // Генерируем новый API ключ
      const newKey = `zp_live_${Math.random().toString(36).substring(2, 34)}`;
      setNewApiKey(newKey);

      const newApiKeyObj: ApiKey = {
        id: Date.now().toString(),
        name,
        key_preview: `${newKey.substring(0, 16)}••••••••••••${newKey.slice(-4)}`,
        permissions,
        last_used_at: null,
        expires_at: expiresAt || null,
        is_active: true,
        created_at: new Date().toISOString()
      };

      setApiKeys(prev => [...prev, newApiKeyObj]);
      
      toast({
        title: "API ключ создан",
        description: "Скопируйте ключ - он больше не будет показан"
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать API ключ",
        variant: "destructive"
      });
    }
  };

  const toggleFeatureFlag = async (flagName: string, enabled: boolean) => {
    try {
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag.name === flagName 
            ? { ...flag, user_enabled: enabled }
            : flag
        )
      );

      toast({
        title: "Настройка обновлена",
        description: `Feature flag "${flagName}" ${enabled ? 'включен' : 'выключен'}`
      });
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить настройку",
        variant: "destructive"
      });
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Скопировано",
      description: "API ключ скопирован в буфер обмена"
    });
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "text-green-600";
    if (statusCode >= 400 && statusCode < 500) return "text-yellow-600";
    if (statusCode >= 500) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API и интеграции</h1>
          <p className="text-muted-foreground">Управление API ключами, feature flags и интеграциями</p>
        </div>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">API ключи</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="logs">API логи</TabsTrigger>
          <TabsTrigger value="docs">Документация</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">API ключи</h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Создать ключ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Новый API ключ</DialogTitle>
                    <DialogDescription>Создание нового ключа для доступа к API</DialogDescription>
                  </DialogHeader>
                  
                  {newApiKey ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Важно!</span>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                          Скопируйте ключ сейчас. Он больше не будет показан.
                        </p>
                        <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm break-all">
                          {newApiKey}
                        </div>
                        <Button 
                          className="w-full mt-3" 
                          onClick={() => copyApiKey(newApiKey)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Скопировать ключ
                        </Button>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setNewApiKey("");
                          setShowCreateDialog(false);
                        }}
                      >
                        Готово
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateApiKey(new FormData(e.currentTarget));
                    }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Название</Label>
                          <Input id="name" name="name" placeholder="Например: Мобильное приложение" required />
                        </div>
                        
                        <div>
                          <Label>Разрешения</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {[
                              { id: "read:clients", label: "Чтение клиентов" },
                              { id: "write:clients", label: "Изменение клиентов" },
                              { id: "read:appointments", label: "Чтение записей" },
                              { id: "write:appointments", label: "Изменение записей" },
                              { id: "read:analytics", label: "Чтение аналитики" },
                              { id: "admin", label: "Полный доступ" }
                            ].map(permission => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox id={permission.id} name="permissions" value={permission.id} />
                                <Label htmlFor={permission.id} className="text-sm">{permission.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="expires_at">Срок действия (опционально)</Label>
                          <Input id="expires_at" name="expires_at" type="date" />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Отмена
                          </Button>
                          <Button type="submit">Создать</Button>
                        </div>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{key.name}</CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {key.key_preview}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Разрешения:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {key.permissions.map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Последнее использование:</Label>
                          <p>{key.last_used_at ? new Date(key.last_used_at).toLocaleString('ru') : 'Никогда'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Истекает:</Label>
                          <p>{key.expires_at ? new Date(key.expires_at).toLocaleDateString('ru') : 'Без ограничений'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Настроить
                        </Button>
                        <Button size="sm" variant="outline">
                          Отозвать
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Feature Flags</h2>
            
            <div className="grid gap-4">
              {featureFlags.map((flag) => (
                <Card key={flag.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">{flag.description}</h3>
                          <Badge variant="outline" className="text-xs">
                            {flag.rollout_percentage}% rollout
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{flag.name}</p>
                      </div>
                      <Switch
                        checked={flag.user_enabled}
                        onCheckedChange={(checked) => toggleFeatureFlag(flag.name, checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">API логи</h2>
            
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {apiLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.method}
                          </Badge>
                          <span className="font-mono text-sm">{log.endpoint}</span>
                          <span className={`font-mono text-sm font-medium ${getStatusColor(log.status_code)}`}>
                            {log.status_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{log.execution_time_ms}ms</span>
                          <span>{new Date(log.created_at).toLocaleString('ru')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">API документация</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Быстрый старт
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Base URL:</Label>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm mt-1">
                      https://d82e03d1-52f4-4dab-96e8-6e6c67ad8ae0.lovableproject.com/api/v1
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Аутентификация:</Label>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm mt-1">
                      curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;https://api.zooplan.com/v1/clients
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Основные эндпоинты</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { method: "GET", endpoint: "/clients", description: "Получить список клиентов" },
                      { method: "POST", endpoint: "/clients", description: "Создать нового клиента" },
                      { method: "GET", endpoint: "/appointments", description: "Получить записи" },
                      { method: "POST", endpoint: "/appointments", description: "Создать запись" },
                      { method: "GET", endpoint: "/analytics/revenue", description: "Получить данные о выручке" }
                    ].map((endpoint, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded">
                        <Badge variant="outline" className="font-mono text-xs w-16 justify-center">
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono text-sm flex-1">{endpoint.endpoint}</span>
                        <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}