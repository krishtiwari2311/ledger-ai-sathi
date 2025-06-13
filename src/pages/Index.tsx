
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Mic, Upload, BarChart3, Shield, Smartphone, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Smart Ledger AI
            </h1>
          </div>
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600">Login</Button>
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
      <section className="px-4 py-12 text-center max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Voice-First AI Bookkeeping
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              for Indian Businesses
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            GST-compliant, voice-enabled bookkeeping platform designed for freelancers, 
            shopkeepers, and service providers. Just speak your transactions!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 px-8 py-3 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Everything you need for smart bookkeeping
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Mic,
              title: "Voice Entry",
              description: "Just speak: 'Paid ₹500 to Amazon for office chair' - we'll handle the rest with AI.",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: Upload,
              title: "Invoice OCR",
              description: "Upload bills & invoices. Our AI extracts amount, vendor, GST automatically.",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: Shield,
              title: "GST Compliance",
              description: "Automatic GST calculations, input/output tracking, and export-ready reports.",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              icon: BarChart3,
              title: "Smart Analytics",
              description: "Ask questions like 'How much GST in April?' and get instant AI-powered insights.",
              gradient: "from-orange-500 to-red-500"
            },
            {
              icon: Smartphone,
              title: "Mobile First",
              description: "WhatsApp-style interface optimized for mobile. Work on-the-go seamlessly.",
              gradient: "from-indigo-500 to-purple-500"
            },
            {
              icon: Zap,
              title: "AI Automation",
              description: "Auto-categorization, smart tagging, and predictive text for faster entry.",
              gradient: "from-yellow-500 to-orange-500"
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to revolutionize your bookkeeping?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Indian businesses already using Smart Ledger AI
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              Get Started Now - Free!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 Smart Ledger AI. Built for Indian businesses with ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
