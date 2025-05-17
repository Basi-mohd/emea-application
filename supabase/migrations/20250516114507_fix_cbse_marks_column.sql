-- Drop the old cbse_marks column if it exists
ALTER TABLE applications DROP COLUMN IF EXISTS cbse_marks;

-- Add the correctly typed cbse_marks column as JSONB
ALTER TABLE applications ADD COLUMN cbse_marks JSONB;
