-- Create admin user using the service role approach
-- First, let's create a function that can create admin users

CREATE OR REPLACE FUNCTION create_admin_user(
  p_email text,
  p_password text,
  p_full_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  new_profile_id uuid;
BEGIN
  -- This function would typically use auth.admin functions
  -- For now, we'll create the profile directly and rely on external admin creation
  
  -- Generate a user ID (this would come from auth.users normally)
  new_user_id := gen_random_uuid();
  
  -- Create the profile directly
  INSERT INTO public.profiles (
    user_id,
    role,
    full_name
  ) VALUES (
    new_user_id,
    'admin',
    p_full_name
  ) RETURNING id INTO new_profile_id;
  
  -- Create admin record
  INSERT INTO public.admins (
    profile_id,
    department,
    admin_level,
    permissions
  ) VALUES (
    new_profile_id,
    'Computer Science',
    'department',
    '{"manage_results": true, "manage_students": true, "manage_announcements": true}'::jsonb
  );
  
  RETURN jsonb_build_object(
    'user_id', new_user_id,
    'profile_id', new_profile_id,
    'email', p_email,
    'success', true
  );
END;
$$;