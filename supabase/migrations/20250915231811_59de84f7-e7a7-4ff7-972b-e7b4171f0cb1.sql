-- Insert admin profile directly with a temporary user_id
-- We'll use a fixed UUID for the admin user
INSERT INTO public.profiles (
    id,
    user_id, 
    role,
    full_name,
    matric_number,
    phone_number,
    level,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001'::uuid,  -- temporary admin user id
    'admin'::user_role,
    'System Administrator',
    'admin@plateau.edu.ng',
    '+2348000000000',
    'admin',
    now(),
    now()
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin'::user_role,
    full_name = 'System Administrator',
    updated_at = now();