-- Remove plaintext PIN column from students table for security
-- Only pin_hash should be stored for authentication

-- Drop the insecure pin column
ALTER TABLE public.students DROP COLUMN IF EXISTS pin;

-- Add comment to pin_hash to document its purpose
COMMENT ON COLUMN public.students.pin_hash IS 'Bcrypt hashed PIN for student authentication. Never store plaintext PINs.';