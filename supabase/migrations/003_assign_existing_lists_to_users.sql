-- This migration assigns existing lists without user_id to users
-- Run this ONLY if you have existing lists that need to be assigned
-- 
-- Option 1: Assign all existing lists to a specific user (replace USER_ID_HERE with your actual user ID)
-- UPDATE shopping_lists 
-- SET user_id = 'USER_ID_HERE'::uuid
-- WHERE user_id IS NULL;
--
-- Option 2: Delete all lists without user_id (if they're test data)
-- DELETE FROM shopping_lists WHERE user_id IS NULL;
--
-- Option 3: Temporarily allow viewing lists without user_id (NOT RECOMMENDED for production)
-- This would require modifying the RLS policy, which is not secure

-- For now, this file is just a template
-- You need to manually run one of the options above in SQL Editor
-- To get your user ID, run: SELECT id, email FROM auth.users;

