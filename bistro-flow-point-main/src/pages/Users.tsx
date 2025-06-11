
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserPlus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { UserRole, useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Mock users data
interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
}

const MOCK_USERS: StaffMember[] = [
  {
    id: '1',
    email: 'owner@example.com',
    firstName: 'John',
    lastName: 'Owner',
    role: 'owner',
    active: true
  },
  {
    id: '2',
    email: 'warehouse@example.com',
    firstName: 'Jane',
    lastName: 'Warehouse',
    role: 'warehouse_admin',
    active: true
  },
  {
    id: '3',
    email: 'cashier@example.com',
    firstName: 'Bob',
    lastName: 'Cashier',
    role: 'cashier',
    active: true
  },
  {
    id: '4',
    email: 'cashier2@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'cashier',
    active: false
  }
];

const Users = () => {
  const { isAuthorized } = useAuth();
  
  // Redirect if not authorized
  if (!isAuthorized(['owner'])) {
    return <Navigate to="/pos" replace />;
  }
  
  const [users, setUsers] = useState<StaffMember[]>(MOCK_USERS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<Partial<StaffMember> | null>(null);
  
  // Handle opening the add user dialog
  const handleAddUser = () => {
    setCurrentUser({
      email: '',
      firstName: '',
      lastName: '',
      role: 'cashier',
      active: true
    });
    setIsNewUser(true);
    setIsDialogOpen(true);
  };
  
  // Handle editing a user
  const handleEditUser = (user: StaffMember) => {
    setCurrentUser({ ...user });
    setIsNewUser(false);
    setIsDialogOpen(true);
  };
  
  // Handle saving a user
  const handleSaveUser = () => {
    if (!currentUser || !currentUser.email || !currentUser.firstName || !currentUser.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isNewUser) {
      // Add new user
      const newUser: StaffMember = {
        ...currentUser as Omit<StaffMember, 'id'>,
        id: Date.now().toString()
      };
      
      setUsers(prev => [...prev, newUser]);
      toast.success("User added successfully");
    } else {
      // Update existing user
      setUsers(prev => 
        prev.map(user => 
          user.id === currentUser.id ? { ...currentUser as StaffMember } : user
        )
      );
      toast.success("User updated successfully");
    }
    
    setIsDialogOpen(false);
    setCurrentUser(null);
  };
  
  // Handle toggling user active status
  const handleToggleActive = (id: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === id ? { ...user, active: !user.active } : user
      )
    );
    
    const user = users.find(u => u.id === id);
    toast.success(`User ${user?.active ? 'deactivated' : 'activated'} successfully`);
  };
  
  // Handle deleting a user
  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    
    if (user?.role === 'owner') {
      toast.error("Cannot delete the owner account");
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${user?.firstName} ${user?.lastName}?`)) {
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success("User deleted successfully");
    }
  };
  
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <User className="mr-2 h-6 w-6" />
          User Management
        </h1>
        
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">
                    {user.role.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleActive(user.id)}
                        className={user.active ? "text-red-500" : "text-green-500"}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      {user.role !== 'owner' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isNewUser ? 'Add New User' : 'Edit User'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={currentUser?.firstName || ''}
                  onChange={(e) => setCurrentUser(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={currentUser?.lastName || ''}
                  onChange={(e) => setCurrentUser(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email || ''}
                onChange={(e) => setCurrentUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={currentUser?.role || 'cashier'}
                onValueChange={(value: UserRole) => setCurrentUser(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="warehouse_admin">Warehouse Admin</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={currentUser?.active || false}
                onChange={(e) => setCurrentUser(prev => ({ ...prev, active: e.target.checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            
            {isNewUser && (
              <div className="text-sm text-gray-500 mt-2">
                <p>Note: For demo purposes, the password will be set to "password".</p>
                <p>In a real application, you would set a secure password or send an invitation email.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
