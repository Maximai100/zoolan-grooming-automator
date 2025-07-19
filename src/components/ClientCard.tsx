import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Star, Edit3, Trash2, Heart } from 'lucide-react';
import { Client } from '@/hooks/useClients';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewPets: (client: Client) => void;
}

export default function ClientCard({ client, onEdit, onDelete, onViewPets }: ClientCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatLastVisit = (date?: string) => {
    if (!date) return 'Не посещал';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const getTagColor = (tag: string) => {
    const colors = {
      'VIP': 'bg-gradient-primary text-white',
      'Новый': 'bg-blue-100 text-blue-800',
      'Проблемный': 'bg-red-100 text-red-800',
      'Постоянный': 'bg-green-100 text-green-800',
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-elegant transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.first_name}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(client.first_name, client.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {client.first_name} {client.last_name}
                </h3>
                {client.is_vip && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {client.is_vip && (
                  <Badge className={getTagColor('VIP')}>VIP</Badge>
                )}
                {client.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(client)}
              className="hover:bg-primary/10"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(client.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{client.phone}</span>
          </div>
          {client.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{client.address}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Визитов: </span>
                <span className="font-medium">{client.total_visits}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Потрачено: </span>
                <span className="font-medium">{client.total_spent} ₽</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Последний визит: {formatLastVisit(client.last_visit_date)}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewPets(client)}
            className="flex-1"
          >
            <Heart className="h-4 w-4 mr-2" />
            Питомцы
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-primary"
          >
            Записать
          </Button>
        </div>

        {client.notes && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            <strong>Заметки:</strong> {client.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}