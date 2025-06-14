import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Download, IndianRupee, FileText, FileArchive } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';

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
  categories?: { name: string };
  invoice_url?: string;
}

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading transactions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDownloadInvoice = async (invoiceUrl: string, vendorName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('invoices')
        .download(invoiceUrl);

      if (error) throw error;

      // Get the file extension from the URL
      const fileExtension = invoiceUrl.split('.').pop()?.toLowerCase() || 'pdf';
      const mimeType = fileExtension === 'pdf' ? 'application/pdf' : 
                      fileExtension === 'png' ? 'image/png' : 
                      fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' : 
                      'application/octet-stream';

      // Create a blob with the correct mime type
      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      // Use the original file extension
      const fileName = `invoice-${vendorName}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error downloading invoice",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadAllInvoices = async () => {
    if (!user) return;
    
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      const transactionsWithInvoices = transactions.filter(t => t.invoice_url);

      // Download all invoices
      const downloadPromises = transactionsWithInvoices.map(async (transaction) => {
        if (!transaction.invoice_url) return;

        const { data, error } = await supabase.storage
          .from('invoices')
          .download(transaction.invoice_url);

        if (error) throw error;

        // Add file to zip with a descriptive name
        const fileName = `invoice-${transaction.vendor_name}-${transaction.transaction_date}.pdf`;
        zip.file(fileName, data);
      });

      await Promise.all(downloadPromises);

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-invoices-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "All invoices downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error downloading invoices",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloadingZip(false);
    }
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
        <div className="flex items-center space-x-4 max-w-6xl mx-auto">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Transactions</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadAllInvoices}
              disabled={downloadingZip || !transactions.some(t => t.invoice_url)}
            >
              <FileArchive className="w-4 h-4 mr-2" />
              {downloadingZip ? "Downloading..." : "Download All"}
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Filters */}
        <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <h3 className="font-semibold text-gray-800">{transaction.vendor_name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {transaction.categories?.name || 'Uncategorized'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.transaction_date)}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className={`flex items-center space-x-1 ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span className="text-sm">{transaction.type === 'income' ? '+' : '-'}</span>
                        <IndianRupee className="w-4 h-4" />
                        <span className="text-lg font-bold">{formatCurrency(transaction.amount)}</span>
                      </div>
                      <p className="text-xs text-gray-600">GST: ₹{formatCurrency(transaction.gst_amount)} ({transaction.gst_rate}%)</p>
                      {transaction.invoice_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleDownloadInvoice(transaction.invoice_url!, transaction.vendor_name)}
                        >
                          <FileText className="w-4 h-4" />
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No transactions found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default Transactions;
