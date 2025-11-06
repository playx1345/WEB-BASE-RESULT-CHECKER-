-- Fix critical security issue: Restrict audit_logs INSERT to system-level operations only
-- This prevents users from forging audit log entries

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert logs" ON public.audit_logs;

-- Create a restrictive INSERT policy that only allows the log_user_activity() function
-- to insert records (which runs as SECURITY DEFINER)
-- Normal users cannot directly insert into audit_logs
CREATE POLICY "Only system functions can insert logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow inserts from service role or through SECURITY DEFINER functions
  -- This is achieved by checking if the current user context has elevated privileges
  auth.jwt() ->> 'role' = 'service_role'
);