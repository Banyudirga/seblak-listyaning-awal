
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, UserPlus, Edit, Trash2, Search } from 'lucide-react';
import { localStorageHelper, Customer } from '@/utils/localStorage';
import { toast } from '@/components/ui/sonner';

const Customers = () => {
  const { user, isAuthorized } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authorized
  if (!isAuthorized(['owner'])) {
    return <Navigate to="/pos" replace />;
  }

  // Load customers from localStorage
  useEffect(() => {
    const loadedCustomers = localStorageHelper.getCustomers();
    setCustomers(loadedCustomers);
  }, []);

  // Handle opening the add customer dialog
  const handleAddCustomer = () => {
    setCurrentCustomer({
      name: '',
      contact: '',
      lastVisitDate: new Date().toISOString(),
      lastTransactionAmount: 0,
      visitCount: 0,
      totalSpent: 0,
      notes: ''
    });
    setIsNewCustomer(true);
    setIsDialogOpen(true);
  };

  // Handle editing a customer
  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer({ ...customer });
    setIsNewCustomer(false);
    setIsDialogOpen(true);
  };

  // Handle saving a customer
  const handleSaveCustomer = () => {
    if (!currentCustomer || !currentCustomer.name || !currentCustomer.contact) {
      toast.error("Mohon isi nama dan nomor telepon pelanggan");
      return;
    }

    try {
      localStorageHelper.updateCustomer({
        name: currentCustomer.name,
        contact: currentCustomer.contact,
        lastVisitDate: currentCustomer.lastVisitDate || new Date().toISOString(),
        lastTransactionAmount: currentCustomer.lastTransactionAmount || 0,
        visitCount: currentCustomer.visitCount || 0,
        totalSpent: currentCustomer.totalSpent || 0,
        notes: currentCustomer.notes
      });

      // Refresh customer list
      setCustomers(localStorageHelper.getCustomers());
      
      toast.success(isNewCustomer 
        ? "Data pelanggan berhasil ditambahkan" 
        : "Data pelanggan berhasil diperbarui"
      );
      
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan data pelanggan");
      console.error(error);
    }
  };

  // Handle deleting a customer
  const handleDeleteCustomer = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data pelanggan ini?")) {
      try {
        localStorageHelper.deleteCustomer(id);
        setCustomers(customers.filter(c => c.id !== id));
        toast.success("Data pelanggan berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus data pelanggan");
        console.error(error);
      }
    }
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <User className="mr-2 h-6 w-6" />
          Data Pelanggan
        </h1>
        
        <Button onClick={handleAddCustomer}>
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>
      
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Pelanggan</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input 
                placeholder="Cari pelanggan..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto flex-1 p-0">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Kunjungan</TableHead>
                <TableHead>Transaksi Terakhir</TableHead>
                <TableHead>Total Transaksi</TableHead>
                <TableHead>Terakhir Berkunjung</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.contact}</TableCell>
                  <TableCell>{customer.visitCount}x</TableCell>
                  <TableCell>Rp{customer.lastTransactionAmount.toLocaleString('id-ID')}</TableCell>
                  <TableCell>Rp{customer.totalSpent.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    {new Date(customer.lastVisitDate).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {searchTerm ? 'Tidak ada pelanggan yang sesuai dengan pencarian' : 'Belum ada data pelanggan'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isNewCustomer ? 'Tambah Pelanggan Baru' : 'Edit Data Pelanggan'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Pelanggan</Label>
              <Input
                id="name"
                value={currentCustomer?.name || ''}
                onChange={(e) => setCurrentCustomer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama pelanggan"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact">Nomor Telepon</Label>
              <Input
                id="contact"
                value={currentCustomer?.contact || ''}
                onChange={(e) => setCurrentCustomer(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="Nomor telepon"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={currentCustomer?.notes || ''}
                onChange={(e) => setCurrentCustomer(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan tambahan"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveCustomer}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
