import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, ArrowLeft, Upload, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";
import VoiceInput from "@/components/VoiceInput";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { Database } from "@/integrations/supabase/types";
import { Pie, Cell, PieChart, Tooltip, Legend } from "recharts";
import { extractTransactionData } from "@/integrations/gemini-flash/client";
import jsPDF from 'jspdf';

type TransactionType = Database["public"]["Enums"]["transaction_type"];
type GSTRate = "0" | "5" | "12" | "18" | "28";

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      let invoiceUrl = null;

      // If no file is selected, create a PDF invoice
      if (!selectedFile) {
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Set up colors
        const primaryColor = '#2563eb'; // Blue
        const textColor = '#1f2937'; // Dark gray
        const borderColor = '#e5e7eb'; // Light gray
        
        // Add header with background
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Add company name in header
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Ledger AI Sathi', 20, 25);
        
        // Add invoice title
        doc.setFontSize(16);
        doc.text('INVOICE', 150, 25);
        
        // Reset text color for body
        doc.setTextColor(textColor);
        
        // Add invoice details section
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Invoice Details:', 20, 60);
        
        // Add horizontal line
        doc.setDrawColor(borderColor);
        doc.line(20, 65, 190, 65);
        
        // Add transaction details in a table format
        const details = [
          ['Date:', formData.date],
          ['Vendor:', formData.vendor],
          ['Description:', formData.description]
        ];
        
        let y = 75;
        details.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 20, y);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 60, y);
          y += 10;
        });
        
        // Add amount details section
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Amount Details:', 20, y);
        
        // Add horizontal line
        doc.line(20, y + 5, 190, y + 5);
        
        // Add amount details in a table format
        const amountDetails = [
          ['Base Amount:', `₹${amount.toLocaleString()}`],
          ['GST Rate:', `${formData.gstRate}%`],
          ['GST Amount:', `₹${calculateGSTAmount(amount, formData.gstRate).toLocaleString()}`],
          ['Total Amount:', `₹${(amount + calculateGSTAmount(amount, formData.gstRate)).toLocaleString()}`]
        ];
        
        y += 15;
        amountDetails.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 20, y);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 120, y, { align: 'right' });
          y += 10;
        });
        
        // Add total amount with emphasis
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Total Amount Due:', 20, y);
        doc.text(`₹${(amount + calculateGSTAmount(amount, formData.gstRate)).toLocaleString()}`, 120, y, { align: 'right' });
        
        // Add footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128); // Gray color
        doc.text('Generated by Ledger AI Sathi', 105, 280, { align: 'center' });
        doc.text('This is a computer-generated invoice and does not require a signature.', 105, 285, { align: 'center' });
        
        // Convert PDF to blob
        const pdfBlob = doc.output('blob');
        const filePath = `${user.id}/${Date.now()}-invoice.pdf`;
        
        // Upload the generated invoice
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, pdfBlob);

        if (uploadError) throw uploadError;
        invoiceUrl = filePath;
      } else {
        // Upload the selected file
        const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;
        invoiceUrl = filePath;
      }

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
          is_voice_entry: isListening,
          invoice_url: invoiceUrl
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
      setSelectedFile(null);
      
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const extractedData = await extractTransactionData(file);
      console.log('Extracted data:', extractedData);

      // Find the matching category using a more flexible matching approach
      const matchingCategory = categories.find(cat => {
        const categoryName = cat.name.toLowerCase();
        const extractedCategory = extractedData.category_id?.toLowerCase() || '';
        
        // Check for exact match first
        if (categoryName === extractedCategory) return true;
        
        // Check for partial matches
        if (categoryName.includes(extractedCategory) || extractedCategory.includes(categoryName)) return true;
        
        // Special case handling for common variations
        if (extractedCategory.includes('marketing') && categoryName.includes('marketing')) return true;
        if (extractedCategory.includes('office') && categoryName.includes('office')) return true;
        if (extractedCategory.includes('travel') && categoryName.includes('travel')) return true;
        if (extractedCategory.includes('software') && categoryName.includes('equipment')) return true;
        if (extractedCategory.includes('service') && categoryName.includes('professional')) return true;
        
        return false;
      });

      console.log('Matching category found:', matchingCategory);

      // Update form with extracted data
      setFormData(prev => ({
        ...prev,
        type: extractedData.type || prev.type,
        vendor: extractedData.vendor || prev.vendor,
        amount: extractedData.amount?.toString() || prev.amount,
        gstRate: (extractedData.gstRate as GSTRate) || prev.gstRate,
        description: extractedData.description || prev.description,
        date: extractedData.date || prev.date,
        category_id: matchingCategory?.id || prev.category_id
      }));

      toast({
        title: "Success",
        description: "Bill processed successfully! Please review the details."
      });
    } catch (error: any) {
      console.error('Error processing bill:', error);
      
      let errorMessage = "Failed to process bill";
      if (error.message.includes('API key')) {
        errorMessage = "Gemini API key is not configured. Please contact your administrator.";
      } else if (error.message.includes('403')) {
        errorMessage = "Access denied. Please check your API key configuration.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCategories = categories;

  return (
    <div className="container mx-auto py-8">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Bill Upload Section */}
        <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 text-purple-600 mr-2" />
              Upload Bill/Invoice
            </CardTitle>
            <CardDescription>
              Upload a bill or invoice to automatically extract transaction details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="bill-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                  </div>
                  <input
                    id="bill-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  {isUploading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
