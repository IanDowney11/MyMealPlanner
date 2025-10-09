-- Add meal tracking columns to meals table
ALTER TABLE meals
ADD COLUMN last_eaten TIMESTAMP WITH TIME ZONE,
ADD COLUMN eaten_count INTEGER DEFAULT 0 NOT NULL;

-- Add index for sorting by last_eaten
CREATE INDEX meals_last_eaten_idx ON meals(last_eaten);

-- Add index for sorting by eaten_count
CREATE INDEX meals_eaten_count_idx ON meals(eaten_count);

-- Add comments
COMMENT ON COLUMN meals.last_eaten IS 'Timestamp when the meal was last consumed';
COMMENT ON COLUMN meals.eaten_count IS 'Number of times this meal has been eaten';