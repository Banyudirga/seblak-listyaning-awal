
import { MenuItem } from '@/hooks/useMenuItems';

// Define all required interfaces
export interface LocalMenuItem extends MenuItem {
  ingredients?: Array<{
    inventoryId: string;
    amount: number;
    unit: string;
  }>;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_price: number;
  threshold_quantity: number | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  lastVisitDate: string;
  lastTransactionAmount: number;
  visitCount: number;
  totalSpent: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  date: string;
  paymentMethod: string;
  cashierId: string;
  customerName?: string;
  customerContact?: string;
}

export interface LocalStorageUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

class LocalStorageHelper {
  private localStorageKey = 'seblak-listyaning';

  // Helper function to set item in local storage
  private setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(`${this.localStorageKey}-${key}`, serializedValue);
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
    }
  }

  // Helper function to get item from local storage
  private getItem<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(`${this.localStorageKey}-${key}`);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  }

  // Helper function to remove item from local storage
  private removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.localStorageKey}-${key}`);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  }

  // Get menu items from local storage
  public getMenuItems(): MenuItem[] {
    try {
      const menuItems = this.getItem<MenuItem[]>('menuItems');
      if (!menuItems) {
        // Provide default menu items if none exist
        const defaultMenuItems = this.getDefaultMenuItems();
        this.setItem('menuItems', defaultMenuItems);
        return defaultMenuItems;
      }
      return menuItems;
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  // Get default menu items with proper food images
  private getDefaultMenuItems(): MenuItem[] {
    return [
      // SEBLAK Category (Makanan Utama)
      {
        id: '1',
        name: 'Seblak Original',
        price: 15000,
        category: 'Makanan Utama',
        image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&h=300&fit=crop&crop=center',
        description: 'Seblak dengan bumbu khas pedas, kerupuk, dan sayuran',
        is_available: true
      },
      {
        id: '2',
        name: 'Seblak Tulang',
        price: 20000,
        category: 'Makanan Utama',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&crop=center',
        description: 'Seblak dengan tambahan tulang ayam yang gurih',
        is_available: true
      },
      {
        id: '3',
        name: 'Seblak Ceker',
        price: 18000,
        category: 'Makanan Utama',
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop&crop=center',
        description: 'Seblak dengan tambahan ceker ayam',
        is_available: true
      },
      {
        id: '4',
        name: 'Seblak Seafood',
        price: 25000,
        category: 'Makanan Utama',
        image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=300&fit=crop&crop=center',
        description: 'Seblak dengan tambahan udang, cumi, dan bakso ikan',
        is_available: true
      },
      {
        id: '5',
        name: 'Seblak Mie',
        price: 17000,
        category: 'Makanan Utama',
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop&crop=center',
        description: 'Seblak dengan tambahan mie instan',
        is_available: true
      },
      
      // MAKANAN Category (Makanan Pendamping)
      {
        id: '6',
        name: 'Baso Aci',
        price: 15000,
        category: 'Makanan Pendamping',
        image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&crop=center',
        description: 'Bakso dari tepung aci dengan kuah pedas',
        is_available: true
      },
      {
        id: '7',
        name: 'Cireng Rujak',
        price: 12000,
        category: 'Makanan Pendamping',
        image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop&crop=center',
        description: 'Cireng dengan saus rujak pedas manis',
        is_available: true
      },
      {
        id: '8',
        name: 'Cimol',
        price: 10000,
        category: 'Makanan Pendamping',
        image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d29b?w=300&h=300&fit=crop&crop=center',
        description: 'Bola-bola tapioka yang garing di luar, lembut di dalam',
        is_available: true
      },
      {
        id: '9',
        name: 'Makaroni Goreng',
        price: 12000,
        category: 'Makanan Pendamping',
        image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=300&fit=crop&crop=center',
        description: 'Makaroni goreng dengan bumbu pedas',
        is_available: true
      },
      
      // MINUMAN Category (Minuman)
      {
        id: '10',
        name: 'Es Teh Manis',
        price: 5000,
        category: 'Minuman',
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop&crop=center',
        description: 'Teh manis dengan es batu',
        is_available: true
      },
      {
        id: '11',
        name: 'Es Jeruk',
        price: 7000,
        category: 'Minuman',
        image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=300&h=300&fit=crop&crop=center',
        description: 'Air jeruk segar dengan es batu',
        is_available: true
      },
      {
        id: '12',
        name: 'Es Kelapa',
        price: 10000,
        category: 'Minuman',
        image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&h=300&fit=crop&crop=center',
        description: 'Air kelapa muda segar dengan es batu',
        is_available: true
      },
      {
        id: '13',
        name: 'Es Buah',
        price: 12000,
        category: 'Minuman',
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop&crop=center',
        description: 'Campuran buah-buahan dengan sirup dan susu',
        is_available: true
      },
      {
        id: '14',
        name: 'Es Campur',
        price: 15000,
        category: 'Minuman',
        image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&crop=center',
        description: 'Campuran cincau, kolang-kaling, dan alpukat dengan susu',
        is_available: true
      },
      
      // CAMILAN Category (Makanan Penutup)
      {
        id: '15',
        name: 'Kripik Singkong',
        price: 8000,
        category: 'Makanan Penutup',
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center',
        description: 'Keripik singkong renyah dengan berbagai rasa',
        is_available: true
      },
      {
        id: '16',
        name: 'Kripik Pisang',
        price: 8000,
        category: 'Makanan Penutup',
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop&crop=center',
        description: 'Keripik pisang renyah dengan rasa manis',
        is_available: true
      },
      {
        id: '17',
        name: 'Kue Cubit',
        price: 10000,
        category: 'Makanan Penutup',
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&crop=center',
        description: 'Kue tradisional dengan berbagai topping',
        is_available: true
      },
      {
        id: '18',
        name: 'Pisang Goreng',
        price: 10000,
        category: 'Makanan Penutup',
        image_url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=300&h=300&fit=crop&crop=center',
        description: 'Pisang goreng crispy dengan toping keju atau coklat',
        is_available: true
      },
    ];
  }

  // Set menu items to local storage
  public setMenuItems(items: MenuItem[]): void {
    this.setItem('menuItems', items);
  }

  // Add a new menu item
  public addMenuItem(item: LocalMenuItem): void {
    const menuItems = this.getMenuItems();
    menuItems.push(item);
    this.setMenuItems(menuItems);
  }

  // Update a menu item
  public updateMenuItem(updatedItem: LocalMenuItem): void {
    const menuItems = this.getMenuItems();
    const index = menuItems.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      menuItems[index] = updatedItem;
      this.setMenuItems(menuItems);
    }
  }

  // Delete a menu item
  public deleteMenuItem(id: string): void {
    const menuItems = this.getMenuItems();
    const filteredItems = menuItems.filter(item => item.id !== id);
    this.setMenuItems(filteredItems);
  }

  // Clear menu items from local storage
  public clearMenuItems(): void {
    this.removeItem('menuItems');
  }

  // Inventory items methods
  public getInventoryItems(): InventoryItem[] {
    const items = this.getItem<InventoryItem[]>('inventoryItems');
    if (!items) {
      // Initialize with default inventory items
      const defaultItems = this.getDefaultInventoryItems();
      this.setItem('inventoryItems', defaultItems);
      return defaultItems;
    }
    return items;
  }

  // Get default inventory items
  private getDefaultInventoryItems(): InventoryItem[] {
    const baseItems = [
      'air vit/air mineral', 'ayam fillet', 'baso ikan', 'baso salmon', 'baso sapi',
      'bawang goreng', 'bawang merah', 'bawang putih', 'Boso ikan salmon', 'cabe ijo',
      'cabe kering', 'cabe merah', 'cabe rawit merah', 'ceker', 'cikuwa',
      'crabstick', 'cumi', 'cumi cumian', 'daun', 'dimsum',
      'dumpling ayam', 'dumpling keju', 'Filet', 'fishroll', 'goodday moccacino',
      'goodday capucino', 'jamur kuping', 'jamur enoki', 'jeruk limau', 'Kecap bango',
      'kencur', 'kerupuk mawar putih', 'kerupuk putih warna warni pinggir', 'kerupuk udang merah', 'kobe',
      'Krupuk orange 1 ba', 'kue ikan', 'Kue ikan pedas', 'kulit', 'kwetiau',
      'lidah', 'makaroni pipa', 'mama lemon', 'mentega', 'mie soto',
      'mie goreng Indomie', 'minuman', 'odeng merah', 'odeng putih', 'okado',
      'otak\' Singapur', 'paha', 'paha penyet', 'plastik krupuk', 'plastik seblak',
      'racik', 'rawit ijo', 'rawit merah', 'royco', 'Royco sapi',
      'Saos Belibis', 'saos cabe', 'Sasa 1', 'sawi ijo', 'sawi putih',
      'sayap', 'sayur', 'sedotan', 'sosis besar', 'sosis kecil panjang',
      'sosis yona', 'steropom mangkuk', 'Sukro kencur', 'tepung roti', 'Timun',
      'Topu', 'tulang', 'twinster', 'udang', 'vit', 'Wijen'
    ];

    return baseItems.map((name, index) => ({
      id: `inv-${Date.now()}-${index}`,
      name,
      quantity: 100,
      unit: this.getDefaultUnit(name),
      cost_price: this.getDefaultPrice(name),
      threshold_quantity: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  // Get default unit based on item name
  private getDefaultUnit(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('air') || lowerName.includes('minuman') || lowerName.includes('goodday')) return 'ml';
    if (lowerName.includes('plastik') || lowerName.includes('sedotan') || lowerName.includes('steropom')) return 'pcs';
    if (lowerName.includes('kerupuk') || lowerName.includes('krupuk')) return 'g';
    if (lowerName.includes('ayam') || lowerName.includes('fillet') || lowerName.includes('paha') || lowerName.includes('sayap') || lowerName.includes('ceker') || lowerName.includes('tulang')) return 'pcs';
    if (lowerName.includes('baso') || lowerName.includes('dumpling') || lowerName.includes('dimsum')) return 'pcs';
    if (lowerName.includes('sosis') || lowerName.includes('crabstick') || lowerName.includes('fishroll')) return 'pcs';
    if (lowerName.includes('jamur') || lowerName.includes('sayur') || lowerName.includes('sawi') || lowerName.includes('timun')) return 'g';
    if (lowerName.includes('bawang') || lowerName.includes('cabe') || lowerName.includes('rawit')) return 'g';
    if (lowerName.includes('saos') || lowerName.includes('kecap')) return 'ml';
    if (lowerName.includes('tepung') || lowerName.includes('mentega')) return 'g';
    if (lowerName.includes('mie') || lowerName.includes('makaroni') || lowerName.includes('kwetiau')) return 'g';
    return 'pcs';
  }

  // Get default price based on item name
  private getDefaultPrice(name: string): number {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('ayam') || lowerName.includes('fillet')) return 15000;
    if (lowerName.includes('udang') || lowerName.includes('cumi')) return 20000;
    if (lowerName.includes('baso') || lowerName.includes('sosis')) return 5000;
    if (lowerName.includes('kerupuk') || lowerName.includes('krupuk')) return 2000;
    if (lowerName.includes('sayur') || lowerName.includes('jamur')) return 3000;
    if (lowerName.includes('bawang') || lowerName.includes('cabe')) return 8000;
    if (lowerName.includes('saos') || lowerName.includes('kecap')) return 12000;
    if (lowerName.includes('plastik') || lowerName.includes('sedotan')) return 500;
    if (lowerName.includes('air') || lowerName.includes('minuman')) return 3000;
    if (lowerName.includes('goodday')) return 8000;
    return 5000;
  }

  public addInventoryItem(item: InventoryItem): void {
    const items = this.getInventoryItems();
    items.push(item);
    this.setItem('inventoryItems', items);
  }

  public updateInventoryItem(updatedItem: InventoryItem): void {
    const items = this.getInventoryItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      this.setItem('inventoryItems', items);
    }
  }

  public deleteInventoryItem(id: string): void {
    const items = this.getInventoryItems();
    const filteredItems = items.filter(item => item.id !== id);
    this.setItem('inventoryItems', filteredItems);
  }

  // Customer methods
  public getCustomers(): Customer[] {
    const customers = this.getItem<Customer[]>('customers');
    return customers || [];
  }

  public updateCustomer(customerData: Omit<Customer, 'id'>): Customer {
    const customers = this.getCustomers();
    const existingCustomerIndex = customers.findIndex(c => c.contact === customerData.contact);
    
    if (existingCustomerIndex >= 0) {
      // Update existing customer
      const existingCustomer = customers[existingCustomerIndex];
      const updatedCustomer: Customer = {
        ...existingCustomer,
        name: customerData.name,
        contact: customerData.contact,
        lastVisitDate: customerData.lastVisitDate,
        lastTransactionAmount: customerData.lastTransactionAmount,
        visitCount: existingCustomer.visitCount + 1,
        totalSpent: existingCustomer.totalSpent + customerData.lastTransactionAmount,
        notes: customerData.notes || existingCustomer.notes
      };
      
      customers[existingCustomerIndex] = updatedCustomer;
      this.setItem('customers', customers);
      return updatedCustomer;
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: `customer-${Date.now()}`,
        ...customerData
      };
      
      customers.push(newCustomer);
      this.setItem('customers', customers);
      return newCustomer;
    }
  }

  public deleteCustomer(id: string): void {
    const customers = this.getCustomers();
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    this.setItem('customers', filteredCustomers);
  }

  // Order methods
  public getOrders(): Order[] {
    const orders = this.getItem<Order[]>('orders');
    return orders || [];
  }

  public addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    this.setItem('orders', orders);
  }

  // User methods
  public getUser(): LocalStorageUser | null {
    return this.getItem<LocalStorageUser>('user');
  }

  public setUser(user: LocalStorageUser): void {
    this.setItem('user', user);
  }

  public clearUser(): void {
    this.removeItem('user');
  }
}

export const localStorageHelper = new LocalStorageHelper();
