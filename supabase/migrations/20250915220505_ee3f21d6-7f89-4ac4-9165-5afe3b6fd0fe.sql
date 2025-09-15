-- Insert sample students using the admin_create_student function
-- We'll create these without the admin profile first since we need to create a proper admin account

-- Student 1
SELECT admin_create_student(
  'John Doe',
  'PLT/ND/2023/001',
  'ND1',
  '+234-801-234-5678',
  '123456'
);

-- Student 2
SELECT admin_create_student(
  'Jane Smith',
  'PLT/ND/2023/002',
  'ND1',
  '+234-802-345-6789',
  '234567'
);

-- Student 3
SELECT admin_create_student(
  'Michael Johnson',
  'PLT/ND/2022/001',
  'ND2',
  '+234-803-456-7890',
  '345678'
);

-- Student 4
SELECT admin_create_student(
  'Sarah Wilson',
  'PLT/ND/2022/002',
  'ND2',
  '+234-804-567-8901',
  '456789'
);

-- Student 5
SELECT admin_create_student(
  'David Brown',
  'PLT/HND/2023/001',
  'HND1',
  '+234-805-678-9012',
  '567890'
);

-- Add sample results for these students
INSERT INTO public.results (
  student_id,
  course_code,
  course_title,
  credit_unit,
  grade,
  point,
  level,
  session,
  semester
) VALUES
-- Results for John Doe (PLT/ND/2023/001)
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/001'), 'MTH101', 'Mathematics I', 3, 'A', 15.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/001'), 'ENG101', 'English Language I', 2, 'B', 8.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/001'), 'CSC101', 'Introduction to Computing', 3, 'A', 15.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/001'), 'PHY101', 'Physics I', 3, 'B', 12.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/001'), 'CHM101', 'Chemistry I', 2, 'C', 6.0, 'ND1', '2023/2024', 'First'),

-- Results for Jane Smith (PLT/ND/2023/002)
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/002'), 'MTH101', 'Mathematics I', 3, 'B', 12.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/002'), 'ENG101', 'English Language I', 2, 'A', 10.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/002'), 'CSC101', 'Introduction to Computing', 3, 'A', 15.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/002'), 'PHY101', 'Physics I', 3, 'B', 12.0, 'ND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2023/002'), 'CHM101', 'Chemistry I', 2, 'B', 8.0, 'ND1', '2023/2024', 'First'),

-- Results for Michael Johnson (PLT/ND/2022/001) - ND2 level
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/001'), 'MTH201', 'Mathematics II', 3, 'A', 15.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/001'), 'ENG201', 'English Language II', 2, 'B', 8.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/001'), 'CSC201', 'Data Structures', 4, 'A', 20.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/001'), 'CSC202', 'Database Systems', 3, 'B', 12.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/001'), 'CSC203', 'Web Development', 3, 'A', 15.0, 'ND2', '2023/2024', 'First'),

-- Results for Sarah Wilson (PLT/ND/2022/002) - ND2 level
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/002'), 'MTH201', 'Mathematics II', 3, 'B', 12.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/002'), 'ENG201', 'English Language II', 2, 'A', 10.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/002'), 'CSC201', 'Data Structures', 4, 'B', 16.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/002'), 'CSC202', 'Database Systems', 3, 'C', 9.0, 'ND2', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/ND/2022/002'), 'CSC203', 'Web Development', 3, 'B', 12.0, 'ND2', '2023/2024', 'First'),

-- Results for David Brown (PLT/HND/2023/001) - HND1 level
((SELECT id FROM students WHERE matric_number = 'PLT/HND/2023/001'), 'MTH301', 'Advanced Mathematics', 4, 'A', 20.0, 'HND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/HND/2023/001'), 'CSC301', 'Software Engineering', 4, 'A', 20.0, 'HND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/HND/2023/001'), 'CSC302', 'Computer Networks', 3, 'B', 12.0, 'HND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/HND/2023/001'), 'CSC303', 'Mobile App Development', 3, 'A', 15.0, 'HND1', '2023/2024', 'First'),
((SELECT id FROM students WHERE matric_number = 'PLT/HND/2023/001'), 'ENG301', 'Technical Writing', 2, 'B', 8.0, 'HND1', '2023/2024', 'First');

-- Update student CGP and total GP based on results
UPDATE students SET 
  total_gp = (
    SELECT COALESCE(SUM(r.point), 0)
    FROM results r 
    WHERE r.student_id = students.id
  ),
  cgp = (
    SELECT CASE 
      WHEN SUM(r.credit_unit) > 0 THEN 
        ROUND(SUM(r.point) / SUM(r.credit_unit), 2)
      ELSE 0 
    END
    FROM results r 
    WHERE r.student_id = students.id
  );

-- Update fee status for some students to demonstrate different states
UPDATE students SET fee_status = 'paid' WHERE matric_number IN ('PLT/ND/2023/001', 'PLT/ND/2022/001', 'PLT/HND/2023/001');
UPDATE students SET fee_status = 'unpaid' WHERE matric_number IN ('PLT/ND/2023/002', 'PLT/ND/2022/002');