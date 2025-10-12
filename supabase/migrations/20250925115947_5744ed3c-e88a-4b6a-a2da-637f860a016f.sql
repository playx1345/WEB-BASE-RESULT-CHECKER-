-- Create missing database functions for role checking

-- Function to check if current user has a specific role
CREATE OR REPLACE FUNCTION public.check_user_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role::text = required_role
  );
$$;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role::text FROM profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;