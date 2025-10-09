-- Drop the existing shopping_items table if it exists
DROP TABLE IF EXISTS shopping_items;

-- Create frequently purchased items table
CREATE TABLE frequent_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shopping lists table (only one active at a time per user)
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Shopping List',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shopping list items table
CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX frequent_items_user_id_idx ON frequent_items(user_id);
CREATE INDEX shopping_lists_user_id_idx ON shopping_lists(user_id);
CREATE INDEX shopping_list_items_list_id_idx ON shopping_list_items(shopping_list_id);

-- Enable Row Level Security (RLS)
ALTER TABLE frequent_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for frequent_items
CREATE POLICY "Users can view their own frequent items" ON frequent_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own frequent items" ON frequent_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own frequent items" ON frequent_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own frequent items" ON frequent_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for shopping_lists
CREATE POLICY "Users can view their own shopping lists" ON shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists" ON shopping_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists" ON shopping_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for shopping_list_items
CREATE POLICY "Users can view items in their shopping lists" ON shopping_list_items
  FOR SELECT USING (shopping_list_id IN (SELECT id FROM shopping_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert items into their shopping lists" ON shopping_list_items
  FOR INSERT WITH CHECK (shopping_list_id IN (SELECT id FROM shopping_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can update items in their shopping lists" ON shopping_list_items
  FOR UPDATE USING (shopping_list_id IN (SELECT id FROM shopping_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete items from their shopping lists" ON shopping_list_items
  FOR DELETE USING (shopping_list_id IN (SELECT id FROM shopping_lists WHERE user_id = auth.uid()));

-- Add comments
COMMENT ON TABLE frequent_items IS 'Frequently purchased items that users can add to shopping lists';
COMMENT ON TABLE shopping_lists IS 'Shopping lists (one active at a time per user)';
COMMENT ON TABLE shopping_list_items IS 'Items in a specific shopping list';

-- Ensure only one active shopping list per user
CREATE UNIQUE INDEX shopping_lists_one_per_user_idx ON shopping_lists(user_id);