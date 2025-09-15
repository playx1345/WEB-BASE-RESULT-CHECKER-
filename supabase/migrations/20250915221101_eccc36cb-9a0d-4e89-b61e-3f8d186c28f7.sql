-- Create sample student records directly without auth users
-- First, insert dummy profiles linked to existing or dummy user IDs that we'll create

-- First, let's just insert students and results for testing without auth integration
-- We'll use the admin_create_student function to properly create students

-- Let's create students using the admin function but need to modify approach
-- Instead, let's insert sample data that works with existing constraints

-- First, clean up any existing sample data to avoid conflicts
DELETE FROM public.results WHERE student_id IN (
  SELECT id FROM public.students WHERE matric_number LIKE 'PLT/%/2023/%' OR matric_number LIKE 'PLT/%/2022/%'
);
DELETE FROM public.students WHERE matric_number LIKE 'PLT/%/2023/%' OR matric_number LIKE 'PLT/%/2022/%';
DELETE FROM public.profiles WHERE matric_number LIKE 'PLT/%/2023/%' OR matric_number LIKE 'PLT/%/2022/%';

-- For now, let's create simplified sample data by directly inserting into students table
-- This won't have auth integration but will populate the dashboard with data

INSERT INTO public.students (id, matric_number, level, pin, fee_status, cgp, total_gp, carryovers, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'PLT/ND/2023/001', 'ND1', '123456', 'paid', 3.45, 82.8, 0, now(), now()),
('660e8400-e29b-41d4-a716-446655440002', 'PLT/ND/2023/002', 'ND1', '234567', 'unpaid', 2.85, 68.4, 1, now(), now()),
('660e8400-e29b-41d4-a716-446655440003', 'PLT/ND/2022/001', 'ND2', '345678', 'paid', 3.72, 111.6, 0, now(), now()),
('660e8400-e29b-41d4-a716-446655440004', 'PLT/ND/2022/002', 'ND2', '456789', 'unpaid', 2.45, 73.5, 2, now(), now()),
('660e8400-e29b-41d4-a716-446655440005', 'PLT/HND/2023/001', 'HND1', '567890', 'paid', 3.95, 118.5, 0, now(), now());

-- Insert sample results for all students
-- John Doe (ND1, Paid) - PLT/ND/2023/001
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'MTH111', 'General Mathematics I', 3, 'B', 12.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'ENG111', 'English Language I', 2, 'A', 10.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'PHY111', 'General Physics I', 3, 'B', 12.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'CHM111', 'General Chemistry I', 3, 'A', 15.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'COM111', 'Computer Literacy', 2, 'A', 10.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'MTH112', 'General Mathematics II', 3, 'B', 12.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440001', 'ENG112', 'English Language II', 2, 'A', 10.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440001', 'STA111', 'Statistics', 2, 'B', 8.0, 'ND1', '2023/2024', 'Second', now());

-- Jane Smith (ND1, Unpaid) - PLT/ND/2023/002
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440002', 'MTH111', 'General Mathematics I', 3, 'C', 9.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'ENG111', 'English Language I', 2, 'B', 8.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'PHY111', 'General Physics I', 3, 'C', 9.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'CHM111', 'General Chemistry I', 3, 'D', 6.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'COM111', 'Computer Literacy', 2, 'B', 8.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'MTH112', 'General Mathematics II', 3, 'C', 9.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440002', 'ENG112', 'English Language II', 2, 'B', 8.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440002', 'STA111', 'Statistics', 2, 'F', 0.0, 'ND1', '2023/2024', 'Second', now());

-- Michael Johnson (ND2, Paid) - PLT/ND/2022/001
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440003', 'MTH211', 'Advanced Mathematics I', 4, 'A', 20.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'ENG211', 'Technical English', 2, 'A', 10.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'PHY211', 'Applied Physics', 3, 'A', 15.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'CHM211', 'Applied Chemistry', 3, 'B', 12.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'COM211', 'Computer Programming', 3, 'A', 15.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'MTH212', 'Advanced Mathematics II', 4, 'A', 20.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440003', 'ENG212', 'Communication Skills', 2, 'B', 8.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440003', 'STA211', 'Applied Statistics', 3, 'A', 15.0, 'ND2', '2022/2023', 'Second', now());

-- Sarah Wilson (ND2, Unpaid) - PLT/ND/2022/002
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440004', 'MTH211', 'Advanced Mathematics I', 4, 'D', 8.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'ENG211', 'Technical English', 2, 'C', 6.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'PHY211', 'Applied Physics', 3, 'C', 9.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'CHM211', 'Applied Chemistry', 3, 'D', 6.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'COM211', 'Computer Programming', 3, 'F', 0.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'MTH212', 'Advanced Mathematics II', 4, 'C', 12.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440004', 'ENG212', 'Communication Skills', 2, 'C', 6.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440004', 'STA211', 'Applied Statistics', 3, 'F', 0.0, 'ND2', '2022/2023', 'Second', now());

-- David Brown (HND1, Paid) - PLT/HND/2023/001
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440005', 'MTH311', 'Higher Mathematics I', 4, 'A', 20.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'ENG311', 'Advanced English', 2, 'A', 10.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'PHY311', 'Engineering Physics', 4, 'A', 20.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'CHM311', 'Industrial Chemistry', 3, 'A', 15.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'COM311', 'Advanced Programming', 3, 'A', 15.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'MTH312', 'Higher Mathematics II', 4, 'A', 20.0, 'HND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440005', 'ENG312', 'Project Management', 2, 'B', 8.0, 'HND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440005', 'STA311', 'Research Methods', 3, 'A', 15.0, 'HND1', '2023/2024', 'Second', now());