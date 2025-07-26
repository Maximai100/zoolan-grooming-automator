import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Gift, 
  Star, 
  TrendingUp, 
  Users, 
  Search,
  Calendar,
  Target,
  Award,
  CreditCard,
  Megaphone,
  Zap,
  TrendingUp as TrendingUpIcon,
  Send
} from 'lucide-react';
import { useLoyalty } from '@/hooks/useLoyalty';
import LoyaltyProgramForm from './LoyaltyProgramForm';
import PersonalOfferForm from './PersonalOfferForm';
import ClientBalanceAdjustment from './ClientBalanceAdjustment';

const LoyaltyPage = () => {
  const { 
    programs, 
    balances, 
    transactions, 
    offers, 
    loading, 
    createProgram, 
    updateProgram,
    createPersonalOffer,
    adjustClientPoints
  } = useLoyalty();

  // Mock data for campaigns - replace with actual hook
  const campaigns = [];
  const automations = [];

  const [searchTerm, setSearchTerm] = useState("");
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showBalanceAdjustment, setShowBalanceAdjustment] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  const activePrograms = programs.filter(p => p.is_active);
  const totalActiveClients = balances.filter(b => b.current_points > 0).length;
  const totalPointsInCirculation = balances.reduce((sum, b) => sum + b.current_points, 0);
  const averagePointsPerClient = totalActiveClients > 0 ? Math.round(totalPointsInCirculation / totalActiveClients) : 0;

  const filteredBalances = balances.filter(balance => {
    const clientName = `${balance.clients?.first_name} ${balance.clients?.last_name}`.toLowerCase();
    return clientName.includes(searchTerm.toLowerCase());
  });

  const handleCreateProgram = async (data: any) => {
    const result = await createProgram(data);
    if (result.error === null) {
      setShowProgramForm(false);
      setEditingProgram(null);
    }
  };

  const handleUpdateProgram = async (data: any) => {
    if (editingProgram) {
      const result = await updateProgram(editingProgram.id, data);
      if (result.error === null) {
        setShowProgramForm(false);
        setEditingProgram(null);
      }
    }
  };

  const handleCreateOffer = async (data: any) => {
    const result = await createPersonalOffer(data);
    if (result.error === null) {
      setShowOfferForm(false);
    }
  };

  const handleAdjustPoints = async (data: any) => {
    const result = await adjustClientPoints(
      data.clientId, 
      data.programId, 
      data.pointsAmount, 
      data.description
    );
    if (result.error === null) {
      setShowBalanceAdjustment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Программы лояльности</h1>
          <p className="text-muted-foreground">Управление программами лояльности и баллами клиентов</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowOfferForm(true)} variant="outline">
            <Gift className="h-4 w-4 mr-2" />
            Персональное предложение
          </Button>
          <Button onClick={() => setShowBalanceAdjustment(true)} variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Корректировка баллов
          </Button>
          <Button onClick={() => setShowProgramForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новая программа
          </Button>
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные программы</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms.length}</div>
            <p className="text-xs text-muted-foreground">
              из {programs.length} общих
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Участники программы</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveClients}</div>
            <p className="text-xs text-muted-foreground">
              активных клиентов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Баллы в обороте</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsInCirculation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              общий баланс
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний баланс</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePointsPerClient}</div>
            <p className="text-xs text-muted-foreground">
              баллов на клиента
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки */}
      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Программы</TabsTrigger>
          <TabsTrigger value="balances">Балансы клиентов</TabsTrigger>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="offers">Персональные предложения</TabsTrigger>
          <TabsTrigger value="campaigns">Массовые рассылки</TabsTrigger>
        </TabsList>

        {/* Программы лояльности */}
        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <Badge variant={program.is_active ? "default" : "secondary"}>
                      {program.is_active ? "Активна" : "Неактивна"}
                    </Badge>
                  </div>
                  {program.description && (
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Тип:</span>
                      <p>{program.type === 'points' ? 'Баллы за рубли' : 'Баллы за визиты'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Награда:</span>
                      <p>
                        {program.type === 'points' 
                          ? `${program.points_per_ruble} б/₽`
                          : `${program.points_per_visit} б/визит`
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Мин. списание:</span>
                      <p>{program.min_redemption_points} баллов</p>
                    </div>
                    <div>
                      <span className="font-medium">Стоимость балла:</span>
                      <p>{program.point_value} ₽</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setEditingProgram(program);
                      setShowProgramForm(true);
                    }}
                  >
                    Редактировать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Балансы клиентов */}
        <TabsContent value="balances" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск клиентов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBalances.map((balance) => (
              <Card key={balance.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {balance.clients?.first_name} {balance.clients?.last_name}
                  </CardTitle>
                  <div className="flex justify-between items-center">
                    <Badge variant={
                      balance.tier_level === 'gold' ? 'default' :
                      balance.tier_level === 'silver' ? 'secondary' : 'outline'
                    }>
                      {balance.tier_level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {balance.loyalty_programs?.name}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Текущие баллы:</span>
                    <span className="font-medium">{balance.current_points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Всего заработано:</span>
                    <span className="text-sm text-muted-foreground">{balance.total_earned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Потрачено:</span>
                    <span className="text-sm text-muted-foreground">{balance.total_redeemed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Последняя активность:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(balance.last_activity_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Транзакции */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Последние транзакции</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 20).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.transaction_type === 'earned' ? 'bg-green-500' :
                        transaction.transaction_type === 'redeemed' ? 'bg-blue-500' :
                        transaction.transaction_type === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">
                          {transaction.clients?.first_name} {transaction.clients?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || 'Без описания'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.transaction_type === 'earned' ? 'text-green-600' :
                        transaction.transaction_type === 'redeemed' ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'earned' ? '+' : '-'}
                        {Math.abs(transaction.points_amount)} баллов
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Персональные предложения */}
        <TabsContent value="offers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <Badge variant={offer.is_active ? "default" : "secondary"}>
                      {offer.is_active ? "Активно" : "Неактивно"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    для {offer.clients?.first_name} {offer.clients?.last_name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Тип:</span>
                    <span className="text-sm">{
                      offer.offer_type === 'discount' ? 'Скидка' :
                      offer.offer_type === 'bonus_points' ? 'Бонусные баллы' :
                      offer.offer_type === 'free_service' ? 'Бесплатная услуга' : 'Бесплатный товар'
                    }</span>
                  </div>
                  {offer.discount_value && (
                    <div className="flex justify-between">
                      <span className="text-sm">Скидка:</span>
                      <span className="text-sm font-medium">{offer.discount_value}%</span>
                    </div>
                  )}
                  {offer.bonus_points && (
                    <div className="flex justify-between">
                      <span className="text-sm">Бонус:</span>
                      <span className="text-sm font-medium">{offer.bonus_points} баллов</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm">Использований:</span>
                    <span className="text-sm">{offer.usage_count}/{offer.usage_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Действует до:</span>
                    <span className="text-sm">
                      {offer.valid_until ? new Date(offer.valid_until).toLocaleDateString() : 'Без ограничений'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Массовые рассылки */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные кампании</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">запущенных сейчас</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Автоматизация</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{automations.filter(a => a.is_active).length}</div>
                <p className="text-xs text-muted-foreground">активных правил</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Отправлено сегодня</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">сообщений</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="campaigns" className="space-y-4">
            <TabsList>
              <TabsTrigger value="campaigns">Кампании</TabsTrigger>
              <TabsTrigger value="automation">Автоматизация</TabsTrigger>
              <TabsTrigger value="segments">Сегменты</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Кампании массовых рассылок</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Новая кампания
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Создайте первую кампанию</h3>
                    <p className="mb-4">
                      Отправляйте персонализированные сообщения сегментам клиентов: 
                      VIP-клиенты, дни рождения питомцев, неактивные клиенты
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать кампанию
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Автоматические рассылки</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Новое правило
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Дни рождения питомцев</CardTitle>
                      <Badge variant="outline">Неактивно</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Автоматически поздравляйте владельцев с днем рождения их питомцев и предлагайте скидки
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Триггер:</span>
                      <span>За 7 дней до дня рождения</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Последний запуск:</span>
                      <span>Никогда</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Настроить
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Возврат клиентов</CardTitle>
                      <Badge variant="outline">Неактивно</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Напоминайте клиентам, которые не посещали салон более 30 дней
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Триггер:</span>
                      <span>30 дней без визитов</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Последний запуск:</span>
                      <span>Никогда</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Настроить
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">VIP предложения</CardTitle>
                      <Badge variant="outline">Неактивно</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Специальные предложения для высокоценных клиентов
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Триггер:</span>
                      <span>Трата свыше 10 000 ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Последний запуск:</span>
                      <span>Никогда</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Настроить
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Свободные слоты</CardTitle>
                      <Badge variant="outline">Неактивно</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Уведомления о свободных местах в расписании с выгодными предложениями
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Триггер:</span>
                      <span>Много свободных слотов</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Последний запуск:</span>
                      <span>Никогда</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Настроить
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="segments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Сегменты клиентов</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Новый сегмент
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">VIP клиенты</CardTitle>
                      <Badge>Активен</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Клиентов:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Условие:</span>
                      <span className="text-sm">Потратили {'>'}10 000 ₽</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Редактировать
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Новые клиенты</CardTitle>
                      <Badge>Активен</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Клиентов:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Условие:</span>
                      <span className="text-sm">Зарегистрированы {'<'}30 дней</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Редактировать
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Неактивные</CardTitle>
                      <Badge variant="secondary">Неактивен</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Клиентов:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Условие:</span>
                      <span className="text-sm">Нет визитов {'>'}60 дней</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Редактировать
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Диалоги */}
      <Dialog open={showProgramForm} onOpenChange={setShowProgramForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Редактировать программу' : 'Новая программа лояльности'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[75vh] pr-2">
            <LoyaltyProgramForm
              program={editingProgram}
              onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram}
              onCancel={() => {
                setShowProgramForm(false);
                setEditingProgram(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOfferForm} onOpenChange={setShowOfferForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Новое персональное предложение</DialogTitle>
          </DialogHeader>
          <PersonalOfferForm
            onSubmit={handleCreateOffer}
            onCancel={() => setShowOfferForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBalanceAdjustment} onOpenChange={setShowBalanceAdjustment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Корректировка баланса клиента</DialogTitle>
          </DialogHeader>
          <ClientBalanceAdjustment
            programs={programs}
            onSubmit={handleAdjustPoints}
            onCancel={() => setShowBalanceAdjustment(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoyaltyPage;