import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Star, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';

interface Survey {
  id: string;
  customer_id: string;
  survey_type: string;
  responses: Record<string, any>;
  rating: number;
  feedback: string;
  created_at: string;
}

interface CustomerSurveyProps {
  customerId: string;
}

export function CustomerSurvey({ customerId }: CustomerSurveyProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [surveyData, setSurveyData] = useState({
    survey_type: 'satisfaction',
    rating: 5,
    feedback: '',
    responses: {
      product_quality: 5,
      customer_service: 5,
      value_for_money: 5,
    },
  });

  const queryClient = useQueryClient();

  const addSurveyMutation = useMutation({
    mutationFn: async (survey: Omit<Survey, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('customer_surveys')
        .insert([survey])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', customerId] });
      setIsDialogOpen(false);
      setSurveyData({
        survey_type: 'satisfaction',
        rating: 5,
        feedback: '',
        responses: {
          product_quality: 5,
          customer_service: 5,
          value_for_money: 5,
        },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSurveyMutation.mutate({
      ...surveyData,
      customer_id: customerId,
    });
  };

  const handleRatingChange = (category: string, value: number) => {
    setSurveyData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [category]: value,
      },
      rating: Math.round(
        Object.values({
          ...prev.responses,
          [category]: value,
        }).reduce((a, b) => a + b, 0) / 3
      ),
    }));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Survey</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Survey
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Satisfaction Survey</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Quality
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={surveyData.responses.product_quality === rating ? 'default' : 'outline'}
                        onClick={() => handleRatingChange('product_quality', rating)}
                        className="w-12 h-12 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Customer Service
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={surveyData.responses.customer_service === rating ? 'default' : 'outline'}
                        onClick={() => handleRatingChange('customer_service', rating)}
                        className="w-12 h-12 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Value for Money
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={surveyData.responses.value_for_money === rating ? 'default' : 'outline'}
                        onClick={() => handleRatingChange('value_for_money', rating)}
                        className="w-12 h-12 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Feedback
                  </label>
                  <Textarea
                    value={surveyData.feedback}
                    onChange={(e) => setSurveyData(prev => ({
                      ...prev,
                      feedback: e.target.value
                    }))}
                    placeholder="Please share your thoughts..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Overall Rating</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(surveyData.rating)}
                      <span className="text-lg font-bold">{surveyData.rating}/5</span>
                    </div>
                  </div>
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    Submit Survey
                  </Button>
                </div>
              </Card>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 