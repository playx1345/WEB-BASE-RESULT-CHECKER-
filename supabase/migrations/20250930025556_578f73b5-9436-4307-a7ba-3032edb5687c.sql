-- Create admin user account with proper setup
DO $$
DECLARE
    admin_user_id uuid;
    admin_profile_id uuid;
BEGIN
    -- Generate a consistent UUID for the admin user
    admin_user_id := 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
    
    -- Insert admin user into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        admin_user_id,
        'authenticated',
        'authenticated',
        'admin@plateau.edu.ng',
        crypt('Admin123456', gen_salt('bf')),
        now(),
        now(),
        '',
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "admin", "full_name": "System Administrator", "department": "Computer Science"}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null,
        false,
        null
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Create admin profile
    INSERT INTO public.profiles (
        user_id,
        role,
        full_name,
        matric_number,
        phone_number,
        level
    ) VALUES (
        admin_user_id,
        'admin',
        'System Administrator',
        null,
        null,
        null
    ) ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        full_name = 'System Administrator'
    RETURNING id INTO admin_profile_id;
    
    -- Create admin record
    INSERT INTO public.admins (
        profile_id,
        department,
        admin_level,
        permissions
    ) VALUES (
        admin_profile_id,
        'Computer Science',
        'super',
        '{"manage_results": true, "manage_students": true, "manage_announcements": true, "manage_admins": true}'::jsonb
    ) ON CONFLICT (profile_id) DO UPDATE SET
        admin_level = 'super',
        permissions = '{"manage_results": true, "manage_students": true, "manage_announcements": true, "manage_admins": true}'::jsonb;
    
    RAISE NOTICE 'Admin account created successfully with email: admin@plateau.edu.ng';
END $$;