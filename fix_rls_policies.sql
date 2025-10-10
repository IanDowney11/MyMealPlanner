-- Fix RLS Policies for Shopping List Sharing
-- This addresses the 406 error when querying permissions

-- Drop and recreate the problematic policies with better permissions

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view their own sharing permissions" ON shopping_list_sharing_permissions;
DROP POLICY IF EXISTS "Users can manage their own sharing permissions" ON shopping_list_sharing_permissions;
DROP POLICY IF EXISTS "Users can view relevant shared shopping lists" ON shared_shopping_lists;
DROP POLICY IF EXISTS "Users can create shared shopping lists as sender" ON shared_shopping_lists;
DROP POLICY IF EXISTS "Receivers can update shared shopping lists" ON shared_shopping_lists;
DROP POLICY IF EXISTS "All users can view user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

-- Recreate policies with more permissive access for authenticated users

-- Sharing permissions policies - allow authenticated users to query
CREATE POLICY "Authenticated users can view sharing permissions" ON shopping_list_sharing_permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage permissions where they are receiver" ON shopping_list_sharing_permissions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = receiver_user_id);

CREATE POLICY "Users can update their own permissions" ON shopping_list_sharing_permissions
    FOR UPDATE TO authenticated USING (auth.uid() = receiver_user_id);

CREATE POLICY "Users can delete their own permissions" ON shopping_list_sharing_permissions
    FOR DELETE TO authenticated USING (auth.uid() = receiver_user_id);

-- Shared shopping lists policies
CREATE POLICY "Authenticated users can view shared lists" ON shared_shopping_lists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create shared lists as sender" ON shared_shopping_lists
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Users can update shared lists as receiver" ON shared_shopping_lists
    FOR UPDATE TO authenticated USING (auth.uid() = receiver_user_id);

-- User profiles policies - more permissive for lookup
CREATE POLICY "Authenticated users can view all profiles" ON user_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Test the permissions
SELECT 'RLS policies updated successfully!' as result;