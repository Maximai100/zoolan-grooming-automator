import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { LoyaltyProgram } from '@/hooks/useLoyalty';

interface ClientBalanceAdjustmentProps {
  programs: LoyaltyProgram[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ClientBalanceAdjustment = ({ programs, onSubmit, onCancel }: ClientBalanceAdjustmentProps) => {
  const { clients } = useClients();
  
  const [formData, setFormData] = useState({
    clientId: '',
    programId: '',
    pointsAmount: 0,
    description: ''
  });

  const [clientSearch, setClientSearch] = useState('');
  const [showClientList, setShowClientList] = useState(false);

  const filteredClients = clients.filter(client => 
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const activePrograms = programs.filter(p => p.is_active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectClient = (client: any) => {
    setFormData(prev => ({ ...prev, clientId: client.id }));
    setClientSearch(`${client.first_name} ${client.last_name}`);
    setShowClientList(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Выбор клиента */}
      <div className="space-y-2">
        <Label>Выберите клиента *</Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск клиента..."
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setShowClientList(true);
              }}
              onFocus={() => setShowClientList(true)}
              className="pl-8"
            />
          </div>
          
          {showClientList && filteredClients.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => selectClient(client)}
                >
                  <div className="font-medium">{client.first_name} {client.last_name}</div>
                  <div className="text-sm text-muted-foreground">{client.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedClient && (
          <div className="p-3 bg-gray-50 rounded border">
            <div className="font-medium">{selectedClient.first_name} {selectedClient.last_name}</div>
            <div className="text-sm text-muted-foreground">
              {selectedClient.phone} • {selectedClient.total_visits} визитов
            </div>
          </div>
        )}
      </div>

      {/* Программа лояльности */}
      <div className="space-y-2">
        <Label htmlFor="programId">Программа лояльности *</Label>
        <Select
          value={formData.programId}
          onValueChange={(value) => handleInputChange('programId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите программу" />
          </SelectTrigger>
          <SelectContent>
            {activePrograms.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name} ({program.type === 'points' ? 'За рубли' : 'За визиты'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Количество баллов */}
      <div className="space-y-2">
        <Label htmlFor="pointsAmount">Изменение баллов *</Label>
        <Input
          id="pointsAmount"
          type="number"
          value={formData.pointsAmount}
          onChange={(e) => handleInputChange('pointsAmount', parseInt(e.target.value) || 0)}
          placeholder="Положительное число для добавления, отрицательное для списания"
          required
        />
        <div className="text-sm text-muted-foreground">
          {formData.pointsAmount > 0 
            ? `Будет добавлено ${formData.pointsAmount} баллов`
            : formData.pointsAmount < 0 
            ? `Будет списано ${Math.abs(formData.pointsAmount)} баллов`
            : 'Введите количество баллов'
          }
        </div>
      </div>

      {/* Описание */}
      <div className="space-y-2">
        <Label htmlFor="description">Причина корректировки *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Укажите причину изменения баланса..."
          rows={3}
          required
        />
      </div>

      {/* Кнопки */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button 
          type="submit" 
          disabled={!formData.clientId || !formData.programId || !formData.description || formData.pointsAmount === 0}
        >
          Применить корректировку
        </Button>
      </div>
    </form>
  );
};

export default ClientBalanceAdjustment;