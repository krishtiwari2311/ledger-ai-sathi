
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNav from "@/components/MobileNav";

const Analytics = () => {
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
                  <p className="text-2xl font-bold text-gray-800">₹52,000</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Month</p>
                  <p className="text-2xl font-bold text-gray-800">₹48,500</p>
                </div>
                <TrendingDown className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth</p>
                  <p className="text-2xl font-bold text-green-600">+7.2%</p>
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
                  <p className="text-2xl font-bold text-gray-800">₹2,260</p>
                </div>
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Chart visualization coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Pie chart visualization coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Office Supplies", amount: 12500, percentage: 35 },
                { category: "Software", amount: 8200, percentage: 23 },
                { category: "Travel", amount: 6800, percentage: 19 },
                { category: "Meals", amount: 4500, percentage: 13 },
                { category: "Others", amount: 3500, percentage: 10 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
                    <span className="font-medium text-gray-800">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-16 text-right">₹{item.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default Analytics;
