-- Create function for admin to reset student PIN
-- This function allows admin users to securely reset a student's PIN

CREATE OR REPLACE FUNCTION public.admin_reset_student_pin(
  student_id uuid,
  new_pin text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pin_hash_value text;
  admin_check boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT public.is_admin() INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Only administrators can reset student PINs';
  END IF;
  
  -- Validate PIN format (4-8 digits)
  IF new_pin !~ '^\d{4,8}$' THEN
    RAISE EXCEPTION 'PIN must be between 4 and 8 digits';
  END IF;
  
  -- Hash the new PIN using bcrypt
  -- Using crypt function from pgcrypto extension
  pin_hash_value := crypt(new_pin, gen_salt('bf'));
  
  -- Update the student's PIN hash
  UPDATE public.students
  SET 
    pin_hash = pin_hash_value,
    updated_at = now()
  WHERE id = student_id;
  
  -- Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student with ID % not found', student_id;
  END IF;
  
  -- Log the action in audit_logs
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, metadata)
  VALUES (
    auth.uid(),
    'reset_student_pin',
    'students',
    student_id::text,
    jsonb_build_object(
      'timestamp', now(),
      'action_type', 'pin_reset'
    )
  );
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users (admin check is done inside the function)
GRANT EXECUTE ON FUNCTION public.admin_reset_student_pin(uuid, text) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.admin_reset_student_pin IS 'Allows admin users to securely reset a student PIN with bcrypt hashing and audit logging';
