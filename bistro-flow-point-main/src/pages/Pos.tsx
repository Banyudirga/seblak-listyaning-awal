
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';

// Import custom hooks
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCart } from '@/hooks/useCart';
import { useOrderManagement } from '@/hooks/useOrderManagement';

// Import components
import { MenuCategories } from '@/components/pos/MenuCategories';
import { Cart } from '@/components/pos/Cart';
import { PaymentDialog } from '@/components/pos/PaymentDialog';
import { ReceiptDialog } from '@/components/pos/ReceiptDialog';

const Pos = () => {
  const { user, loading, initialized } = useAuth();
  const { menuItems, categories, isLoading, refreshMenuItems } = useMenuItems();
  const { cart, addToCart, removeFromCart, clearCart, calculateTotal } = useCart();
  const { 
    paymentDialogOpen, 
    setPaymentDialogOpen,
    receiptDialogOpen, 
    setReceiptDialogOpen,
    currentReceipt,
    createOrderMutation
  } = useOrderManagement(user?.id);

  console.log("Pos - Auth State:", { user: user?.email, loading, initialized });

  // Wait until authentication is fully initialized
  if (!initialized || loading) {
    return <div className="flex items-center justify-center h-full">
      <p className="text-white">Memuat autentikasi...</p>
    </div>;
  }

  // Check if user is authenticated after initialization
  if (!user) {
    console.log("No authenticated user found in Pos component, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Handle payment
  const handlePayment = (paymentMethod: string, amountPaid: string, customerName?: string, customerContact?: string) => {
    const total = calculateTotal();
    // No tax
    
    if (cart.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }
    
    const paid = parseFloat(amountPaid);
    if (paymentMethod === "cash" && (isNaN(paid) || paid < total)) {
      toast.error("Jumlah pembayaran tidak valid");
      return;
    }
    
    createOrderMutation.mutate({
      orderItems: cart,
      total,
      paymentMethod,
      customerName,
      customerContact
    });
    
    setPaymentDialogOpen(false);
  };

  // Print receipt
  const printReceipt = () => {
    window.print();
    toast.success("Struk berhasil dicetak");
    
    // Clear the cart after successful payment
    clearCart();
    setReceiptDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-4xl font-bold mb-4 font-seblak text-seblak-red">SEBLAK LISTYANING</div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Menu Section */}
        <div className="lg:col-span-2">
          <Card className="h-full border-seblak-red bg-seblak-black text-white">
            <CardContent className="p-4 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white">Memuat menu...</p>
                </div>
              ) : menuItems && menuItems.length > 0 ? (
                <MenuCategories 
                  categories={categories}
                  menuItems={menuItems}
                  onSelectItem={addToCart}
                  onMenuItemsChange={refreshMenuItems}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <p>Tidak ada menu ditemukan.</p>
                  <p className="text-sm">Tambahkan menu di halaman inventaris.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Cart Section */}
        <div>
          <Card className="h-full flex flex-col border-seblak-red bg-seblak-black text-white">
            <CardContent className="p-4 flex flex-col h-full">
              <Cart 
                items={cart}
                onClearCart={clearCart}
                onRemoveItem={removeFromCart}
                onAddItem={(id) => {
                  const menuItem = menuItems?.find(mi => mi.id === id);
                  if (menuItem) {
                    addToCart(menuItem);
                  }
                }}
                onCheckout={() => setPaymentDialogOpen(true)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Payment Dialog */}
      <PaymentDialog 
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        cart={cart}
        onCompletePayment={handlePayment}
      />
      
      {/* Receipt Dialog */}
      <ReceiptDialog 
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        receipt={currentReceipt}
        onPrintReceipt={printReceipt}
      />
    </div>
  );
};

export default Pos;
