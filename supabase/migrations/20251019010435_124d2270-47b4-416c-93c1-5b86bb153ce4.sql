-- Set default PINs for existing students who don't have one
-- This allows existing students to login

UPDATE students 
SET pin_hash = crypt('123456', gen_salt('bf'))
WHERE pin_hash IS NULL;

-- Add comment
COMMENT ON COLUMN students.pin_hash IS 'Bcrypt hash of student PIN. Default PIN is 123456 for demo accounts.';