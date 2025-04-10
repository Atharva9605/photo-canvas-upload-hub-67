
-- Create a function that creates the csv_data table if it doesn't exist
CREATE OR REPLACE FUNCTION create_csv_data_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'csv_data'
  ) THEN
    -- Create the table
    CREATE TABLE public.csv_data (
      id UUID PRIMARY KEY,
      data JSONB NOT NULL,
      file_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Add RLS policies
    ALTER TABLE public.csv_data ENABLE ROW LEVEL SECURITY;
    
    -- Grant access to authenticated users
    CREATE POLICY "Users can view their own data" 
    ON public.csv_data FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own data" 
    ON public.csv_data FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own data" 
    ON public.csv_data FOR UPDATE
    USING (auth.uid() = user_id);
    
    -- Add user_id column and default constraint
    ALTER TABLE public.csv_data ADD COLUMN user_id UUID REFERENCES auth.users(id);
    ALTER TABLE public.csv_data ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END;
$$;
