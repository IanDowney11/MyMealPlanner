-- Add versions column to meals table
ALTER TABLE meals ADD COLUMN versions JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN meals.versions IS 'Array of meal version strings (e.g., ["with brown rice", "on zucchini noodles"])';