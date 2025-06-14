-- Create the invoices storage bucket using the storage API
SELECT storage.create_bucket('invoices', 'invoices', false);

-- Create policy to allow authenticated users to upload their own invoices
CREATE POLICY "Users can upload their own invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to read their own invoices
CREATE POLICY "Users can read their own invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to update their own invoices
CREATE POLICY "Users can update their own invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own invoices
CREATE POLICY "Users can delete their own invoices"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
); 