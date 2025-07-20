import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Search,
  Filter,
  Edit,
  Minus,
  RotateCcw,
  FileText,
  Download
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import InventoryItemForm from './InventoryItemForm';
import StockAdjustmentForm from './StockAdjustmentForm';

const InventoryPage = () => {
  const { 
    items, 
    lowStockItems, 
    loading, 
    addInventoryItem, 
    updateInventoryItem,
    adjustStock,
    generateLowStockReport,
    generateInventoryValue,
    searchItems,
    getCategories
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showItemForm, setShowItemForm] = useState(false);
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = searchItems(searchTerm, selectedCategory);
  const categories = getCategories();
  const totalValue = generateInventoryValue();
  const lowStockReport = generateLowStockReport();

  const handleCreateItem = async (data: any) => {
    const result = await addInventoryItem(data);
    if (result.error === null) {
      setShowItemForm(false);
      setEditingItem(null);
    }
  };

  const handleUpdateItem = async (data: any) => {
    if (editingItem) {
      const result = await updateInventoryItem(editingItem.id, data);
      if (result.error === null) {
        setShowItemForm(false);
        setEditingItem(null);
      }
    }
  };

  const handleStockAdjustment = async (data: any) => {
    if (selectedItem) {
      const result = await adjustStock(
        selectedItem.id,
        data.quantity,
        data.movementType,
        data.reason,
        data.notes
      );
      if (result.error === null) {
        setShowStockAdjustment(false);
        setSelectedItem(null);
      }
    }
  };

  const exportLowStockReport = () => {
    const report = lowStockReport;
    const csv = [
      ['Товар', 'Категория', 'Текущий остаток', 'Мин. уровень', 'Нехватка', 'Стоимость единицы', 'Оценочная стоимость заказа'],
      ...report.map(item => [
        item.name,
        item.category,
        item.currentStock,
        item.minLevel,
        item.shortfall,
        item.unitCost,
        item.estimatedOrderCost
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Инвентаризация</h1>
          <p className="text-muted-foreground">Управление складскими запасами</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowItemForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </div>
      </div>

      {/* Предупреждения о низких остатках */}
      {lowStockItems.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <span>
                Внимание! {lowStockItems.length} товаров с низким остатком требуют пополнения
              </span>
              <Button variant="outline" size="sm" onClick={exportLowStockReport}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт отчета
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">
              активных позиций
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Стоимость склада</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} ₽</div>
            <p className="text-xs text-muted-foreground">
              общая стоимость
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Низкий остаток</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              требуют пополнения
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Категории</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              различных категорий
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Инвентарь</TabsTrigger>
          <TabsTrigger value="low-stock">Низкий остаток</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
        </TabsList>

        {/* Основной инвентарь */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Поиск и фильтры */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Все категории</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Список товаров */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <Badge variant={item.current_stock <= item.min_stock_level ? "destructive" : "default"}>
                      {item.current_stock} шт
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.sku && (
                      <span className="text-sm text-muted-foreground">SKU: {item.sku}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Остаток:</span>
                      <p className={item.current_stock <= item.min_stock_level ? "text-orange-600" : ""}>
                        {item.current_stock} / {item.min_stock_level} мин
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Стоимость:</span>
                      <p>{item.unit_cost} ₽</p>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setEditingItem(item);
                        setShowItemForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Изменить
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowStockAdjustment(true);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Корректировка
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Товары с низким остатком */}
        <TabsContent value="low-stock" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Товары требующие пополнения</h3>
            <Button onClick={exportLowStockReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт отчета
            </Button>
          </div>

          <div className="grid gap-4">
            {lowStockReport.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">
                        -{item.shortfall} шт
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.currentStock} / {item.minLevel}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span>Рекомендуемый заказ: {item.shortfall + 10} шт</span>
                    <span>Стоимость: {item.estimatedOrderCost.toLocaleString()} ₽</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Отчеты */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Анализ склада</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Общая стоимость:</span>
                  <span className="font-medium">{totalValue.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Количество позиций:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Средняя стоимость позиции:</span>
                  <span className="font-medium">
                    {items.length > 0 ? (totalValue / items.length).toLocaleString() : 0} ₽
                  </span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Требуют пополнения:</span>
                  <span className="font-medium">{lowStockItems.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ категории</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(0, 5).map(category => {
                    const categoryItems = items.filter(item => item.category === category);
                    const categoryValue = categoryItems.reduce((sum, item) => 
                      sum + (item.current_stock * item.unit_cost), 0
                    );
                    
                    return (
                      <div key={category} className="flex justify-between">
                        <span>{category}</span>
                        <div className="text-right">
                          <div className="font-medium">{categoryItems.length} позиций</div>
                          <div className="text-sm text-muted-foreground">
                            {categoryValue.toLocaleString()} ₽
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Диалоги */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Редактировать товар' : 'Добавить товар'}
            </DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            item={editingItem}
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            onCancel={() => {
              setShowItemForm(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showStockAdjustment} onOpenChange={setShowStockAdjustment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Корректировка остатков</DialogTitle>
          </DialogHeader>
          <StockAdjustmentForm
            item={selectedItem}
            onSubmit={handleStockAdjustment}
            onCancel={() => {
              setShowStockAdjustment(false);
              setSelectedItem(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;