import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Heart, Edit3, Trash2, Clock, Weight, Ruler } from 'lucide-react';
import { usePets } from '@/hooks/usePets';
import PetForm from './PetForm';

interface PetsModalProps {
  client: any;
  open: boolean;
  onClose: () => void;
  onScheduleGrooming?: (client: any, pet: any) => void;
}

export default function PetsModal({ client, open, onClose, onScheduleGrooming }: PetsModalProps) {
  const { pets, loading, addPet, updatePet, deletePet, calculateServiceTime } = usePets(client?.id);
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const handleAddPet = () => {
    setEditingPet(null);
    setShowPetForm(true);
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setShowPetForm(true);
  };

  const handleSubmitPet = async (formData) => {
    const petData = {
      ...formData,
      client_id: client.id
    };

    if (editingPet) {
      await updatePet(editingPet.id, petData);
    } else {
      await addPet(petData);
    }
    setShowPetForm(false);
  };

  const handleDeletePet = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить информацию о питомце?')) {
      await deletePet(id);
    }
  };

  const handleScheduleGrooming = (pet: any) => {
    if (onScheduleGrooming) {
      onScheduleGrooming(client, pet);
    }
  };

  const getPetInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const formatAge = (age?: number) => {
    if (!age) return 'Возраст неизвестен';
    if (age < 1) return 'Меньше года';
    return `${age} ${age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}`;
  };

  if (!client) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Питомцы {client.first_name} {client.last_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Управление информацией о питомцах клиента
              </p>
              <Button onClick={handleAddPet} size="sm" className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Добавить питомца
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Загрузка питомцев...</div>
              </div>
            ) : pets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Пока нет питомцев</h3>
                  <p className="text-muted-foreground mb-4">
                    Добавьте информацию о питомцах клиента
                  </p>
                  <Button onClick={handleAddPet} className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить первого питомца
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <Card key={pet.id} className="hover:shadow-elegant transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={pet.photo_url} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getPetInitials(pet.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{pet.name}</CardTitle>
                            {pet.breed && (
                              <Badge variant="secondary" className="mt-1">
                                {pet.breed}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPet(pet)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePet(pet.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatAge(pet.age)}</span>
                        </div>
                        {pet.weight && (
                          <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-muted-foreground" />
                            <span>{pet.weight} кг</span>
                          </div>
                        )}
                        {pet.gender && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Пол: </span>
                            <span>{pet.gender}</span>
                          </div>
                        )}
                        {pet.color && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Окрас: </span>
                            <span>{pet.color}</span>
                          </div>
                        )}
                      </div>

                      {pet.coat_type && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Шерсть: </span>
                          <span>{pet.coat_type}</span>
                        </div>
                      )}

                      {pet.vaccination_status && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Вакцинация: </span>
                          <Badge 
                            variant={pet.vaccination_status.toLowerCase().includes('актуальн') ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {pet.vaccination_status}
                          </Badge>
                        </div>
                      )}

                      {pet.allergies && (
                        <div className="text-sm bg-red-50 p-2 rounded">
                          <span className="text-red-600 font-medium">Аллергии: </span>
                          <span className="text-red-700">{pet.allergies}</span>
                        </div>
                      )}

                      {pet.special_notes && (
                        <div className="text-sm bg-muted/50 p-2 rounded">
                          <span className="font-medium">Заметки: </span>
                          <span>{pet.special_notes}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Ruler className="h-3 w-3" />
                          Рекомендуемое время груминга: {calculateServiceTime(pet.breed, pet.coat_type)} мин
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-primary"
                        onClick={() => handleScheduleGrooming(pet)}
                      >
                        Записать на груминг
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PetForm
        pet={editingPet}
        open={showPetForm}
        onClose={() => setShowPetForm(false)}
        onSubmit={handleSubmitPet}
      />
    </>
  );
}