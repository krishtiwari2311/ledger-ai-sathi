import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, PieChart, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  vendor_name: string;
  amount: number;
  gst_amount: number;
  gst_rate: string;
  description: string;
  transaction_date: string;
  created_at: string;
  category_id?: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

interface YearlyComparison {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
}

const Analytics = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [yearlyComparison, setYearlyComparison] = useState<YearlyComparison[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category_id
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      setTransactions(data || []);
      if (categories.length > 0) {
        processData(data || [], categories);
      }
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processData = (data: Transaction[], allCategories: { id: string; name: string }[]) => {
    // Process monthly data with savings
    const monthlyMap = new Map<string, { income: number; expenses: number; savings: number; savingsRate: number }>();
    
    data.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0, savings: 0, savingsRate: 0 };
      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }
      current.savings = current.income - current.expenses;
      current.savingsRate = current.income > 0 ? (current.savings / current.income) * 100 : 0;
      monthlyMap.set(monthKey, current);
    });

    const monthlyDataArray = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      savings: data.savings,
      savingsRate: data.savingsRate
    }));

    setMonthlyData(monthlyDataArray);

    // Process yearly comparison
    const yearlyMap = new Map<number, { totalIncome: number; totalExpenses: number; netSavings: number }>();
    
    data.forEach(transaction => {
      const year = new Date(transaction.transaction_date).getFullYear();
      const current = yearlyMap.get(year) || { totalIncome: 0, totalExpenses: 0, netSavings: 0 };
      
      if (transaction.type === 'income') {
        current.totalIncome += transaction.amount;
      } else {
        current.totalExpenses += transaction.amount;
      }
      current.netSavings = current.totalIncome - current.totalExpenses;
      yearlyMap.set(year, current);
    });

    const yearlyDataArray = Array.from(yearlyMap.entries())
      .map(([year, data]) => ({
        year,
        ...data
      }))
      .sort((a, b) => a.year - b.year);

    setYearlyComparison(yearlyDataArray);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      processData(transactions, categories);
    }
  }, [transactions, categories]);

  useEffect(() => {
    // Debug log for categoryData
    console.log("categoryData", monthlyData);
  }, [monthlyData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const calculateGrowth = () => {
    if (monthlyData.length < 2) return 0;
    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];
    const totalCurrent = current.income - current.expenses;
    const totalPrevious = previous.income - previous.expenses;
    return ((totalCurrent - totalPrevious) / totalPrevious) * 100;
  };

  const calculateAverageTransaction = () => {
    if (transactions.length === 0) return 0;
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return total / transactions.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentMonth = monthlyData[monthlyData.length - 1] || { income: 0, expenses: 0, savings: 0, savingsRate: 0 };
  const previousMonth = monthlyData[monthlyData.length - 2] || { income: 0, expenses: 0, savings: 0, savingsRate: 0 };
  const growth = calculateGrowth();
  const avgTransaction = calculateAverageTransaction();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="px-4 py-6 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center space-x-4 max-w-6xl mx-auto">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{formatCurrency(currentMonth.income - currentMonth.expenses)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Savings Rate</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentMonth.savingsRate.toFixed(1)}%
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">YoY Growth</p>
                  <p className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Transaction</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{formatCurrency(avgTransaction)}
                  </p>
                </div>
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Monthly Revenue & Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`₹${formatCurrency(value)}`, '']}
                    />
                    <Area type="monotone" dataKey="income" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Expenses" />
                    <Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Year-over-Year Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`₹${formatCurrency(value)}`, '']}
                    />
                    <Bar dataKey="totalIncome" fill="#22c55e" name="Income" />
                    <Bar dataKey="totalExpenses" fill="#ef4444" name="Expenses" />
                    <Bar dataKey="netSavings" fill="#3b82f6" name="Net Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Monthly Savings Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                    />
                    <Line type="monotone" dataKey="savingsRate" stroke="#3b82f6" name="Savings Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Monthly Savings</span>
                  <span className="font-medium text-gray-800">
                    ₹{formatCurrency(monthlyData.reduce((sum, month) => sum + month.savings, 0) / monthlyData.length)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Best Savings Month</span>
                  <span className="font-medium text-gray-800">
                    {monthlyData.reduce((max, month) => month.savings > max.savings ? month : max, monthlyData[0])?.month}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Savings Rate</span>
                  <span className="font-medium text-gray-800">
                    {(monthlyData.reduce((sum, month) => sum + month.savingsRate, 0) / monthlyData.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Savings</span>
                  <span className="font-medium text-gray-800">
                    ₹{formatCurrency(monthlyData.reduce((sum, month) => sum + month.savings, 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default Analytics;
