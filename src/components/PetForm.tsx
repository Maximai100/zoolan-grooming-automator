import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pet } from '@/hooks/usePets';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, X } from 'lucide-react';

interface PetFormProps {
  pet?: Pet;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const COMMON_BREEDS = [
  'Лабрадор', 'Немецкая овчарка', 'Йоркширский терьер', 'Чихуахуа', 'Пудель',
  'Хаски', 'Золотистый ретривер', 'Мальтийская болонка', 'Джек-рассел терьер',
  'Мопс', 'Шпиц', 'Такса', 'Французский бульдог', 'Бигль', 'Метис'
];

const COAT_TYPES = [
  'Короткая', 'Средняя', 'Длинная', 'Кудрявая', 'Жесткая', 'Двойная'
];

const COLORS = [
  'Черный', 'Белый', 'Коричневый', 'Рыжий', 'Серый', 'Палевый',
  'Пятнистый', 'Триколор', 'Мерле', 'Тигровый'
];

const GENDERS = ['Мужской', 'Женский'];

const VACCINATION_STATUSES = [
  'Актуальные', 'Просрочены', 'Частично', 'Неизвестно', 'Не вакцинирован'
];

export default function PetForm({ pet, open, onClose, onSubmit }: PetFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    breed: pet?.breed || '',
    age: pet?.age || '',
    weight: pet?.weight || '',
    coat_type: pet?.coat_type || '',
    color: pet?.color || '',
    gender: pet?.gender || '',
    allergies: pet?.allergies || '',
    special_notes: pet?.special_notes || '',
    vaccination_status: pet?.vaccination_status || '',
    microchip_number: pet?.microchip_number || '',
    photo_url: pet?.photo_url || ''
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите изображение',
        variant: 'destructive'
      });
      return;
    }

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `pets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));

      toast({
        title: 'Успешно',
        description: 'Фотография загружена'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фотографию',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo_url: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      age: formData.age ? Number(formData.age) : null,
      weight: formData.weight ? Number(formData.weight) : null
    };
    onSubmit(submitData);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: '',
      weight: '',
      coat_type: '',
      color: '',
      gender: '',
      allergies: '',
      special_notes: '',
      vaccination_status: '',
      microchip_number: '',
      photo_url: ''
    });
  };

  const getPetInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {pet ? 'Редактировать питомца' : 'Новый питомец'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Фотография питомца */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.photo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {formData.name ? getPetInitials(formData.name) : <Camera className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <Label>Фотография питомца</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Загрузка...' : 'Загрузить фото'}
                    </Button>
                    {formData.photo_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Удалить
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG до 5MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Кличка *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Барсик"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Порода</Label>
              <Select value={formData.breed} onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите породу" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_BREEDS.map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Возраст (лет)</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Вес (кг)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="25.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Пол</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Пол" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map(gender => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coat_type">Тип шерсти</Label>
              <Select value={formData.coat_type} onValueChange={(value) => setFormData(prev => ({ ...prev, coat_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Тип шерсти" />
                </SelectTrigger>
                <SelectContent>
                  {COAT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Окрас</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Окрас" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccination_status">Статус вакцинации</Label>
              <Select value={formData.vaccination_status} onValueChange={(value) => setFormData(prev => ({ ...prev, vaccination_status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус вакцинации" />
                </SelectTrigger>
                <SelectContent>
                  {VACCINATION_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="microchip_number">Номер чипа</Label>
              <Input
                id="microchip_number"
                value={formData.microchip_number}
                onChange={(e) => setFormData(prev => ({ ...prev, microchip_number: e.target.value }))}
                placeholder="123456789012345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Аллергии и противопоказания</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="Аллергия на определенные шампуни, лекарства..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_notes">Особые заметки</Label>
            <Textarea
              id="special_notes"
              value={formData.special_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, special_notes: e.target.value }))}
              placeholder="Особенности поведения, предпочтения, медицинские особенности..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="btn-primary" disabled={uploading}>
              {pet ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}