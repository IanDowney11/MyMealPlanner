-- MyMealPlanner Database Schema
-- Complete schema for the meal planning application
-- For use with Supabase PostgreSQL database

-- =============================================================================
-- MAIN TABLES
-- =============================================================================

-- Meals table - stores individual meal recipes
CREATE TABLE IF NOT EXISTS meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT, -- Base64 encoded image or URL
    rating INTEGER CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    url TEXT, -- URL to recipe source
    tags JSONB DEFAULT '[]'::jsonb, -- Array of tag strings
    versions JSONB DEFAULT '[]'::jsonb -- Array of meal version strings
);

-- Meal plans table - stores planned meals for specific dates
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    meal_data JSONB NOT NULL, -- Complete meal object stored as JSON
    selected_version TEXT, -- Which version of the meal was selected
    last_cooked DATE, -- When this meal was last cooked
    cook_count INTEGER DEFAULT 0, -- How many times this meal has been cooked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Ensure one meal per date per user
    UNIQUE(user_id, date)
);

-- Shopping list items table
CREATE TABLE IF NOT EXISTS shopping_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================================================
-- SHARING FUNCTIONALITY TABLES
-- =============================================================================

-- User profiles table - stores user profile information for sharing
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping list sharing permissions table
-- The receiver grants permission to the sender to share shopping lists
CREATE TABLE IF NOT EXISTS shopping_list_sharing_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure each sender can only have one permission per receiver
    UNIQUE(receiver_user_id, sender_email)
);

-- Shared shopping lists table
CREATE TABLE IF NOT EXISTS shared_shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_email TEXT NOT NULL,
    receiver_email TEXT NOT NULL,
    list_name TEXT NOT NULL DEFAULT 'Shared Shopping List',
    items JSONB NOT NULL DEFAULT '[]', -- Array of {item_name: string, is_completed: boolean}
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE -- Whether the receiver has processed this share
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Meals table indexes
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON meals(user_id);
CREATE INDEX IF NOT EXISTS meals_created_at_idx ON meals(created_at);

-- Meal plans table indexes
CREATE INDEX IF NOT EXISTS meal_plans_user_id_idx ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS meal_plans_date_idx ON meal_plans(date);
CREATE INDEX IF NOT EXISTS meal_plans_user_date_idx ON meal_plans(user_id, date);

-- Shopping items table indexes
CREATE INDEX IF NOT EXISTS shopping_items_user_id_idx ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS shopping_items_created_at_idx ON shopping_items(created_at);

-- Sharing tables indexes
CREATE INDEX IF NOT EXISTS idx_shared_lists_receiver ON shared_shopping_lists (receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_sender ON shared_shopping_lists (sender_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_processed ON shared_shopping_lists (processed);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_sharing_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_shopping_lists ENABLE ROW LEVEL SECURITY;

-- Meals table policies
CREATE POLICY IF NOT EXISTS "Users can view their own meals" ON meals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own meals" ON meals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own meals" ON meals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own meals" ON meals
    FOR DELETE USING (auth.uid() = user_id);

-- Meal plans table policies
CREATE POLICY IF NOT EXISTS "Users can view their own meal plans" ON meal_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own meal plans" ON meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own meal plans" ON meal_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own meal plans" ON meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Shopping items table policies
CREATE POLICY IF NOT EXISTS "Users can view their own shopping items" ON shopping_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own shopping items" ON shopping_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own shopping items" ON shopping_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own shopping items" ON shopping_items
    FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY IF NOT EXISTS "All users can view user profiles" ON user_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Users can manage their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Sharing permissions policies
CREATE POLICY IF NOT EXISTS "Users can view their own sharing permissions" ON shopping_list_sharing_permissions
    FOR SELECT USING (auth.uid() = receiver_user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their own sharing permissions" ON shopping_list_sharing_permissions
    FOR ALL USING (auth.uid() = receiver_user_id);

-- Shared shopping lists policies
CREATE POLICY IF NOT EXISTS "Users can view relevant shared shopping lists" ON shared_shopping_lists
    FOR SELECT USING (auth.uid() = sender_user_id OR auth.uid() = receiver_user_id);

CREATE POLICY IF NOT EXISTS "Users can create shared shopping lists as sender" ON shared_shopping_lists
    FOR INSERT WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY IF NOT EXISTS "Receivers can update shared shopping lists" ON shared_shopping_lists
    FOR UPDATE USING (auth.uid() = receiver_user_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get user ID by email
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id
    FROM user_profiles
    WHERE email = user_email;

    RETURN user_id;
END;
$$;

-- Function to check if sharing is allowed
CREATE OR REPLACE FUNCTION is_sharing_allowed(sender_email TEXT, receiver_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    receiver_id UUID;
    permission_exists BOOLEAN;
BEGIN
    -- Get receiver user ID
    SELECT get_user_id_by_email(receiver_email) INTO receiver_id;

    IF receiver_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if permission exists
    SELECT EXISTS(
        SELECT 1 FROM shopping_list_sharing_permissions
        WHERE receiver_user_id = receiver_id
        AND sender_email = sender_email
    ) INTO permission_exists;

    RETURN permission_exists;
END;
$$;

-- =============================================================================
-- TABLE COMMENTS AND DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE meals IS 'Individual meal recipes created by users';
COMMENT ON TABLE meal_plans IS 'Planned meals for specific dates with tracking data';
COMMENT ON TABLE shopping_items IS 'Shopping list items for users';
COMMENT ON TABLE user_profiles IS 'User profile information including email for lookup';
COMMENT ON TABLE shopping_list_sharing_permissions IS 'Permissions for users to share shopping lists with each other';
COMMENT ON TABLE shared_shopping_lists IS 'Shared shopping lists between users';

-- Column comments for meals table
COMMENT ON COLUMN meals.title IS 'Name of the meal/recipe';
COMMENT ON COLUMN meals.description IS 'Optional description of the meal';
COMMENT ON COLUMN meals.image IS 'Base64 encoded image or image URL';
COMMENT ON COLUMN meals.rating IS 'User rating from 0-5 stars';
COMMENT ON COLUMN meals.url IS 'URL to the original recipe source';
COMMENT ON COLUMN meals.tags IS 'Array of tag strings for categorization';
COMMENT ON COLUMN meals.versions IS 'Array of meal version strings (e.g., ["with brown rice", "vegetarian option"])';

-- Column comments for meal_plans table
COMMENT ON COLUMN meal_plans.date IS 'Date when the meal is planned';
COMMENT ON COLUMN meal_plans.meal_data IS 'Complete meal object stored as JSON';
COMMENT ON COLUMN meal_plans.selected_version IS 'Which version of the meal was selected for this plan';
COMMENT ON COLUMN meal_plans.last_cooked IS 'Date when this meal was last cooked';
COMMENT ON COLUMN meal_plans.cook_count IS 'Number of times this meal has been cooked';

-- Column comments for shopping items table
COMMENT ON COLUMN shopping_items.item_name IS 'Name of the shopping item';
COMMENT ON COLUMN shopping_items.is_completed IS 'Whether the item has been checked off the list';

-- Column comments for sharing tables
COMMENT ON COLUMN shopping_list_sharing_permissions.receiver_user_id IS 'The user who grants permission to receive shared lists';
COMMENT ON COLUMN shopping_list_sharing_permissions.sender_email IS 'Email address of the user allowed to send shopping lists';
COMMENT ON COLUMN shared_shopping_lists.items IS 'JSON array of shopping list items with their completion status';
COMMENT ON COLUMN shared_shopping_lists.processed IS 'Whether the receiver has processed this shared list';

-- Success message
SELECT 'MyMealPlanner Database Schema created successfully!' as result;