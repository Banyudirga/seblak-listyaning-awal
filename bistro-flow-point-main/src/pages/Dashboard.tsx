import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { toast } from '@/components/ui/sonner';
import { useDashboardData, DateFilter } from '@/hooks/useDashboardData';
import { usePurchaseData } from '@/hooks/usePurchaseData';

const Dashboard = () => {
  const { user, loading, initialized } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Use dashboard data hook
  const {
    getDateRange,
    calculateStats,
    calculateMenuPerformance,
    calculateDailyRevenue,
    calculatePaymentMethodStats
  } = useDashboardData(dateFilter, customDateRange);

  // Use purchase data hook
  const {
    calculateStats: calculatePurchaseStats,
    calculateSupplierPerformance,
    calculateDailyPurchases,
    calculateItemStats
  } = usePurchaseData(dateFilter, customDateRange);

  // Wait until authentication is fully initialized
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Memuat autentikasi...</p>
      </div>
    );
  }

  // Check if user is authenticated and has owner role
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'owner') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Akses Ditolak</CardTitle>
            <CardDescription>
              Halaman ini hanya dapat diakses oleh Owner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Role Anda: <Badge variant="secondary">{user.role}</Badge>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }



  const stats = calculateStats();
  const menuPerformance = calculateMenuPerformance();
  const dailyRevenue = calculateDailyRevenue();
  const paymentMethodStats = calculatePaymentMethodStats();

  // Calculate purchase data
  const purchaseStats = calculatePurchaseStats();
  const supplierPerformance = calculateSupplierPerformance();
  const dailyPurchases = calculateDailyPurchases();
  const itemStats = calculateItemStats();

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

  // Export data function
  const exportData = () => {
    const data = {
      period: dateFilter,
      dateRange: getDateRange(),
      sales: {
        stats,
        menuPerformance,
        dailyRevenue,
        paymentMethodStats
      },
      purchases: {
        purchaseStats,
        supplierPerformance,
        dailyPurchases,
        itemStats
      },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data berhasil diekspor');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Owner</h1>
          <p className="text-muted-foreground">Ringkasan performa restoran</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="custom">Rentang Kustom</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "dd/MM/yyyy")} - {format(customDateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(customDateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange.from}
                  selected={{ from: customDateRange.from, to: customDateRange.to }}
                  onSelect={(range) => setCustomDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  locale={id}
                />
              </PopoverContent>
            </Popover>
          )}
          
          {/* Export Button */}
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(stats.revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">dari periode sebelumnya</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.ordersGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={stats.ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(stats.ordersGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">dari periode sebelumnya</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Pelanggan unik</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Pesanan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.averageOrderValue.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Per transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {paymentMethodStats.slice(0, 3).map((payment, index) => (
          <Card key={payment.method}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pembayaran {payment.method}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {payment.revenue.toLocaleString('id-ID')}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{payment.count} transaksi</span>
                <span className="font-medium">{payment.percentage.toFixed(1)}%</span>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-1">
                <div
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${payment.percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Pembelian</CardTitle>
          <CardDescription>Analisis pembelian dan pengeluaran dalam periode yang dipilih</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Pembelian</p>
              <p className="text-2xl font-bold">{purchaseStats.totalPurchases}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                {purchaseStats.purchaseGrowth >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={purchaseStats.purchaseGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(purchaseStats.purchaseGrowth).toFixed(1)}%
                </span>
                <span className="ml-1">dari periode sebelumnya</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold">Rp {purchaseStats.totalAmount.toLocaleString('id-ID')}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                {purchaseStats.amountGrowth >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                )}
                <span className={purchaseStats.amountGrowth >= 0 ? 'text-red-500' : 'text-green-500'}>
                  {Math.abs(purchaseStats.amountGrowth).toFixed(1)}%
                </span>
                <span className="ml-1">dari periode sebelumnya</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Rata-rata Pembelian</p>
              <p className="text-2xl font-bold">Rp {purchaseStats.averagePurchaseValue.toLocaleString('id-ID')}</p>
              <p className="text-xs text-muted-foreground">Per transaksi</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Supplier Utama</p>
              <p className="text-2xl font-bold text-blue-600">
                {supplierPerformance[0]?.name || 'Tidak ada data'}
              </p>
              <p className="text-xs text-muted-foreground">
                {supplierPerformance[0] ? `${supplierPerformance[0].purchaseCount} pembelian` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Pendapatan Harian</CardTitle>
            <CardDescription>Grafik pendapatan dan jumlah pesanan per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? `Rp ${Number(value).toLocaleString('id-ID')}` : value,
                    name === 'revenue' ? 'Pendapatan' : 'Pesanan'
                  ]}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="revenue" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="orders" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
            <CardDescription>Distribusi berdasarkan jenis pembayaran</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {paymentMethodStats.map((entry, index) => (
                    <Cell key={`payment-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Purchase Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Pembelian Harian</CardTitle>
            <CardDescription>Grafik pengeluaran dan jumlah pembelian per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyPurchases}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'amount' ? `Rp ${Number(value).toLocaleString('id-ID')}` : value,
                    name === 'amount' ? 'Pengeluaran' : 'Pembelian'
                  ]}
                />
                <Bar yAxisId="left" dataKey="amount" fill="#ff7c7c" name="amount" />
                <Line yAxisId="right" type="monotone" dataKey="purchases" stroke="#8884d8" name="purchases" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Teratas</CardTitle>
            <CardDescription>Distribusi pembelian berdasarkan supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={supplierPerformance.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalAmount"
                >
                  {supplierPerformance.slice(0, 5).map((entry, index) => (
                    <Cell key={`supplier-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total Pembelian']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Menu Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performa Menu Terbaik</CardTitle>
            <CardDescription>Distribusi penjualan berdasarkan menu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={menuPerformance.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {menuPerformance.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Metode Pembayaran</CardTitle>
            <CardDescription>Perbandingan jumlah transaksi per metode</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'count' ? `${value} transaksi` : `Rp ${Number(value).toLocaleString('id-ID')}`,
                    name === 'count' ? 'Jumlah Transaksi' : 'Total Pendapatan'
                  ]}
                />
                <Bar dataKey="count" fill="#82ca9d" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Metode Pembayaran</CardTitle>
          <CardDescription>Detail lengkap transaksi berdasarkan metode pembayaran</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Metode Pembayaran</th>
                  <th className="text-right p-2">Jumlah Transaksi</th>
                  <th className="text-right p-2">Total Pendapatan</th>
                  <th className="text-right p-2">Rata-rata per Transaksi</th>
                  <th className="text-right p-2">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethodStats.map((payment, index) => (
                  <tr key={payment.method} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{payment.method}</span>
                      </div>
                    </td>
                    <td className="p-2 text-right">{payment.count} transaksi</td>
                    <td className="p-2 text-right">Rp {payment.revenue.toLocaleString('id-ID')}</td>
                    <td className="p-2 text-right">
                      Rp {(payment.revenue / payment.count).toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${payment.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{payment.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {paymentMethodStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Tidak ada data pembayaran dalam periode yang dipilih
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Menu Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Performa Menu</CardTitle>
          <CardDescription>Daftar lengkap performa semua menu dalam periode yang dipilih</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ranking</th>
                  <th className="text-left p-2">Nama Menu</th>
                  <th className="text-right p-2">Terjual</th>
                  <th className="text-right p-2">Pendapatan</th>
                  <th className="text-right p-2">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {menuPerformance.map((menu, index) => (
                  <tr key={menu.name} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{menu.name}</td>
                    <td className="p-2 text-right">{menu.quantity} porsi</td>
                    <td className="p-2 text-right">Rp {menu.revenue.toLocaleString('id-ID')}</td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${menu.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{menu.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {menuPerformance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Tidak ada data penjualan dalam periode yang dipilih
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Items Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performa Item Pembelian</CardTitle>
          <CardDescription>Daftar item yang paling sering dibeli dalam periode yang dipilih</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ranking</th>
                  <th className="text-left p-2">Nama Item</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Total Pembelian</th>
                  <th className="text-right p-2">Rata-rata Harga</th>
                  <th className="text-right p-2">Frekuensi</th>
                </tr>
              </thead>
              <tbody>
                {itemStats.slice(0, 10).map((item, index) => (
                  <tr key={item.itemName} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{item.itemName}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">Rp {item.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="p-2 text-right">Rp {item.averagePrice.toLocaleString('id-ID')}</td>
                    <td className="p-2 text-right">{item.purchaseCount}x</td>
                  </tr>
                ))}
                {itemStats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Tidak ada data pembelian dalam periode yang dipilih
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Periode</CardTitle>
          <CardDescription>
            Data untuk periode: {format(getDateRange().from, 'dd MMMM yyyy', { locale: id })} - {format(getDateRange().to, 'dd MMMM yyyy', { locale: id })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Menu Terlaris</p>
              <p className="text-2xl font-bold text-green-600">
                {menuPerformance[0]?.name || 'Tidak ada data'}
              </p>
              <p className="text-xs text-muted-foreground">
                {menuPerformance[0] ? `${menuPerformance[0].quantity} porsi terjual` : ''}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Pendapatan Tertinggi</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {(Math.max(...dailyRevenue.map(d => d.revenue)) || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-muted-foreground">
                Dalam satu hari
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Pesanan Terbanyak</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.max(...dailyRevenue.map(d => d.orders)) || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Pesanan dalam satu hari
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Metode Pembayaran Favorit</p>
              <p className="text-2xl font-bold text-orange-600">
                {paymentMethodStats[0]?.method || 'Tidak ada data'}
              </p>
              <p className="text-xs text-muted-foreground">
                {paymentMethodStats[0] ? `${paymentMethodStats[0].count} transaksi (${paymentMethodStats[0].percentage.toFixed(1)}%)` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
