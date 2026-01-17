-- Fix the permissive audit_logs INSERT policy
-- The current policy uses WITH CHECK (true) which is too permissive

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create a more restrictive policy that only allows authenticated users to insert
-- The log_user_activity function is SECURITY DEFINER, so it will still work
CREATE POLICY "Authenticated users can insert audit logs via function"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if the user_id matches the current user (direct inserts)
  -- OR if user_id is null (system-level logs)
  user_id = auth.uid() OR user_id IS NULL
);

-- Add a policy for admins to have full access to audit logs
CREATE POLICY "Admins can manage audit logs"
ON public.audit_logs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));