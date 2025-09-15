-- First, drop the existing level check constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_level_check;

-- Add a new check constraint that includes HND levels
ALTER TABLE public.profiles ADD CONSTRAINT profiles_level_check 
CHECK (level = ANY (ARRAY['ND1'::text, 'ND2'::text, 'HND1'::text, 'HND2'::text]));

-- Also update the students table level constraint if it exists
DO $$
BEGIN
    -- Check if constraint exists and drop it
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_level_check' AND conrelid = 'public.students'::regclass) THEN
        ALTER TABLE public.students DROP CONSTRAINT students_level_check;
    END IF;
    
    -- Add new constraint for students table
    ALTER TABLE public.students ADD CONSTRAINT students_level_check 
    CHECK (level = ANY (ARRAY['ND1'::text, 'ND2'::text, 'HND1'::text, 'HND2'::text]));
END
$$;

-- Now insert the sample data
-- Insert sample profiles (these will be referenced by students)
INSERT INTO public.profiles (id, user_id, role, full_name, matric_number, phone_number, level, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'student', 'John Doe', 'PLT/ND/2023/001', '08012345671', 'ND1', now(), now()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'student', 'Jane Smith', 'PLT/ND/2023/002', '08012345672', 'ND1', now(), now()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', 'student', 'Michael Johnson', 'PLT/ND/2022/001', '08012345673', 'ND2', now(), now()),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440014', 'student', 'Sarah Wilson', 'PLT/ND/2022/002', '08012345674', 'ND2', now(), now()),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440015', 'student', 'David Brown', 'PLT/HND/2023/001', '08012345675', 'HND1', now(), now());

-- Insert corresponding students
INSERT INTO public.students (id, profile_id, matric_number, level, pin, fee_status, cgp, total_gp, carryovers, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'PLT/ND/2023/001', 'ND1', '123456', 'paid', 3.45, 82.8, 0, now(), now()),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'PLT/ND/2023/002', 'ND1', '234567', 'unpaid', 2.85, 68.4, 1, now(), now()),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'PLT/ND/2022/001', 'ND2', '345678', 'paid', 3.72, 111.6, 0, now(), now()),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'PLT/ND/2022/002', 'ND2', '456789', 'unpaid', 2.45, 73.5, 2, now(), now()),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'PLT/HND/2023/001', 'HND1', '567890', 'paid', 3.95, 118.5, 0, now(), now());

-- Insert sample results for John Doe (ND1, Paid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'MTH111', 'General Mathematics I', 3, 'B', 12.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'ENG111', 'English Language I', 2, 'A', 10.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'PHY111', 'General Physics I', 3, 'B', 12.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'CHM111', 'General Chemistry I', 3, 'A', 15.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'COM111', 'Computer Literacy', 2, 'A', 10.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440001', 'MTH112', 'General Mathematics II', 3, 'B', 12.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440001', 'ENG112', 'English Language II', 2, 'A', 10.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440001', 'STA111', 'Statistics', 2, 'B', 8.0, 'ND1', '2023/2024', 'Second', now());

-- Insert sample results for Jane Smith (ND1, Unpaid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440002', 'MTH111', 'General Mathematics I', 3, 'C', 9.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'ENG111', 'English Language I', 2, 'B', 8.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'PHY111', 'General Physics I', 3, 'C', 9.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'CHM111', 'General Chemistry I', 3, 'D', 6.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'COM111', 'Computer Literacy', 2, 'B', 8.0, 'ND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440002', 'MTH112', 'General Mathematics II', 3, 'C', 9.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440002', 'ENG112', 'English Language II', 2, 'B', 8.0, 'ND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440002', 'STA111', 'Statistics', 2, 'F', 0.0, 'ND1', '2023/2024', 'Second', now());

-- Insert sample results for Michael Johnson (ND2, Paid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440003', 'MTH211', 'Advanced Mathematics I', 4, 'A', 20.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'ENG211', 'Technical English', 2, 'A', 10.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'PHY211', 'Applied Physics', 3, 'A', 15.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'CHM211', 'Applied Chemistry', 3, 'B', 12.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'COM211', 'Computer Programming', 3, 'A', 15.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440003', 'MTH212', 'Advanced Mathematics II', 4, 'A', 20.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440003', 'ENG212', 'Communication Skills', 2, 'B', 8.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440003', 'STA211', 'Applied Statistics', 3, 'A', 15.0, 'ND2', '2022/2023', 'Second', now());

-- Insert sample results for Sarah Wilson (ND2, Unpaid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440004', 'MTH211', 'Advanced Mathematics I', 4, 'D', 8.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'ENG211', 'Technical English', 2, 'C', 6.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'PHY211', 'Applied Physics', 3, 'C', 9.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'CHM211', 'Applied Chemistry', 3, 'D', 6.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'COM211', 'Computer Programming', 3, 'F', 0.0, 'ND2', '2022/2023', 'First', now()),
('660e8400-e29b-41d4-a716-446655440004', 'MTH212', 'Advanced Mathematics II', 4, 'C', 12.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440004', 'ENG212', 'Communication Skills', 2, 'C', 6.0, 'ND2', '2022/2023', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440004', 'STA211', 'Applied Statistics', 3, 'F', 0.0, 'ND2', '2022/2023', 'Second', now());

-- Insert sample results for David Brown (HND1, Paid)
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440005', 'MTH311', 'Higher Mathematics I', 4, 'A', 20.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'ENG311', 'Advanced English', 2, 'A', 10.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'PHY311', 'Engineering Physics', 4, 'A', 20.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'CHM311', 'Industrial Chemistry', 3, 'A', 15.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'COM311', 'Advanced Programming', 3, 'A', 15.0, 'HND1', '2023/2024', 'First', now()),
('660e8400-e29b-41d4-a716-446655440005', 'MTH312', 'Higher Mathematics II', 4, 'A', 20.0, 'HND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440005', 'ENG312', 'Project Management', 2, 'B', 8.0, 'HND1', '2023/2024', 'Second', now()),
('660e8400-e29b-41d4-a716-446655440005', 'STA311', 'Research Methods', 3, 'A', 15.0, 'HND1', '2023/2024', 'Second', now());

-- Insert some sample announcements
INSERT INTO public.announcements (created_by, title, content, target_level, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Welcome to New Academic Session', 'Welcome all students to the 2023/2024 academic session. Classes will commence on Monday, September 18th, 2023.', 'all', now(), now()),
('550e8400-e29b-41d4-a716-446655440001', 'ND1 Orientation Program', 'All ND1 students are expected to attend the orientation program scheduled for Friday, September 15th, 2023 at the main auditorium.', 'ND1', now(), now()),
('550e8400-e29b-41d4-a716-446655440001', 'Fee Payment Reminder', 'Students with outstanding fees are reminded to complete their payments before the deadline to avoid penalties.', 'all', now(), now());