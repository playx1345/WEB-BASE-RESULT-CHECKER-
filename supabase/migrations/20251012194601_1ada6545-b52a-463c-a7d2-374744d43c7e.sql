-- ============================================
-- SECURITY FIX: Create Separate User Roles System
-- ============================================

-- 1. Create user_roles table (use existing user_role enum)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- 2. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 4. Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- 5. RLS Policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT user_id, role, created_at
FROM profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- UPDATE EXISTING FUNCTIONS TO USE user_roles
-- ============================================

-- Update is_admin() to use user_roles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Update check_user_role() to use user_roles table
CREATE OR REPLACE FUNCTION public.check_user_role(required_role text)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), required_role::user_role);
$$;

-- Update get_current_user_role() to use user_roles table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Update handle_new_user() trigger to use user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile WITHOUT role
  INSERT INTO public.profiles (user_id, full_name, matric_number, phone_number, level)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'matric_number',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'level'
  );
  
  -- Insert role into separate user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update admin_create_student() to use user_roles table
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
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  new_profile_id uuid;
  new_student_id uuid;
  generated_pin text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can create students';
  END IF;
  
  IF p_pin IS NULL THEN
    generated_pin := generate_secure_pin();
  ELSE
    generated_pin := p_pin;
  END IF;
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
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
      'full_name', p_full_name,
      'matric_number', p_matric_number,
      'level', p_level,
      'phone_number', p_phone_number
    ),
    now(), now(), '', '', '', ''
  ) RETURNING id INTO new_user_id;
  
  INSERT INTO public.profiles (user_id, full_name, matric_number, phone_number, level)
  VALUES (new_user_id, p_full_name, p_matric_number, p_phone_number, p_level)
  RETURNING id INTO new_profile_id;
  
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (new_user_id, 'student', auth.uid());
  
  INSERT INTO public.students (profile_id, matric_number, level, pin_hash, fee_status)
  VALUES (new_profile_id, p_matric_number, p_level, hash_pin(generated_pin), 'unpaid')
  RETURNING id INTO new_student_id;
  
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
  
  RETURN jsonb_build_object(
    'student_id', new_student_id,
    'generated_pin', generated_pin,
    'success', true
  );
END;
$$;

-- ============================================
-- FIX OTHER SECURITY ISSUES
-- ============================================

-- FIX: Restrict audit_logs INSERT to system only
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (false);

-- FIX: Add explicit public access denial to profiles
CREATE POLICY "Deny all public access to profiles"
ON public.profiles FOR ALL
TO anon
USING (false);

-- FIX: Add explicit public access denial to students
CREATE POLICY "Deny all public access to students"
ON public.students FOR ALL
TO anon
USING (false);

-- ============================================
-- REMOVE ROLE COLUMN FROM PROFILES
-- ============================================

ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

COMMENT ON TABLE public.user_roles IS 'Secure role storage with RLS to prevent privilege escalation attacks.';