
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { CartItem } from './useCart';
import { localStorageHelper } from '@/utils/localStorage';

export interface Receipt {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  paymentMethod: string;
  orderNumber: string;
  customerName?: string;
  customerContact?: string;
}

export const useOrderManagement = (userId: string | undefined) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);

  // Create order mutation
  const createOrderMutation = {
    mutate: async ({
      orderItems,
      total,
      paymentMethod,
      customerName,
      customerContact
    }: {
      orderItems: CartItem[],
      total: number,
      paymentMethod: string,
      customerName?: string,
      customerContact?: string
    }) => {
      try {
        // Generate order number (prefix with current date + sequential number)
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = String(now.getHours()).padStart(2, '0') + 
                        String(now.getMinutes()).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `INV${dateStr}${timeStr}-${randomNum}`;
        
        const orderId = `order-${Date.now()}`;
        
        console.log("Creating order:", { orderId, orderNumber, items: orderItems, total });
        
        // Create the order in localStorage
        localStorageHelper.addOrder({
          id: orderId,
          orderNumber,
          items: orderItems,
          total,
          date: now.toISOString(),
          paymentMethod,
          cashierId: userId || 'unknown',
          customerName,
          customerContact
        });
        
        // If customer info is provided, update or add customer record
        if (customerName && customerContact) {
          localStorageHelper.updateCustomer({
            name: customerName,
            contact: customerContact,
            lastVisitDate: now.toISOString(),
            lastTransactionAmount: total,
            visitCount: 1, // Will be incremented if customer exists
            totalSpent: total // Will be added to if customer exists
          });
        }
        
        const receipt = {
          id: orderId,
          items: orderItems,
          total,
          date: now,
          paymentMethod,
          orderNumber,
          customerName,
          customerContact
        };
        
        setCurrentReceipt(receipt);
        setReceiptDialogOpen(true);
        
        toast.success('Pesanan berhasil dibuat');
        return receipt;
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error(`Gagal membuat pesanan: ${(error as Error).message}`);
        setPaymentDialogOpen(false);
        throw error;
      }
    },
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: () => {}
  };

  return {
    paymentDialogOpen,
    setPaymentDialogOpen,
    receiptDialogOpen,
    setReceiptDialogOpen,
    currentReceipt,
    setCurrentReceipt,
    createOrderMutation
  };
};
