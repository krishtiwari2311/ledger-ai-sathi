import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Building2, User, Mail, Phone, Tag, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  segment: string;
  status: string;
}

interface CustomerListProps {
  onSelectCustomer: (customerId: string) => void;
}

export function CustomerList({ onSelectCustomer }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    segment: 'small_business',
    status: 'active'
  });

  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('company_name');
      
      if (error) throw error;
      return data as Customer[];
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      setNewCustomer({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        segment: 'small_business',
        status: 'active'
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomerMutation.mutate(newCustomer);
  };

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = 
      customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    
    return matchesSearch && matchesSegment;
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedSegment}
          onChange={(e) => setSelectedSegment(e.target.value)}
          className="border rounded-md px-3 py-2 bg-white"
        >
          <option value="all">All Segments</option>
          <option value="enterprise">Enterprise</option>
          <option value="small_business">Small Business</option>
          <option value="startup">Startup</option>
        </select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={newCustomer.company_name}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      company_name: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={newCustomer.contact_name}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      contact_name: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Segment
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={newCustomer.segment}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      segment: e.target.value
                    }))}
                    className="w-full border rounded-md p-2 pl-10 bg-white"
                    required
                  >
                    <option value="enterprise">Enterprise</option>
                    <option value="small_business">Small Business</option>
                    <option value="startup">Startup</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Add Customer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers?.map((customer) => (
              <TableRow 
                key={customer.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onSelectCustomer(customer.id)}
              >
                <TableCell className="font-medium">{customer.company_name}</TableCell>
                <TableCell>{customer.contact_name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge variant={
                    customer.segment === 'enterprise' ? 'default' :
                    customer.segment === 'small_business' ? 'secondary' :
                    'outline'
                  }>
                    {customer.segment.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.status === 'active' ? 'success' : 'destructive'}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCustomer(customer.id);
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 