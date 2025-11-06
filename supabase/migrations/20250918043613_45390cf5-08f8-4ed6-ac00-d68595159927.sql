-- Fix security vulnerabilities in student authentication system

-- First, create a function to generate secure random PINs
CREATE OR REPLACE FUNCTION public.generate_secure_pin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Generate a random 6-digit PIN (100000-999999)
  RETURN LPAD((FLOOR(RANDOM() * 900000) + 100000)::text, 6, '0');
END;
$$;

-- Create a function to hash PINs securely
CREATE OR REPLACE FUNCTION public.hash_pin(pin_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use bcrypt to hash the PIN with a salt
  RETURN crypt(pin_text, gen_salt('bf', 12));
END;
$$;

-- Update the authenticate_student function to use hashed PIN comparison
CREATE OR REPLACE FUNCTION public.authenticate_student(p_matric_number text, p_pin text)
RETURNS TABLE(user_id uuid, student_id uuid, profile_id uuid, full_name text, level text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    AND s.pin_hash = crypt(p_pin, s.pin_hash);  -- Use secure hash comparison
END;
$$;

-- Add new column for hashed PIN and update admin_create_student function
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin_hash text;

-- Update admin_create_student to use secure PIN generation and hashing
CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_full_name text, 
  p_matric_number text, 
  p_level text, 
  p_phone_number text DEFAULT NULL::text, 
  p_pin text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  new_profile_id uuid;
  new_student_id uuid;
  admin_check boolean;
  generated_pin text;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Only admins can create students';
  END IF;
  
  -- Generate secure PIN if not provided
  IF p_pin IS NULL THEN
    generated_pin := generate_secure_pin();
  ELSE
    generated_pin := p_pin;
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
    crypt(generated_pin, gen_salt('bf')),
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
  
  -- Create student record with hashed PIN
  INSERT INTO public.students (
    profile_id,
    matric_number,
    level,
    pin_hash,  -- Store hashed PIN instead of plain text
    fee_status
  ) VALUES (
    new_profile_id,
    p_matric_number,
    p_level,
    hash_pin(generated_pin),  -- Hash the PIN before storing
    'unpaid'
  ) RETURNING id INTO new_student_id;
  
  -- Log the admin action
  PERFORM log_user_activity(
    'student_created',
    'students',
    new_student_id::text,
    jsonb_build_object(
      'student_name', p_full_name,
      'matric_number', p_matric_number,
      'level', p_level
    )
  );
  
  -- Return student ID and generated PIN (for admin to give to student)
  RETURN jsonb_build_object(
    'student_id', new_student_id,
    'generated_pin', generated_pin,
    'success', true
  );
END;
$$;

-- Migrate existing students to use hashed PINs
DO $$
DECLARE
  student_record RECORD;
BEGIN
  -- Update existing students with hashed PINs
  FOR student_record IN 
    SELECT id, pin FROM students WHERE pin_hash IS NULL AND pin IS NOT NULL
  LOOP
    UPDATE students 
    SET pin_hash = hash_pin(student_record.pin)
    WHERE id = student_record.id;
  END LOOP;
END;
$$;

-- Add additional security: Create audit trigger for fee status changes
CREATE OR REPLACE FUNCTION public.audit_fee_status_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log fee status changes for audit purposes
  IF OLD.fee_status IS DISTINCT FROM NEW.fee_status THEN
    PERFORM log_user_activity(
      'fee_status_changed',
      'students',
      NEW.id::text,
      jsonb_build_object(
        'old_status', OLD.fee_status,
        'new_status', NEW.fee_status,
        'matric_number', NEW.matric_number
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for fee status audit
DROP TRIGGER IF EXISTS audit_fee_status_trigger ON students;
CREATE TRIGGER audit_fee_status_trigger
  AFTER UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION audit_fee_status_changes();

-- Add RLS policy to restrict fee status viewing to admins and the student themselves
CREATE POLICY "Students can only view their own fee status" 
ON public.students 
FOR SELECT 
USING (
  -- Admin can see all
  (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')) OR
  -- Student can only see their own record
  (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Update RLS policy for fee status updates (only admins)
CREATE POLICY "Only admins can update fee status" 
ON public.students 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Remove the old plain text PIN column after migration (optional, uncomment if you want to remove it)
-- ALTER TABLE public.students DROP COLUMN IF EXISTS pin;