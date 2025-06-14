import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from '@/components/inventory/ProductList';
import { SupplierList } from '@/components/inventory/SupplierList';
import { PurchaseOrderList } from '@/components/inventory/PurchaseOrderList';
import { Package, AlertTriangle, Users, ClipboardList, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('products');

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchase_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const totalProducts = products?.length || 0;
  const lowStockItems = products?.filter(p => p.status === 'low_stock').length || 0;
  const totalSuppliers = suppliers?.length || 0;
  const pendingOrders = purchaseOrders?.filter(po => po.status === 'pending').length || 0;

  // Calculate trends (mock data for now)
  const productTrend = 12; // 12% increase
  const lowStockTrend = -5; // 5% decrease
  const supplierTrend = 8; // 8% increase
  const orderTrend = 15; // 15% increase

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Inventory Management
        </h1>
        <p className="text-gray-600">
          Track stock levels, manage suppliers, and handle purchase orders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{productTrend}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{lowStockTrend}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{supplierTrend}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{orderTrend}% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger 
                value="products"
                className={cn(
                  "data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600",
                  "transition-colors duration-200"
                )}
              >
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="suppliers"
                className={cn(
                  "data-[state=active]:bg-green-100 data-[state=active]:text-green-600",
                  "transition-colors duration-200"
                )}
              >
                Suppliers
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className={cn(
                  "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600",
                  "transition-colors duration-200"
                )}
              >
                Purchase Orders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-6">
              <ProductList />
            </TabsContent>
            <TabsContent value="suppliers" className="mt-6">
              <SupplierList />
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <PurchaseOrderList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 