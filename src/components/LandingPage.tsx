import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Bell, BarChart3, Shield, Clock, Star, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-grooming.jpg";
import calendarFeature from "@/assets/calendar-feature.jpg";
import crmFeature from "@/assets/crm-feature.jpg";
import remindersFeature from "@/assets/reminders-feature.jpg";

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: "AI-Планировщик",
      description: "Умное планирование записей с учетом времени груминга для каждой породы",
      image: calendarFeature,
      stats: "+15% больше записей"
    },
    {
      icon: Users,
      title: "CRM для питомцев",
      description: "Полные профили клиентов и их любимцев с историей посещений",
      image: crmFeature,
      stats: "Экономия 10 часов в неделю"
    },
    {
      icon: Bell,
      title: "Автонапоминания",
      description: "SMS, email и WhatsApp напоминания для клиентов",
      image: remindersFeature,
      stats: "-25% пропущенных записей"
    },
    {
      icon: BarChart3,
      title: "Аналитика бизнеса",
      description: "Отчеты по доходам, загруженности и популярным услугам",
      image: calendarFeature,
      stats: "Полный контроль над бизнесом"
    }
  ];

  const testimonials = [
    {
      name: "Анна Петрова",
      role: "Владелец салона 'Лапки'",
      text: "Зооплан полностью изменил мой бизнес! Больше никаких потерянных записей и забытых клиентов.",
      rating: 5
    },
    {
      name: "Михаил Соколов", 
      role: "Грумер-стилист",
      text: "Теперь я могу сосредоточиться на работе с животными, а не на бумажной работе.",
      rating: 5
    },
    {
      name: "Елена Волкова",
      role: "Менеджер сети салонов",
      text: "Управление тремя салонами стало в разы проще. Рекомендую всем коллегам!",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Старт",
      price: "2990",
      description: "Для начинающих грумеров",
      features: [
        "До 100 записей в месяц",
        "Базовый CRM",
        "Email напоминания",
        "Мобильное приложение"
      ],
      popular: false
    },
    {
      name: "Профи",
      price: "4990",
      description: "Для салонов груминга",
      features: [
        "Неограниченные записи",
        "AI-планировщик",
        "SMS + Email + WhatsApp",
        "Аналитика и отчеты",
        "Онлайн-запись для клиентов",
        "Интеграция с 1С"
      ],
      popular: true
    },
    {
      name: "Сеть",
      price: "9990",
      description: "Для сетей салонов",
      features: [
        "Все функции Профи",
        "Мультилокации",
        "Управление персоналом",
        "Расширенная аналитика",
        "Персональный менеджер",
        "API интеграции"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">З</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">Зооплан</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Функции</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Тарифы</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Отзывы</a>
            <Button variant="outline" size="sm" className="hidden lg:inline-flex">Войти</Button>
            <Button variant="hero" size="sm">Попробовать бесплатно</Button>
          </nav>
          <div className="md:hidden">
            <Button variant="hero" size="sm" className="text-xs px-3">Попробовать</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                  🚀 Автопилот для салона груминга
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Управляйте салоном груминга
                  <span className="bg-hero-gradient bg-clip-text text-transparent"> на автопилоте</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  AI-платформа, которая автоматизирует записи, напоминания и ведение клиентской базы. 
                  Сосредоточьтесь на уходе за питомцами, а не на бумажной работе.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button variant="hero" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 h-12 sm:h-auto">
                  Начать бесплатный период
                </Button>
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 h-12 sm:h-auto">
                  Смотреть демо
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">1300+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Салонов</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">25%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Меньше пропусков</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">10 ч</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Экономия в неделю</div>
                </div>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              <img 
                src={heroImage} 
                alt="Профессиональный груминг" 
                className="rounded-2xl shadow-2xl w-full animate-float"
              />
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white rounded-xl p-3 sm:p-4 shadow-glow animate-bounce">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">Запись подтверждена</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground">
              Все инструменты в одном месте
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Зооплан объединяет планирование, CRM и аналитику специально для салонов груминга
            </p>
          </div>

          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card-gradient border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <Badge variant="outline" className="text-xs bg-primary/5 text-primary">
                        {feature.stats}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="rounded-lg w-full shadow-card hover:shadow-glow transition-all duration-300"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Прозрачные тарифы
            </h2>
            <p className="text-xl text-muted-foreground">
              Выберите подходящий план для вашего бизнеса
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary scale-105 shadow-glow' : ''} hover:shadow-card transition-all duration-300`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Популярный
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-foreground">
                      {plan.price} ₽
                    </div>
                    <div className="text-sm text-muted-foreground">в месяц</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.popular ? "hero" : "outline"} 
                    className="w-full"
                    size="lg"
                  >
                    {plan.popular ? "Начать сейчас" : "Выбрать план"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Что говорят наши клиенты
            </h2>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card-gradient hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">
            Готовы автоматизировать свой салон?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Присоединяйтесь к 1300+ успешным салонам груминга по всей России
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
              Начать бесплатный период 14 дней
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
              Записаться на демо
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">З</span>
                </div>
                <span className="text-xl font-bold">Зооплан</span>
              </div>
              <p className="text-muted-foreground">
                Платформа нового поколения для салонов груминга
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Функции</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Тарифы</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Помощь</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Обучение</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Контакты</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Блог</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Карьера</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Зооплан. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;