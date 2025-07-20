import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LoyaltyProgram } from '@/hooks/useLoyalty';

interface LoyaltyProgramFormProps {
  program?: LoyaltyProgram | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const LoyaltyProgramForm = ({ program, onSubmit, onCancel }: LoyaltyProgramFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'points' as 'points' | 'visits',
    points_per_ruble: 1,
    points_per_visit: 1,
    point_value: 0.01,
    min_redemption_points: 100,
    bonus_multiplier: 1.0,
    is_active: true,
    start_date: new Date(),
    end_date: null as Date | null,
    terms_and_conditions: ''
  });

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        description: program.description || '',
        type: program.type,
        points_per_ruble: program.points_per_ruble,
        points_per_visit: program.points_per_visit,
        point_value: program.point_value,
        min_redemption_points: program.min_redemption_points,
        bonus_multiplier: program.bonus_multiplier,
        is_active: program.is_active,
        start_date: new Date(program.start_date),
        end_date: program.end_date ? new Date(program.end_date) : null,
        terms_and_conditions: program.terms_and_conditions || ''
      });
    }
  }, [program]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      start_date: formData.start_date.toISOString(),
      end_date: formData.end_date?.toISOString() || null
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название программы *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Например: Золотая программа"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Тип программы *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Баллы за рубли</SelectItem>
                  <SelectItem value="visits">Баллы за визиты</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Краткое описание программы лояльности"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Программа активна</Label>
          </div>
        </CardContent>
      </Card>

      {/* Настройки начисления */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки начисления баллов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {formData.type === 'points' ? (
              <div className="space-y-2">
                <Label htmlFor="points_per_ruble">Баллов за 1 рубль *</Label>
                <Input
                  id="points_per_ruble"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.points_per_ruble}
                  onChange={(e) => handleInputChange('points_per_ruble', parseFloat(e.target.value))}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="points_per_visit">Баллов за визит *</Label>
                <Input
                  id="points_per_visit"
                  type="number"
                  min="1"
                  value={formData.points_per_visit}
                  onChange={(e) => handleInputChange('points_per_visit', parseInt(e.target.value))}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="point_value">Стоимость 1 балла (₽) *</Label>
              <Input
                id="point_value"
                type="number"
                step="0.01"
                min="0"
                value={formData.point_value}
                onChange={(e) => handleInputChange('point_value', parseFloat(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_redemption_points">Минимум для списания *</Label>
              <Input
                id="min_redemption_points"
                type="number"
                min="1"
                value={formData.min_redemption_points}
                onChange={(e) => handleInputChange('min_redemption_points', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus_multiplier">Бонусный множитель</Label>
              <Input
                id="bonus_multiplier"
                type="number"
                step="0.1"
                min="1"
                value={formData.bonus_multiplier}
                onChange={(e) => handleInputChange('bonus_multiplier', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Период действия */}
      <Card>
        <CardHeader>
          <CardTitle>Период действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата начала *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? (
                      format(formData.start_date, "PPP", { locale: ru })
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => handleInputChange('start_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? (
                      format(formData.end_date, "PPP", { locale: ru })
                    ) : (
                      <span>Без ограничений</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => handleInputChange('end_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Условия */}
      <Card>
        <CardHeader>
          <CardTitle>Условия программы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="terms_and_conditions">Правила и условия</Label>
            <Textarea
              id="terms_and_conditions"
              value={formData.terms_and_conditions}
              onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
              placeholder="Подробные условия участия в программе лояльности..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Кнопки */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          {program ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};

export default LoyaltyProgramForm;