-- Fix RLS policies to work correctly with Supabase auth
-- The issue is that auth.uid() might not match the user_id being inserted/queried

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can insert their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete their own shopping lists" ON shopping_lists;

-- Allow users to see only their own lists
-- Use auth.uid() which is the authenticated user's ID from the JWT token
CREATE POLICY "Users can view their own shopping lists" ON shopping_lists
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own lists
-- The WITH CHECK ensures user_id matches the authenticated user
CREATE POLICY "Users can insert their own shopping lists" ON shopping_lists
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own lists
CREATE POLICY "Users can update their own shopping lists" ON shopping_lists
  FOR UPDATE
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to delete their own lists
CREATE POLICY "Users can delete their own shopping lists" ON shopping_lists
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

