import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Clock, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppointments } from '@/hooks/useAppointments';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DepositManagementProps {
  appointments: any[];
  onUpdateAppointment: (id: string, updates: any) => void;
}

const DepositManagement = ({ appointments, onUpdateAppointment }: DepositManagementProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Фильтрация записей с депозитами
  const appointmentsWithDeposits = appointments.filter(apt => 
    apt.deposit_amount > 0 || apt.payment_status !== 'paid'
  );

  const pendingDeposits = appointmentsWithDeposits.filter(apt => 
    apt.payment_status === 'pending' && apt.deposit_amount > 0
  );

  const overdueDeposits = appointmentsWithDeposits.filter(apt => {
    const appointmentDate = new Date(`${apt.scheduled_date}T${apt.scheduled_time}`);
    const oneDayBefore = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    return apt.payment_status === 'pending' && apt.deposit_amount > 0 && new Date() > oneDayBefore;
  });

  const handleDepositPayment = async (appointmentId: string, method: string, amount: number) => {
    setIsProcessing(true);
    try {
      // В реальном приложении здесь была бы интеграция с платежной системой
      await new Promise(resolve => setTimeout(resolve, 2000)); // Имитация API запроса
      
      onUpdateAppointment(appointmentId, {
        payment_status: 'paid',
        deposit_amount: amount
      });

      toast({
        title: 'Успешно',
        description: 'Депозит успешно оплачен',
      });
      
      setSelectedAppointment(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать платеж',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendPaymentLink = async (appointmentId: string) => {
    try {
      // В реальном приложении здесь отправка ссылки через SMS/Email
      toast({
        title: 'Ссылка отправлена',
        description: 'Ссылка для оплаты отправлена клиенту',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить ссылку',
        variant: 'destructive'
      });
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "destructive" as const, icon: Clock, text: "Ожидает" },
      paid: { variant: "default" as const, icon: CheckCircle, text: "Оплачено" },
      failed: { variant: "destructive" as const, icon: AlertCircle, text: "Ошибка" },
      refunded: { variant: "secondary" as const, icon: AlertCircle, text: "Возврат" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Статистика депозитов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{pendingDeposits.length}</div>
                <div className="text-sm text-muted-foreground">Ожидают оплаты</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{overdueDeposits.length}</div>
                <div className="text-sm text-muted-foreground">Просрочено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  ₽{pendingDeposits.reduce((sum, apt) => sum + apt.deposit_amount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Сумма ожидания</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список записей с депозитами */}
      <Card>
        <CardHeader>
          <CardTitle>Управление депозитами</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointmentsWithDeposits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет записей с депозитами
              </p>
            ) : (
              appointmentsWithDeposits.map(appointment => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {appointment.client?.first_name} {appointment.client?.last_name}
                      </span>
                      {getPaymentStatusBadge(appointment.payment_status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.pet?.name} • {appointment.service?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(appointment.scheduled_date), 'dd MMMM yyyy', { locale: ru })} в {appointment.scheduled_time}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">₽{appointment.deposit_amount}</div>
                      <div className="text-sm text-muted-foreground">депозит</div>
                    </div>

                    <div className="flex gap-2">
                      {appointment.payment_status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendPaymentLink(appointment.id)}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Отправить ссылку
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setDepositAmount(appointment.deposit_amount);
                                }}
                                className="bg-gradient-primary"
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Принять оплату
                              </Button>
                            </DialogTrigger>
                            
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Принять оплату депозита</DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="p-3 bg-muted rounded-lg">
                                  <div className="font-medium mb-1">
                                    {appointment.client?.first_name} {appointment.client?.last_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {appointment.pet?.name} • {appointment.service?.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(appointment.scheduled_date), 'dd MMMM yyyy', { locale: ru })} в {appointment.scheduled_time}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Способ оплаты</Label>
                                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Выберите способ оплаты" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="cash">Наличные</SelectItem>
                                      <SelectItem value="card">Банковская карта</SelectItem>
                                      <SelectItem value="transfer">Банковский перевод</SelectItem>
                                      <SelectItem value="online">Онлайн-платеж</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Сумма депозита</Label>
                                  <Input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setSelectedAppointment(null)}
                                  >
                                    Отмена
                                  </Button>
                                  <Button
                                    className="flex-1 bg-gradient-primary"
                                    onClick={() => handleDepositPayment(appointment.id, paymentMethod, depositAmount)}
                                    disabled={!paymentMethod || depositAmount <= 0 || isProcessing}
                                  >
                                    {isProcessing ? 'Обработка...' : 'Подтвердить'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositManagement;