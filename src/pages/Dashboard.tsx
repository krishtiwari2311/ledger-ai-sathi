import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Mic, Upload, Plus, BarChart3, TrendingUp, TrendingDown, IndianRupee, LogOut, Users, Package } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";

const Dashboard = () => {
  const [currentMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const { signOut, user } = useAuth();
  const { dashboardData, loading } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="px-4 py-6 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Smart Ledger AI</h1>
              <p className="text-sm text-gray-600">{currentMonth}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/add-transaction">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Welcome message */}
        {user && (
          <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              Welcome back! 👋
            </h2>
            <p className="text-gray-600">Here's your business overview for {currentMonth}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/add-transaction" className="block">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">Voice Entry</span>
              </div>
            </Card>
          </Link>
          <Link to="/transactions" className="block">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">Transactions</span>
              </div>
            </Card>
          </Link>
          <Link to="/analytics" className="block">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">Analytics</span>
              </div>
            </Card>
          </Link>
          <Link to="/crm" className="block">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">CRM</span>
              </div>
            </Card>
          </Link>
          <Link to="/inventory" className="block">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">Inventory</span>
              </div>
            </Card>
          </Link>
        </div>

        {/* GST Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                Input GST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-6 h-6 text-green-600" />
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(dashboardData.inputGST)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">GST you can claim back</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                Output GST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-6 h-6 text-red-600" />
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(dashboardData.outputGST)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">GST you need to pay</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-gray-600" />
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.totalIncome)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-gray-600" />
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.totalExpenses)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.netProfit)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentTransactions?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{transaction.vendor_name}</p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-600">{transaction.gst_rate}% GST</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No transactions yet</p>
                <Link to="/add-transaction">
                  <Button className="mt-4">Add Your First Transaction</Button>
                </Link>
              </div>
            )}
            <Link to="/transactions">
              <Button variant="outline" className="w-full mt-4">
                View All Transactions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default Dashboard;
