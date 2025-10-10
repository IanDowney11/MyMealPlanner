-- Shopping List Sharing Schema (Fixed Version)
-- This SQL script creates the necessary tables for private shopping list sharing

-- Table to store sharing permissions between users
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

-- Table to store shared shopping lists
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_lists_receiver ON shared_shopping_lists (receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_sender ON shared_shopping_lists (sender_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_processed ON shared_shopping_lists (processed);

-- Add user profiles table to store email addresses for easier lookup
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE shopping_list_sharing_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Sharing permissions policies
-- Users can only see permissions where they are the receiver
CREATE POLICY "Users can view their own sharing permissions" ON shopping_list_sharing_permissions
    FOR SELECT USING (auth.uid() = receiver_user_id);

-- Users can only create/update/delete permissions where they are the receiver
CREATE POLICY "Users can manage their own sharing permissions" ON shopping_list_sharing_permissions
    FOR ALL USING (auth.uid() = receiver_user_id);

-- Shared shopping lists policies
-- Users can view shared lists where they are either sender or receiver
CREATE POLICY "Users can view relevant shared shopping lists" ON shared_shopping_lists
    FOR SELECT USING (auth.uid() = sender_user_id OR auth.uid() = receiver_user_id);

-- Users can create shared lists where they are the sender
CREATE POLICY "Users can create shared shopping lists as sender" ON shared_shopping_lists
    FOR INSERT WITH CHECK (auth.uid() = sender_user_id);

-- Users can update shared lists where they are the receiver (to mark as processed)
CREATE POLICY "Receivers can update shared shopping lists" ON shared_shopping_lists
    FOR UPDATE USING (auth.uid() = receiver_user_id);

-- User profiles policies
-- Users can view all profiles (needed for email lookup)
CREATE POLICY "All users can view user profiles" ON user_profiles
    FOR SELECT TO authenticated USING (true);

-- Users can only insert/update their own profile
CREATE POLICY "Users can manage their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Functions to help with sharing workflow

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

-- Comments for documentation
COMMENT ON TABLE shopping_list_sharing_permissions IS 'Stores permissions for users to share shopping lists with each other';
COMMENT ON TABLE shared_shopping_lists IS 'Stores shared shopping lists between users';
COMMENT ON TABLE user_profiles IS 'Stores user profile information including email for lookup';

COMMENT ON COLUMN shopping_list_sharing_permissions.receiver_user_id IS 'The user who grants permission to receive shared lists';
COMMENT ON COLUMN shopping_list_sharing_permissions.sender_email IS 'Email address of the user allowed to send shopping lists';

COMMENT ON COLUMN shared_shopping_lists.items IS 'JSON array of shopping list items with their completion status';
COMMENT ON COLUMN shared_shopping_lists.processed IS 'Whether the receiver has processed this shared list';

-- Note: User profiles will be created automatically by the application when needed
-- This avoids potential authentication issues with database triggers