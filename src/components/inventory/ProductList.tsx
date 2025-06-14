import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, Package, Tag, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  unit_price: number;
  reorder_level: number;
  current_stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    unit_price: '',
    reorder_level: '',
    current_stock: '',
    status: 'in_stock' as const
  });

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setNewProduct({
        name: '',
        description: '',
        sku: '',
        category: '',
        unit_price: '',
        reorder_level: '',
        current_stock: '',
        status: 'in_stock'
      });
      toast.success('Product added successfully');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('A product with this SKU already exists');
      } else {
        toast.error('Failed to add product');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProductMutation.mutate({
      name: newProduct.name,
      description: newProduct.description,
      sku: newProduct.sku,
      category: newProduct.category,
      unit_price: parseFloat(newProduct.unit_price),
      reorder_level: parseInt(newProduct.reorder_level),
      current_stock: parseInt(newProduct.current_stock),
      status: newProduct.current_stock === '0' ? 'out_of_stock' :
              parseInt(newProduct.current_stock) <= parseInt(newProduct.reorder_level) ? 'low_stock' : 'in_stock'
    });
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products?.map(p => p.category) || []));

  if (isLoading) {
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <div className="relative">
                  <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <div className="relative">
                  <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={newProduct.unit_price}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_level">Reorder Level</Label>
                <div className="relative">
                  <AlertTriangle className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reorder_level"
                    type="number"
                    value={newProduct.reorder_level}
                    onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_stock">Current Stock</Label>
                <div className="relative">
                  <AlertTriangle className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current_stock"
                    type="number"
                    value={newProduct.current_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, current_stock: e.target.value })}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={addProductMutation.isPending}
              >
                {addProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-600">
          <div className="col-span-2">Product</div>
          <div>Category</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Reorder Level</div>
          <div>Status</div>
        </div>
        <div className="divide-y">
          {filteredProducts?.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="col-span-2">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">{product.sku}</div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-gray-100">
                  {product.category}
                </Badge>
              </div>
              <div className="flex items-center">
                <span className="font-medium">
                  ${(product.unit_price || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center">
                <span className={cn(
                  "font-medium",
                  (product.current_stock || 0) <= (product.reorder_level || 0) ? "text-red-600" : "text-green-600"
                )}>
                  {product.current_stock || 0}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  {product.reorder_level || 0}
                </span>
              </div>
              <div className="flex items-center">
                <Badge
                  variant={product.status === 'in_stock' ? 'default' : 
                          product.status === 'low_stock' ? 'destructive' : 'secondary'}
                  className="capitalize"
                >
                  {product.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 