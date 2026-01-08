-- Create admin user for silasplayx64@outlook.com with password SILAS1234$
DO $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
BEGIN
  -- Generate a user ID
  v_user_id := extensions.uuid_generate_v4();
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'silasplayx64@outlook.com') THEN
    RAISE NOTICE 'User already exists, skipping creation';
    RETURN;
  END IF;
  
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
    'silasplayx64@outlook.com',
    extensions.crypt('SILAS1234$', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Silas Administrator', 'role', 'admin'),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Update the profile created by handle_new_user trigger
  UPDATE public.profiles 
  SET full_name = 'Silas Administrator'
  WHERE user_id = v_user_id
  RETURNING id INTO v_profile_id;

  -- Create admin role in user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Admin user created successfully with ID: %', v_user_id;
END $$;