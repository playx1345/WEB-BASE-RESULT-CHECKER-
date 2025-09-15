-- Create admin user using the existing function
SELECT admin_create_student(
    'System Administrator',  -- full_name
    'admin',                 -- matric_number (we'll use this as identifier)
    'admin',                 -- level
    null,                    -- phone_number (optional)
    'Admin123456'            -- pin (will be the password)
) as admin_id;

-- Update the created user to be an admin instead of student
UPDATE profiles 
SET role = 'admin'
WHERE matric_number = 'admin';

-- Remove from students table since this is an admin
DELETE FROM students 
WHERE matric_number = 'admin';