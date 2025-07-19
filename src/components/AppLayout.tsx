
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell, BarChart3, Settings, Menu, Home, X, LogOut } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Dashboard from "./Dashboard";
import ClientsPage from "./ClientsPage";
import CalendarPage from "./CalendarPage";
import NotificationsPage from "./NotificationsPage";

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выйти из системы',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'До свидания!',
        description: 'Вы успешно вышли из системы'
      });
    }
  };

  const navigation = [
    { id: "dashboard", name: "Дашборд", icon: Home },
    { id: "calendar", name: "Календарь", icon: Calendar },
    { id: "clients", name: "Клиенты", icon: Users },
    { id: "reminders", name: "Напоминания", icon: Bell },
    { id: "analytics", name: "Аналитика", icon: BarChart3 },
    { id: "settings", name: "Настройки", icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    console.log('🔄 Switching to tab:', tabId);
    console.log('🔄 Previous tab:', activeTab);
    setActiveTab(tabId);
    setSidebarOpen(false);
    console.log('✅ Tab switched successfully');
  };

  const renderContent = () => {
    console.log('🎨 Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "calendar":
        return <CalendarPage />;
      case "clients":
        console.log('👥 Rendering ClientsPage');
        return <ClientsPage />;
      case "reminders":
        return <NotificationsPage />;
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
        console.log('⚠️ Unknown tab, falling back to dashboard');
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
              onClick={() => handleTabClick(item.id)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {item.id === 'clients' && (
                <span className="ml-auto text-xs opacity-60">
                  {activeTab === item.id ? '●' : '○'}
                </span>
              )}
            </Button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-muted rounded-lg p-3 mb-3">
            <div className="text-xs text-muted-foreground mb-1">Пользователь</div>
            <div className="text-sm font-medium truncate">{user?.email}</div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
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
                  Салон груминга "Лапки" • Активная вкладка: {activeTab}
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
          <div className="mb-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            Debug: activeTab = "{activeTab}" | user = {user?.email || 'not logged in'}
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
