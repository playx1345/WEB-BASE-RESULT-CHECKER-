-- Insert admin profile with a valid level (ND1)
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
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin'::user_role,
    'System Administrator',
    'admin@plateau.edu.ng',
    '+2348000000000',
    'ND1',  -- Using a valid level
    now(),
    now()
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin'::user_role,
    full_name = 'System Administrator',
    updated_at = now();