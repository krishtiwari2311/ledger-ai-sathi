import { supabase } from './integrations/supabase/client';
import { useAuth } from './hooks/useAuth';

async function testInvoiceFunctionality() {
  try {
    // 1. Upload test invoice to Supabase storage
    const testInvoiceFile = new File(['test-invoice.pdf'], 'test-invoice.pdf', { type: 'application/pdf' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(`test-${Date.now()}.pdf`, testInvoiceFile);

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
        invoice_url: uploadData.path
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    console.log('Test transaction created:', transactionData);
    console.log('Invoice URL:', uploadData.path);

    // 3. Test download functionality
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('invoices')
      .download(uploadData.path);

    if (downloadError) throw downloadError;

    console.log('Invoice download successful!');
    console.log('File size:', downloadData.size, 'bytes');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testInvoiceFunctionality(); 