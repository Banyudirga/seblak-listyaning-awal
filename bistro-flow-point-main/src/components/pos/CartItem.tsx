
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };
  onAddItem: () => void;
  onRemoveItem: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onAddItem,
  onRemoveItem
}) => {
  const itemTotal = item.price * item.quantity;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-gray-500">
          Rp{item.price.toLocaleString('id-ID')} x {item.quantity}
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <div className="font-semibold w-24 text-right">
          Rp{itemTotal.toLocaleString('id-ID')}
        </div>
        
        <div className="flex items-center ml-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full p-0"
            onClick={onRemoveItem}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full p-0"
            onClick={onAddItem}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
