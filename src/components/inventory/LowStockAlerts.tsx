import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '../ui/button';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  current_stock: number;
  reorder_level: number;
  unit_price: number;
}

export function LowStockAlerts() {
  const { data: lowStockProducts, isLoading } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'low_stock')
        .order('current_stock');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!lowStockProducts?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Low Stock Alerts</h3>
            <p className="text-gray-500 mt-2">All products are currently well-stocked.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockProducts.map((product) => (
          <Card key={product.id} className="border-orange-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <Badge variant="outline" className="capitalize">
                    {product.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Stock:</span>
                  <span className="font-medium text-orange-600">{product.current_stock}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reorder Level:</span>
                  <span className="font-medium">{product.reorder_level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Unit Price:</span>
                  <span className="font-medium">${product.unit_price.toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Create Purchase Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 