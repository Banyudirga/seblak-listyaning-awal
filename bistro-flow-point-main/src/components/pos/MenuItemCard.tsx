
import React from 'react';
import { Edit } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description?: string | null;
}

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  isEditMode?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect, isEditMode = false }) => {
  return (
    <div 
      className={`border rounded-lg p-2 cursor-pointer ${isEditMode ? 'bg-amber-50 hover:bg-amber-100 text-black' : 'bg-seblak-black hover:bg-gray-900 text-white'} transition-colors text-center relative border-seblak-red`}
      onClick={() => onSelect(item)}
    >
      {isEditMode && (
        <div className="absolute top-2 right-2 bg-amber-200 rounded-full p-1">
          <Edit className="h-3 w-3" />
        </div>
      )}
      <div className="flex justify-center mb-2">
        <img 
          src={item.image_url || 'https://via.placeholder.com/80'} 
          alt={item.name} 
          className="w-20 h-20 object-cover rounded"
          loading="lazy"
        />
      </div>
      <div className="font-medium">{item.name}</div>
      <div className="text-seblak-red font-bold">Rp{item.price.toLocaleString('id-ID')}</div>
      {item.description && (
        <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</div>
      )}
    </div>
  );
};
