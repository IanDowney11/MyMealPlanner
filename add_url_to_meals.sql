-- Add URL column to meals table
-- This column will store recipe website URLs

ALTER TABLE meals
ADD COLUMN recipe_url TEXT;

-- Add a comment to explain the column
COMMENT ON COLUMN meals.recipe_url IS 'URL to the recipe website or source';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meals'
AND column_name = 'recipe_url';