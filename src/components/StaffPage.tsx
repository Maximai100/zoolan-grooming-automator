import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaff } from '@/hooks/useStaff';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Clock, CheckSquare, MessageCircle, Plus, 
  Calendar, Timer, AlertCircle, Send, Play, Square, Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import StaffForm from './StaffForm';

const StaffPage = () => {
  const { 
    staff, shifts, tasks, messages, 
    isLoadingStaff, isLoadingShifts, isLoadingTasks, isLoadingMessages,
    addShift, addTask, updateTask, sendMessage, clockIn, clockOut,
    refreshAllData, profile
  } = useStaff();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("shifts");
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [newShift, setNewShift] = useState({
    staff_id: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    assigned_to: '',
    due_date: ''
  });
  const [newMessage, setNewMessage] = useState({
    content: '',
    recipient_id: '',
    channel_type: 'general'
  });

  const handleAddShift = async () => {
    try {
      await addShift.mutateAsync(newShift);
      setNewShift({
        staff_id: '',
        shift_date: '',
        start_time: '',
        end_time: '',
        notes: ''
      });
      toast({
        title: 'Смена добавлена',
        description: 'Смена успешно запланирована'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleAddTask = async () => {
    try {
      await addTask.mutateAsync(newTask);
      setNewTask({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
        assigned_to: '',
        due_date: ''
      });
      toast({
        title: 'Задача создана',
        description: 'Задача успешно добавлена'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        updates: { 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        }
      });
      toast({
        title: 'Задача обновлена',
        description: `Статус изменён на "${status}"`
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) return;
    
    try {
      await sendMessage.mutateAsync(newMessage);
      setNewMessage({
        content: '',
        recipient_id: '',
        channel_type: 'general'
      });
      toast({
        title: 'Сообщение отправлено',
        description: 'Ваше сообщение доставлено'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Управление персоналом</h1>
          <p className="text-muted-foreground">Смены, задачи и внутренние коммуникации</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowStaffForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить сотрудника
          </Button>
          <Button onClick={() => {
            // Обновляем все данные с правильными ключами
            window.location.reload();
          }} variant="outline">
            Обновить
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shifts">
            <Calendar className="w-4 h-4 mr-2" />
            Смены
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="w-4 h-4 mr-2" />
            Задачи
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageCircle className="w-4 h-4 mr-2" />
            Сообщения
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="w-4 h-4 mr-2" />
            Сотрудники
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">График смен</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить смену
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая смена</DialogTitle>
                  <DialogDescription>
                    Запланируйте смену для сотрудника
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={newShift.staff_id} onValueChange={(value) => setNewShift({...newShift, staff_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="date"
                    value={newShift.shift_date}
                    onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      placeholder="Начало"
                      value={newShift.start_time}
                      onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                    />
                    <Input
                      type="time"
                      placeholder="Конец"
                      value={newShift.end_time}
                      onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Заметки (необязательно)"
                    value={newShift.notes}
                    onChange={(e) => setNewShift({...newShift, notes: e.target.value})}
                  />
                  
                  <Button onClick={handleAddShift} className="w-full">
                    Добавить смену
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingShifts ? (
              <div className="text-center py-8">Загрузка смен...</div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет запланированных смен
              </div>
            ) : (
              shifts.map((shift: any) => (
                <Card key={shift.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {shift.profiles?.first_name} {shift.profiles?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(shift.shift_date), 'dd MMMM yyyy', { locale: ru })}
                        </p>
                        <p className="text-sm">
                          {shift.start_time} - {shift.end_time}
                        </p>
                        {shift.notes && (
                          <p className="text-xs text-muted-foreground mt-2">{shift.notes}</p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Задачи персонала</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать задачу
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая задача</DialogTitle>
                  <DialogDescription>
                    Создайте задачу для сотрудника
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Название задачи"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                  
                  <Textarea
                    placeholder="Описание задачи"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newTask.category} onValueChange={(value) => setNewTask({...newTask, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cleaning">Уборка</SelectItem>
                        <SelectItem value="inventory">Инвентаризация</SelectItem>
                        <SelectItem value="maintenance">Обслуживание</SelectItem>
                        <SelectItem value="admin">Администрирование</SelectItem>
                        <SelectItem value="customer_service">Работа с клиентами</SelectItem>
                        <SelectItem value="general">Общие</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Срочно</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="low">Низкий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({...newTask, assigned_to: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Назначить сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                  
                  <Button onClick={handleAddTask} className="w-full">
                    Создать задачу
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingTasks ? (
              <div className="text-center py-8">Загрузка задач...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет активных задач
              </div>
            ) : (
              tasks.map((task: any) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">
                            {task.category}
                          </Badge>
                          {task.assigned_profiles && (
                            <span className="text-xs text-muted-foreground">
                              → {task.assigned_profiles.first_name} {task.assigned_profiles.last_name}
                            </span>
                          )}
                        </div>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Срок: {format(new Date(task.due_date), 'dd.MM.yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">В ожидании</SelectItem>
                            <SelectItem value="in_progress">В работе</SelectItem>
                            <SelectItem value="completed">Выполнено</SelectItem>
                            <SelectItem value="cancelled">Отменено</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Внутренний чат</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Отправить сообщение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Select value={newMessage.recipient_id} onValueChange={(value) => setNewMessage({...newMessage, recipient_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Получатель (оставьте пустым для всех)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всем сотрудникам</SelectItem>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newMessage.channel_type} onValueChange={(value) => setNewMessage({...newMessage, channel_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Общий</SelectItem>
                    <SelectItem value="private">Личное</SelectItem>
                    <SelectItem value="team">Команда</SelectItem>
                    <SelectItem value="announcements">Объявления</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Введите сообщение..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isLoadingMessages ? (
              <div className="text-center py-8">Загрузка сообщений...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет сообщений
              </div>
            ) : (
              messages.map((message: any) => (
                <Card key={message.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {message.sender_profiles?.first_name} {message.sender_profiles?.last_name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.channel_type}
                          </Badge>
                          {message.recipient_profiles && (
                            <span className="text-xs text-muted-foreground">
                              → {message.recipient_profiles.first_name} {message.recipient_profiles.last_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1">{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'dd.MM HH:mm')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <h2 className="text-xl font-semibold">Сотрудники салона</h2>
          
          <div className="grid gap-4">
            {isLoadingStaff ? (
              <div className="text-center py-8">Загрузка сотрудников...</div>
            ) : staff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет зарегистрированных сотрудников
              </div>
            ) : (
              staff.map((member: any) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <h3 className="font-medium">
                           {member.first_name} {member.last_name}
                         </h3>
                         <p className="text-sm text-muted-foreground">{member.email}</p>
                         <div className="flex items-center gap-2 mt-2">
                           <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                             {member.role}
                           </Badge>
                           <Badge variant={member.is_active ? 'default' : 'destructive'}>
                             {member.is_active ? 'Активен' : 'Неактивен'}
                           </Badge>
                         </div>
                         
                         {/* Clock In/Out кнопки */}
                         <div className="flex gap-2 mt-3">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={async () => {
                               try {
                                 await clockIn.mutateAsync(undefined);
                                 toast({
                                   title: 'Отмечен приход',
                                   description: `${member.first_name} начал смену`
                                 });
                               } catch (error: any) {
                                 toast({
                                   title: 'Ошибка',
                                   description: error.message,
                                   variant: 'destructive'
                                 });
                               }
                             }}
                           >
                             <Play className="h-3 w-3 mr-1" />
                             Приход
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => {
                               toast({
                                 title: 'Функция в разработке',
                                 description: 'Требуется активная запись времени для завершения'
                               });
                             }}
                           >
                             <Square className="h-3 w-3 mr-1" />
                             Уход
                           </Button>
                         </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                         <div className="text-right text-sm text-muted-foreground">
                           Регистрация: {format(new Date(member.created_at), 'dd.MM.yyyy')}
                         </div>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             toast({
                               title: 'В разработке',
                               description: 'Редактирование сотрудника будет доступно в следующей версии'
                             });
                           }}
                         >
                           <Edit3 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Форма добавления сотрудника */}
      <StaffForm 
        open={showStaffForm}
        onClose={() => setShowStaffForm(false)}
        onStaffAdded={refreshAllData}
      />
    </div>
  );
};

export default StaffPage;