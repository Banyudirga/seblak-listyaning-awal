
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { MenuItemCard } from './MenuItemCard';
import { AddMenuItemDialog } from './AddMenuItemDialog';
import { EditMenuItemDialog } from './EditMenuItemDialog';
import { useAuth } from '@/contexts/auth';

interface MenuCategoriesProps {
  categories: string[];
  menuItems: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    image_url: string | null;
    description?: string | null;
    is_available?: boolean | null;
  }>;
  onSelectItem: (item: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    description?: string | null;
  }) => void;
  onMenuItemsChange: () => void;
}

// Category mapping for display
const categoryMap: Record<string, string> = {
  'SEBLAK': 'SEBLAK',
  'MAKANAN': 'MAKANAN',
  'MINUMAN': 'MINUMAN',
  'CAMILAN': 'CAMILAN'
};

// Sort order for categories
const categoryOrder: Record<string, number> = {
  'SEBLAK': 1,
  'MAKANAN': 2,
  'CAMILAN': 3,
  'MINUMAN': 4
};

export const MenuCategories: React.FC<MenuCategoriesProps> = ({
  categories,
  menuItems,
  onSelectItem,
  onMenuItemsChange
}) => {
  // Map original categories to new display names
  const displayCategories = categories.map(cat => categoryMap[cat] || cat);
  
  // Set the initial active category to the first one after sorting
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useAuth();
  
  const isOwner = user?.role === 'owner';

  // Set initial active category based on sort order
  useEffect(() => {
    if (categories.length > 0) {
      // Get the display name of the first category after sorting
      const sortedCategories = [...categories].sort((a, b) => {
        const displayA = categoryMap[a] || a;
        const displayB = categoryMap[b] || b;
        return (categoryOrder[displayA] || 999) - (categoryOrder[displayB] || 999);
      });
      setActiveCategory(sortedCategories[0]);
    }
  }, [categories]);

  // Handle active category change - we need to map display name back to original
  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
  };

  // Filter items by active category
  const filteredItems = menuItems.filter(item => 
    item.category === activeCategory && 
    (item.is_available === undefined || item.is_available === true)
  );

  // Handle click on menu item
  const handleMenuItemClick = (item: any) => {
    if (isEditMode) {
      // In edit mode, open the edit dialog
      setSelectedMenuItemId(item.id);
      setEditDialogOpen(true);
    } else {
      // In normal mode, add to cart
      onSelectItem(item);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Sort categories for display
  const sortedCategories = [...categories].sort((a, b) => {
    const displayA = categoryMap[a] || a;
    const displayB = categoryMap[b] || b;
    return (categoryOrder[displayA] || 999) - (categoryOrder[displayB] || 999);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Menu</h2>
        {isOwner && (
          <div className="flex gap-2">
            <Button 
              variant={isEditMode ? "default" : "outline"}
              size="sm" 
              onClick={toggleEditMode}
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditMode ? "Mode Edit Aktif" : "Edit Menu"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Menu
            </Button>
          </div>
        )}
      </div>

      <Tabs 
        value={activeCategory} 
        onValueChange={handleCategoryChange} 
        className="flex-1 flex flex-col"
      >
        <div className="border-b overflow-x-auto">
          <TabsList className="w-full justify-start h-auto">
            {sortedCategories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="px-4 py-2 whitespace-nowrap"
              >
                {categoryMap[category] || category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {sortedCategories.map(category => (
          <TabsContent 
            key={category} 
            value={category} 
            className="flex-1 overflow-y-auto pt-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  onSelect={handleMenuItemClick}
                  isEditMode={isEditMode}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Tidak ada menu dalam kategori ini
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <AddMenuItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onMenuItemAdded={onMenuItemsChange}
      />

      <EditMenuItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onMenuItemUpdated={onMenuItemsChange}
        menuItemId={selectedMenuItemId}
      />
    </div>
  );
};
