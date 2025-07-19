import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell, BarChart3, Settings, Menu, Home, X } from "lucide-react";
import Dashboard from "./Dashboard";

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: "dashboard", name: "Дашборд", icon: Home },
    { id: "calendar", name: "Календарь", icon: Calendar },
    { id: "clients", name: "Клиенты", icon: Users },
    { id: "reminders", name: "Напоминания", icon: Bell },
    { id: "analytics", name: "Аналитика", icon: BarChart3 },
    { id: "settings", name: "Настройки", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "calendar":
        return (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Календарь записей</h2>
            <p className="text-muted-foreground">Здесь будет AI-планировщик записей</p>
          </div>
        );
      case "clients":
        return (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">База клиентов</h2>
            <p className="text-muted-foreground">CRM для управления клиентами и их питомцами</p>
          </div>
        );
      case "reminders":
        return (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Автонапоминания</h2>
            <p className="text-muted-foreground">SMS, email и WhatsApp уведомления</p>
          </div>
        );
      case "analytics":
        return (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Аналитика бизнеса</h2>
            <p className="text-muted-foreground">Отчеты по доходам и эффективности</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-20">
            <Settings className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Настройки</h2>
            <p className="text-muted-foreground">Конфигурация системы и профиля</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">З</span>
            </div>
            <span className="text-xl font-bold text-foreground">Зооплан</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-soft" 
                  : "hover:bg-muted"
              }`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-hero-gradient rounded-lg p-4 text-white text-center">
            <div className="text-sm font-medium mb-2">Версия Профи</div>
            <div className="text-xs opacity-90">Все функции доступны</div>
            <Button variant="secondary" size="sm" className="mt-3 w-full">
              Управление подпиской
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {navigation.find(item => item.id === activeTab)?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Салон груминга "Лапки"
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                3
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">АП</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;