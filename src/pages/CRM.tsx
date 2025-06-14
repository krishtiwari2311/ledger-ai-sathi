import React, { useState } from 'react';
import { CustomerList } from '../components/crm/CustomerList';
import { CustomerInteractions } from '../components/crm/CustomerInteractions';
import { CustomerSurvey } from '../components/crm/CustomerSurvey';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Users, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function CRM() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: async () => {
      const [
        { count: totalCustomers },
        { count: totalInteractions },
        { count: totalSurveys },
        { data: surveys }
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('customer_interactions').select('*', { count: 'exact', head: true }),
        supabase.from('customer_surveys').select('*', { count: 'exact', head: true }),
        supabase.from('customer_surveys').select('rating')
      ]);

      const avgRating = surveys?.length 
        ? (surveys.reduce((acc, curr) => acc + curr.rating, 0) / surveys.length).toFixed(1)
        : '0.0';

      return {
        totalCustomers: totalCustomers || 0,
        totalInteractions: totalInteractions || 0,
        totalSurveys: totalSurveys || 0,
        avgRating
      };
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Customer Relationship Management
        </h1>
        <p className="text-gray-600">
          Manage your customer relationships, track interactions, and monitor satisfaction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold">{stats?.totalInteractions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                <p className="text-2xl font-bold">{stats?.totalSurveys || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold">{stats?.avgRating || '0.0'}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="customers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="customers" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600">
                Customers
              </TabsTrigger>
              {selectedCustomerId && (
                <>
                  <TabsTrigger value="interactions" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-600">
                    Interactions
                  </TabsTrigger>
                  <TabsTrigger value="surveys" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600">
                    Surveys
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="customers" className="mt-6">
              <CustomerList onSelectCustomer={setSelectedCustomerId} />
            </TabsContent>

            {selectedCustomerId && (
              <>
                <TabsContent value="interactions" className="mt-6">
                  <CustomerInteractions customerId={selectedCustomerId} />
                </TabsContent>

                <TabsContent value="surveys" className="mt-6">
                  <CustomerSurvey customerId={selectedCustomerId} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 