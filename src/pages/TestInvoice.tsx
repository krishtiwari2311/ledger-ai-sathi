import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const TestInvoice = () => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const runTest = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to run this test",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      // 1. Upload test invoice to Supabase storage
      const testInvoiceFile = new File(['test-invoice.pdf'], 'test-invoice.pdf', { type: 'application/pdf' });
      const filePath = `${user.id}/test-${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, testInvoiceFile);

      if (uploadError) throw uploadError;

      // 2. Create a test transaction with the invoice URL
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          type: 'expense',
          vendor_name: 'Test Vendor',
          amount: 1000,
          gst_rate: '18',
          description: 'Test transaction with invoice',
          transaction_date: new Date().toISOString().split('T')[0],
          invoice_url: filePath,
          user_id: user.id
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      toast({
        title: "Test Successful",
        description: "Test transaction created with invoice. Check the Transactions page to verify the download button.",
      });

    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Invoice Functionality</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            This test will:
            1. Upload a test invoice
            2. Create a test transaction with the invoice
            3. Verify the download functionality
          </p>
          <Button 
            onClick={runTest} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? "Running Test..." : "Run Test"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestInvoice; 