-- Seed sample data: create 5 student auth users, profiles, students and results
-- Ensure level constraints allow HND levels
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_level_check' 
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_level_check;
  END IF;
  
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_level_check 
  CHECK (level = ANY (ARRAY['ND1'::text, 'ND2'::text, 'HND1'::text, 'HND2'::text]));

  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'students_level_check' 
      AND conrelid = 'public.students'::regclass
  ) THEN
    ALTER TABLE public.students DROP CONSTRAINT students_level_check;
  END IF;

  ALTER TABLE public.students ADD CONSTRAINT students_level_check 
  CHECK (level = ANY (ARRAY['ND1'::text, 'ND2'::text, 'HND1'::text, 'HND2'::text]));
END$$;

-- Clean previous sample data if any
DELETE FROM public.results WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE matric_number IN (
    'PLT/ND/2023/001','PLT/ND/2023/002','PLT/ND/2022/001','PLT/ND/2022/002','PLT/HND/2023/001'
  )
);
DELETE FROM public.students WHERE matric_number IN (
  'PLT/ND/2023/001','PLT/ND/2023/002','PLT/ND/2022/001','PLT/ND/2022/002','PLT/HND/2023/001'
);
DELETE FROM public.profiles WHERE matric_number IN (
  'PLT/ND/2023/001','PLT/ND/2023/002','PLT/ND/2022/001','PLT/ND/2022/002','PLT/HND/2023/001'
);
DELETE FROM auth.users WHERE email IN (
  'PLT/ND/2023/001@student.plateau.edu.ng',
  'PLT/ND/2023/002@student.plateau.edu.ng',
  'PLT/ND/2022/001@student.plateau.edu.ng',
  'PLT/ND/2022/002@student.plateau.edu.ng',
  'PLT/HND/2023/001@student.plateau.edu.ng'
);

-- Create auth users for students (so RLS works and they can log in)
-- Note: Using same pattern as admin_create_student function
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
('00000000-0000-0000-0000-000000000000','11111111-1111-4111-8111-111111111111','authenticated','authenticated','PLT/ND/2023/001@student.plateau.edu.ng',crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"John Doe","matric_number":"PLT/ND/2023/001","level":"ND1","phone_number":"08012345671"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000','22222222-2222-4222-8222-222222222222','authenticated','authenticated','PLT/ND/2023/002@student.plateau.edu.ng',crypt('234567', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"Jane Smith","matric_number":"PLT/ND/2023/002","level":"ND1","phone_number":"08012345672"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000','33333333-3333-4333-8333-333333333333','authenticated','authenticated','PLT/ND/2022/001@student.plateau.edu.ng',crypt('345678', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"Michael Johnson","matric_number":"PLT/ND/2022/001","level":"ND2","phone_number":"08012345673"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000','44444444-4444-4444-8444-444444444444','authenticated','authenticated','PLT/ND/2022/002@student.plateau.edu.ng',crypt('456789', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"Sarah Wilson","matric_number":"PLT/ND/2022/002","level":"ND2","phone_number":"08012345674"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000','55555555-5555-4555-8555-555555555555','authenticated','authenticated','PLT/HND/2023/001@student.plateau.edu.ng',crypt('567890', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"David Brown","matric_number":"PLT/HND/2023/001","level":"HND1","phone_number":"08012345675"}', now(), now(), '', '', '', '');

-- Create profiles for these users
INSERT INTO public.profiles (id, user_id, role, full_name, matric_number, phone_number, level, created_at, updated_at) VALUES
('aaaaaaa1-aaaa-41aa-8aaa-aaaaaaaaaaa1','11111111-1111-4111-8111-111111111111','student','John Doe','PLT/ND/2023/001','08012345671','ND1', now(), now()),
('aaaaaaa2-aaaa-42aa-8aaa-aaaaaaaaaaa2','22222222-2222-4222-8222-222222222222','student','Jane Smith','PLT/ND/2023/002','08012345672','ND1', now(), now()),
('aaaaaaa3-aaaa-43aa-8aaa-aaaaaaaaaaa3','33333333-3333-4333-8333-333333333333','student','Michael Johnson','PLT/ND/2022/001','08012345673','ND2', now(), now()),
('aaaaaaa4-aaaa-44aa-8aaa-aaaaaaaaaaa4','44444444-4444-4444-8444-444444444444','student','Sarah Wilson','PLT/ND/2022/002','08012345674','ND2', now(), now()),
('aaaaaaa5-aaaa-45aa-8aaa-aaaaaaaaaaa5','55555555-5555-4555-8555-555555555555','student','David Brown','PLT/HND/2023/001','08012345675','HND1', now(), now());

-- Create students linked to profiles
INSERT INTO public.students (id, profile_id, matric_number, level, pin, fee_status, cgp, total_gp, carryovers, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001','aaaaaaa1-aaaa-41aa-8aaa-aaaaaaaaaaa1','PLT/ND/2023/001','ND1','123456','paid',3.45,82.8,0, now(), now()),
('660e8400-e29b-41d4-a716-446655440002','aaaaaaa2-aaaa-42aa-8aaa-aaaaaaaaaaa2','PLT/ND/2023/002','ND1','234567','unpaid',2.85,68.4,1, now(), now()),
('660e8400-e29b-41d4-a716-446655440003','aaaaaaa3-aaaa-43aa-8aaa-aaaaaaaaaaa3','PLT/ND/2022/001','ND2','345678','paid',3.72,111.6,0, now(), now()),
('660e8400-e29b-41d4-a716-446655440004','aaaaaaa4-aaaa-44aa-8aaa-aaaaaaaaaaa4','PLT/ND/2022/002','ND2','456789','unpaid',2.45,73.5,2, now(), now()),
('660e8400-e29b-41d4-a716-446655440005','aaaaaaa5-aaaa-45aa-8aaa-aaaaaaaaaaa5','PLT/HND/2023/001','HND1','567890','paid',3.95,118.5,0, now(), now());

-- Insert sample results
-- John Doe (ND1, Paid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001','MTH111','General Mathematics I',3,'B',12.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440001','ENG111','English Language I',2,'A',10.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440001','PHY111','General Physics I',3,'B',12.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440001','CHM111','General Chemistry I',3,'A',15.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440001','COM111','Computer Literacy',2,'A',10.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440001','MTH112','General Mathematics II',3,'B',12.0,'ND1','2023/2024','Second', now()),
('660e8400-e29b-41d4-a716-446655440001','ENG112','English Language II',2,'A',10.0,'ND1','2023/2024','Second', now()),
('660e8400-e29b-41d4-a716-446655440001','STA111','Statistics',2,'B',8.0,'ND1','2023/2024','Second', now());

-- Jane Smith (ND1, Unpaid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440002','MTH111','General Mathematics I',3,'C',9.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440002','ENG111','English Language I',2,'B',8.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440002','PHY111','General Physics I',3,'C',9.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440002','CHM111','General Chemistry I',3,'D',6.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440002','COM111','Computer Literacy',2,'B',8.0,'ND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440002','MTH112','General Mathematics II',3,'C',9.0,'ND1','2023/2024','Second', now()),
('660e8400-e29b-41d4-a716-446655440002','ENG112','English Language II',2,'B',8.0,'ND1','2023/2024','Second', now()),
('660e8400-e29b-41d4-a716-446655440002','STA111','Statistics',2,'F',0.0,'ND1','2023/2024','Second', now());

-- Michael Johnson (ND2, Paid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440003','MTH211','Advanced Mathematics I',4,'A',20.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440003','ENG211','Technical English',2,'A',10.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440003','PHY211','Applied Physics',3,'A',15.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440003','CHM211','Applied Chemistry',3,'B',12.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440003','COM211','Computer Programming',3,'A',15.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440003','MTH212','Advanced Mathematics II',4,'A',20.0,'ND2','2022/2023','Second', now()),
('660e8400-e29b-41d4-a716-446655440003','ENG212','Communication Skills',2,'B',8.0,'ND2','2022/2023','Second', now()),
('660e8400-e29b-41d4-a716-446655440003','STA211','Applied Statistics',3,'A',15.0,'ND2','2022/2023','Second', now());

-- Sarah Wilson (ND2, Unpaid)
INSERT INTO public.results (student_id, course_id, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440004','MTH211','Advanced Mathematics I',4,'D',8.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440004','ENG211','Technical English',2,'C',6.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440004','PHY211','Applied Physics',3,'C',9.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440004','CHM211','Applied Chemistry',3,'D',6.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440004','COM211','Computer Programming',3,'F',0.0,'ND2','2022/2023','First', now()),
('660e8400-e29b-41d4-a716-446655440004','MTH212','Advanced Mathematics II',4,'C',12.0,'ND2','2022/2023','Second', now()),
('660e8400-e29b-41d4-a716-446655440004','ENG212','Communication Skills',2,'C',6.0,'ND2','2022/2023','Second', now()),
('660e8400-e29b-41d4-a716-446655440004','STA211','Applied Statistics',3,'F',0.0,'ND2','2022/2023','Second', now());

-- David Brown (HND1, Paid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440005','MTH311','Higher Mathematics I',4,'A',20.0,'HND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440005','ENG311','Advanced English',2,'A',10.0,'HND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440005','PHY311','Engineering Physics',4,'A',20.0,'HND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440005','CHM311','Industrial Chemistry',3,'A',15.0,'HND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440005','COM311','Advanced Programming',3,'A',15.0,'HND1','2023/2024','First', now()),
('660e8400-e29b-41d4-a716-446655440005','MTH312','Higher Mathematics II',4,'A',20.0,'HND1','2023/2024','Second', now()),
('660e8400-e29b-41d4-a716-446655440005','ENG312','Project Management',2,'B',8.0,'HND1','2023/2024','Second', now()),
('660e8400-e29b-41d4-a716-446655440005','STA311','Research Methods',3,'A',15.0,'HND1','2023/2024','Second', now());