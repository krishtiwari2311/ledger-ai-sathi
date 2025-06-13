
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormData {
  type: string;
  vendor: string;
  amount: string;
  gstRate: string;
  description: string;
  date: string;
  categoryId: string;
}

export const useTransactionForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: "",
    vendor: "",
    amount: "",
    gstRate: "18",
    description: "",
    date: new Date().toISOString().split('T')[0],
    categoryId: ""
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const updateFormData = (updates: Partial<TransactionFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      type: "",
      vendor: "",
      amount: "",
      gstRate: "18",
      description: "",
      date: new Date().toISOString().split('T')[0],
      categoryId: ""
    });
  };

  const submitTransaction = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add transactions",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.type || !formData.vendor || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: formData.type as 'income' | 'expense',
          vendor_name: formData.vendor,
          amount: parseFloat(formData.amount),
          gst_rate: formData.gstRate as '0' | '5' | '12' | '18' | '28',
          description: formData.description || null,
          transaction_date: formData.date,
          category_id: formData.categoryId || null,
          is_voice_entry: false
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `₹${formData.amount} transaction recorded successfully!`
      });

      resetForm();
      navigate("/dashboard");
      return true;
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    updateFormData,
    resetForm,
    submitTransaction
  };
};
