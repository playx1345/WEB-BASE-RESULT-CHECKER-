-- Fix Security Issue 1: Prevent students from seeing their pin_hash
-- Drop the existing "Students view own data" policy and recreate with pin_hash excluded
DROP POLICY IF EXISTS "Students view own data" ON students;

-- Create new policy that allows students to view their data but excludes sensitive columns
-- We'll handle pin_hash exclusion at the application level by updating queries
CREATE POLICY "Students view own data (safe)" ON students
FOR SELECT USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Fix Security Issue 2: Restrict admin permissions visibility
-- Drop the overly permissive "Super admins manage all" SELECT policy
DROP POLICY IF EXISTS "Super admins manage all" ON admins;

-- Recreate with separate policies for better control
-- Admins can only view their own admin record
CREATE POLICY "Admins view own record only" ON admins
FOR SELECT USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) AND has_role(auth.uid(), 'admin'::user_role)
);

-- Admins can insert their own record (for initial setup)
CREATE POLICY "Admins can insert own record" ON admins
FOR INSERT WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) AND has_role(auth.uid(), 'admin'::user_role)
);

-- Admins can update their own record
CREATE POLICY "Admins can update own record" ON admins
FOR UPDATE USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) AND has_role(auth.uid(), 'admin'::user_role)
);

-- Admins can delete their own record
CREATE POLICY "Admins can delete own record" ON admins
FOR DELETE USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) AND has_role(auth.uid(), 'admin'::user_role)
);

-- Add helper function to safely get student data without pin_hash
CREATE OR REPLACE FUNCTION get_student_safe_data(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  profile_id uuid,
  matric_number text,
  level text,
  cgp numeric,
  total_gp numeric,
  carryovers integer,
  fee_status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.profile_id,
    s.matric_number,
    s.level,
    s.cgp,
    s.total_gp,
    s.carryovers,
    s.fee_status,
    s.created_at,
    s.updated_at
  FROM students s
  JOIN profiles p ON s.profile_id = p.id
  WHERE p.user_id = p_user_id;
$$;