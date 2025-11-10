-- Simplified RLS policies for testing
-- This temporarily allows authenticated users to see/insert their own data
-- We'll make it more secure later once we confirm it works

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can insert their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete their own shopping lists" ON shopping_lists;

-- Simplified policies - allow if user_id matches auth.uid() OR if user_id is NULL (for testing)
-- This will help us see if the issue is with the UUID comparison
CREATE POLICY "Users can view their own shopping lists" ON shopping_lists
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can insert their own shopping lists" ON shopping_lists
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL
  );

CREATE POLICY "Users can update their own shopping lists" ON shopping_lists
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    user_id IS NULL
  )
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL
  );

CREATE POLICY "Users can delete their own shopping lists" ON shopping_lists
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    user_id IS NULL
  );

