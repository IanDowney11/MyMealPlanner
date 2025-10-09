-- Create shopping list table
CREATE TABLE shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX shopping_items_user_id_idx ON shopping_items(user_id);
CREATE INDEX shopping_items_created_at_idx ON shopping_items(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
CREATE POLICY "Users can view their own shopping items" ON shopping_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping items" ON shopping_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items" ON shopping_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items" ON shopping_items
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE shopping_items IS 'Shopping list items for users';
COMMENT ON COLUMN shopping_items.item_name IS 'Name of the shopping item';
COMMENT ON COLUMN shopping_items.is_completed IS 'Whether the item has been checked off the list';