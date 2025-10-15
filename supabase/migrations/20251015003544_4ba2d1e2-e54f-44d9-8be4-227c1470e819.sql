-- Add pin_hash column to students table for secure PIN storage
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS pin_hash text;

-- Add index for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_students_matric_number ON public.students(matric_number);

-- Update existing students with hashed PINs from demo data
-- These match the PINs in create-demo-students.js
UPDATE public.students 
SET pin_hash = hash_pin('123456')
WHERE matric_number = 'PSP/SICT/CSC/ND/24/001';

UPDATE public.students 
SET pin_hash = hash_pin('234567')
WHERE matric_number = 'PSP/SICT/CSC/ND/24/002';

UPDATE public.students 
SET pin_hash = hash_pin('345678')
WHERE matric_number = 'PSP/SICT/CSC/ND/23/001';

UPDATE public.students 
SET pin_hash = hash_pin('456789')
WHERE matric_number = 'PSP/SICT/CSC/ND/23/002';

UPDATE public.students 
SET pin_hash = hash_pin('567890')
WHERE matric_number = 'PSP/SICT/CSC/HND/24/001';