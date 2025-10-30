-- Drop and recreate the admin_create_student function with proper logic
DROP FUNCTION IF EXISTS public.admin_create_student(text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_full_name text,
  p_matric_number text,
  p_level text,
  p_phone_number text DEFAULT NULL,
  p_pin text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  v_student_id uuid;
  v_profile_id uuid;
  v_user_id uuid;
  v_generated_pin text;
  v_student_email text;
  v_pin_hash text;
BEGIN
  -- Only admins can create students
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can create student accounts';
  END IF;

  -- Check if matric number already exists
  IF EXISTS (SELECT 1 FROM public.students WHERE matric_number = p_matric_number) THEN
    RAISE EXCEPTION 'Student with matric number % already exists', p_matric_number;
  END IF;

  -- Generate or use provided PIN
  IF p_pin IS NULL OR p_pin = '' THEN
    v_generated_pin := public.generate_secure_pin();
  ELSE
    v_generated_pin := p_pin;
  END IF;

  -- Hash the PIN
  v_pin_hash := extensions.crypt(v_generated_pin, extensions.gen_salt('bf', 12));

  -- Create student email
  v_student_email := p_matric_number || '@student.plateau.edu.ng';

  -- Generate user ID
  v_user_id := extensions.uuid_generate_v4();
  
  -- Create auth user
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
    v_user_id,
    'authenticated',
    'authenticated',
    v_student_email,
    extensions.crypt(v_generated_pin, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
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
  );

  -- Create profile
  INSERT INTO public.profiles (
    user_id,
    full_name,
    matric_number,
    phone_number,
    level
  ) VALUES (
    v_user_id,
    p_full_name,
    p_matric_number,
    p_phone_number,
    p_level
  ) RETURNING id INTO v_profile_id;

  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'student');

  -- Create student record
  INSERT INTO public.students (
    profile_id,
    matric_number,
    level,
    pin_hash,
    fee_status,
    full_name,
    email
  ) VALUES (
    v_profile_id,
    p_matric_number,
    p_level,
    v_pin_hash,
    'unpaid',
    p_full_name,
    v_student_email
  ) RETURNING id INTO v_student_id;

  -- Log the creation
  PERFORM public.log_user_activity(
    'student_created',
    'students',
    v_student_id::text,
    jsonb_build_object(
      'student_name', p_full_name,
      'matric_number', p_matric_number,
      'level', p_level,
      'generated_pin', v_generated_pin
    )
  );

  -- Return success with the generated PIN
  RETURN jsonb_build_object(
    'success', true,
    'student_id', v_student_id,
    'profile_id', v_profile_id,
    'user_id', v_user_id,
    'matric_number', p_matric_number,
    'email', v_student_email,
    'pin', v_generated_pin,
    'message', 'Student account created successfully'
  );
END;
$$;