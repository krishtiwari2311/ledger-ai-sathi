import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MessageSquare, Phone, Mail, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface Interaction {
  id: string;
  customer_id: string;
  interaction_type: string;
  description: string;
  date: string;
  follow_up_date: string | null;
  status: string;
}

interface CustomerInteractionsProps {
  customerId: string;
}

export function CustomerInteractions({ customerId }: CustomerInteractionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: '',
    description: '',
    follow_up_date: '',
  });
  
  const queryClient = useQueryClient();

  const { data: interactions, isLoading } = useQuery({
    queryKey: ['interactions', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_interactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Interaction[];
    },
  });

  const addInteractionMutation = useMutation({
    mutationFn: async (interaction: Omit<Interaction, 'id' | 'date' | 'status'>) => {
      const { data, error } = await supabase
        .from('customer_interactions')
        .insert([{
          ...interaction,
          customer_id: customerId,
          status: 'pending',
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', customerId] });
      setIsDialogOpen(false);
      setNewInteraction({
        interaction_type: '',
        description: '',
        follow_up_date: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInteractionMutation.mutate(newInteraction);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <MessageSquare className="w-5 h-5" />;
      case 'call':
        return <Phone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Interactions</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Interaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Interaction Type
                </label>
                <select
                  value={newInteraction.interaction_type}
                  onChange={(e) => setNewInteraction(prev => ({
                    ...prev,
                    interaction_type: e.target.value
                  }))}
                  className="w-full border rounded-md p-2 bg-white"
                  required
                >
                  <option value="">Select type</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={newInteraction.description}
                  onChange={(e) => setNewInteraction(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  required
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Follow-up Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={newInteraction.follow_up_date}
                    onChange={(e) => setNewInteraction(prev => ({
                      ...prev,
                      follow_up_date: e.target.value
                    }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Add Interaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {interactions?.map((interaction) => (
          <Card key={interaction.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  interaction.interaction_type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                  interaction.interaction_type === 'call' ? 'bg-green-100 text-green-600' :
                  interaction.interaction_type === 'email' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getInteractionIcon(interaction.interaction_type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium capitalize">
                      {interaction.interaction_type}
                    </h3>
                    <Badge variant={
                      interaction.status === 'completed' ? 'success' :
                      interaction.status === 'pending' ? 'warning' :
                      'destructive'
                    }>
                      {interaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {new Date(interaction.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mt-2">{interaction.description}</p>
                  {interaction.follow_up_date && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      Follow-up: {new Date(interaction.follow_up_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 