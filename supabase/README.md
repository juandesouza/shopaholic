# Supabase Setup

## Shopping Lists Table Schema

This migration creates a `shopping_lists` table with the following structure:

### Table: `shopping_lists`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `items` | TEXT[] | Array of strings representing shopping list items |
| `created_at` | TIMESTAMPTZ | Timestamp when the record was created |
| `updated_at` | TIMESTAMPTZ | Timestamp when the record was last updated |

### Features

- **Automatic timestamps**: `created_at` and `updated_at` are automatically managed
- **Auto-update trigger**: `updated_at` is automatically updated whenever a row is modified
- **Row Level Security (RLS)**: Enabled for security (policy allows all operations by default)
- **Index**: Created on `created_at` for better query performance

## Running the Migration

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_shopping_lists_table.sql`
4. Run the SQL

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

### Option 3: Direct SQL Execution

Copy the SQL from the migration file and execute it directly in your Supabase SQL editor.

## Example Usage

### Insert a new shopping list:
```sql
INSERT INTO shopping_lists (items)
VALUES (ARRAY['Milk', 'Bread', 'Eggs']);
```

### Query all shopping lists:
```sql
SELECT * FROM shopping_lists ORDER BY created_at DESC;
```

### Update items in a shopping list:
```sql
UPDATE shopping_lists
SET items = ARRAY['Milk', 'Bread', 'Eggs', 'Butter']
WHERE id = 'your-uuid-here';
```

### Add an item to an existing list:
```sql
UPDATE shopping_lists
SET items = array_append(items, 'New Item')
WHERE id = 'your-uuid-here';
```

## Security Notes

⚠️ **Important**: The current policy allows all operations. For production:

1. Set up authentication (Supabase Auth)
2. Add a `user_id` column to associate lists with users
3. Update the RLS policy to restrict access:

```sql
-- Example production policy
CREATE POLICY "Users can only see their own lists" ON shopping_lists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own lists" ON shopping_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own lists" ON shopping_lists
  FOR UPDATE
  USING (auth.uid() = user_id);
```

