import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  vendor_name: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  type: 'income' | 'expense';
  gst_rate: '0' | '5' | '12' | '18' | '28';
  description?: string;
  transaction_date: string;
  created_at: string;
  categories?: { name: string };
}

interface DashboardData {
  inputGST: number;
  outputGST: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  recentTransactions: Transaction[];
}

export const useTransactions = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    inputGST: 0,
    outputGST: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch transactions for current month
      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Fetch current month's transactions for dashboard metrics
      const { data: currentMonthTransactions, error: currentMonthError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', user.id)
        .gte('transaction_date', firstDay.toISOString().split('T')[0])
        .lte('transaction_date', lastDay.toISOString().split('T')[0]);

      if (currentMonthError) throw currentMonthError;

      // Fetch recent transactions (last 5) regardless of month
      const { data: recentTransactions, error: recentError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Calculate dashboard metrics
      const income = currentMonthTransactions?.filter(t => t.type === 'income') || [];
      const expenses = currentMonthTransactions?.filter(t => t.type === 'expense') || [];

      const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
      const inputGST = expenses.reduce((sum, t) => sum + Number(t.gst_amount), 0);
      const outputGST = income.reduce((sum, t) => sum + Number(t.gst_amount), 0);

      setDashboardData({
        inputGST,
        outputGST,
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        transactionCount: currentMonthTransactions?.length || 0,
        recentTransactions: recentTransactions || []
      });
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return { dashboardData, loading, refetch: fetchDashboardData };
};
