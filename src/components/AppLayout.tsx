
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Bell, 
  BarChart3, 
  UserCog, 
  Settings, 
  LogOut,
  Heart,
  Wrench,
  Gift,
  ShoppingCart,
  Package,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Клиенты', href: '/clients', icon: Users },
  { name: 'Календарь', href: '/calendar', icon: Calendar },
  { name: 'POS Система', href: '/pos', icon: ShoppingCart },
  { name: 'Уведомления', href: '/notifications', icon: Bell },
  { name: 'Аналитика', href: '/analytics', icon: BarChart3 },
  { name: 'Персонал', href: '/staff', icon: UserCog },
  { name: 'Услуги', href: '/services', icon: Wrench },
  { name: 'Инвентарь', href: '/inventory', icon: Package },
  { name: 'Лояльность', href: '/loyalty', icon: Gift },
  { name: 'Подписка', href: '/subscription', icon: CreditCard },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    return href !== '/'
      ? location.pathname.startsWith(href)
      : location.pathname === '/';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2 hover:bg-primary/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-primary p-2 rounded-lg shadow-soft animate-float">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Зооплан</h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Управление салоном груминга
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/5 to-primary-glow/5 border border-primary/10">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.role === 'owner' ? 'Владелец' : 
                     profile?.role === 'manager' ? 'Менеджер' : 
                     profile?.role === 'groomer' ? 'Грумер' : 'Администратор'}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="btn-secondary hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Выход</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-card/50 backdrop-blur-sm border-r border-border/50 h-full fixed left-0 top-16 z-30">
          <div className="p-4 h-full overflow-y-auto">
            <nav className="space-y-1">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item group animate-fade-in-left ${isActive(item.href) ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md transition-colors ${
                      isActive(item.href) ? 'bg-primary-foreground/20' : 'group-hover:bg-accent/50'
                    }`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isActive(item.href) && (
                    <div className="w-1 h-1 bg-primary-foreground rounded-full animate-bounce-in"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
            <Card className="absolute left-0 top-16 bottom-0 w-64 bg-card/95 backdrop-blur-sm border-r border-border/50 animate-fade-in-left">
              <div className="p-4">
                <nav className="space-y-1">
                  {navigation.map((item, index) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`nav-item group animate-slide-up ${isActive(item.href) ? 'active' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-md transition-colors ${
                          isActive(item.href) ? 'bg-primary-foreground/20' : 'group-hover:bg-accent/50'
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {isActive(item.href) && (
                        <div className="w-1 h-1 bg-primary-foreground rounded-full animate-bounce-in"></div>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-8 h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
