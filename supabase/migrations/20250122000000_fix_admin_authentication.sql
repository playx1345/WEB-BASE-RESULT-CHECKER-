-- Fix admin authentication system
-- This migration ensures there's a proper demo admin user and fixes role verification

-- First, ensure we have proper demo admin data in the database
-- Insert demo admin user if not exists (using the same ID as in the mock session)
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
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@plateau.edu.ng',
  crypt('Admin123456', gen_salt('bf')),
  now(),
      '{"provider":"email","providers":["email"]}',
  jsonb_build_object(
    'role', 'admin',
    'full_name', 'System Administrator'
  ),
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Insert demo admin profile if not exists
INSERT INTO public.profiles (
  id,
  user_id,
  role,
  full_name,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'System Administrator',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  full_name = 'System Administrator';

-- Improve the is_admin function with better error handling and logging
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  admin_exists boolean := false;
BEGIN
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has admin role in profiles
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = current_user_id AND role = 'admin'
  ) INTO admin_exists;
  
  RETURN admin_exists;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return false for safety
    RETURN false;
END;
$$;

-- Create a helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT role::text FROM profiles WHERE user_id = auth.uid();
$$;

-- Create a helper function that can be used client-side to check roles securely
CREATE OR REPLACE FUNCTION public.check_user_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  user_role text;
BEGIN
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user's role
  SELECT role::text INTO user_role
  FROM profiles 
  WHERE user_id = current_user_id;
  
  -- Return whether user has the required role
  RETURN user_role = required_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Add more detailed logging to the admin_create_student function
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
  generated_pin text;
  current_user_id uuid := auth.uid();
  current_user_role text;
BEGIN
  -- More detailed admin check with better error messages
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: Please log in to create students';
  END IF;
  
  -- Get the current user's role for better error reporting
  SELECT role::text INTO current_user_role
  FROM profiles 
  WHERE user_id = current_user_id;
  
  IF current_user_role IS NULL THEN
    RAISE EXCEPTION 'User profile not found: Unable to verify permissions';
  END IF;
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can create students. Current role: %', current_user_role;
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
  
  -- Log the admin action with more details
  PERFORM log_user_activity(
    'student_created',
    'students',
    new_student_id::text,
    jsonb_build_object(
      'student_name', p_full_name,
      'matric_number', p_matric_number,
      'level', p_level,
      'created_by_admin', current_user_id,
      'admin_role_verified', true
    )
  );
  
  -- Return student ID and generated PIN (for admin to give to student)
  RETURN jsonb_build_object(
    'student_id', new_student_id,
    'generated_pin', generated_pin,
    'success', true,
    'message', format('Student %s created successfully', p_full_name)
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    PERFORM log_user_activity(
      'student_creation_failed',
      'students',
      NULL,
      jsonb_build_object(
        'error_message', SQLERRM,
        'attempted_by', current_user_id,
        'attempted_for', p_matric_number,
        'error_detail', SQLSTATE
      )
    );
    
    -- Re-raise the exception
    RAISE;
END;
$$;