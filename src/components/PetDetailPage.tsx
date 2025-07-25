import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Phone, Edit3, Calendar, Camera, Clock, Weight, Ruler, Heart, MapPin } from 'lucide-react';
import { usePets } from '@/hooks/usePets';
import { useAppointments } from '@/hooks/useAppointments';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import PetForm from './PetForm';
import AppointmentFormDialog from './AppointmentFormDialog';
import PhotoUpload from './PhotoUpload';

interface PetDetailPageProps {
  petId: string;
  clientId: string;
  onBack: () => void;
}

interface Visit {
  id: string;
  date: string;
  time: string;
  services: string[];
  notes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  price: number;
  status: string;
}

export default function PetDetailPage({ petId, clientId, onBack }: PetDetailPageProps) {
  const { pets, loading: petsLoading, updatePet } = usePets(clientId);
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const pet = pets.find(p => p.id === petId);
  
  // Получаем историю визитов питомца
  const petVisits = appointments
    .filter(apt => apt.pet_id === petId && apt.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
    .map(apt => ({
      id: apt.id,
      date: apt.scheduled_date,
      time: apt.scheduled_time,
      services: apt.services?.name ? [apt.services.name] : [],
      notes: apt.notes || '',
      beforePhotos: [], // TODO: Добавить фото из базы
      afterPhotos: [], // TODO: Добавить фото из базы
      price: apt.price || 0,
      status: apt.status
    }));

  const client = pet ? {
    first_name: 'Загрузка...', // TODO: Получить данные клиента
    last_name: '',
    phone: '+7 (999) 999-99-99'
  } : null;

  const handleEditPet = async (formData: any) => {
    if (pet) {
      await updatePet(pet.id, formData);
      setShowEditForm(false);
    }
  };

  const openPhotoUpload = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowPhotoUpload(true);
  };

  const formatAge = (age?: number) => {
    if (!age) return 'Возраст неизвестен';
    if (age < 1) return 'Меньше года';
    return `${age} ${age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}`;
  };

  const getPetInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  if (petsLoading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="ml-3 text-lg text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Питомец не найден</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к клиентам
        </Button>
      </div>

      {/* Информация о клиенте и питомце */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={pet.photo_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                  {getPetInitials(pet.name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{pet.name}</h1>
                  <Badge variant="secondary">{pet.breed || 'Без породы'}</Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{client?.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatAge(pet.age)}</span>
                  </div>
                  {pet.weight && (
                    <div className="flex items-center gap-1">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span>{pet.weight} кг</span>
                    </div>
                  )}
                  {pet.gender && (
                    <div>
                      <span className="text-muted-foreground">Пол: </span>
                      <span>{pet.gender}</span>
                    </div>
                  )}
                </div>

                {pet.coat_type && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Тип шерсти: </span>
                    <span>{pet.coat_type}</span>
                  </div>
                )}

                {pet.allergies && pet.allergies !== 'Нет' && (
                  <div className="mt-2 text-sm bg-red-50 p-2 rounded">
                    <span className="text-red-600 font-medium">Аллергии: </span>
                    <span className="text-red-700">{pet.allergies}</span>
                  </div>
                )}

                {pet.special_notes && pet.special_notes !== 'Нет' && (
                  <div className="mt-2 text-sm bg-muted/50 p-2 rounded">
                    <span className="font-medium">Особенности: </span>
                    <span>{pet.special_notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowEditForm(true)} variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Изменить
              </Button>
              <Button onClick={() => setShowAppointmentForm(true)} className="bg-gradient-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Новая запись
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* История визитов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            История визитов
          </CardTitle>
        </CardHeader>
        <CardContent>
          {petVisits.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Пока нет записей о визитах</p>
              <Button onClick={() => setShowAppointmentForm(true)} className="mt-4 bg-gradient-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Создать первую запись
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {petVisits.map((visit, index) => (
                <div key={visit.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-lg font-bold">{format(new Date(visit.date), 'd MMMM yyyy г.', { locale: ru })}</div>
                      <div className="text-sm text-muted-foreground">{visit.time}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="text-base font-medium">{visit.services.join(', ') || 'Услуга не указана'}</div>
                        {visit.price > 0 && (
                          <div className="text-sm text-muted-foreground">Стоимость: {visit.price} ₽</div>
                        )}
                      </div>
                      
                      {visit.notes && (
                        <div className="text-sm mb-3">
                          <span className="font-medium">Заметки: </span>
                          <span>{visit.notes}</span>
                        </div>
                      )}
                      
                      {/* Кнопка для добавления фотографий */}
                      <div className="mb-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openPhotoUpload(visit.id)}
                          className="gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          Управление фотографиями
                        </Button>
                      </div>
                      
                      {/* Компонент загрузки фотографий */}
                      {showPhotoUpload && selectedAppointmentId === visit.id && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <PhotoUpload
                            appointmentId={visit.id}
                            photoType="before"
                            title="Фото до"
                            onPhotoUploaded={() => {}}
                          />
                          <PhotoUpload
                            appointmentId={visit.id}
                            photoType="after"
                            title="Фото после"
                            onPhotoUploaded={() => {}}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < petVisits.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальные окна */}
      <PetForm
        pet={pet}
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditPet}
      />

      <AppointmentFormDialog
        open={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        preselectedClient={{ id: clientId, first_name: client?.first_name, last_name: client?.last_name }}
        preselectedPet={pet}
      />
    </div>
  );
}