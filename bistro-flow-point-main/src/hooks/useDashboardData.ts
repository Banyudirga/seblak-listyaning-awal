import { useState, useEffect } from 'react';
import { localStorageHelper, Order } from '@/utils/localStorage';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays, format } from 'date-fns';

export type DateFilter = 'today' | 'week' | 'month' | 'custom';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface MenuPerformance {
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export const useDashboardData = (
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
        return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'custom':
        return {
          from: customDateRange.from ? startOfDay(customDateRange.from) : startOfDay(now),
          to: customDateRange.to ? endOfDay(customDateRange.to) : endOfDay(now)
        };
      default:
        return { from: startOfDay(now), to: endOfDay(now) };
    }
  };

  // Get filtered orders
  const getFilteredOrders = (): Order[] => {
    const orders = localStorageHelper.getOrders();
    const { from, to } = getDateRange();
    
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return isWithinInterval(orderDate, { start: from, end: to });
    });
  };

  // Calculate dashboard statistics
  const calculateStats = (): DashboardStats => {
    const currentOrders = getFilteredOrders();
    const totalRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = currentOrders.length;
    const uniqueCustomers = new Set(currentOrders.map(order => order.customerName || 'Guest')).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (compare with previous period)
    const { from, to } = getDateRange();
    const periodDuration = to.getTime() - from.getTime();
    const previousFrom = new Date(from.getTime() - periodDuration);
    const previousTo = new Date(to.getTime() - periodDuration);
    
    const allOrders = localStorageHelper.getOrders();
    const previousOrders = allOrders.filter(order => {
      const orderDate = new Date(order.date);
      return isWithinInterval(orderDate, { start: previousFrom, end: previousTo });
    });
    
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
    const previousOrderCount = previousOrders.length;
    
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersGrowth = previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: uniqueCustomers,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth
    };
  };

  // Calculate menu performance
  const calculateMenuPerformance = (): MenuPerformance[] => {
    const orders = getFilteredOrders();
    const menuStats: Record<string, { quantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!menuStats[item.name]) {
          menuStats[item.name] = { quantity: 0, revenue: 0 };
        }
        menuStats[item.name].quantity += item.quantity;
        menuStats[item.name].revenue += item.price * item.quantity;
      });
    });
    
    const totalRevenue = Object.values(menuStats).reduce((sum, stat) => sum + stat.revenue, 0);
    
    return Object.entries(menuStats)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate daily revenue trend
  const calculateDailyRevenue = (): DailyRevenue[] => {
    const { from, to } = getDateRange();
    const orders = getFilteredOrders();
    const dailyStats: Record<string, { revenue: number; orders: number }> = {};
    
    // Initialize all dates in range
    const currentDate = new Date(from);
    while (currentDate <= to) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dailyStats[dateKey] = { revenue: 0, orders: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Aggregate orders by date
    orders.forEach(order => {
      const dateKey = format(new Date(order.date), 'yyyy-MM-dd');
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].revenue += order.total;
        dailyStats[dateKey].orders += 1;
      }
    });
    
    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date: format(new Date(date), 'dd/MM'),
        revenue: stats.revenue,
        orders: stats.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Calculate payment method statistics
  const calculatePaymentMethodStats = (): PaymentMethodStats[] => {
    const orders = getFilteredOrders();
    const paymentStats: Record<string, { count: number; revenue: number }> = {};
    
    orders.forEach(order => {
      const method = order.paymentMethod || 'cash';
      if (!paymentStats[method]) {
        paymentStats[method] = { count: 0, revenue: 0 };
      }
      paymentStats[method].count += 1;
      paymentStats[method].revenue += order.total;
    });
    
    const totalRevenue = Object.values(paymentStats).reduce((sum, stat) => sum + stat.revenue, 0);
    
    return Object.entries(paymentStats)
      .map(([method, stats]) => ({
        method: method === 'cash' ? 'Tunai' : method === 'card' ? 'Kartu' : method === 'qris' ? 'QRIS' : method,
        count: stats.count,
        revenue: stats.revenue,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Generate sample data for testing
  const generateSampleData = () => {
    const sampleOrders: Order[] = [];
    const now = new Date();
    
    // Generate orders for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = subDays(now, i);
      const ordersPerDay = Math.floor(Math.random() * 10) + 5; // 5-15 orders per day
      
      for (let j = 0; j < ordersPerDay; j++) {
        const orderTime = new Date(date);
        orderTime.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM
        orderTime.setMinutes(Math.floor(Math.random() * 60));
        
        const menuItems = [
          { name: 'Seblak Original', price: 15000 },
          { name: 'Seblak Tulang', price: 20000 },
          { name: 'Seblak Seafood', price: 25000 },
          { name: 'Es Teh Manis', price: 5000 },
          { name: 'Es Jeruk', price: 7000 },
          { name: 'Kerupuk', price: 3000 },
          { name: 'Gorengan', price: 8000 }
        ];
        
        const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
        const orderItems = [];
        let total = 0;
        
        for (let k = 0; k < itemCount; k++) {
          const item = menuItems[Math.floor(Math.random() * menuItems.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          orderItems.push({
            id: `item-${Date.now()}-${k}`,
            name: item.name,
            price: item.price,
            quantity
          });
          total += item.price * quantity;
        }
        
        const paymentMethods = ['cash', 'card', 'qris'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        sampleOrders.push({
          id: `order-${Date.now()}-${i}-${j}`,
          orderNumber: `ORD-${String(Date.now()).slice(-6)}-${i}-${j}`,
          items: orderItems,
          total,
          date: orderTime.toISOString(),
          paymentMethod,
          cashierId: 'cashier-1',
          customerName: Math.random() > 0.5 ? `Customer ${j + 1}` : undefined
        });
      }
    }
    
    // Store sample data
    sampleOrders.forEach(order => {
      localStorageHelper.addOrder(order);
    });
  };

  // Check if we need sample data
  useEffect(() => {
    const existingOrders = localStorageHelper.getOrders();
    if (existingOrders.length === 0) {
      generateSampleData();
    }
  }, []);

  return {
    isLoading,
    getDateRange,
    getFilteredOrders,
    calculateStats,
    calculateMenuPerformance,
    calculateDailyRevenue,
    calculatePaymentMethodStats
  };
};
