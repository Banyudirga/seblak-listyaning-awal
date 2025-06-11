
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { localStorageHelper } from '@/utils/localStorage';
import { normalizeUnit } from '@/utils/unitConversion';

interface AddMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMenuItemAdded: () => void;
}

export const AddMenuItemDialog: React.FC<AddMenuItemDialogProps> = ({
  open,
  onOpenChange,
  onMenuItemAdded
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [menuIngredients, setMenuIngredients] = useState<Array<{
    inventoryId: string, 
    amount: string,
    unit: string
  }>>([
    { inventoryId: '', amount: '1', unit: '' }
  ]);
  
  const [inventoryItems, setInventoryItems] = useState<Array<{
    id: string, 
    name: string,
    unit: string
  }>>([]);
  
  // Common measurement units
  const commonUnits = ['g', 'kg', 'ml', 'l', 'pcs', 'buah', 'butir', 'lembar', 'botol'];
  
  // Load categories and inventory items
  useEffect(() => {
    if (open) {
      // Reset form
      setName('');
      setPrice('');
      setCategory('');
      setDescription('');
      setImageUrl('');
      setMenuIngredients([{ inventoryId: '', amount: '1', unit: '' }]);
      
      // Load existing categories
      const menuItems = localStorageHelper.getMenuItems();
      const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
      setCategories(uniqueCategories);
      
      // Load inventory items
      const inventoryItems = localStorageHelper.getInventoryItems();
      setInventoryItems(inventoryItems.map(item => ({ 
        id: item.id, 
        name: item.name,
        unit: item.unit
      })));
    }
  }, [open]);
  
  const handleAddMenuIngredient = () => {
    setMenuIngredients([...menuIngredients, { inventoryId: '', amount: '1', unit: '' }]);
  };
  
  const handleRemoveMenuIngredient = (index: number) => {
    if (menuIngredients.length > 1) {
      const newIngredients = [...menuIngredients];
      newIngredients.splice(index, 1);
      setMenuIngredients(newIngredients);
    }
  };
  
  const handleIngredientChange = (index: number, field: 'inventoryId' | 'amount' | 'unit', value: string) => {
    const newIngredients = [...menuIngredients];
    newIngredients[index][field] = value;
    
    // If changing the inventory item, suggest the unit but don't automatically set it
    // This allows users to specify a different unit for the recipe vs. inventory
    if (field === 'inventoryId') {
      const selectedItem = inventoryItems.find(item => item.id === value);
      if (selectedItem && !newIngredients[index].unit) {
        newIngredients[index].unit = selectedItem.unit;
      }
    }
    
    setMenuIngredients(newIngredients);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !category) {
      toast.error('Mohon isi semua kolom wajib');
      return;
    }
    
    try {
      // Format ingredients for storage
      const ingredients = menuIngredients
        .filter(ing => ing.inventoryId && parseFloat(ing.amount) > 0 && ing.unit)
        .map(ing => ({
          inventoryId: ing.inventoryId,
          amount: parseFloat(ing.amount),
          unit: normalizeUnit(ing.unit)
        }));
      
      // Create new menu item
      const newMenuItem = {
        id: `menu-${Date.now()}`,
        name,
        price: parseFloat(price),
        category,
        description: description || null,
        image_url: imageUrl || null,
        is_available: true,
        ingredients
      };
      
      localStorageHelper.addMenuItem(newMenuItem);
      toast.success('Menu berhasil ditambahkan');
      onOpenChange(false);
      onMenuItemAdded();
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Gagal menambahkan menu');
    }
  };
  
  const handleAddCategory = () => {
    const newCategory = prompt('Masukkan nama kategori baru:');
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setCategory(newCategory);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Menu Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Menu*</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama menu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp)*</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategori*</Label>
              <div className="flex space-x-2">
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={handleAddCategory}>
                  Kategori Baru
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi menu (opsional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">URL Gambar</Label>
              <Input
                id="image_url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL gambar (opsional)"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Bahan/Inventaris yang Diperlukan</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddMenuIngredient}
                >
                  Tambah Bahan
                </Button>
              </div>
              
              {menuIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Select
                    value={ingredient.inventoryId}
                    onValueChange={(value) => handleIngredientChange(index, 'inventoryId', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Pilih bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    placeholder="Jumlah"
                    className="w-20"
                  />
                  
                  <Select
                    value={ingredient.unit}
                    onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                      {/* Add the inventory item's unit as an option if not already in common units */}
                      {ingredient.inventoryId && inventoryItems.find(item => item.id === ingredient.inventoryId)?.unit && 
                       !commonUnits.includes(inventoryItems.find(item => item.id === ingredient.inventoryId)?.unit || '') && (
                        <SelectItem 
                          value={inventoryItems.find(item => item.id === ingredient.inventoryId)?.unit || ''}
                        >
                          {inventoryItems.find(item => item.id === ingredient.inventoryId)?.unit}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveMenuIngredient(index)}
                    disabled={menuIngredients.length <= 1}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-1">
                Catatan: Satuan bahan dapat berbeda dari data inventaris - sistem akan melakukan konversi otomatis
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              Tambah Menu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
