-- Add sample course results for students
DO $$
DECLARE
  v_student_id uuid;
BEGIN
  -- Get Blessing Musa's student ID and add results
  SELECT id INTO v_student_id FROM public.students WHERE matric_number = 'PSP/SICT/ND1/CS/001';
  IF v_student_id IS NOT NULL THEN
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC101', 'Introduction to Computer Science', 3, 'A', 5.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'CSC102', 'Computer Programming I', 3, 'A', 5.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'MTH101', 'Mathematics I', 3, 'B', 4.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'GNS101', 'Use of English I', 2, 'A', 5.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'GNS102', 'Citizenship Education', 2, 'B', 4.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'CSC103', 'Computer Hardware', 2, 'A', 5.0, 'first', '2024/2025', 'ND1');
  END IF;

  -- Get David Gyang's student ID and add results
  SELECT id INTO v_student_id FROM public.students WHERE matric_number = 'PSP/SICT/ND1/CS/002';
  IF v_student_id IS NOT NULL THEN
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC101', 'Introduction to Computer Science', 3, 'B', 4.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'CSC102', 'Computer Programming I', 3, 'A', 5.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'MTH101', 'Mathematics I', 3, 'C', 3.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'GNS101', 'Use of English I', 2, 'B', 4.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'GNS102', 'Citizenship Education', 2, 'B', 4.0, 'first', '2024/2025', 'ND1'),
    (v_student_id, 'CSC103', 'Computer Hardware', 2, 'B', 4.0, 'first', '2024/2025', 'ND1');
  END IF;

  -- Get Grace Pam's student ID and add results (ND2 - has more semesters)
  SELECT id INTO v_student_id FROM public.students WHERE matric_number = 'PSP/SICT/ND2/CS/001';
  IF v_student_id IS NOT NULL THEN
    -- First semester ND1
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC101', 'Introduction to Computer Science', 3, 'A', 5.0, 'first', '2023/2024', 'ND1'),
    (v_student_id, 'CSC102', 'Computer Programming I', 3, 'A', 5.0, 'first', '2023/2024', 'ND1'),
    (v_student_id, 'MTH101', 'Mathematics I', 3, 'A', 5.0, 'first', '2023/2024', 'ND1'),
    (v_student_id, 'GNS101', 'Use of English I', 2, 'A', 5.0, 'first', '2023/2024', 'ND1');
    -- Second semester ND1
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC104', 'Computer Programming II', 3, 'A', 5.0, 'second', '2023/2024', 'ND1'),
    (v_student_id, 'CSC105', 'Data Structures', 3, 'B', 4.0, 'second', '2023/2024', 'ND1'),
    (v_student_id, 'MTH102', 'Mathematics II', 3, 'A', 5.0, 'second', '2023/2024', 'ND1');
    -- First semester ND2
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC201', 'Database Management', 3, 'A', 5.0, 'first', '2024/2025', 'ND2'),
    (v_student_id, 'CSC202', 'Web Development', 3, 'A', 5.0, 'first', '2024/2025', 'ND2'),
    (v_student_id, 'CSC203', 'Operating Systems', 3, 'B', 4.0, 'first', '2024/2025', 'ND2');
  END IF;

  -- Get Emmanuel Dung's student ID and add results (has some carryovers)
  SELECT id INTO v_student_id FROM public.students WHERE matric_number = 'PSP/SICT/ND2/CS/002';
  IF v_student_id IS NOT NULL THEN
    -- First semester ND1
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC101', 'Introduction to Computer Science', 3, 'C', 3.0, 'first', '2023/2024', 'ND1'),
    (v_student_id, 'CSC102', 'Computer Programming I', 3, 'D', 2.0, 'first', '2023/2024', 'ND1'),
    (v_student_id, 'MTH101', 'Mathematics I', 3, 'F', 0.0, 'first', '2023/2024', 'ND1'),
    (v_student_id, 'GNS101', 'Use of English I', 2, 'C', 3.0, 'first', '2023/2024', 'ND1');
    -- Second semester ND1
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC104', 'Computer Programming II', 3, 'C', 3.0, 'second', '2023/2024', 'ND1'),
    (v_student_id, 'CSC105', 'Data Structures', 3, 'D', 2.0, 'second', '2023/2024', 'ND1'),
    (v_student_id, 'MTH102', 'Mathematics II', 3, 'C', 3.0, 'second', '2023/2024', 'ND1');
    -- First semester ND2
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, semester, session, level) VALUES
    (v_student_id, 'CSC201', 'Database Management', 3, 'B', 4.0, 'first', '2024/2025', 'ND2'),
    (v_student_id, 'CSC202', 'Web Development', 3, 'C', 3.0, 'first', '2024/2025', 'ND2'),
    (v_student_id, 'CSC203', 'Operating Systems', 3, 'D', 2.0, 'first', '2024/2025', 'ND2');
    
    -- Update carryovers count
    UPDATE public.students SET carryovers = 2 WHERE id = v_student_id;
  END IF;

  RAISE NOTICE 'Sample results added successfully';
END $$;