-- Create function to create admin user safely
CREATE OR REPLACE FUNCTION public.create_default_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    RETURN;
  END IF;
  
  -- Create the admin user directly in profiles table
  INSERT INTO public.profiles (
    user_id,
    role,
    full_name,
    matric_number,
    phone_number,
    level
  ) VALUES (
    gen_random_uuid(),
    'admin',
    'System Administrator',
    NULL,
    NULL,
    NULL
  ) RETURNING user_id INTO admin_user_id;
  
  -- Note: In a real system, the admin would be created through Supabase Auth
  -- This is a temporary solution for development
END;
$$;

-- Call the function to create default admin
SELECT public.create_default_admin();