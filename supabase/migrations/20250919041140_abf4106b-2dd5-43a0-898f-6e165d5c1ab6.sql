-- Fix infinite recursion in RLS policies for profiles table

-- Drop all existing problematic policies on profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create fixed policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_admin());

-- Also fix any other policies that might cause recursion
DROP POLICY IF EXISTS "Students can only view their own fee status" ON public.students;
DROP POLICY IF EXISTS "Only admins can update fee status" ON public.students;

-- Recreate student policies with proper security definer functions
CREATE POLICY "Students can only view their own fee status" 
ON public.students 
FOR SELECT 
USING (
  is_admin() OR 
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can update fee status" 
ON public.students 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());