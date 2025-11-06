-- Delete broken student record
DELETE FROM public.students WHERE matric_number = 'PSP/SICT//CSCND/001';

-- Create 6 students with full authentication using direct inserts
DO $$
DECLARE
  -- Student 1: Blessing Musa
  s1_user_id uuid := gen_random_uuid();
  s1_profile_id uuid;
  s1_student_id uuid := gen_random_uuid();
  
  -- Student 2: David Gyang
  s2_user_id uuid := gen_random_uuid();
  s2_profile_id uuid;
  s2_student_id uuid := gen_random_uuid();
  
  -- Student 3: Grace Pam
  s3_user_id uuid := gen_random_uuid();
  s3_profile_id uuid;
  s3_student_id uuid := gen_random_uuid();
  
  -- Student 4: Emmanuel Dung
  s4_user_id uuid := gen_random_uuid();
  s4_profile_id uuid;
  s4_student_id uuid := gen_random_uuid();
  
  -- Student 5: Faith Dakup
  s5_user_id uuid := gen_random_uuid();
  s5_profile_id uuid;
  s5_student_id uuid := gen_random_uuid();
  
  -- Student 6: Samuel Gotip
  s6_user_id uuid := gen_random_uuid();
  s6_profile_id uuid;
  s6_student_id uuid := gen_random_uuid();
BEGIN
  -- Insert auth users (profiles will be auto-created by trigger)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', s1_user_id, 'authenticated', 'authenticated',
     'PSP/SICT/CSC/ND1/2024/001@student.plateau.edu.ng', crypt('111111', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb,
     jsonb_build_object('full_name', 'Blessing Musa', 'matric_number', 'PSP/SICT/CSC/ND1/2024/001', 'level', 'ND1', 'phone_number', '+2348123456001'),
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', s2_user_id, 'authenticated', 'authenticated',
     'PSP/SICT/CSC/ND1/2024/002@student.plateau.edu.ng', crypt('222222', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb,
     jsonb_build_object('full_name', 'David Gyang', 'matric_number', 'PSP/SICT/CSC/ND1/2024/002', 'level', 'ND1', 'phone_number', '+2348123456002'),
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', s3_user_id, 'authenticated', 'authenticated',
     'PSP/SICT/CSC/ND2/2023/001@student.plateau.edu.ng', crypt('333333', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb,
     jsonb_build_object('full_name', 'Grace Pam', 'matric_number', 'PSP/SICT/CSC/ND2/2023/001', 'level', 'ND2', 'phone_number', '+2348123456003'),
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', s4_user_id, 'authenticated', 'authenticated',
     'PSP/SICT/CSC/ND2/2023/002@student.plateau.edu.ng', crypt('444444', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb,
     jsonb_build_object('full_name', 'Emmanuel Dung', 'matric_number', 'PSP/SICT/CSC/ND2/2023/002', 'level', 'ND2', 'phone_number', '+2348123456004'),
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', s5_user_id, 'authenticated', 'authenticated',
     'PSP/SICT/CSC/HND1/2024/001@student.plateau.edu.ng', crypt('555555', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb,
     jsonb_build_object('full_name', 'Faith Dakup', 'matric_number', 'PSP/SICT/CSC/HND1/2024/001', 'level', 'HND1', 'phone_number', '+2348123456005'),
     now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', s6_user_id, 'authenticated', 'authenticated',
     'PSP/SICT/CSC/HND2/2023/001@student.plateau.edu.ng', crypt('666666', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb,
     jsonb_build_object('full_name', 'Samuel Gotip', 'matric_number', 'PSP/SICT/CSC/HND2/2023/001', 'level', 'HND2', 'phone_number', '+2348123456006'),
     now(), now(), '', '', '', '');

  -- Get profile IDs that were auto-created
  SELECT id INTO s1_profile_id FROM public.profiles WHERE user_id = s1_user_id;
  SELECT id INTO s2_profile_id FROM public.profiles WHERE user_id = s2_user_id;
  SELECT id INTO s3_profile_id FROM public.profiles WHERE user_id = s3_user_id;
  SELECT id INTO s4_profile_id FROM public.profiles WHERE user_id = s4_user_id;
  SELECT id INTO s5_profile_id FROM public.profiles WHERE user_id = s5_user_id;
  SELECT id INTO s6_profile_id FROM public.profiles WHERE user_id = s6_user_id;

  -- Update profiles with additional data
  UPDATE public.profiles SET matric_number = 'PSP/SICT/CSC/ND1/2024/001', phone_number = '+2348123456001', level = 'ND1' WHERE user_id = s1_user_id;
  UPDATE public.profiles SET matric_number = 'PSP/SICT/CSC/ND1/2024/002', phone_number = '+2348123456002', level = 'ND1' WHERE user_id = s2_user_id;
  UPDATE public.profiles SET matric_number = 'PSP/SICT/CSC/ND2/2023/001', phone_number = '+2348123456003', level = 'ND2' WHERE user_id = s3_user_id;
  UPDATE public.profiles SET matric_number = 'PSP/SICT/CSC/ND2/2023/002', phone_number = '+2348123456004', level = 'ND2' WHERE user_id = s4_user_id;
  UPDATE public.profiles SET matric_number = 'PSP/SICT/CSC/HND1/2024/001', phone_number = '+2348123456005', level = 'HND1' WHERE user_id = s5_user_id;
  UPDATE public.profiles SET matric_number = 'PSP/SICT/CSC/HND2/2023/001', phone_number = '+2348123456006', level = 'HND2' WHERE user_id = s6_user_id;

  -- Insert user roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES
    (s1_user_id, 'student'),
    (s2_user_id, 'student'),
    (s3_user_id, 'student'),
    (s4_user_id, 'student'),
    (s5_user_id, 'student'),
    (s6_user_id, 'student');

  -- Insert students with hashed PINs
  INSERT INTO public.students (id, profile_id, matric_number, level, pin_hash, fee_status, full_name, email)
  VALUES
    (s1_student_id, s1_profile_id, 'PSP/SICT/CSC/ND1/2024/001', 'ND1', crypt('111111', gen_salt('bf', 12)), 'paid', 'Blessing Musa', 'PSP/SICT/CSC/ND1/2024/001@student.plateau.edu.ng'),
    (s2_student_id, s2_profile_id, 'PSP/SICT/CSC/ND1/2024/002', 'ND1', crypt('222222', gen_salt('bf', 12)), 'paid', 'David Gyang', 'PSP/SICT/CSC/ND1/2024/002@student.plateau.edu.ng'),
    (s3_student_id, s3_profile_id, 'PSP/SICT/CSC/ND2/2023/001', 'ND2', crypt('333333', gen_salt('bf', 12)), 'paid', 'Grace Pam', 'PSP/SICT/CSC/ND2/2023/001@student.plateau.edu.ng'),
    (s4_student_id, s4_profile_id, 'PSP/SICT/CSC/ND2/2023/002', 'ND2', crypt('444444', gen_salt('bf', 12)), 'paid', 'Emmanuel Dung', 'PSP/SICT/CSC/ND2/2023/002@student.plateau.edu.ng'),
    (s5_student_id, s5_profile_id, 'PSP/SICT/CSC/HND1/2024/001', 'HND1', crypt('555555', gen_salt('bf', 12)), 'paid', 'Faith Dakup', 'PSP/SICT/CSC/HND1/2024/001@student.plateau.edu.ng'),
    (s6_student_id, s6_profile_id, 'PSP/SICT/CSC/HND2/2023/001', 'HND2', crypt('666666', gen_salt('bf', 12)), 'paid', 'Samuel Gotip', 'PSP/SICT/CSC/HND2/2023/001@student.plateau.edu.ng');

  -- Add sample results for each student
  INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
  VALUES
    -- Student 1: Blessing Musa (ND1)
    (s1_student_id, 'CSC101', 'Introduction to Computer Science', 3, 'A', 15, 'ND1', '2023/2024', 'First'),
    (s1_student_id, 'MTH101', 'General Mathematics I', 3, 'B', 12, 'ND1', '2023/2024', 'First'),
    (s1_student_id, 'PHY101', 'General Physics I', 3, 'A', 15, 'ND1', '2023/2024', 'First'),
    (s1_student_id, 'ENG101', 'Use of English I', 2, 'B', 8, 'ND1', '2023/2024', 'First'),
    -- Student 2: David Gyang (ND1)
    (s2_student_id, 'CSC101', 'Introduction to Computer Science', 3, 'B', 12, 'ND1', '2023/2024', 'First'),
    (s2_student_id, 'MTH101', 'General Mathematics I', 3, 'A', 15, 'ND1', '2023/2024', 'First'),
    (s2_student_id, 'PHY101', 'General Physics I', 3, 'B', 12, 'ND1', '2023/2024', 'First'),
    (s2_student_id, 'ENG101', 'Use of English I', 2, 'A', 10, 'ND1', '2023/2024', 'First'),
    (s2_student_id, 'CHM101', 'General Chemistry I', 3, 'B', 12, 'ND1', '2023/2024', 'First'),
    -- Student 3: Grace Pam (ND2)
    (s3_student_id, 'CSC201', 'Data Structures', 4, 'A', 20, 'ND2', '2023/2024', 'First'),
    (s3_student_id, 'CSC203', 'Database Management Systems', 3, 'A', 15, 'ND2', '2023/2024', 'First'),
    (s3_student_id, 'MTH201', 'Linear Algebra', 3, 'B', 12, 'ND2', '2023/2024', 'First'),
    (s3_student_id, 'CSC205', 'Computer Architecture', 3, 'A', 15, 'ND2', '2023/2024', 'First'),
    -- Student 4: Emmanuel Dung (ND2)
    (s4_student_id, 'CSC201', 'Data Structures', 4, 'B', 16, 'ND2', '2023/2024', 'First'),
    (s4_student_id, 'CSC203', 'Database Management Systems', 3, 'B', 12, 'ND2', '2023/2024', 'First'),
    (s4_student_id, 'MTH201', 'Linear Algebra', 3, 'A', 15, 'ND2', '2023/2024', 'First'),
    (s4_student_id, 'CSC205', 'Computer Architecture', 3, 'B', 12, 'ND2', '2023/2024', 'First'),
    (s4_student_id, 'ENG201', 'Technical Writing', 2, 'A', 10, 'ND2', '2023/2024', 'First'),
    -- Student 5: Faith Dakup (HND1)
    (s5_student_id, 'CSC301', 'Software Engineering', 4, 'A', 20, 'HND1', '2023/2024', 'First'),
    (s5_student_id, 'CSC303', 'Operating Systems', 3, 'A', 15, 'HND1', '2023/2024', 'First'),
    (s5_student_id, 'CSC305', 'Computer Networks', 3, 'B', 12, 'HND1', '2023/2024', 'First'),
    (s5_student_id, 'MTH301', 'Numerical Methods', 3, 'A', 15, 'HND1', '2023/2024', 'First'),
    -- Student 6: Samuel Gotip (HND2)
    (s6_student_id, 'CSC401', 'Artificial Intelligence', 4, 'A', 20, 'HND2', '2023/2024', 'First'),
    (s6_student_id, 'CSC403', 'System Analysis and Design', 3, 'B', 12, 'HND2', '2023/2024', 'First'),
    (s6_student_id, 'CSC405', 'Mobile Application Development', 3, 'A', 15, 'HND2', '2023/2024', 'First'),
    (s6_student_id, 'CSC407', 'Project Management', 3, 'A', 15, 'HND2', '2023/2024', 'First'),
    (s6_student_id, 'ENT401', 'Entrepreneurship', 2, 'B', 8, 'HND2', '2023/2024', 'First');

  -- Update CGP and Total GP for all students
  UPDATE public.students s
  SET 
    total_gp = (
      SELECT COALESCE(SUM(r.point), 0)
      FROM public.results r
      WHERE r.student_id = s.id
    ),
    cgp = (
      SELECT CASE 
        WHEN SUM(r.credit_unit) > 0 THEN ROUND(SUM(r.point)::numeric / SUM(r.credit_unit)::numeric, 2)
        ELSE 0
      END
      FROM public.results r
      WHERE r.student_id = s.id
    )
  WHERE s.id IN (s1_student_id, s2_student_id, s3_student_id, s4_student_id, s5_student_id, s6_student_id);

END $$;