import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageTemplate, useNotifications } from '@/hooks/useNotifications';

interface TemplateFormProps {
  template?: MessageTemplate | null;
  open: boolean;
  onClose: () => void;
}

const TRIGGER_EVENTS = [
  { value: 'appointment_confirmation', label: 'Подтверждение записи' },
  { value: 'reminder_24h', label: 'Напоминание за 24 часа' },
  { value: 'reminder_2h', label: 'Напоминание за 2 часа' },
  { value: 'follow_up', label: 'Последующий контакт' },
  { value: 'birthday', label: 'День рождения питомца' },
  { value: 'no_show', label: 'Неявка на прием' }
];

const MESSAGE_TYPES = [
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' }
];

export default function TemplateForm({ template, open, onClose }: TemplateFormProps) {
  const { addTemplate, updateTemplate, getAvailableVariables } = useNotifications();
  
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'sms',
    trigger_event: template?.trigger_event || 'reminder_24h',
    subject: template?.subject || '',
    content: template?.content || '',
    is_active: template?.is_active ?? true,
    is_default: template?.is_default || false
  });

  const variables = getAvailableVariables();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (template) {
      await updateTemplate(template.id, formData);
    } else {
      await addTemplate({
        ...formData,
        variables
      });
    }
    
    onClose();
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.substring(0, start) + variable + formData.content.substring(end);
      setFormData(prev => ({ ...prev, content: newContent }));
      
      // Восстанавливаем фокус и позицию курсора
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const getTemplatePreview = () => {
    let preview = formData.content;
    
    // Заменяем переменные на примеры
    const examples = {
      '{{client_name}}': 'Иван Петров',
      '{{pet_name}}': 'Барсик',
      '{{service_name}}': 'Полный комплекс груминга',
      '{{appointment_date}}': '25 декабря 2024',
      '{{appointment_time}}': '14:30',
      '{{salon_name}}': 'Салон груминга "Лапки"',
      '{{salon_address}}': 'г. Москва, ул. Примерная, д. 1',
      '{{salon_phone}}': '+7 (495) 123-45-67',
      '{{price}}': '3500 ₽',
      '{{groomer_name}}': 'Анна Иванова'
    };

    Object.entries(examples).forEach(([variable, example]) => {
      preview = preview.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), example);
    });

    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Редактировать шаблон' : 'Новый шаблон сообщения'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - форма */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название шаблона *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Напоминание за 24 часа"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Тип сообщения *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger_event">Событие *</Label>
                  <Select 
                    value={formData.trigger_event} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_event: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_EVENTS.map(event => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Тема письма</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Напоминание о записи для {{pet_name}}"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Текст сообщения *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Здравствуйте, {{client_name}}! Напоминаем о записи {{pet_name}} на {{appointment_date}} в {{appointment_time}}."
                  rows={6}
                  required
                />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Доступные переменные</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {variables.map((variable) => (
                      <Button
                        key={variable}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable)}
                        className="justify-start text-xs h-8"
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Активен</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                  />
                  <Label htmlFor="is_default">По умолчанию</Label>
                </div>
              </div>
            </div>

            {/* Правая колонка - превью */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Предварительный просмотр</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{MESSAGE_TYPES.find(t => t.value === formData.type)?.label}</Badge>
                      <Badge variant="secondary">
                        {TRIGGER_EVENTS.find(e => e.value === formData.trigger_event)?.label}
                      </Badge>
                    </div>

                    {formData.type === 'email' && formData.subject && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Тема:</Label>
                        <div className="font-medium mt-1">
                          {formData.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                            const examples: any = {
                              'client_name': 'Иван Петров',
                              'pet_name': 'Барсик',
                              'appointment_date': '25 декабря 2024'
                            };
                            return examples[key] || match;
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm text-muted-foreground">Сообщение:</Label>
                      <div className="mt-1 p-3 bg-muted rounded border min-h-24">
                        {formData.content ? getTemplatePreview() : (
                          <span className="text-muted-foreground italic">
                            Введите текст сообщения...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Длина: {formData.content.length} символов
                      {formData.type === 'sms' && (
                        <span className={formData.content.length > 160 ? 'text-orange-600 ml-2' : 'ml-2'}>
                          {formData.content.length > 160 ? `(${Math.ceil(formData.content.length / 160)} SMS)` : '(1 SMS)'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {template ? 'Сохранить' : 'Создать шаблон'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}