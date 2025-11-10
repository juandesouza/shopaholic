-- Add user_id column to shopping_lists table
ALTER TABLE shopping_lists 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);

-- Update RLS policy to be user-specific
DROP POLICY IF EXISTS "Allow all operations on shopping_lists" ON shopping_lists;

-- Allow users to see only their own lists
CREATE POLICY "Users can view their own shopping lists" ON shopping_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own lists
CREATE POLICY "Users can insert their own shopping lists" ON shopping_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own lists
CREATE POLICY "Users can update their own shopping lists" ON shopping_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own lists
CREATE POLICY "Users can delete their own shopping lists" ON shopping_lists
  FOR DELETE
  USING (auth.uid() = user_id);

