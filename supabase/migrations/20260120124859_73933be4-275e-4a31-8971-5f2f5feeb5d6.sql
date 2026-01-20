-- Create table for PIN reset tokens
CREATE TABLE public.pin_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  token VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pin_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Index for faster lookups
CREATE INDEX idx_pin_reset_tokens_student ON public.pin_reset_tokens(student_id);
CREATE INDEX idx_pin_reset_tokens_token ON public.pin_reset_tokens(token);
CREATE INDEX idx_pin_reset_tokens_expires ON public.pin_reset_tokens(expires_at);

-- RLS policies - only edge functions (service role) can manage these tokens
-- No user-facing policies needed since students use edge functions to reset

-- Function to generate a 6-digit reset code
CREATE OR REPLACE FUNCTION public.generate_reset_code()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$;

-- Function to create a reset token for a student (called by edge function with service role)
CREATE OR REPLACE FUNCTION public.create_pin_reset_token(p_matric_number TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
  v_phone_number TEXT;
  v_email TEXT;
  v_token VARCHAR(6);
  v_full_name TEXT;
BEGIN
  -- Find the student
  SELECT s.id, p.phone_number, s.email, p.full_name
  INTO v_student_id, v_phone_number, v_email, v_full_name
  FROM students s
  LEFT JOIN profiles p ON s.profile_id = p.id
  WHERE s.matric_number = p_matric_number;
  
  IF v_student_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Student not found');
  END IF;
  
  -- Invalidate any existing tokens for this student
  UPDATE pin_reset_tokens 
  SET used = true 
  WHERE student_id = v_student_id AND used = false;
  
  -- Generate new token
  v_token := generate_reset_code();
  
  -- Insert new token
  INSERT INTO pin_reset_tokens (student_id, token)
  VALUES (v_student_id, v_token);
  
  RETURN json_build_object(
    'success', true,
    'token', v_token,
    'phone_number', v_phone_number,
    'email', v_email,
    'full_name', v_full_name,
    'student_id', v_student_id
  );
END;
$$;

-- Function to verify reset token and update PIN
CREATE OR REPLACE FUNCTION public.verify_and_reset_pin(
  p_matric_number TEXT,
  p_token VARCHAR(6),
  p_new_pin TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
  v_token_valid BOOLEAN;
  v_user_email TEXT;
BEGIN
  -- Find the student
  SELECT id INTO v_student_id
  FROM students
  WHERE matric_number = p_matric_number;
  
  IF v_student_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Student not found');
  END IF;
  
  -- Verify token is valid and not expired
  SELECT EXISTS (
    SELECT 1 FROM pin_reset_tokens
    WHERE student_id = v_student_id
      AND token = p_token
      AND used = false
      AND expires_at > now()
  ) INTO v_token_valid;
  
  IF NOT v_token_valid THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired reset code');
  END IF;
  
  -- Mark token as used
  UPDATE pin_reset_tokens
  SET used = true
  WHERE student_id = v_student_id AND token = p_token;
  
  -- Update the PIN in students table
  UPDATE students
  SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
      updated_at = now()
  WHERE id = v_student_id;
  
  -- Also update the auth.users password
  v_user_email := p_matric_number || '@student.plateau.edu.ng';
  
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_pin, gen_salt('bf')),
      updated_at = now()
  WHERE email = v_user_email;
  
  RETURN json_build_object('success', true, 'message', 'PIN reset successfully');
END;
$$;