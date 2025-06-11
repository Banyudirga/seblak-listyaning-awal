import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CalendarDays, Plus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

// Define shift types
interface ShiftProfile {
  first_name: string | null;
  last_name: string | null;
}

interface Shift {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  starting_cash: number;
  ending_cash: number | null;
  total_sales: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: ShiftProfile | null;
}

interface ShiftFormData {
  starting_cash: number;
  ending_cash?: number | null;
  notes: string;
}

// Remove the local UserRole type definition since we're importing it from AuthContext

const Shifts = () => {
  const { user, isAuthorized } = useAuth();
  const queryClient = useQueryClient();
  
  // State for dialogs and forms
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);
  const [isEndShiftOpen, setIsEndShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<ShiftFormData>({
    starting_cash: 0,
    notes: '',
  });
  
  // Update the roles array to match the UserRole type from AuthContext
  const isManager = isAuthorized(['owner'] as UserRole[]);
  
  // Fetch shifts
  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select('*, profile:profiles(first_name, last_name)')
        .order('start_time', { ascending: false });
        
      // If not manager, only show user's shifts
      if (!isManager && user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match Shift interface
      return data.map(shift => ({
        ...shift,
        // Handle potential error responses in profile
        profile: shift.profile && !('error' in shift.profile) 
          ? shift.profile 
          : null
      })) as Shift[];
    },
    enabled: !!user
  });
  
  // Check for active shift
  const activeShift = shifts?.find(shift => shift.user_id === user?.id && !shift.end_time) || null;
  
  // Start shift mutation
  const startShiftMutation = useMutation({
    mutationFn: async (shiftData: Pick<ShiftFormData, 'starting_cash' | 'notes'>) => {
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          user_id: user!.id,
          starting_cash: shiftData.starting_cash,
          notes: shiftData.notes || null
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift started successfully');
      setIsStartShiftOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to start shift: ${(error as Error).message}`);
    }
  });
  
  // End shift mutation
  const endShiftMutation = useMutation({
    mutationFn: async ({ id, endData }: { id: string, endData: { ending_cash: number, notes: string } }) => {
      // Get total sales for this shift
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('cashier_id', user!.id)
        .gte('created_at', activeShift!.start_time)
        .lt('created_at', new Date().toISOString());
        
      if (orderError) throw orderError;
      
      const totalSales = orderData.reduce((sum, order) => sum + order.total_amount, 0);
      
      const { data, error } = await supabase
        .from('shifts')
        .update({
          end_time: new Date().toISOString(),
          ending_cash: endData.ending_cash,
          total_sales: totalSales,
          notes: activeShift!.notes 
            ? `${activeShift!.notes}\n\nClose notes: ${endData.notes}`.trim() 
            : endData.notes || null
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift ended successfully');
      setIsEndShiftOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to end shift: ${(error as Error).message}`);
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : parseFloat(value) || 0
    }));
  };
  
  // Handle starting a shift
  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.starting_cash < 0) {
      toast.error('Starting cash cannot be negative');
      return;
    }
    
    startShiftMutation.mutate({
      starting_cash: formData.starting_cash,
      notes: formData.notes
    });
  };
  
  // Handle ending a shift
  const handleEndShift = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeShift) {
      toast.error('No active shift found');
      return;
    }
    
    if (!formData.ending_cash && formData.ending_cash !== 0) {
      toast.error('Please enter the ending cash amount');
      return;
    }
    
    endShiftMutation.mutate({
      id: activeShift.id,
      endData: {
        ending_cash: formData.ending_cash!,
        notes: formData.notes
      }
    });
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Current';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate shift duration
  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return 'In progress';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const hours = differenceInHours(endDate, startDate);
    const minutes = differenceInMinutes(endDate, startDate) % 60;
    
    return `${hours}h ${minutes}m`;
  };
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shift Management</h1>
        
        {!activeShift ? (
          <Button onClick={() => {
            setFormData({ starting_cash: 0, notes: '' });
            setIsStartShiftOpen(true);
          }}>
            <Clock className="mr-2 h-4 w-4" />
            Start Shift
          </Button>
        ) : (
          <Button onClick={() => {
            setFormData({ 
              starting_cash: activeShift.starting_cash,
              ending_cash: 0,
              notes: ''
            });
            setIsEndShiftOpen(true);
          }}>
            <Clock className="mr-2 h-4 w-4" />
            End Current Shift
          </Button>
        )}
      </div>
      
      {activeShift && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-700">Active Shift</h3>
                <p className="text-sm text-green-600">
                  Started at {formatDate(activeShift.start_time)}
                </p>
                <p className="text-sm text-green-600">
                  Starting cash: ${activeShift.starting_cash.toFixed(2)}
                </p>
              </div>
              <Button
                className="mt-4 sm:mt-0"
                onClick={() => {
                  setFormData({ 
                    starting_cash: activeShift.starting_cash,
                    ending_cash: 0,
                    notes: ''
                  });
                  setIsEndShiftOpen(true);
                }}
              >
                End Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-8">Loading shifts...</div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Shift History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isManager && <TableHead>Employee</TableHead>}
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Starting Cash</TableHead>
                  <TableHead>Ending Cash</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts && shifts.length > 0 ? (
                  shifts.map(shift => (
                    <TableRow key={shift.id}>
                      {isManager && (
                        <TableCell className="font-medium">
                          {shift.profile ? `${shift.profile.first_name || ''} ${shift.profile.last_name || ''}` : 'Unknown'}
                        </TableCell>
                      )}
                      <TableCell>{formatDate(shift.start_time)}</TableCell>
                      <TableCell>{formatDate(shift.end_time)}</TableCell>
                      <TableCell>{calculateDuration(shift.start_time, shift.end_time)}</TableCell>
                      <TableCell>${shift.starting_cash.toFixed(2)}</TableCell>
                      <TableCell>{shift.ending_cash ? `$${shift.ending_cash.toFixed(2)}` : 'N/A'}</TableCell>
                      <TableCell>{shift.total_sales ? `$${shift.total_sales.toFixed(2)}` : 'N/A'}</TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {shift.notes || 'No notes'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isManager ? 8 : 7} className="text-center py-6">
                      No shifts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Start Shift Dialog */}
      <Dialog open={isStartShiftOpen} onOpenChange={setIsStartShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Shift</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleStartShift}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="starting_cash">Starting Cash ($)</Label>
                <Input
                  id="starting_cash"
                  name="starting_cash"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.starting_cash}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter the amount of cash in the register at the start of your shift.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any notes about this shift"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsStartShiftOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Start Shift
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* End Shift Dialog */}
      <Dialog open={isEndShiftOpen} onOpenChange={setIsEndShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Current Shift</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEndShift}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Starting Cash</Label>
                  <div className="p-2 border rounded-md bg-gray-50">
                    ${activeShift?.starting_cash.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ending_cash">Ending Cash ($)</Label>
                  <Input
                    id="ending_cash"
                    name="ending_cash"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.ending_cash || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Closing Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any notes about closing the shift"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEndShiftOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                End Shift
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shifts;
