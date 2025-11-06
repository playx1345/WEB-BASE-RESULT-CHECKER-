-- Fix RLS policies for students table to protect sensitive academic data and PIN hashes

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;
DROP POLICY IF EXISTS "Students can only view their own fee status" ON public.students;
DROP POLICY IF EXISTS "Only admins can update fee status" ON public.students;

-- Create comprehensive SELECT policy for students to view their own data (excluding pin_hash)
CREATE POLICY "Students can view their own data excluding pin_hash"
ON public.students
FOR SELECT
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Admins can view all student data
CREATE POLICY "Admins can view all students"
ON public.students
FOR SELECT
TO authenticated
USING (is_admin());

-- Only admins can insert student records
CREATE POLICY "Only admins can create students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update student records
CREATE POLICY "Only admins can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete student records
CREATE POLICY "Only admins can delete students"
ON public.students
FOR DELETE
TO authenticated
USING (is_admin());