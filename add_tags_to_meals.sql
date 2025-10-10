-- Add tags column to meals table
-- This column will store meal tags as a JSON array

ALTER TABLE meals
ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- Add a comment to explain the column
COMMENT ON COLUMN meals.tags IS 'Array of tags for categorizing meals (stored as JSONB)';

-- Create an index on tags for better search performance
CREATE INDEX idx_meals_tags ON meals USING GIN (tags);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'meals'
AND column_name = 'tags';