-- Add PIN field to students table for 6-digit authentication
ALTER TABLE public.students 
ADD COLUMN pin TEXT DEFAULT '112233';

-- Create index for faster PIN lookups
CREATE INDEX idx_students_pin ON public.students(pin);

-- Update students table to ensure matric_number is unique
ALTER TABLE public.students 
ADD CONSTRAINT unique_matric_number UNIQUE (matric_number);

-- Create function to authenticate students with matric number and PIN
CREATE OR REPLACE FUNCTION public.authenticate_student(p_matric_number text, p_pin text)
RETURNS TABLE(
  user_id uuid,
  student_id uuid,
  profile_id uuid,
  full_name text,
  level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    s.id as student_id,
    s.profile_id,
    p.full_name,
    s.level
  FROM students s
  JOIN profiles p ON s.profile_id = p.id
  WHERE s.matric_number = p_matric_number 
    AND s.pin = p_pin;
END;
$$;

-- Create function for admins to create students
CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_full_name text,
  p_matric_number text,
  p_level text,
  p_phone_number text DEFAULT NULL,
  p_pin text DEFAULT '112233'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  new_profile_id uuid;
  new_student_id uuid;
  admin_check boolean;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Only admins can create students';
  END IF;
  
  -- Create auth user with matric number as email and PIN as password
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_matric_number || '@student.plateau.edu.ng',
    crypt(p_pin, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'role', 'student',
      'full_name', p_full_name,
      'matric_number', p_matric_number,
      'level', p_level,
      'phone_number', p_phone_number
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;
  
  -- Create profile
  INSERT INTO public.profiles (
    user_id,
    role,
    full_name,
    matric_number,
    phone_number,
    level
  ) VALUES (
    new_user_id,
    'student',
    p_full_name,
    p_matric_number,
    p_phone_number,
    p_level
  ) RETURNING id INTO new_profile_id;
  
  -- Create student record
  INSERT INTO public.students (
    profile_id,
    matric_number,
    level,
    pin,
    fee_status
  ) VALUES (
    new_profile_id,
    p_matric_number,
    p_level,
    p_pin,
    'unpaid'
  ) RETURNING id INTO new_student_id;
  
  RETURN new_student_id;
END;
$$;