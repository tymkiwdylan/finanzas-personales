-- Add user_id column to expenses table
ALTER TABLE expenses 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id column to incomes table
ALTER TABLE incomes 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create indexes for better query performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Add Row Level Security (RLS) policies to ensure users can only access their own data
-- Enable RLS on tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses table
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for incomes table
CREATE POLICY "Users can view their own incomes"
  ON incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incomes"
  ON incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incomes"
  ON incomes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own incomes"
  ON incomes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for user_settings table
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- For existing data migration (if there are existing users)
-- This must be customized based on your specific situation
-- For example, if you have only one user currently using the app:
/*
-- Get the first authenticated user (if any)
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Assign all existing expenses to the first user
    UPDATE expenses SET user_id = first_user_id WHERE user_id IS NULL;
    
    -- Assign all existing incomes to the first user
    UPDATE incomes SET user_id = first_user_id WHERE user_id IS NULL;
    
    -- Assign all existing user_settings to the first user
    UPDATE user_settings SET user_id = first_user_id WHERE user_id IS NULL;
  END IF;
END $$;
*/

-- After migration is complete, make user_id NOT NULL (optional, depending on your requirements)
/*
ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE incomes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_settings ALTER COLUMN user_id SET NOT NULL;
*/
