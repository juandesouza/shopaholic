-- Rollback to working state: Disable RLS and make user_id optional
-- This restores the app to the original working configuration

-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can insert their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Allow all operations on shopping_lists" ON shopping_lists;

-- Make user_id nullable (optional) so existing code works
ALTER TABLE shopping_lists 
ALTER COLUMN user_id DROP NOT NULL;

-- Restore the original permissive policy (allow all operations)
CREATE POLICY "Allow all operations on shopping_lists" ON shopping_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);

