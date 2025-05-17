-- supabase/migrations/20250516121000_add_cbse_marks_column.sql

ALTER TABLE applications ADD COLUMN cbse_marks INTEGER;
