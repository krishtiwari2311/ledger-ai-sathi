
-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Create enum for GST rates
CREATE TYPE gst_rate AS ENUM ('0', '5', '12', '18', '28');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  business_type TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create categories table for transaction categorization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  vendor_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  gst_rate gst_rate NOT NULL DEFAULT '18',
  gst_amount DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_url TEXT,
  is_voice_entry BOOLEAN DEFAULT false,
  voice_transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, description, is_system) VALUES
  ('Office Supplies', 'Stationery, equipment, and office materials', true),
  ('Travel & Transport', 'Transportation costs and travel expenses', true),
  ('Professional Services', 'Consulting, legal, accounting services', true),
  ('Marketing & Advertising', 'Promotional activities and advertising costs', true),
  ('Utilities', 'Electricity, internet, phone bills', true),
  ('Equipment & Software', 'Hardware, software, and tools', true),
  ('Sales Revenue', 'Income from sales and services', true),
  ('Consulting Income', 'Revenue from consulting work', true),
  ('Other Income', 'Miscellaneous income sources', true),
  ('Other Expenses', 'Miscellaneous business expenses', true);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for categories (everyone can read, only system can modify system categories)
CREATE POLICY "Anyone can view categories" 
  ON public.categories 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create custom categories" 
  ON public.categories 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (is_system = false);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.email)
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically calculate GST amounts
CREATE OR REPLACE FUNCTION calculate_gst_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate GST amount based on rate
  NEW.gst_amount = ROUND((NEW.amount * (NEW.gst_rate::INTEGER / 100.0)), 2);
  
  -- Calculate total amount
  NEW.total_amount = NEW.amount + NEW.gst_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate GST on insert/update
CREATE TRIGGER calculate_gst_trigger
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_gst_amounts();
