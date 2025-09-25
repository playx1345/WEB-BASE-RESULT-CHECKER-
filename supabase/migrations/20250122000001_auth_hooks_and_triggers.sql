-- Add authentication hooks and triggers for automatic role assignment
-- This migration adds triggers to automatically create profiles when users are created

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text := 'student'; -- Default role
  user_name text;
BEGIN
  -- Extract user information from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    'New User'
  );
  
  -- Determine role based on email or metadata
  IF NEW.email LIKE '%@admin.plateau.edu.ng' OR 
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
  );
  
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

-- Create trigger to handle new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle user updates (role changes, etc.)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update profile if user metadata changes
  IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
    UPDATE public.profiles SET
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        full_name
      ),
      updated_at = now()
    WHERE user_id = NEW.id;
    
    -- Log the update
    PERFORM log_user_activity(
      'profile_updated',
      'profiles',
      NEW.id::text,
      jsonb_build_object(
        'old_metadata', OLD.raw_user_meta_data,
        'new_metadata', NEW.raw_user_meta_data
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the update
    PERFORM log_user_activity(
      'profile_update_failed',
      'profiles',
      NEW.id::text,
      jsonb_build_object(
        'error', SQLERRM
      )
    );
    RETURN NEW;
END;
$$;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- Create function to handle user deletions
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log the deletion (profile will be deleted by CASCADE)
  PERFORM log_user_activity(
    'user_deleted',
    'profiles',
    OLD.id::text,
    jsonb_build_object(
      'email', OLD.email,
      'deleted_at', now()
    )
  );
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RETURN OLD;
END;
$$;

-- Create trigger for user deletions
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- Add helper function to assign roles programmatically
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_role text;
  old_role text;
BEGIN
  -- Only admins can change roles
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can assign user roles';
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN ('student', 'admin', 'teacher', 'parent') THEN
    RAISE EXCEPTION 'Invalid role: %. Valid roles are: student, admin, teacher, parent', new_role;
  END IF;
  
  -- Get the old role for logging
  SELECT role::text INTO old_role
  FROM profiles
  WHERE user_id = target_user_id;
  
  IF old_role IS NULL THEN
    RAISE EXCEPTION 'User profile not found for user ID: %', target_user_id;
  END IF;
  
  -- Update the role
  UPDATE profiles 
  SET 
    role = new_role::user_role,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the role change
  PERFORM log_user_activity(
    'role_changed',
    'profiles',
    target_user_id::text,
    jsonb_build_object(
      'old_role', old_role,
      'new_role', new_role,
      'changed_by', auth.uid()
    )
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    PERFORM log_user_activity(
      'role_change_failed',
      'profiles',
      target_user_id::text,
      jsonb_build_object(
        'attempted_role', new_role,
        'error', SQLERRM,
        'attempted_by', auth.uid()
      )
    );
    RAISE;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;