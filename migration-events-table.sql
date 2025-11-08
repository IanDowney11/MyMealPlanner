-- Migration: Add Events Table with Monthly Recurring Support
-- This creates the events table for tracking one-time, weekly, and monthly recurring events

-- Create events table if it doesn't exist (base version)
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('one-time', 'weekly', 'monthly')),
    date DATE NOT NULL, -- Reference date for the event
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add monthly recurring fields if they don't exist
DO $$
BEGIN
    -- Add monthly_pattern column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'events' AND column_name = 'monthly_pattern'
    ) THEN
        ALTER TABLE events ADD COLUMN monthly_pattern TEXT
            CHECK (monthly_pattern IN ('date', 'day-of-week') OR monthly_pattern IS NULL);
    END IF;

    -- Add monthly_week column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'events' AND column_name = 'monthly_week'
    ) THEN
        ALTER TABLE events ADD COLUMN monthly_week TEXT
            CHECK (monthly_week IN ('first', 'second', 'third', 'fourth', 'last') OR monthly_week IS NULL);
    END IF;

    -- Add monthly_day_of_week column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'events' AND column_name = 'monthly_day_of_week'
    ) THEN
        ALTER TABLE events ADD COLUMN monthly_day_of_week INTEGER
            CHECK (monthly_day_of_week BETWEEN 0 AND 6 OR monthly_day_of_week IS NULL);
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_type_idx ON events(type);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Create RLS Policies
CREATE POLICY "Users can view their own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
    FOR DELETE USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE events IS 'Calendar events for meal planning (one-time, weekly, and monthly recurring)';
COMMENT ON COLUMN events.title IS 'Event title/description';
COMMENT ON COLUMN events.type IS 'Event recurrence type: one-time, weekly, or monthly';
COMMENT ON COLUMN events.date IS 'Reference date for the event';
COMMENT ON COLUMN events.monthly_pattern IS 'For monthly events: whether to repeat by date (15th) or day-of-week (first Tuesday)';
COMMENT ON COLUMN events.monthly_week IS 'For day-of-week monthly events: which week of the month (first, second, third, fourth, last)';
COMMENT ON COLUMN events.monthly_day_of_week IS 'For day-of-week monthly events: which day of the week (0=Sunday, 6=Saturday)';

-- Success message
SELECT 'Events table created successfully with monthly recurring support!' as result;
