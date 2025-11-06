-- Update admin@plateau.edu.ng to have admin role
UPDATE public.profiles
SET role = 'admin'
WHERE user_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Insert admin record for this user with full permissions
INSERT INTO public.admins (profile_id, department, admin_level, permissions)
SELECT 
  id,
  'Computer Science',
  'super',
  '{"manage_results": true, "manage_students": true, "manage_announcements": true, "manage_admins": true}'::jsonb
FROM public.profiles
WHERE user_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
ON CONFLICT DO NOTHING;