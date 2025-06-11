import { useState, useEffect } from 'react';
import { localStorageHelper, Purchase } from '@/utils/localStorage';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays, format } from 'date-fns';

export type DateFilter = 'today' | 'week' | 'month' | 'custom';

export interface PurchaseStats {
  totalPurchases: number;
  totalAmount: number;
  totalItems: number;
  averagePurchaseValue: number;
  purchaseGrowth: number;
  amountGrowth: number;
}

export interface SupplierPerformance {
  name: string;
  purchaseCount: number;
  totalAmount: number;
  percentage: number;
}

export interface DailyPurchase {
  date: string;
  amount: number;
  purchases: number;
}

export interface ItemPurchaseStats {
  itemName: string;
  quantity: number;
  totalAmount: number;
  purchaseCount: number;
  averagePrice: number;
}

export const usePurchaseData = (
  dateFilter: DateFilter,
  customDateRange: { from: Date | undefined; to: Date | undefined }
) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case 'week':
        return { from: startOfWeek(now), to: endOfWeek(now) };
      case 'month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'custom':
        return {
          from: customDateRange.from || startOfMonth(now),
          to: customDateRange.to || endOfMonth(now)
        };
      default:
        return { from: startOfDay(now), to: endOfDay(now) };
    }
  };

  // Get filtered purchases based on date range
  const getFilteredPurchases = (): Purchase[] => {
    const { from, to } = getDateRange();
    const allPurchases = localStorageHelper.getPurchases();
    
    return allPurchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchase_date);
      return isWithinInterval(purchaseDate, { start: from, end: to });
    });
  };

  // Calculate purchase statistics
  const calculateStats = (): PurchaseStats => {
    const currentPurchases = getFilteredPurchases();
    const totalPurchases = currentPurchases.length;
    const totalAmount = currentPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
    const totalItems = currentPurchases.reduce((sum, purchase) => sum + purchase.items.length, 0);
    const averagePurchaseValue = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

    // Calculate growth (compare with previous period)
    const { from, to } = getDateRange();
    const periodDuration = to.getTime() - from.getTime();
    const previousFrom = new Date(from.getTime() - periodDuration);
    const previousTo = new Date(to.getTime() - periodDuration);
    
    const allPurchases = localStorageHelper.getPurchases();
    const previousPurchases = allPurchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchase_date);
      return isWithinInterval(purchaseDate, { start: previousFrom, end: previousTo });
    });
    
    const previousAmount = previousPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
    const previousCount = previousPurchases.length;
    
    const purchaseGrowth = previousCount > 0 ? ((totalPurchases - previousCount) / previousCount) * 100 : 0;
    const amountGrowth = previousAmount > 0 ? ((totalAmount - previousAmount) / previousAmount) * 100 : 0;

    return {
      totalPurchases,
      totalAmount,
      totalItems,
      averagePurchaseValue,
      purchaseGrowth,
      amountGrowth
    };
  };

  // Calculate supplier performance
  const calculateSupplierPerformance = (): SupplierPerformance[] => {
    const purchases = getFilteredPurchases();
    const supplierStats: { [key: string]: { count: number; amount: number } } = {};
    
    purchases.forEach(purchase => {
      const supplierName = purchase.supplier_name;
      if (!supplierStats[supplierName]) {
        supplierStats[supplierName] = { count: 0, amount: 0 };
      }
      supplierStats[supplierName].count += 1;
      supplierStats[supplierName].amount += purchase.total_amount;
    });
    
    const totalAmount = Object.values(supplierStats).reduce((sum, stat) => sum + stat.amount, 0);
    
    return Object.entries(supplierStats)
      .map(([name, stats]) => ({
        name,
        purchaseCount: stats.count,
        totalAmount: stats.amount,
        percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // Calculate daily purchase data
  const calculateDailyPurchases = (): DailyPurchase[] => {
    const { from, to } = getDateRange();
    const purchases = getFilteredPurchases();
    const dailyData: { [key: string]: { amount: number; purchases: number } } = {};
    
    // Initialize all days in range with zero values
    const currentDate = new Date(from);
    while (currentDate <= to) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dailyData[dateKey] = { amount: 0, purchases: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Populate with actual purchase data
    purchases.forEach(purchase => {
      const dateKey = format(new Date(purchase.purchase_date), 'yyyy-MM-dd');
      if (dailyData[dateKey]) {
        dailyData[dateKey].amount += purchase.total_amount;
        dailyData[dateKey].purchases += 1;
      }
    });
    
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date: format(new Date(date), 'dd/MM'),
        amount: data.amount,
        purchases: data.purchases
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calculate item purchase statistics
  const calculateItemStats = (): ItemPurchaseStats[] => {
    const purchases = getFilteredPurchases();
    const itemStats: { [key: string]: { quantity: number; totalAmount: number; purchaseCount: number; totalPrice: number } } = {};
    
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        const itemName = item.item_name;
        if (!itemStats[itemName]) {
          itemStats[itemName] = { quantity: 0, totalAmount: 0, purchaseCount: 0, totalPrice: 0 };
        }
        itemStats[itemName].quantity += item.quantity;
        itemStats[itemName].totalAmount += item.total_price;
        itemStats[itemName].purchaseCount += 1;
        itemStats[itemName].totalPrice += item.total_price;
      });
    });
    
    return Object.entries(itemStats)
      .map(([itemName, stats]) => ({
        itemName,
        quantity: stats.quantity,
        totalAmount: stats.totalAmount,
        purchaseCount: stats.purchaseCount,
        averagePrice: stats.purchaseCount > 0 ? stats.totalPrice / stats.purchaseCount : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // Generate comprehensive sample purchase data for testing
  const generateSamplePurchaseData = () => {
    const samplePurchases: Purchase[] = [];
    const now = new Date();

    // Realistic Indonesian suppliers with complete information
    const suppliers = [
      {
        id: 'supplier-pt-sumber-makmur',
        name: 'PT Sumber Makmur',
        contact: '+62 812-3456-7890',
        email: 'info@sumbermakmur.co.id',
        address: 'Jl. Raya Industri No. 45, Bekasi'
      },
      {
        id: 'supplier-cv-berkah-jaya',
        name: 'CV Berkah Jaya',
        contact: '+62 821-9876-5432',
        email: 'order@berkahjaya.com',
        address: 'Jl. Pasar Induk No. 12, Jakarta Timur'
      },
      {
        id: 'supplier-toko-sembako-maju',
        name: 'Toko Sembako Maju',
        contact: '0811-2233-4455',
        email: 'sembako.maju@gmail.com',
        address: 'Jl. Kebon Jeruk Raya No. 78, Jakarta Barat'
      },
      {
        id: 'supplier-ud-sari-rasa',
        name: 'UD Sari Rasa',
        contact: '0856-7788-9900',
        email: 'sarirasa.supplier@yahoo.com',
        address: 'Jl. Veteran No. 23, Bogor'
      },
      {
        id: 'supplier-pt-fresh-food',
        name: 'PT Fresh Food Indonesia',
        contact: '+62 813-5566-7788',
        email: 'sales@freshfood.id',
        address: 'Jl. Raya Serpong No. 156, Tangerang'
      },
      {
        id: 'supplier-cv-dapur-nusantara',
        name: 'CV Dapur Nusantara',
        contact: '0877-9988-7766',
        email: 'info@dapurnusantara.co.id',
        address: 'Jl. Gatot Subroto No. 89, Jakarta Selatan'
      }
    ];

    // Restaurant-relevant items with realistic Indonesian pricing
    const items = [
      // Protein & Main Ingredients
      { name: 'Mie Instan Grosir', unit: 'dus', basePrice: 48000, category: 'bahan_utama' },
      { name: 'Telur Ayam Segar', unit: 'kg', basePrice: 28000, category: 'protein' },
      { name: 'Sosis Ayam', unit: 'pack', basePrice: 25000, category: 'protein' },
      { name: 'Bakso Ikan', unit: 'kg', basePrice: 35000, category: 'protein' },
      { name: 'Daging Ayam Fillet', unit: 'kg', basePrice: 45000, category: 'protein' },

      // Vegetables & Spices
      { name: 'Cabai Rawit Merah', unit: 'kg', basePrice: 38000, category: 'sayuran' },
      { name: 'Cabai Keriting', unit: 'kg', basePrice: 32000, category: 'sayuran' },
      { name: 'Bawang Merah', unit: 'kg', basePrice: 35000, category: 'bumbu' },
      { name: 'Bawang Putih', unit: 'kg', basePrice: 42000, category: 'bumbu' },
      { name: 'Jahe Segar', unit: 'kg', basePrice: 18000, category: 'bumbu' },
      { name: 'Lengkuas', unit: 'kg', basePrice: 15000, category: 'bumbu' },
      { name: 'Daun Bawang', unit: 'ikat', basePrice: 3000, category: 'sayuran' },
      { name: 'Sawi Hijau', unit: 'kg', basePrice: 8000, category: 'sayuran' },
      { name: 'Tauge', unit: 'kg', basePrice: 6000, category: 'sayuran' },

      // Pantry Items
      { name: 'Minyak Goreng Curah', unit: 'liter', basePrice: 16000, category: 'minyak' },
      { name: 'Garam Dapur', unit: 'kg', basePrice: 8000, category: 'bumbu' },
      { name: 'Gula Pasir', unit: 'kg', basePrice: 14000, category: 'bumbu' },
      { name: 'Kecap Manis Botol', unit: 'botol', basePrice: 12000, category: 'saus' },
      { name: 'Saus Sambal', unit: 'botol', basePrice: 15000, category: 'saus' },
      { name: 'Tepung Terigu', unit: 'kg', basePrice: 12000, category: 'tepung' },
      { name: 'Tepung Tapioka', unit: 'kg', basePrice: 10000, category: 'tepung' },

      // Snacks & Sides
      { name: 'Kerupuk Mentah', unit: 'pack', basePrice: 18000, category: 'kerupuk' },
      { name: 'Kerupuk Udang', unit: 'pack', basePrice: 22000, category: 'kerupuk' },
      { name: 'Emping Mentah', unit: 'pack', basePrice: 25000, category: 'kerupuk' },

      // Beverages
      { name: 'Teh Celup Kotak', unit: 'dus', basePrice: 35000, category: 'minuman' },
      { name: 'Kopi Sachet', unit: 'dus', basePrice: 42000, category: 'minuman' },
      { name: 'Sirup Rasa', unit: 'botol', basePrice: 18000, category: 'minuman' },

      // Packaging & Supplies
      { name: 'Styrofoam Kotak', unit: 'pack', basePrice: 45000, category: 'kemasan' },
      { name: 'Plastik Bening', unit: 'roll', basePrice: 25000, category: 'kemasan' },
      { name: 'Sendok Plastik', unit: 'pack', basePrice: 15000, category: 'alat' },
      { name: 'Tissue Makan', unit: 'pack', basePrice: 28000, category: 'alat' }
    ];

    // Notes variations for realism
    const noteVariations = [
      'Pembelian rutin bulanan',
      'Stok untuk event khusus',
      'Harga naik 5% dari bulan lalu',
      'Kualitas bagus, supplier terpercaya',
      'Pembelian darurat - stok habis',
      'Promo bulk purchase',
      'Untuk menu baru seblak seafood',
      'Stok aman untuk 2 minggu',
      'Supplier memberikan bonus',
      'Pembelian sesuai budget'
    ];

    let invoiceCounter = 1001;

    // Generate 18-22 purchases over the last 30 days
    const totalPurchases = Math.floor(Math.random() * 5) + 18; // 18-22 purchases
    const purchaseDates = [];

    // Create varied purchase dates (not every day, some days multiple purchases)
    for (let i = 0; i < totalPurchases; i++) {
      const daysBack = Math.floor(Math.random() * 30);
      const date = subDays(now, daysBack);
      // Add some time variation within the day
      date.setHours(Math.floor(Math.random() * 8) + 8); // 8 AM to 4 PM
      date.setMinutes(Math.floor(Math.random() * 60));
      purchaseDates.push(date);
    }

    // Sort dates chronologically
    purchaseDates.sort((a, b) => a.getTime() - b.getTime());

    purchaseDates.forEach((date, index) => {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const purchaseItems = [];

      // Vary number of items per purchase (2-6 items)
      const itemCount = Math.floor(Math.random() * 5) + 2;
      const usedItems = new Set(); // Prevent duplicate items in same purchase

      for (let k = 0; k < itemCount; k++) {
        let item;
        let attempts = 0;

        // Try to get a unique item for this purchase
        do {
          item = items[Math.floor(Math.random() * items.length)];
          attempts++;
        } while (usedItems.has(item.name) && attempts < 10);

        usedItems.add(item.name);

        // Realistic quantity based on item type
        let quantity;
        if (item.unit === 'dus' || item.unit === 'pack') {
          quantity = Math.floor(Math.random() * 5) + 1; // 1-5 boxes/packs
        } else if (item.unit === 'kg' || item.unit === 'liter') {
          quantity = Math.floor(Math.random() * 15) + 5; // 5-20 kg/liters
        } else if (item.unit === 'botol') {
          quantity = Math.floor(Math.random() * 10) + 2; // 2-12 bottles
        } else if (item.unit === 'ikat') {
          quantity = Math.floor(Math.random() * 20) + 5; // 5-25 bunches
        } else {
          quantity = Math.floor(Math.random() * 10) + 1; // 1-10 pieces
        }

        // Price variation based on market conditions (±15%)
        const priceVariation = (Math.random() * 0.3 - 0.15); // -15% to +15%
        const unitPrice = Math.round(item.basePrice * (1 + priceVariation));
        const totalPrice = quantity * unitPrice;

        purchaseItems.push({
          id: `item-${Date.now()}-${index}-${k}-${Math.random().toString(36).substr(2, 9)}`,
          item_name: item.name,
          quantity,
          unit: item.unit,
          unit_price: unitPrice,
          total_price: totalPrice
        });
      }

      const totalAmount = purchaseItems.reduce((sum, item) => sum + item.total_price, 0);

      // Generate realistic invoice numbers
      const invoiceNumber = `INV-${format(date, 'yyyyMM')}-${String(invoiceCounter).padStart(4, '0')}`;
      invoiceCounter++;

      // Add notes to about 40% of purchases
      const hasNotes = Math.random() < 0.4;
      const notes = hasNotes ? noteVariations[Math.floor(Math.random() * noteVariations.length)] : '';

      samplePurchases.push({
        id: `purchase-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_contact: supplier.contact,
        purchase_date: date.toISOString(),
        invoice_number: invoiceNumber,
        items: purchaseItems,
        total_amount: totalAmount,
        notes,
        created_by: 'owner-1',
        created_at: date.toISOString(),
        updated_at: date.toISOString()
      });
    });

    // Store sample data
    samplePurchases.forEach(purchase => {
      localStorageHelper.addPurchase(purchase);
    });

    console.log(`Generated ${samplePurchases.length} sample purchases with realistic Indonesian supplier data`);
  };

  // Generate sample supplier data
  const generateSampleSuppliers = () => {
    const sampleSuppliers = [
      {
        id: 'supplier-pt-sumber-makmur',
        name: 'PT Sumber Makmur',
        contact: '+62 812-3456-7890',
        email: 'info@sumbermakmur.co.id',
        address: 'Jl. Raya Industri No. 45, Bekasi',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'supplier-cv-berkah-jaya',
        name: 'CV Berkah Jaya',
        contact: '+62 821-9876-5432',
        email: 'order@berkahjaya.com',
        address: 'Jl. Pasar Induk No. 12, Jakarta Timur',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'supplier-toko-sembako-maju',
        name: 'Toko Sembako Maju',
        contact: '0811-2233-4455',
        email: 'sembako.maju@gmail.com',
        address: 'Jl. Kebon Jeruk Raya No. 78, Jakarta Barat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'supplier-ud-sari-rasa',
        name: 'UD Sari Rasa',
        contact: '0856-7788-9900',
        email: 'sarirasa.supplier@yahoo.com',
        address: 'Jl. Veteran No. 23, Bogor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'supplier-pt-fresh-food',
        name: 'PT Fresh Food Indonesia',
        contact: '+62 813-5566-7788',
        email: 'sales@freshfood.id',
        address: 'Jl. Raya Serpong No. 156, Tangerang',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'supplier-cv-dapur-nusantara',
        name: 'CV Dapur Nusantara',
        contact: '0877-9988-7766',
        email: 'info@dapurnusantara.co.id',
        address: 'Jl. Gatot Subroto No. 89, Jakarta Selatan',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Store sample suppliers
    sampleSuppliers.forEach(supplier => {
      localStorageHelper.addSupplier(supplier);
    });

    console.log(`Generated ${sampleSuppliers.length} sample suppliers`);
  };

  // Check if we need sample data
  useEffect(() => {
    const existingPurchases = localStorageHelper.getPurchases();
    const existingSuppliers = localStorageHelper.getSuppliers();

    if (existingSuppliers.length === 0) {
      generateSampleSuppliers();
    }

    if (existingPurchases.length === 0) {
      generateSamplePurchaseData();
    }
  }, []);

  return {
    getDateRange,
    calculateStats,
    calculateSupplierPerformance,
    calculateDailyPurchases,
    calculateItemStats,
    isLoading
  };
};
