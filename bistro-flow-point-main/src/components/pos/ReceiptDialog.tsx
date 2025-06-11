
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Receipt {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  paymentMethod: string;
  orderNumber: string;
}

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  onPrintReceipt: () => void;
}

export const ReceiptDialog: React.FC<ReceiptDialogProps> = ({
  open,
  onOpenChange,
  receipt,
  onPrintReceipt
}) => {
  if (!receipt) return null;

  // Helper function to translate payment methods
  const translatePaymentMethod = (method: string): string => {
    switch (method.toLowerCase()) {
      case 'cash': return 'Tunai';
      case 'card': return 'Kartu';
      case 'qris': return 'QRIS';
      default: return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md print:shadow-none print:border-none">
        <DialogHeader>
          <DialogTitle>Struk</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="text-center border-b pb-2 mb-2">
            <h3 className="font-bold text-lg">Nama Restoran</h3>
            <p className="text-sm">Jl. Restoran No. 123, Kota</p>
            <p className="text-sm">Tel: (021) 123-4567</p>
          </div>
          
          <div className="border-b pb-2 mb-2">
            <div className="flex justify-between text-sm">
              <span>No. Struk:</span>
              <span>{receipt.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tanggal:</span>
              <span>{receipt.date.toLocaleString('id-ID', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Metode Pembayaran:</span>
              <span>{translatePaymentMethod(receipt.paymentMethod)}</span>
            </div>
          </div>
          
          <div className="border-b pb-2 mb-2">
            <div className="text-sm font-semibold mb-1 flex justify-between">
              <span>Item</span>
              <span>Total</span>
            </div>
            {receipt.items.map((item, index) => (
              <div key={index} className="text-sm flex justify-between">
                <span>{item.quantity} x {item.name}</span>
                <span>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          
          <div className="font-bold flex justify-between">
            <span>Total:</span>
            <span>Rp{receipt.total.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="text-center mt-4 text-sm">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Silahkan datang kembali</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={onPrintReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Struk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
