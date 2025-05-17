-- Add unique constraint to register_number in applications table
ALTER TABLE applications ADD CONSTRAINT applications_register_number_unique UNIQUE (register_number); 