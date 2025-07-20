import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Phone, User, Shield } from 'lucide-react';

interface StaffFormProps {
  open: boolean;
  onClose: () => void;
  onStaffAdded: () => void;
}

const StaffForm = ({ open, onClose, onStaffAdded }: StaffFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'groomer' as 'owner' | 'manager' | 'groomer' | 'receptionist'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Получаем salon_id текущего пользователя
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', currentUser.user.id)
        .single();

      if (!profile?.salon_id) {
        throw new Error('Не удалось определить салон');
      }

      // Создаем полноценного пользователя через Admin API
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
          salon_id: profile.salon_id
        }
      });
      
      if (userError) throw userError;
      
      // Создаем профиль сотрудника
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: newUser.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
          salon_id: profile.salon_id,
          is_active: true
        }]);
      
      if (profileError) throw profileError;

      // Отправляем приглашение через email
      await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'email',
          recipient: formData.email,
          subject: 'Добро пожаловать в команду!',
          content: `Здравствуйте, ${formData.first_name}!\n\nВы добавлены в команду груминг-салона.\n\nВаши данные для входа:\nEmail: ${formData.email}\nВременный пароль: ${formData.password}\n\nРекомендуем сменить пароль при первом входе.`,
          salon_id: profile.salon_id
        }
      });


      toast({
        title: 'Сотрудник добавлен',
        description: `${formData.first_name} ${formData.last_name} успешно добавлен в команду`,
      });

      // Сброс формы
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'groomer'
      });

      onStaffAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось добавить сотрудника',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'groomer', label: 'Грумер', icon: User },
    { value: 'manager', label: 'Менеджер', icon: Shield },
    { value: 'receptionist', label: 'Администратор', icon: Phone },
    { value: 'owner', label: 'Владелец', icon: UserPlus }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Добавить сотрудника
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">Имя *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Иван"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Фамилия *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Иванов"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ivan@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+7 (999) 123-45-67"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Временный пароль *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Минимум 6 символов"
              minLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Сотрудник сможет изменить пароль при первом входе
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Роль *</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => {
                  const IconComponent = role.icon;
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary"
              disabled={loading}
            >
              {loading ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Автоматически:</strong> Создаётся учётная запись пользователя и 
          отправляется email-приглашение с данными для входа.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffForm;