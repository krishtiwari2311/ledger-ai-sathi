import { Link, useLocation } from "react-router-dom";
import { BarChart3, Plus, TrendingUp, Search, Users, Home, FileText, Package } from "lucide-react";

const MobileNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t shadow-lg md:hidden">
      <div className="flex items-center justify-around py-2">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
            isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs">Dashboard</span>
        </Link>
        
        <Link 
          to="/transactions" 
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
            isActive('/transactions') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs">Transactions</span>
        </Link>
        
        <Link 
          to="/add-transaction" 
          className="flex flex-col items-center space-y-1 p-2 rounded-lg"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </Link>
        
        <Link 
          to="/analytics" 
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
            isActive('/analytics') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs">Analytics</span>
        </Link>

        <Link 
          to="/crm" 
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
            isActive('/crm') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs">CRM</span>
        </Link>

        <Link 
          to="/inventory" 
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
            isActive('/inventory') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Package className="w-6 h-6" />
          <span className="text-xs">Inventory</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;
