-- Fix corrupted user_role enum and restore admin functionality
-- Step 1: Drop ALL RLS policies that might reference the role column

-- Drop all policies on announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students can view announcements for their level" ON public.announcements;

-- Drop all policies on audit_logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Drop all policies on results
DROP POLICY IF EXISTS "Admins can manage all results" ON public.results;
DROP POLICY IF EXISTS "Students can view their own results if fees paid" ON public.results;

-- Drop all policies on transactions
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;

-- Drop all policies on user_investments
DROP POLICY IF EXISTS "Admins can manage all investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can view their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can create their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON public.user_investments;

-- Drop all policies on students (including the existing one)
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Only admins can create students" ON public.students;
DROP POLICY IF EXISTS "Only admins can update students" ON public.students;
DROP POLICY IF EXISTS "Only admins can delete students" ON public.students;
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
DROP POLICY IF EXISTS "Students can view their own data excluding pin_hash" ON public.students;
DROP POLICY IF EXISTS "Students can only view their own fee status" ON public.students;
DROP POLICY IF EXISTS "Only admins can update fee status" ON public.students;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;

-- Drop all policies on admins
DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage admin records" ON public.admins;

-- Drop all policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Step 2: Fix the enum
ALTER TYPE public.user_role RENAME TO user_role_old;
CREATE TYPE public.user_role AS ENUM ('student', 'admin');

-- Step 3: Convert profiles.role column
ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.user_role USING (
    CASE
      WHEN (role::text IS NULL OR role::text = '' OR role::text = 'null') THEN 'student'::public.user_role
      WHEN role::text IN ('student','admin') THEN role::text::public.user_role
      ELSE 'student'::public.user_role
    END
  ),
  ALTER COLUMN role SET DEFAULT 'student'::public.user_role;

DROP TYPE public.user_role_old;

-- Step 4: Recreate all RLS policies with corrected admin checks

-- announcements policies
CREATE POLICY "Admins can manage announcements"
ON public.announcements FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Students can view announcements for their level"
ON public.announcements FOR SELECT TO authenticated
USING (
  (target_level = 'all'::text) OR 
  (target_level IN (
    SELECT s.level FROM students s
    JOIN profiles p ON s.profile_id = p.id
    WHERE p.user_id = auth.uid()
  ))
);

-- audit_logs policies
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- results policies
CREATE POLICY "Admins can manage all results"
ON public.results FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Students can view their own results if fees paid"
ON public.results FOR SELECT TO authenticated
USING (
  student_id IN (
    SELECT s.id FROM students s
    JOIN profiles p ON s.profile_id = p.id
    WHERE p.user_id = auth.uid() AND s.fee_status = 'paid'
  )
);

-- transactions policies
CREATE POLICY "Admins can manage all transactions"
ON public.transactions FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- user_investments policies
CREATE POLICY "Admins can manage all investments"
ON public.user_investments FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Users can view their own investments"
ON public.user_investments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments"
ON public.user_investments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
ON public.user_investments FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- students policies
CREATE POLICY "Admins can view all students"
ON public.students FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can create students"
ON public.students FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update students"
ON public.students FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete students"
ON public.students FOR DELETE TO authenticated
USING (is_admin());

CREATE POLICY "Students can view their own data"
ON public.students FOR SELECT TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- admins policies
CREATE POLICY "Admins can view all admin records"
ON public.admins FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Super admins can manage admin records"
ON public.admins FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins a
    JOIN profiles p ON a.profile_id = p.id
    WHERE p.user_id = auth.uid() AND a.admin_level = 'super'
  )
);

-- profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (is_admin());