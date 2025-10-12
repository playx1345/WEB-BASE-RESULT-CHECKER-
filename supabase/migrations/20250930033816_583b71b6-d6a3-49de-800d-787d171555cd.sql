-- Create auth users for existing students
DO $$
DECLARE
    student_record RECORD;
    student_email TEXT;
    student_password TEXT := '112233';
BEGIN
    -- Create auth users for all existing students
    FOR student_record IN 
        SELECT s.id as student_id, s.matric_number, s.level, p.user_id, p.full_name 
        FROM students s 
        JOIN profiles p ON s.profile_id = p.id 
    LOOP
        -- Construct student email
        student_email := student_record.matric_number || '@student.plateau.edu.ng';
        
        -- Insert into auth.users if not exists
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            student_record.user_id,
            'authenticated',
            'authenticated',
            student_email,
            crypt(student_password, gen_salt('bf')),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object(
                'role', 'student', 
                'full_name', student_record.full_name,
                'matric_number', student_record.matric_number,
                'level', student_record.level
            ),
            false,
            now(),
            now(),
            '',
            '',
            '',
            ''
        ) ON CONFLICT (id) DO UPDATE SET
            email = student_email,
            encrypted_password = crypt(student_password, gen_salt('bf')),
            raw_user_meta_data = jsonb_build_object(
                'role', 'student', 
                'full_name', student_record.full_name,
                'matric_number', student_record.matric_number,
                'level', student_record.level
            );
            
        RAISE NOTICE 'Created/Updated auth user for student: % (Email: %)', student_record.full_name, student_email;
    END LOOP;
    
    RAISE NOTICE 'Student authentication setup completed';
END $$;