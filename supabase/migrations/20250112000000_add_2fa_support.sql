-- Add 2FA support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_profiles_two_factor_enabled ON public.profiles(two_factor_enabled);