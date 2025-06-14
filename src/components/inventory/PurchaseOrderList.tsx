import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, ClipboardList, Building2, Package, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier: {
    name: string;
  };
  total_amount: number;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date: string;
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
}

export function PurchaseOrderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    supplier_id: '',
    total_amount: '',
    expected_delivery_date: '',
    status: 'pending' as const
  });

  const queryClient = useQueryClient();

  const { data: purchaseOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['purchase_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PurchaseOrder[];
    }
  });

  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Supplier[];
    }
  });

  const addOrderMutation = useMutation({
    mutationFn: async (order: Omit<PurchaseOrder, 'id' | 'order_number' | 'order_date' | 'created_at' | 'supplier'>) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([{
          ...order,
          order_number: `PO-${Date.now()}`,
          order_date: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      setIsDialogOpen(false);
      setNewOrder({
        supplier_id: '',
        total_amount: '',
        expected_delivery_date: '',
        status: 'pending'
      });
      toast.success('Purchase order created successfully');
    },
    onError: () => {
      toast.error('Failed to create purchase order');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOrderMutation.mutate({
      supplier_id: newOrder.supplier_id,
      total_amount: parseFloat(newOrder.total_amount),
      expected_delivery_date: newOrder.expected_delivery_date,
      status: newOrder.status
    });
  };

  const filteredOrders = purchaseOrders?.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingOrders || isLoadingSuppliers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchase orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <div className="relative">
                  <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={newOrder.supplier_id}
                    onValueChange={(value) => setNewOrder({ ...newOrder, supplier_id: value })}
                  >
                    <SelectTrigger className="pl-8">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    value={newOrder.total_amount}
                    onChange={(e) => setNewOrder({ ...newOrder, total_amount: e.target.value })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={newOrder.expected_delivery_date}
                    onChange={(e) => setNewOrder({ ...newOrder, expected_delivery_date: e.target.value })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={addOrderMutation.isPending}
              >
                {addOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Order'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-600">
          <div>Order Number</div>
          <div>Supplier</div>
          <div>Amount</div>
          <div>Order Date</div>
          <div>Expected Delivery</div>
          <div>Status</div>
        </div>
        <div className="divide-y">
          {filteredOrders?.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex items-center">
                <span>{order.supplier.name}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm">
                  {new Date(order.order_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm">
                  {new Date(order.expected_delivery_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <Badge
                  variant={
                    order.status === 'pending' ? 'secondary' :
                    order.status === 'approved' ? 'default' :
                    order.status === 'received' ? 'default' :
                    'destructive'
                  }
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 