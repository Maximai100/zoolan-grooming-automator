import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Heart } from 'lucide-react';

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Ошибка входа',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему'
      });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const { error } = await signUp(email, password, firstName, lastName);

    if (error) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Регистрация успешна!',
        description: 'Добро пожаловать в Зооплан'
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-12 sm:w-16 h-12 sm:h-16 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md sm:max-w-lg relative z-10 animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-glow animate-bounce-in">
              <Scissors className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white gradient-text-white">Зооплан</h1>
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-1"></div>
            </div>
          </div>
          <p className="text-white/90 text-base sm:text-lg font-medium">
            Профессиональная CRM для салонов груминга
          </p>
          <p className="text-white/70 text-sm sm:text-base mt-2">
            Управляйте записями, клиентами и бизнесом эффективно
          </p>
        </div>

        <Card className="border-0 shadow-glow bg-white/95 backdrop-blur-md animate-scale-in">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-gradient-primary/10">
                <Heart className="h-5 w-5 text-primary animate-glow" />
              </div>
              <CardTitle className="text-2xl gradient-text">Добро пожаловать</CardTitle>
            </div>
            <CardDescription className="text-base">
              Войдите в систему или создайте новый аккаунт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 h-12">
                <TabsTrigger 
                  value="signin" 
                  className="h-10 font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Вход
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="h-10 font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="ваш@email.com"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Пароль</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 btn-primary transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                    disabled={isLoading || loading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 spinner"></div>
                        Вход...
                      </div>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Иван"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Иванов"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="ваш@email.com"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Пароль</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 btn-primary transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                    disabled={isLoading || loading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 spinner"></div>
                        Регистрация...
                      </div>
                    ) : (
                      'Создать аккаунт'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Нажимая "Создать аккаунт", вы соглашаетесь с нашими{' '}
            <span className="text-white/90 underline cursor-pointer hover:text-white transition-colors">
              условиями использования
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}