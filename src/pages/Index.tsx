
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BarChart3, Mic, Brain, FileText, TrendingUp, Shield, Clock, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="px-4 py-6 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Smart Ledger AI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20 max-w-6xl mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Voice-First Bookkeeping for 
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {" "}Indian Businesses
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            GST-compliant, AI-powered bookkeeping platform with voice entry for freelancers, 
            shopkeepers, and service providers. Speak in Hindi or English, we understand both!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need</h3>
          <p className="text-gray-600">Powerful features designed for Indian small businesses</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Voice Entry</h4>
              <p className="text-gray-600 text-sm">Speak your transactions in Hindi or English. Our AI understands both!</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered</h4>
              <p className="text-gray-600 text-sm">Smart categorization and automatic GST calculations</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">GST Compliant</h4>
              <p className="text-gray-600 text-sm">Automatic GST calculations and compliance reporting</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h4>
              <p className="text-gray-600 text-sm">Insightful reports and business analytics</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Smart Ledger AI?</h3>
            <p className="text-gray-600">Built specifically for Indian small businesses</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Save Time</h4>
              <p className="text-gray-600">Voice entry is 3x faster than typing. Focus on your business, not bookkeeping.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Stay Compliant</h4>
              <p className="text-gray-600">Automatic GST calculations ensure you're always compliant with Indian tax laws.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Multi-Language</h4>
              <p className="text-gray-600">Speak in Hindi, English, or mix both. Our AI understands Indian businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-gray-800 mb-6">
          Ready to Transform Your Bookkeeping?
        </h3>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of Indian businesses already using Smart Ledger AI
        </p>
        <Link to="/register">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6">
            Start Your Free Trial Today
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-sm">
        <div className="px-4 py-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Smart Ledger AI
            </span>
          </div>
          <p className="text-center text-gray-600 text-sm">
            © 2024 Smart Ledger AI. Voice-first bookkeeping for Indian businesses.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
