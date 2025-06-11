
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Search, Printer } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { localStorageHelper } from '@/utils/localStorage';

// Define receipt interface based on the localStorage order structure
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Receipt {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  date: string;
  paymentMethod: string;
  cashierId: string;
}

const Receipts = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load receipts from localStorage
  useEffect(() => {
    try {
      const orders = localStorageHelper.getOrders();
      console.log("Loaded orders:", orders);
      setReceipts(orders);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading receipts:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);
  
  // Filter receipts based on search query
  const filteredReceipts = receipts?.filter(receipt => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      receipt.orderNumber.toLowerCase().includes(query) ||
      receipt.paymentMethod.toLowerCase().includes(query)
    );
  });
  
  // View receipt details
  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };
  
  // Print receipt
  const handlePrintReceipt = () => {
    window.print();
    toast.success('Struk berhasil dicetak');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari transaksi..."
            className="pl-8 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">Memuat transaksi...</div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-500">
              Error memuat transaksi: {error.message}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Semua Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts && filteredReceipts.length > 0 ? (
                  filteredReceipts.map(receipt => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.orderNumber}</TableCell>
                      <TableCell>{formatDate(receipt.date)}</TableCell>
                      <TableCell>Rp{receipt.total.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="capitalize">
                        {receipt.paymentMethod === 'cash' ? 'Tunai' : 
                         receipt.paymentMethod === 'card' ? 'Kartu' : 
                         receipt.paymentMethod || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-800">
                          Selesai
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewReceipt(receipt)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {searchQuery 
                        ? 'Tidak ada transaksi yang sesuai dengan pencarian.' 
                        : 'Tidak ada transaksi ditemukan.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Receipt Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md print:shadow-none print:border-none">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Detail Transaksi</span>
              <Button
                variant="outline"
                size="sm"
                className="print:hidden"
                onClick={handlePrintReceipt}
              >
                <Printer className="h-4 w-4 mr-1" />
                Cetak
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="py-4">
              <div className="text-center border-b pb-2 mb-2">
                <h3 className="font-bold text-lg">Nama Restoran</h3>
                <p className="text-sm">Jl. Restoran No. 123, Kota</p>
                <p className="text-sm">Tel: (021) 123-4567</p>
              </div>
              
              <div className="border-b pb-2 mb-2">
                <div className="flex justify-between text-sm">
                  <span>No. Transaksi:</span>
                  <span>{selectedReceipt.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tanggal:</span>
                  <span>{formatDate(selectedReceipt.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Metode Pembayaran:</span>
                  <span className="capitalize">
                    {selectedReceipt.paymentMethod === 'cash' ? 'Tunai' : 
                     selectedReceipt.paymentMethod === 'card' ? 'Kartu' : 
                     selectedReceipt.paymentMethod || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="border-b pb-2 mb-2">
                <div className="text-sm font-semibold mb-1 flex justify-between">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                {selectedReceipt.items.map((item, index) => (
                  <div key={index} className="text-sm flex justify-between">
                    <span>{item.quantity} x {item.name}</span>
                    <span>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              
              <div className="font-bold flex justify-between">
                <span>Total:</span>
                <span>Rp{selectedReceipt.total.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="text-center mt-4 text-sm">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>Silahkan datang kembali</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receipts;
