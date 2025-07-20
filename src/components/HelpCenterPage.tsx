import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePWA } from "@/hooks/usePWA";
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Book, 
  Play, 
  CheckCircle, 
  ExternalLink,
  Lightbulb,
  Users,
  Calendar,
  BarChart3,
  Settings
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: any;
  action?: () => void;
}

export default function HelpCenterPage() {
  const { user } = useAuth();
  const { isOnline, canInstall, installApp, isInstalled } = usePWA();
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeOnboarding();
  }, [user]);

  const initializeOnboarding = async () => {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    const steps: OnboardingStep[] = [
      {
        id: 'profile',
        title: 'Заполните профиль',
        description: 'Добавьте информацию о салоне и контактные данные',
        completed: !!profile?.first_name,
        icon: Users,
        action: () => window.location.href = '/settings'
      },
      {
        id: 'client',
        title: 'Добавьте первого клиента',
        description: 'Создайте карточку клиента с информацией о питомце',
        completed: false,
        icon: Users,
        action: () => window.location.href = '/clients'
      },
      {
        id: 'service',
        title: 'Настройте услуги',
        description: 'Добавьте услуги груминга с ценами',
        completed: false,
        icon: Settings,
        action: () => window.location.href = '/services'
      },
      {
        id: 'appointment',
        title: 'Создайте первую запись',
        description: 'Запланируйте посещение в календаре',
        completed: false,
        icon: Calendar,
        action: () => window.location.href = '/calendar'
      }
    ];

    setOnboardingSteps(steps);
    setShowOnboarding(steps.some(step => !step.completed));
  };

  const quickStartGuides = [
    {
      title: "Быстрый старт",
      description: "Настройка системы за 5 минут",
      duration: "5 мин",
      icon: Play,
      content: [
        "1. Заполните профиль салона",
        "2. Добавьте услуги и цены", 
        "3. Создайте первого клиента",
        "4. Запланируйте запись"
      ]
    },
    {
      title: "Работа с клиентами",
      description: "Управление базой клиентов",
      duration: "3 мин",
      icon: Users,
      content: [
        "• Создание карточек клиентов",
        "• Добавление информации о питомцах",
        "• Использование тегов и сегментов",
        "• История посещений"
      ]
    },
    {
      title: "Календарь и записи",
      description: "Планирование и управление записями",
      duration: "4 мин", 
      icon: Calendar,
      content: [
        "• Создание новых записей",
        "• Изменение статусов",
        "• Настройка напоминаний",
        "• Работа с календарем"
      ]
    },
    {
      title: "Аналитика и отчеты",
      description: "Анализ эффективности салона",
      duration: "6 мин",
      icon: BarChart3,
      content: [
        "• Просмотр KPI метрик",
        "• Генерация отчетов",
        "• Анализ доходности",
        "• Экспорт данных"
      ]
    }
  ];

  const faqItems = [
    {
      question: "Как добавить нового клиента?",
      answer: "Перейдите в раздел 'Клиенты' и нажмите кнопку 'Добавить клиента'. Заполните контактную информацию и данные о питомце."
    },
    {
      question: "Как настроить автоматические напоминания?",
      answer: "В разделе 'Уведомления' выберите типы событий и временные интервалы для отправки SMS и email напоминаний."
    },
    {
      question: "Можно ли работать без интернета?",
      answer: "Да, система поддерживает офлайн-режим. Данные синхронизируются при восстановлении связи."
    },
    {
      question: "Как экспортировать данные?",
      answer: "В разделе 'Экспорт данных' выберите тип данных и формат файла. Готовый файл можно скачать после обработки."
    },
    {
      question: "Как изменить тарифный план?",
      answer: "В разделе 'Подписка' выберите подходящий план и нажмите 'Выбрать план'. Изменения вступят в силу немедленно."
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Центр помощи</h1>
          <p className="text-muted-foreground">Руководства, FAQ и поддержка</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? "Онлайн" : "Офлайн"}
          </Badge>
          
          {canInstall && (
            <Button size="sm" onClick={installApp} className="gap-2">
              <Download className="h-4 w-4" />
              Установить приложение
            </Button>
          )}
        </div>
      </div>

      {/* PWA Installation Prompt */}
      {canInstall && !isInstalled && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Установите Зооплан как приложение для быстрого доступа и офлайн-работы</span>
            <Button size="sm" onClick={installApp}>
              Установить
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Onboarding Steps */}
      {showOnboarding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Первые шаги
            </CardTitle>
            <CardDescription>Настройте систему для эффективной работы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {onboardingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${step.completed ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{index + 1}. {step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {!step.completed && step.action && (
                    <Button size="sm" variant="outline" onClick={step.action}>
                      Выполнить
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="guides" className="space-y-4">
        <TabsList>
          <TabsTrigger value="guides">Руководства</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Поддержка</TabsTrigger>
        </TabsList>

        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickStartGuides.map((guide) => (
              <Card key={guide.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <guide.icon className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">{guide.duration}</Badge>
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {guide.content.map((item, index) => (
                      <p key={index} className="text-sm text-muted-foreground">{item}</p>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Начать руководство
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Документация</CardTitle>
                <CardDescription>Полное руководство пользователя</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Book className="h-4 w-4 mr-2" />
                  Открыть документацию
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Техническая поддержка</CardTitle>
                <CardDescription>Свяжитесь с нашей командой</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  📧 support@zooplan.ru
                </Button>
                <Button className="w-full" variant="outline">
                  📱 +7 (495) 123-45-67
                </Button>
                <Button className="w-full" variant="outline">
                  💬 Онлайн чат
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}