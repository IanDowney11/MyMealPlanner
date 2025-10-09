-- Add selected_version column to meal_plans table
-- This column stores which version of a meal was selected when planning

ALTER TABLE meal_plans
ADD COLUMN selected_version TEXT;

-- Add a comment to explain the column
COMMENT ON COLUMN meal_plans.selected_version IS 'Stores the selected version of the meal when planning (e.g., "with brown rice")';

-- Update any existing meal_plans to have null selected_version (this is fine)
-- No update needed as new column will default to NULL

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_plans'
AND column_name = 'selected_version';