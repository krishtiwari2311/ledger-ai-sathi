
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";
import VoiceInput from "@/components/VoiceInput";

const AddTransaction = () => {
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    vendor: "",
    amount: "",
    gstRate: "18",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Transaction submitted:", formData);
    toast({
      title: "Transaction Added",
      description: `₹${formData.amount} transaction recorded successfully!`
    });
    navigate("/dashboard");
  };

  const handleVoiceResult = (transcript: string) => {
    // Simple parsing logic - in real app, this would use NLP
    const amountMatch = transcript.match(/₹?(\d+)/);
    const vendorMatch = transcript.match(/to\s+([a-zA-Z\s]+)/i);
    
    if (amountMatch) {
      setFormData(prev => ({ ...prev, amount: amountMatch[1] }));
    }
    if (vendorMatch) {
      setFormData(prev => ({ ...prev, vendor: vendorMatch[1].trim() }));
    }
    setFormData(prev => ({ ...prev, description: transcript }));
  };

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
          <h1 className="text-xl font-bold text-gray-800">Add Transaction</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Voice Input Section */}
        <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Mic className="w-5 h-5 text-purple-600 mr-2" />
              Voice Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceInput onResult={handleVoiceResult} />
            <p className="text-sm text-gray-600 mt-2">
              Try saying: "Paid ₹500 to Amazon for office chair"
            </p>
          </CardContent>
        </Card>

        {/* Manual Entry Form */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Client</Label>
                <Input
                  id="vendor"
                  placeholder="e.g., Amazon, Client Name"
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstRate">GST Rate (%)</Label>
                  <Select value={formData.gstRate} onValueChange={(value) => setFormData({...formData, gstRate: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the transaction"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* GST Calculation Preview */}
              {formData.amount && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-blue-800 mb-2">GST Calculation</h4>
                    <div className="space-y-1 text-sm">
                      <p>Base Amount: ₹{formData.amount}</p>
                      <p>GST ({formData.gstRate}%): ₹{((parseFloat(formData.amount) || 0) * (parseFloat(formData.gstRate) || 0) / 100).toFixed(2)}</p>
                      <p className="font-semibold">Total: ₹{((parseFloat(formData.amount) || 0) * (1 + (parseFloat(formData.gstRate) || 0) / 100)).toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700"
              >
                Add Transaction
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default AddTransaction;
