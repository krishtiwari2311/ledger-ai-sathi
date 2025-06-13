import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";
import VoiceInput from "@/components/VoiceInput";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { Database } from "@/integrations/supabase/types";

type TransactionType = Database["public"]["Enums"]["transaction_type"];
type GSTRate = Database["public"]["Enums"]["gst_rate"];

interface FormData {
  type: TransactionType | "";
  vendor: string;
  amount: string;
  gstRate: GSTRate;
  description: string;
  date: string;
  category_id: string;
}

// Add speech synthesis interface
interface SpeechSynthesis extends Window {
  speechSynthesis: {
    speak: (utterance: SpeechSynthesisUtterance) => void;
    cancel: () => void;
  };
}

const AddTransaction = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: "",
    vendor: "",
    amount: "",
    gstRate: "18",
    description: "",
    date: new Date().toISOString().split('T')[0],
    category_id: ""
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { refetch } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);

  const validateForm = () => {
    if (!formData.type) {
      toast({
        title: "Error",
        description: "Please select a transaction type",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.vendor) {
      toast({
        title: "Error",
        description: "Please enter a vendor name",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.category_id) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const calculateGSTAmount = (amount: number, rate: string) => {
    return Math.round((amount * (parseInt(rate) / 100)) * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a transaction",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);

      const { error } = await supabase
        .from('transactions')
        .insert({
          type: formData.type as TransactionType,
          vendor_name: formData.vendor,
          amount: amount,
          gst_rate: formData.gstRate,
          description: formData.description,
          transaction_date: formData.date,
          category_id: formData.category_id,
          user_id: user.id,
          is_voice_entry: isListening
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `₹${amount.toLocaleString()} transaction recorded successfully!`
      });

      // Reset form
      setFormData({
        type: "",
        vendor: "",
        amount: "",
        gstRate: "18",
        description: "",
        date: new Date().toISOString().split('T')[0],
        category_id: ""
      });
      
      // Refetch transactions to update the dashboard
      await refetch();
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const findMatchingCategory = (description: string, type: "income" | "expense") => {
    const lowerDesc = description.toLowerCase();
    console.log("Finding category for:", { description: lowerDesc, type });
    
    // Income categories
    if (type === "income") {
      if (lowerDesc.includes("sale") || lowerDesc.includes("revenue")) {
        const category = categories.find(cat => 
          cat.name.toLowerCase().includes("sales revenue") || 
          cat.name.toLowerCase().includes("sales")
        );
        console.log("Found income category (sales):", category);
        return category;
      }
      if (lowerDesc.includes("consult") || lowerDesc.includes("service")) {
        const category = categories.find(cat => 
          cat.name.toLowerCase().includes("consulting") || 
          cat.name.toLowerCase().includes("services")
        );
        console.log("Found income category (consulting):", category);
        return category;
      }
      const category = categories.find(cat => cat.name.toLowerCase().includes("other income"));
      console.log("Found income category (other):", category);
      return category;
    }
    
    // Expense categories
    if (lowerDesc.includes("office") || lowerDesc.includes("supply") || lowerDesc.includes("stationery") || lowerDesc.includes("chair")) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes("office supplies") || 
        cat.name.toLowerCase().includes("office")
      );
      console.log("Found expense category (office):", category);
      return category;
    }
    if (lowerDesc.includes("travel") || lowerDesc.includes("transport")) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes("travel") || 
        cat.name.toLowerCase().includes("transportation")
      );
      console.log("Found expense category (travel):", category);
      return category;
    }
    if (lowerDesc.includes("service") || lowerDesc.includes("consult")) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes("professional services") || 
        cat.name.toLowerCase().includes("services")
      );
      console.log("Found expense category (services):", category);
      return category;
    }
    if (lowerDesc.includes("market") || lowerDesc.includes("advert")) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes("marketing") || 
        cat.name.toLowerCase().includes("advertising")
      );
      console.log("Found expense category (marketing):", category);
      return category;
    }
    if (lowerDesc.includes("utility") || lowerDesc.includes("bill") || lowerDesc.includes("electric") || lowerDesc.includes("internet")) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes("utilities") || 
        cat.name.toLowerCase().includes("bills")
      );
      console.log("Found expense category (utilities):", category);
      return category;
    }
    if (lowerDesc.includes("software") || lowerDesc.includes("equipment") || lowerDesc.includes("hardware")) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes("equipment") || 
        cat.name.toLowerCase().includes("software")
      );
      console.log("Found expense category (equipment):", category);
      return category;
    }
    
    const category = categories.find(cat => cat.name.toLowerCase().includes("other expenses"));
    console.log("Found expense category (other):", category);
    return category;
  };

  // Function to provide voice feedback
  const provideVoiceFeedback = (formData: FormData) => {
    const synth = (window as unknown as SpeechSynthesis).speechSynthesis;
    synth.cancel(); // Cancel any ongoing speech

    const feedback = new SpeechSynthesisUtterance();
    feedback.text = `I understood you want to record a ${formData.type} of ₹${formData.amount} to ${formData.vendor} for ${formData.description}. The category is set to ${categories.find(c => c.id === formData.category_id)?.name || 'Not selected'}. Please verify the details and click save if correct.`;
    feedback.rate = 0.9; // Slightly slower rate for better clarity
    feedback.pitch = 1;
    feedback.volume = 1;

    // Use Indian English voice if available
    const voices = synth.getVoices();
    const indianVoice = voices.find(voice => voice.lang.includes('en-IN'));
    if (indianVoice) {
      feedback.voice = indianVoice;
    }

    synth.speak(feedback);
  };

  const handleVoiceResult = (result: string) => {
    console.log("Voice input received:", result);
    
    // Determine transaction type
    const isExpense = result.toLowerCase().includes("paid") || 
                     result.toLowerCase().includes("spent") ||
                     result.toLowerCase().includes("bought") ||
                     result.toLowerCase().includes("purchased") ||
                     result.toLowerCase().includes("for");
    
    // Extract amount
    const amountMatch = result.match(/(\d+)/);
    const amount = amountMatch ? amountMatch[1] : "";
    
    // Extract vendor - improved regex to stop at "for" and other prepositions
    const vendorMatch = result.match(/(?:to|from)\s+([a-zA-Z0-9\s]+?)(?:\s+for|\s+on|\s+about|\s+regarding|$)/i);
    const vendor = vendorMatch ? vendorMatch[1].trim() : "";
    
    // Find matching category
    const matchingCategory = findMatchingCategory(result, isExpense ? "expense" : "income");
    console.log("Matching category found:", matchingCategory);
    
    // Update form data
    const newFormData = {
      type: isExpense ? "expense" : "income",
      amount,
      vendor,
      description: result,
      category_id: matchingCategory?.id || "",
      gstRate: "18" as const,
      date: new Date().toISOString().split('T')[0]
    };
    
    console.log("Updating form with:", newFormData);
    setFormData(newFormData);

    // Provide voice feedback after a short delay
    setTimeout(() => {
      provideVoiceFeedback(newFormData);
    }, 500);
  };

  const filteredCategories = categories.filter(cat => {
    if (!formData.type) return true; // Show all categories if no type selected
    return formData.type === "income" ? 
      cat.name.toLowerCase().includes("income") || cat.name.toLowerCase().includes("revenue") :
      cat.name.toLowerCase().includes("expense") || cat.name.toLowerCase().includes("cost");
  });

  return (
    <div className="container mx-auto py-8">
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
                <Select 
                  value={formData.type} 
                  onValueChange={(value: TransactionType) => {
                    console.log("Type changed to:", value);
                    setFormData(prev => ({
                      ...prev,
                      type: value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type">
                      {formData.type && formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => {
                    console.log("Category changed to:", value);
                    setFormData(prev => ({
                      ...prev,
                      category_id: value
                    }));
                  }}
                  disabled={!formData.type || categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category">
                      {formData.category_id && categories.find(c => c.id === formData.category_id)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => {
                      console.log("Amount changed to:", e.target.value);
                      setFormData(prev => ({...prev, amount: e.target.value}));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstRate">GST Rate (%)</Label>
                  <Select 
                    value={formData.gstRate} 
                    onValueChange={(value: "0" | "5" | "12" | "18" | "28") => {
                      console.log("GST rate changed to:", value);
                      setFormData(prev => ({...prev, gstRate: value}));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select GST rate">
                        {formData.gstRate}%
                      </SelectValue>
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
                <Label htmlFor="vendor">Vendor/Client</Label>
                <Input
                  id="vendor"
                  placeholder="e.g., Amazon, Client Name"
                  value={formData.vendor}
                  onChange={(e) => {
                    console.log("Vendor changed to:", e.target.value);
                    setFormData(prev => ({...prev, vendor: e.target.value}));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the transaction"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                />
              </div>

              {/* GST Calculation Preview */}
              {formData.amount && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-blue-800 mb-2">GST Calculation</h4>
                    <div className="space-y-1 text-sm">
                      <p>Base Amount: ₹{parseFloat(formData.amount).toLocaleString()}</p>
                      <p>GST ({formData.gstRate}%): ₹{calculateGSTAmount(parseFloat(formData.amount), formData.gstRate).toLocaleString()}</p>
                      <p className="font-semibold">Total: ₹{(parseFloat(formData.amount) + calculateGSTAmount(parseFloat(formData.amount), formData.gstRate)).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Transaction"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTransaction;
