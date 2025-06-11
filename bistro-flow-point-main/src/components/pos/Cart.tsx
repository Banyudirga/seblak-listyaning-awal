
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CartItem } from './CartItem';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2 } from 'lucide-react';

interface CartProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  onClearCart: () => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (id: string) => void;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({
  items,
  onClearCart,
  onRemoveItem,
  onAddItem,
  onCheckout
}) => {
  // Simple total calculation with no tax
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" /> Keranjang
        </h3>
        {items.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearCart}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Kosongkan</span>
          </Button>
        )}
      </div>
      
      <Separator className="mb-4" />
      
      {/* Cart Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-500 text-center">
          <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
          <p>Keranjang Kosong</p>
          <p className="text-sm">Pilih menu untuk ditambahkan ke keranjang</p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-3">
              {items.map(item => (
                <CartItem
                  key={`${item.id}-${item.quantity}`}
                  item={item}
                  onAddItem={() => onAddItem(item.id)}
                  onRemoveItem={() => onRemoveItem(item.id)}
                />
              ))}
            </div>
          </ScrollArea>
          
          {/* Cart Summary (no tax, just total) */}
          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold mt-2">
                <span>Total</span>
                <span>Rp{total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={onCheckout}
              disabled={items.length === 0}
            >
              Bayar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
