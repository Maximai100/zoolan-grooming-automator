import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, CreditCard, Trash2, Receipt, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useServices } from '@/hooks/useServices';
import { useClients } from '@/hooks/useClients';
import { useInventory } from '@/hooks/useInventory';
import { usePOS } from '@/hooks/usePOS';
import { useDiscountCodes } from '@/hooks/useDiscountCodes';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CartItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { services } = useServices();
  const { clients } = useClients();
  const { items: products } = useInventory();
  const { createOrder, loading } = usePOS();
  const { validateDiscountCode, calculateDiscount, markDiscountCodeUsed } = useDiscountCodes();
  const { toast } = useToast();

  const addToCart = (item: { id: string; name: string; price: number; type: 'service' | 'product'; stock?: number }) => {
    try {
      // Validate input data
      if (!item.id || !item.name || typeof item.price !== 'number' || !item.type) {
        toast({
          title: 'Ошибка',
          description: 'Некорректные данные товара',
          variant: 'destructive'
        });
        return;
      }

      // Проверяем остатки для товаров
      if (item.type === 'product' && item.stock !== undefined) {
        const cartItem = cart.find(cartItem => cartItem.id === item.id && cartItem.type === item.type);
        const currentQuantity = cartItem ? cartItem.quantity : 0;
        
        if (currentQuantity >= item.stock) {
          toast({
            title: 'Недостаточно товара',
            description: `В наличии только ${item.stock} шт.`,
            variant: 'destructive'
          });
          return;
        }
      }

      // Fix: Search by both id AND type to prevent conflicts between services and products
      const existingItem = cart.find(cartItem => cartItem.id === item.id && cartItem.type === item.type);
      
      if (existingItem) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id && cartItem.type === item.type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      } else {
        setCart([...cart, { ...item, quantity: 1 }]);
      }

      toast({
        title: 'Добавлено в корзину',
        description: `${item.name} добавлен в корзину`
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину',
        variant: 'destructive'
      });
    }
  };

  const removeFromCart = (itemId: string, itemType: 'service' | 'product') => {
    try {
      // Fix: Filter by both id AND type
      setCart(cart.filter(item => !(item.id === itemId && item.type === itemType)));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар из корзины',
        variant: 'destructive'
      });
    }
  };

  const updateQuantity = (itemId: string, itemType: 'service' | 'product', newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        removeFromCart(itemId, itemType);
        return;
      }
      
      // Fix: Update by both id AND type
      setCart(cart.map(item =>
        item.id === itemId && item.type === itemType ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить количество',
        variant: 'destructive'
      });
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemDiscountAmount = cart.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);
  const promoDiscountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const totalDiscountAmount = itemDiscountAmount + promoDiscountAmount;
  const total = subtotal - totalDiscountAmount + tipAmount;

  const handleApplyDiscount = async () => {
    try {
      if (!discountCode.trim()) {
        toast({
          title: 'Ошибка',
          description: 'Введите промокод',
          variant: 'destructive'
        });
        return;
      }

      const validation = await validateDiscountCode(discountCode);
      if (!validation.valid) {
        toast({
          title: 'Ошибка',
          description: validation.error,
          variant: 'destructive'
        });
        return;
      }

      const discount = calculateDiscount(validation.discountCode!, subtotal, cart);
      if (discount.error) {
        toast({
          title: 'Ошибка',
          description: discount.error,
          variant: 'destructive'
        });
        return;
      }

      setAppliedDiscount({
        code: validation.discountCode,
        discountAmount: discount.discountAmount
      });

      toast({
        title: 'Промокод применен',
        description: `Скидка: ${discount.discountAmount}₽`
      });
    } catch (error) {
      console.error('Error applying discount:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось применить промокод',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) {
        toast({
          title: 'Ошибка',
          description: 'Корзина пуста',
          variant: 'destructive'
        });
        return;
      }

      await createOrder({
        clientId: selectedClient || null,
        items: cart,
        paymentMethod,
        discountCode: appliedDiscount?.code?.code || '',
        tipAmount,
        notes,
        subtotal,
        discountAmount: totalDiscountAmount,
        total
      });

      // Mark discount code as used
      if (appliedDiscount?.code) {
        await markDiscountCodeUsed(appliedDiscount.code.id);
      }

      // Clear cart after successful order
      setCart([]);
      setSelectedClient('');
      setDiscountCode('');
      setAppliedDiscount(null);
      setTipAmount(0);
      setNotes('');
      
      toast({
        title: 'Успешно',
        description: 'Заказ создан и оплачен'
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">POS Система</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {cart.length} товаров
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services & Products */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">Услуги</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Услуги</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2'}>
                      {services.map(service => (
                        <div
                          key={service.id}
                          className={`border rounded-lg transition-colors ${
                            viewMode === 'grid' ? 'p-3' : 'p-2'
                          }`}
                        >
                         <div className={`flex ${viewMode === 'grid' ? 'justify-between items-start' : 'items-center justify-between'}`}>
                           <div className={viewMode === 'grid' ? '' : 'flex items-center gap-3'}>
                             <h3 className="font-medium">{service.name}</h3>
                             {viewMode === 'grid' && (
                               <>
                                 <p className="text-sm text-muted-foreground">
                                   {service.duration_minutes} мин
                                 </p>
                                 {service.category && (
                                   <Badge variant="secondary" className="mt-1">
                                     {service.category}
                                   </Badge>
                                 )}
                               </>
                             )}
                             {viewMode === 'list' && (
                               <div className="flex items-center gap-2">
                                 <span className="text-sm text-muted-foreground">
                                   {service.duration_minutes} мин
                                 </span>
                                 {service.category && (
                                   <Badge variant="secondary">
                                     {service.category}
                                   </Badge>
                                 )}
                               </div>
                             )}
                           </div>
                            <div className={`text-right ${viewMode === 'list' ? 'flex items-center gap-2' : ''}`}>
                              <p className="font-semibold">{service.price} ₽</p>
                              <Button 
                                size="sm" 
                                className={`${viewMode === 'grid' ? 'mt-1' : ''} bg-gradient-primary text-white`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart({
                                    id: service.id,
                                    name: service.name,
                                    price: service.price,
                                    type: 'service'
                                  });
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                         </div>
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Товары</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {products.map(product => (
                        <div
                          key={product.id}
                          className={`p-3 border rounded-lg transition-colors ${
                            product.current_stock > 0 
                              ? '' 
                              : 'opacity-50 cursor-not-allowed bg-muted'
                          }`}
                        >
                         <div className="flex justify-between items-start">
                           <div className="flex-1">
                             <h3 className="font-medium">{product.name}</h3>
                             {product.description && (
                               <p className="text-sm text-muted-foreground line-clamp-2">
                                 {product.description}
                               </p>
                             )}
                             <div className="flex items-center gap-2 mt-1">
                               {product.category && (
                                 <Badge variant="secondary">
                                   {product.category}
                                 </Badge>
                               )}
                               <Badge 
                                 variant={product.current_stock <= product.min_stock_level ? "destructive" : "outline"}
                                 className="text-xs"
                               >
                                 {product.current_stock} шт
                               </Badge>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="font-semibold">{product.unit_price || product.unit_cost} ₽</p>
                              {product.current_stock > 0 ? (
                                <Button 
                                  size="sm" 
                                  className="mt-1 bg-gradient-primary text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart({
                                      id: product.id,
                                      name: product.name,
                                      price: product.unit_price || product.unit_cost,
                                      type: 'product',
                                      stock: product.current_stock
                                    });
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              ) : (
                               <Badge variant="destructive" className="mt-1">
                                 Нет в наличии
                               </Badge>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                    {products.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        Товары не найдены
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Корзина
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Корзина пуста
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={`${item.id}-${item.type}`} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.price} ₽ × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                          className="bg-card text-foreground border-input"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                          className="bg-card text-foreground border-input"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id, item.type)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Оформление заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Клиент (опционально)</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите клиента" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Гость</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Промокод</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Введите промокод"
                      disabled={!!appliedDiscount}
                    />
                    {appliedDiscount ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveDiscount}
                        className="whitespace-nowrap"
                      >
                        Убрать
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyDiscount}
                        className="whitespace-nowrap"
                      >
                        Применить
                      </Button>
                    )}
                  </div>
                  {appliedDiscount && (
                    <p className="text-sm text-green-600">
                      Применен промокод: {appliedDiscount.code.code} (-{appliedDiscount.discountAmount}₽)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tip">Чаевые (₽)</Label>
                  <Input
                    id="tip"
                    type="number"
                    min="0"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Способ оплаты</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Наличные</SelectItem>
                      <SelectItem value="card">Банковская карта</SelectItem>
                      <SelectItem value="transfer">Перевод</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Дополнительная информация"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Подытог:</span>
                    <span>{subtotal.toFixed(2)} ₽</span>
                  </div>
                  {totalDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Скидка:</span>
                      <span>-{totalDiscountAmount.toFixed(2)} ₽</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Чаевые:</span>
                      <span>{tipAmount.toFixed(2)} ₽</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого:</span>
                    <span>{total.toFixed(2)} ₽</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-primary"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? 'Обработка...' : 'Оплатить'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
