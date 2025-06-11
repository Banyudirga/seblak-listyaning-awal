
import { useState, useEffect, useCallback } from 'react';
import { localStorageHelper } from '@/utils/localStorage';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  description: string | null;
  is_available: boolean | null;
  ingredients?: Array<{
    inventoryId: string;
    amount: number;
    unit: string;
  }>;
}

// Category mapping (original DB names to display names)
const categoryMapOrigToDisplay: Record<string, string> = {
  'Makanan Utama': 'SEBLAK',
  'Makanan Pendamping': 'MAKANAN',
  'Minuman': 'MINUMAN',
  'Makanan Penutup': 'CAMILAN'
};

// Category mapping (display names to original DB names)
const categoryMapDisplayToOrig: Record<string, string> = {
  'SEBLAK': 'Makanan Utama',
  'MAKANAN': 'Makanan Pendamping',
  'MINUMAN': 'Minuman',
  'CAMILAN': 'Makanan Penutup'
};

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMenuItems = useCallback(() => {
    try {
      const localItems = localStorageHelper.getMenuItems();
      setMenuItems(localItems);
      
      // Extract categories
      if (localItems && localItems.length > 0) {
        const uniqueCategories = Array.from(new Set(localItems.map(item => item.category)));
        setCategories(uniqueCategories);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading menu items:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  // Load menu items from localStorage
  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Convert display name to original category when needed (for creating/editing items)
  const getOriginalCategory = (displayName: string): string => {
    return categoryMapDisplayToOrig[displayName] || displayName;
  };

  // Convert original category to display name when needed
  const getDisplayCategory = (originalName: string): string => {
    return categoryMapOrigToDisplay[originalName] || originalName;
  };

  return {
    menuItems,
    categories,
    isLoading,
    error,
    refreshMenuItems: loadMenuItems,
    getOriginalCategory,
    getDisplayCategory
  };
};
