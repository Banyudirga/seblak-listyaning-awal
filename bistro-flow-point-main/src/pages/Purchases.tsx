import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, ShoppingCart, Package, Calendar, FileText, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { localStorageHelper, Purchase, PurchaseItem, Supplier } from '@/utils/localStorage';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Form data types
interface PurchaseFormData {
  supplier_name: string;
  supplier_contact: string;
  purchase_date: string;
  invoice_number: string;
  items: PurchaseItem[];
  notes: string;
}

const Purchases = () => {
  const { user } = useAuth();
  
  // State management
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewPurchase, setIsNewPurchase] = useState(true);
  const [currentPurchaseId, setCurrentPurchaseId] = useState<string | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PurchaseFormData>({
    supplier_name: '',
    supplier_contact: '',
    purchase_date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    items: [{ 
      id: `item-${Date.now()}`, 
      item_name: '', 
      quantity: 1, 
      unit: 'pcs', 
      unit_price: 0, 
      total_price: 0 
    }],
    notes: ''
  });

  // Load purchases on component mount
  useEffect(() => {
    const loadedPurchases = localStorageHelper.getPurchases();
    setPurchases(loadedPurchases);
  }, []);

  // Get unique suppliers for autocomplete
  const getUniqueSuppliers = () => {
    const suppliers = localStorageHelper.getSuppliers();
    const purchaseSuppliers = purchases.map(p => ({ name: p.supplier_name, contact: p.supplier_contact }));

    // Combine and deduplicate
    const allSuppliers = [...suppliers.map(s => ({ name: s.name, contact: s.contact })), ...purchaseSuppliers];
    const uniqueSuppliers = allSuppliers.filter((supplier, index, self) =>
      index === self.findIndex(s => s.name === supplier.name)
    );

    return uniqueSuppliers;
  };

  // Get common item suggestions
  const getCommonItems = () => {
    const purchasedItems = purchases.flatMap(p => p.items.map(i => i.item_name));
    const uniqueItems = [...new Set(purchasedItems)];

    // Add common Indonesian food items if not already present
    const commonItems = [
      'Mie Instan Grosir', 'Telur Ayam Segar', 'Cabai Rawit Merah', 'Cabai Keriting',
      'Bawang Merah', 'Bawang Putih', 'Sosis Ayam', 'Bakso Ikan', 'Daging Ayam Fillet',
      'Minyak Goreng Curah', 'Garam Dapur', 'Gula Pasir', 'Kecap Manis Botol',
      'Saus Sambal', 'Tepung Terigu', 'Tepung Tapioka', 'Kerupuk Mentah', 'Kerupuk Udang',
      'Jahe Segar', 'Lengkuas', 'Daun Bawang', 'Sawi Hijau', 'Tauge', 'Emping Mentah',
      'Teh Celup Kotak', 'Kopi Sachet', 'Sirup Rasa', 'Styrofoam Kotak', 'Plastik Bening',
      'Sendok Plastik', 'Tissue Makan'
    ];

    return [...new Set([...uniqueItems, ...commonItems])].sort();
  };

  // Handle opening add purchase dialog
  const handleAddPurchase = () => {
    setIsNewPurchase(true);
    setCurrentPurchaseId(null);
    setFormData({
      supplier_name: '',
      supplier_contact: '',
      purchase_date: new Date().toISOString().split('T')[0],
      invoice_number: '',
      items: [{ 
        id: `item-${Date.now()}`, 
        item_name: '', 
        quantity: 1, 
        unit: 'pcs', 
        unit_price: 0, 
        total_price: 0 
      }],
      notes: ''
    });
    setIsDialogOpen(true);
  };

  // Handle opening edit purchase dialog
  const handleEditPurchase = (purchase: Purchase) => {
    setIsNewPurchase(false);
    setCurrentPurchaseId(purchase.id);
    setFormData({
      supplier_name: purchase.supplier_name,
      supplier_contact: purchase.supplier_contact,
      purchase_date: purchase.purchase_date.split('T')[0],
      invoice_number: purchase.invoice_number,
      items: purchase.items,
      notes: purchase.notes || ''
    });
    setIsDialogOpen(true);
  };

  // Handle delete purchase
  const handleDeletePurchase = (id: string) => {
    setPurchaseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (purchaseToDelete) {
      try {
        localStorageHelper.deletePurchase(purchaseToDelete);
        setPurchases(prevPurchases => 
          prevPurchases.filter(purchase => purchase.id !== purchaseToDelete)
        );
        toast.success('Pembelian berhasil dihapus');
      } catch (error) {
        console.error('Error deleting purchase:', error);
        toast.error('Gagal menghapus pembelian');
      }
    }
    setIsDeleteDialogOpen(false);
    setPurchaseToDelete(null);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof PurchaseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle item changes
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate total price for the item
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Add new item row
  const addItemRow = () => {
    const newItem: PurchaseItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item_name: '',
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      total_price: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove item row
  const removeItemRow = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.total_price, 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.supplier_name || !formData.supplier_contact || !formData.invoice_number) {
      toast.error('Mohon isi semua kolom yang diperlukan');
      return;
    }

    if (formData.items.some(item => !item.item_name || item.quantity <= 0 || item.unit_price <= 0)) {
      toast.error('Mohon isi semua data item dengan benar');
      return;
    }

    try {
      const totalAmount = calculateTotalAmount();
      
      if (isNewPurchase) {
        const newPurchase: Purchase = {
          id: `purchase-${Date.now()}`,
          supplier_id: `supplier-${Date.now()}`, // Generate supplier ID
          supplier_name: formData.supplier_name,
          supplier_contact: formData.supplier_contact,
          purchase_date: new Date(formData.purchase_date).toISOString(),
          invoice_number: formData.invoice_number,
          items: formData.items,
          total_amount: totalAmount,
          notes: formData.notes,
          created_by: user?.id || 'unknown',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localStorageHelper.addPurchase(newPurchase);
        setPurchases(prevPurchases => [...prevPurchases, newPurchase]);
        toast.success('Pembelian berhasil ditambahkan dan inventaris diperbarui');
      } else if (currentPurchaseId) {
        const updatedPurchase: Purchase = {
          id: currentPurchaseId,
          supplier_id: purchases.find(p => p.id === currentPurchaseId)?.supplier_id || `supplier-${Date.now()}`,
          supplier_name: formData.supplier_name,
          supplier_contact: formData.supplier_contact,
          purchase_date: new Date(formData.purchase_date).toISOString(),
          invoice_number: formData.invoice_number,
          items: formData.items,
          total_amount: totalAmount,
          notes: formData.notes,
          created_by: purchases.find(p => p.id === currentPurchaseId)?.created_by || user?.id || 'unknown',
          created_at: purchases.find(p => p.id === currentPurchaseId)?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localStorageHelper.updatePurchase(updatedPurchase);
        setPurchases(prevPurchases => 
          prevPurchases.map(purchase => 
            purchase.id === currentPurchaseId ? updatedPurchase : purchase
          )
        );
        toast.success('Pembelian berhasil diperbarui');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving purchase:', error);
      toast.error('Gagal menyimpan pembelian');
    }
  };

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has appropriate role
  const canManagePurchases = user.role === 'owner' || user.role === 'warehouse_admin';
  
  if (!canManagePurchases) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">Akses Terbatas</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses manajemen pembelian.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pembelian</h1>
          <p className="text-muted-foreground">Kelola pembelian barang dan update inventaris</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleAddPurchase}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pembelian
          </Button>

          {/* Development helper - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Reset semua data pembelian? Ini akan menghapus semua data dan membuat data sample baru.')) {
                  // Clear existing data
                  localStorage.removeItem('seblak-listyaning-purchases');
                  localStorage.removeItem('seblak-listyaning-suppliers');
                  // Reload page to regenerate sample data
                  window.location.reload();
                }
              }}
            >
              Reset Data Sample
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembelian</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
            <p className="text-xs text-muted-foreground">
              Pembelian tercatat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {purchases.reduce((sum, purchase) => sum + purchase.total_amount, 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total nilai pembelian
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.filter(purchase => {
                const purchaseDate = new Date(purchase.purchase_date);
                const now = new Date();
                return purchaseDate.getMonth() === now.getMonth() &&
                       purchaseDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pembelian bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier Aktif</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(purchases.map(p => p.supplier_name)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Supplier berbeda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pembelian Terbesar</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length > 0 ? (
              <>
                <div className="text-xl font-bold text-green-600">
                  Rp {Math.max(...purchases.map(p => p.total_amount)).toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-muted-foreground">
                  {purchases.find(p => p.total_amount === Math.max(...purchases.map(p => p.total_amount)))?.supplier_name}
                </p>
              </>
            ) : (
              <div className="text-xl font-bold">Rp 0</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rata-rata Pembelian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              Rp {purchases.length > 0 ?
                (purchases.reduce((sum, p) => sum + p.total_amount, 0) / purchases.length).toLocaleString('id-ID') :
                '0'
              }
            </div>
            <p className="text-sm text-muted-foreground">Per transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {purchases.reduce((sum, p) => sum + p.items.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Item dibeli ({new Set(purchases.flatMap(p => p.items.map(i => i.item_name))).size} jenis berbeda)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembelian</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Belum ada pembelian</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mulai dengan menambahkan pembelian pertama Anda.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Nilai</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.invoice_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.supplier_name}</div>
                        <div className="text-sm text-muted-foreground">{purchase.supplier_contact}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {format(new Date(purchase.purchase_date), 'dd MMM yyyy', { locale: id })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(purchase.purchase_date), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.items.length} item</div>
                        <div className="text-sm text-muted-foreground">
                          {purchase.items.slice(0, 2).map(item => item.item_name).join(', ')}
                          {purchase.items.length > 2 && '...'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        Rp {purchase.total_amount.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg: Rp {(purchase.total_amount / purchase.items.length).toLocaleString('id-ID')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate text-sm text-muted-foreground">
                        {purchase.notes || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPurchase(purchase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePurchase(purchase.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Purchase Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewPurchase ? 'Tambah Pembelian Baru' : 'Edit Pembelian'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supplier Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Nama Supplier *</Label>
                <Input
                  id="supplier_name"
                  list="suppliers"
                  value={formData.supplier_name}
                  onChange={(e) => {
                    handleInputChange('supplier_name', e.target.value);
                    // Auto-fill contact if supplier is selected from list
                    const selectedSupplier = getUniqueSuppliers().find(s => s.name === e.target.value);
                    if (selectedSupplier && !formData.supplier_contact) {
                      handleInputChange('supplier_contact', selectedSupplier.contact);
                    }
                  }}
                  placeholder="Masukkan nama supplier"
                  required
                />
                <datalist id="suppliers">
                  {getUniqueSuppliers().map((supplier, index) => (
                    <option key={index} value={supplier.name} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_contact">Kontak Supplier *</Label>
                <Input
                  id="supplier_contact"
                  value={formData.supplier_contact}
                  onChange={(e) => handleInputChange('supplier_contact', e.target.value)}
                  placeholder="Nomor telepon atau email"
                  required
                />
              </div>
            </div>

            {/* Purchase Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Tanggal Pembelian *</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_number">No. Invoice *</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  placeholder="Masukkan nomor invoice"
                  required
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Daftar Item *</Label>
                <Button type="button" onClick={addItemRow} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Harga Satuan</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            list="common-items"
                            value={item.item_name}
                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                            placeholder="Nama item"
                            required
                          />
                          <datalist id="common-items">
                            {getCommonItems().map((itemName, idx) => (
                              <option key={idx} value={itemName} />
                            ))}
                          </datalist>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            placeholder="pcs"
                            className="w-20"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-24"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Rp {item.total_price.toLocaleString('id-ID')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItemRow(index)}
                            disabled={formData.items.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Total Amount */}
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total Pembelian</div>
                  <div className="text-2xl font-bold">
                    Rp {calculateTotalAmount().toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Catatan tambahan (opsional)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {isNewPurchase ? 'Simpan Pembelian' : 'Update Pembelian'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pembelian</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pembelian ini? Tindakan ini akan mengurangi stok inventaris yang telah ditambahkan dari pembelian ini dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Purchases;
