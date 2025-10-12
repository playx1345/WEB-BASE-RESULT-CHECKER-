-- Enhanced Admin Creation and Role Assignment
-- This migration improves the admin user creation process

-- Update the handle_new_user function to better handle admin creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text := 'student'; -- Default role
  user_name text;
  new_profile_id uuid;
BEGIN
  -- Extract user information from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    'New User'
  );
  
  -- Determine role based on email or metadata
  IF NEW.email LIKE '%@admin.plateau.edu.ng' OR 
     NEW.email = 'admin@plateau.edu.ng' OR
     NEW.raw_user_meta_data->>'role' = 'admin' THEN
    user_role := 'admin';
  ELSIF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    user_role := 'teacher';
  ELSIF NEW.raw_user_meta_data->>'role' = 'parent' THEN
    user_role := 'parent';
  ELSE
    user_role := 'student';
  END IF;
  
  -- Create profile for the new user
  INSERT INTO public.profiles (
    user_id,
    role,
    full_name,
    matric_number,
    phone_number,
    level
  ) VALUES (
    NEW.id,
    user_role::user_role,
    user_name,
    NEW.raw_user_meta_data->>'matric_number',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'level'
  ) RETURNING id INTO new_profile_id;
  
  -- If this is an admin user, create admin record
  IF user_role = 'admin' THEN
    INSERT INTO public.admins (
      profile_id,
      department,
      admin_level,
      permissions
    ) VALUES (
      new_profile_id,
      COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science'),
      'super', -- Default admin level
      jsonb_build_object(
        'manage_students', true,
        'manage_results', true,
        'manage_announcements', true,
        'manage_admins', true
      )
    );
    
    -- Log admin creation
    PERFORM log_user_activity(
      'admin_created',
      'admins',
      new_profile_id::text,
      jsonb_build_object(
        'admin_email', NEW.email,
        'admin_name', user_name,
        'department', COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science')
      )
    );
  END IF;
  
  -- Log the profile creation
  PERFORM log_user_activity(
    'profile_created',
    'profiles',
    NEW.id::text,
    jsonb_build_object(
      'role', user_role,
      'full_name', user_name,
      'email', NEW.email
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    PERFORM log_user_activity(
      'profile_creation_failed',
      'profiles',
      NEW.id::text,
      jsonb_build_object(
        'error', SQLERRM,
        'email', NEW.email
      )
    );
    RETURN NEW;
END;
$$;

-- Create a function to manually setup admin after user creation
CREATE OR REPLACE FUNCTION public.setup_admin_for_user(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record record;
  profile_record record;
  admin_record record;
  result jsonb := jsonb_build_object('success', false);
BEGIN
  -- Find the user by email
  SELECT id, email, raw_user_meta_data 
  INTO user_record
  FROM auth.users 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    result := jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || user_email
    );
    RETURN result;
  END IF;
  
  -- Check if profile exists
  SELECT id, role, full_name
  INTO profile_record
  FROM public.profiles
  WHERE user_id = user_record.id;
  
  -- Create profile if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      user_id,
      role,
      full_name
    ) VALUES (
      user_record.id,
      'admin',
      COALESCE(user_record.raw_user_meta_data->>'full_name', 'System Administrator')
    ) RETURNING id, role, full_name INTO profile_record;
    
    result := jsonb_set(result, '{profile_created}', 'true'::jsonb);
  ELSIF profile_record.role != 'admin' THEN
    -- Update existing profile to admin
    UPDATE public.profiles 
    SET role = 'admin', 
        full_name = COALESCE(user_record.raw_user_meta_data->>'full_name', profile_record.full_name),
        updated_at = now()
    WHERE id = profile_record.id
    RETURNING id, role, full_name INTO profile_record;
    
    result := jsonb_set(result, '{profile_updated}', 'true'::jsonb);
  END IF;
  
  -- Check if admin record exists
  SELECT id, department, admin_level
  INTO admin_record
  FROM public.admins
  WHERE profile_id = profile_record.id;
  
  -- Create admin record if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.admins (
      profile_id,
      department,
      admin_level,
      permissions
    ) VALUES (
      profile_record.id,
      COALESCE(user_record.raw_user_meta_data->>'department', 'Computer Science'),
      'super',
      jsonb_build_object(
        'manage_students', true,
        'manage_results', true,
        'manage_announcements', true,
        'manage_admins', true
      )
    ) RETURNING id, department, admin_level INTO admin_record;
    
    result := jsonb_set(result, '{admin_created}', 'true'::jsonb);
  END IF;
  
  -- Build success result
  result := jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'profile_id', profile_record.id,
    'admin_id', admin_record.id,
    'email', user_record.email,
    'full_name', profile_record.full_name,
    'department', admin_record.department,
    'admin_level', admin_record.admin_level
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create a convenience function to check if admin setup is complete
CREATE OR REPLACE FUNCTION public.check_admin_setup(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  user_record record;
  profile_record record;
  admin_record record;
  result jsonb := jsonb_build_object();
BEGIN
  -- Find the user by email
  SELECT id, email, email_confirmed_at
  INTO user_record
  FROM auth.users 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'user_exists', false,
      'email', user_email
    );
  END IF;
  
  result := jsonb_build_object(
    'user_exists', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'email_confirmed', user_record.email_confirmed_at IS NOT NULL
  );
  
  -- Check profile
  SELECT id, role, full_name
  INTO profile_record
  FROM public.profiles
  WHERE user_id = user_record.id;
  
  IF FOUND THEN
    result := jsonb_set(result, '{profile_exists}', 'true'::jsonb);
    result := jsonb_set(result, '{profile_role}', to_jsonb(profile_record.role::text));
    result := jsonb_set(result, '{profile_name}', to_jsonb(profile_record.full_name));
    
    -- Check admin record if profile role is admin
    IF profile_record.role = 'admin' THEN
      SELECT id, department, admin_level, permissions
      INTO admin_record
      FROM public.admins
      WHERE profile_id = profile_record.id;
      
      IF FOUND THEN
        result := jsonb_set(result, '{admin_exists}', 'true'::jsonb);
        result := jsonb_set(result, '{admin_department}', to_jsonb(admin_record.department));
        result := jsonb_set(result, '{admin_level}', to_jsonb(admin_record.admin_level));
        result := jsonb_set(result, '{admin_permissions}', admin_record.permissions);
      ELSE
        result := jsonb_set(result, '{admin_exists}', 'false'::jsonb);
      END IF;
    END IF;
  ELSE
    result := jsonb_set(result, '{profile_exists}', 'false'::jsonb);
  END IF;
  
  RETURN result;
END;
$$;