-- Create admin table for additional admin-specific data
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  permissions JSONB DEFAULT '{"manage_students": true, "manage_results": true, "manage_announcements": true}'::jsonb,
  admin_level TEXT NOT NULL DEFAULT 'department' CHECK (admin_level IN ('department', 'faculty', 'super')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all admin records" 
ON public.admins 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Super admins can manage admin records" 
ON public.admins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    JOIN public.profiles p ON a.profile_id = p.id
    WHERE p.user_id = auth.uid() AND a.admin_level = 'super'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_admins_profile_id ON public.admins(profile_id);
CREATE INDEX idx_admins_department ON public.admins(department);