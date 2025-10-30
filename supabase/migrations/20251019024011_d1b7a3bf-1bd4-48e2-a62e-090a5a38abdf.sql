-- ============================================================================
-- COMPLETE STUDENT PORTAL DATABASE MIGRATION (FIXED)
-- ============================================================================

-- PHASE 1: DROP INVESTMENT PLATFORM TABLES
DROP TABLE IF EXISTS public.user_investments CASCADE;
DROP TABLE IF EXISTS public.investment_plans CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- PHASE 2: UPDATE PROFILES TABLE
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS account_balance,
DROP COLUMN IF EXISTS total_invested,
DROP COLUMN IF EXISTS total_withdrawn,
DROP COLUMN IF EXISTS investment_experience,
DROP COLUMN IF EXISTS risk_tolerance,
DROP COLUMN IF EXISTS investment_goals,
DROP COLUMN IF EXISTS monthly_income_range;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS matric_number text UNIQUE,
ADD COLUMN IF NOT EXISTS level text;

-- PHASE 3: CREATE STUDENT PORTAL TABLES
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  matric_number text UNIQUE NOT NULL,
  level text NOT NULL,
  cgp numeric(4,2) DEFAULT 0.00,
  total_gp numeric(10,2) DEFAULT 0.00,
  carryovers integer DEFAULT 0,
  fee_status text DEFAULT 'unpaid' CHECK (fee_status IN ('paid', 'unpaid')),
  pin_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_code text NOT NULL,
  course_title text NOT NULL,
  credit_unit integer NOT NULL,
  grade text NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F')),
  point numeric(4,2) NOT NULL,
  level text NOT NULL,
  session text NOT NULL,
  semester text NOT NULL CHECK (semester IN ('First', 'Second')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_code, session, semester)
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  target_level text DEFAULT 'all',
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  department text DEFAULT 'Computer Science',
  admin_level text DEFAULT 'department' CHECK (admin_level IN ('department', 'faculty', 'super')),
  permissions jsonb DEFAULT '{"manage_results": true, "manage_students": true, "manage_announcements": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- PHASE 4: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_students_matric ON public.students(matric_number);
CREATE INDEX IF NOT EXISTS idx_students_level ON public.students(level);
CREATE INDEX IF NOT EXISTS idx_students_fee_status ON public.students(fee_status);
CREATE INDEX IF NOT EXISTS idx_results_student ON public.results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_session ON public.results(session);
CREATE INDEX IF NOT EXISTS idx_announcements_level ON public.announcements(target_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- PHASE 5: CREATE FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.generate_secure_pin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LPAD((FLOOR(RANDOM() * 900000) + 100000)::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.hash_pin(pin_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(pin_text, gen_salt('bf', 12));
END;
$$;

CREATE OR REPLACE FUNCTION public.authenticate_student(p_matric_number text, p_pin text)
RETURNS TABLE(user_id uuid, student_id uuid, profile_id uuid, full_name text, level text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    s.id as student_id,
    s.profile_id,
    p.full_name,
    s.level
  FROM students s
  JOIN profiles p ON s.profile_id = p.id
  WHERE s.matric_number = p_matric_number 
    AND s.pin_hash = crypt(p_pin, s.pin_hash);
END;
$$;

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
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'student');
  
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
    'matric_number', p_matric_number,
    'generated_pin', generated_pin,
    'success', true
  );
END;
$$;

-- PHASE 6: CREATE TRIGGERS
CREATE OR REPLACE FUNCTION public.audit_fee_status_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.fee_status IS DISTINCT FROM NEW.fee_status THEN
    PERFORM log_user_activity(
      'fee_status_changed',
      'students',
      NEW.id::text,
      jsonb_build_object(
        'old_status', OLD.fee_status,
        'new_status', NEW.fee_status,
        'matric_number', NEW.matric_number
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_audit_fee_status ON public.students;
CREATE TRIGGER trigger_audit_fee_status
  AFTER UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_fee_status_changes();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_results_updated_at ON public.results;
CREATE TRIGGER update_results_updated_at
  BEFORE UPDATE ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- PHASE 7: ENABLE RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PHASE 8: CREATE RLS POLICIES
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students view own data" ON public.students;
CREATE POLICY "Students view own data"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage all students" ON public.students;
CREATE POLICY "Admins manage all students"
  ON public.students FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students view own results if paid" ON public.results;
CREATE POLICY "Students view own results if paid"
  ON public.results FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid()
        AND s.fee_status = 'paid'
    )
  );

DROP POLICY IF EXISTS "Admins manage all results" ON public.results;
CREATE POLICY "Admins manage all results"
  ON public.results FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students view announcements" ON public.announcements;
CREATE POLICY "Students view announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    target_level = 'all' OR
    target_level IN (
      SELECT s.level FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view own record" ON public.admins;
CREATE POLICY "Admins view own record"
  ON public.admins FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Super admins manage all" ON public.admins;
CREATE POLICY "Super admins manage all"
  ON public.admins FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own logs" ON public.audit_logs;
CREATE POLICY "Users view own logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all logs" ON public.audit_logs;
CREATE POLICY "Admins view all logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert logs" ON public.audit_logs;
CREATE POLICY "System can insert logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- PHASE 9: SETUP ADMIN USER
INSERT INTO public.profiles (user_id, full_name, phone_number)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'System Administrator',
  NULL
)
ON CONFLICT (user_id) DO UPDATE
SET full_name = 'System Administrator';

DO $$
DECLARE
  admin_profile_id uuid;
BEGIN
  SELECT id INTO admin_profile_id
  FROM public.profiles
  WHERE user_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.admins (profile_id, department, admin_level, permissions)
  VALUES (
    admin_profile_id,
    'Computer Science',
    'super',
    '{"manage_results": true, "manage_students": true, "manage_announcements": true, "manage_admins": true}'::jsonb
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET admin_level = 'super',
      permissions = '{"manage_results": true, "manage_students": true, "manage_announcements": true, "manage_admins": true}'::jsonb;
END $$;