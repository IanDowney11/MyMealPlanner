-- Migration: Add user_settings table for timezone preferences
-- Date: 2025-11-09
-- Description: Adds user_settings table to store user preferences including timezone

-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Add table and column comments
COMMENT ON TABLE user_settings IS 'User preferences and settings including timezone';
COMMENT ON COLUMN user_settings.timezone IS 'User timezone preference (IANA timezone identifier)';

-- Success message
SELECT 'User settings table created successfully!' as result;
