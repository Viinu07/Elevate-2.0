-- Add results_visible column to votingstatus table
ALTER TABLE votingstatus ADD COLUMN IF NOT EXISTS results_visible BOOLEAN DEFAULT FALSE;

-- Update existing rows
UPDATE votingstatus SET results_visible = FALSE WHERE results_visible IS NULL;
