-- Fix results constraints and reseed data idempotently
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'results_level_check' AND conrelid = 'public.results'::regclass) THEN
    ALTER TABLE public.results DROP CONSTRAINT results_level_check;
  END IF;
  ALTER TABLE public.results ADD CONSTRAINT results_level_check 
    CHECK (level = ANY (ARRAY['ND1','ND2','HND1','HND2']));

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'results_semester_check' AND conrelid = 'public.results'::regclass) THEN
    ALTER TABLE public.results DROP CONSTRAINT results_semester_check;
  END IF;
  ALTER TABLE public.results ADD CONSTRAINT results_semester_check 
    CHECK (semester = ANY (ARRAY['first','second']));
END$$;

-- Reseed using corrected semester casing
DO $$
DECLARE
  rec RECORD;
  v_user_id uuid;
  v_profile_id uuid;
  v_student_id uuid;
BEGIN
  FOR rec IN (
    VALUES
    ('PLT/ND/2023/001','John Doe','ND1','08012345671','123456','paid', 3.45, 82.8, 0,
      jsonb_build_array(
        jsonb_build_object('code','MTH111','title','General Mathematics I','cu',3,'grade','B','pt',12.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','ENG111','title','English Language I','cu',2,'grade','A','pt',10.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','PHY111','title','General Physics I','cu',3,'grade','B','pt',12.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','CHM111','title','General Chemistry I','cu',3,'grade','A','pt',15.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','COM111','title','Computer Literacy','cu',2,'grade','A','pt',10.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','MTH112','title','General Mathematics II','cu',3,'grade','B','pt',12.0,'session','2023/2024','semester','second'),
        jsonb_build_object('code','ENG112','title','English Language II','cu',2,'grade','A','pt',10.0,'session','2023/2024','semester','second'),
        jsonb_build_object('code','STA111','title','Statistics','cu',2,'grade','B','pt',8.0,'session','2023/2024','semester','second')
      )
    ),
    ('PLT/ND/2023/002','Jane Smith','ND1','08012345672','234567','unpaid', 2.85, 68.4, 1,
      jsonb_build_array(
        jsonb_build_object('code','MTH111','title','General Mathematics I','cu',3,'grade','C','pt',9.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','ENG111','title','English Language I','cu',2,'grade','B','pt',8.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','PHY111','title','General Physics I','cu',3,'grade','C','pt',9.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','CHM111','title','General Chemistry I','cu',3,'grade','D','pt',6.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','COM111','title','Computer Literacy','cu',2,'grade','B','pt',8.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','MTH112','title','General Mathematics II','cu',3,'grade','C','pt',9.0,'session','2023/2024','semester','second'),
        jsonb_build_object('code','ENG112','title','English Language II','cu',2,'grade','B','pt',8.0,'session','2023/2024','semester','second'),
        jsonb_build_object('code','STA111','title','Statistics','cu',2,'grade','F','pt',0.0,'session','2023/2024','semester','second')
      )
    ),
    ('PLT/ND/2022/001','Michael Johnson','ND2','08012345673','345678','paid', 3.72, 111.6, 0,
      jsonb_build_array(
        jsonb_build_object('code','MTH211','title','Advanced Mathematics I','cu',4,'grade','A','pt',20.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','ENG211','title','Technical English','cu',2,'grade','A','pt',10.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','PHY211','title','Applied Physics','cu',3,'grade','A','pt',15.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','CHM211','title','Applied Chemistry','cu',3,'grade','B','pt',12.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','COM211','title','Computer Programming','cu',3,'grade','A','pt',15.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','MTH212','title','Advanced Mathematics II','cu',4,'grade','A','pt',20.0,'session','2022/2023','semester','second'),
        jsonb_build_object('code','ENG212','title','Communication Skills','cu',2,'grade','B','pt',8.0,'session','2022/2023','semester','second'),
        jsonb_build_object('code','STA211','title','Applied Statistics','cu',3,'grade','A','pt',15.0,'session','2022/2023','semester','second')
      )
    ),
    ('PLT/ND/2022/002','Sarah Wilson','ND2','08012345674','456789','unpaid', 2.45, 73.5, 2,
      jsonb_build_array(
        jsonb_build_object('code','MTH211','title','Advanced Mathematics I','cu',4,'grade','D','pt',8.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','ENG211','title','Technical English','cu',2,'grade','C','pt',6.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','PHY211','title','Applied Physics','cu',3,'grade','C','pt',9.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','CHM211','title','Applied Chemistry','cu',3,'grade','D','pt',6.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','COM211','title','Computer Programming','cu',3,'grade','F','pt',0.0,'session','2022/2023','semester','first'),
        jsonb_build_object('code','MTH212','title','Advanced Mathematics II','cu',4,'grade','C','pt',12.0,'session','2022/2023','semester','second'),
        jsonb_build_object('code','ENG212','title','Communication Skills','cu',2,'grade','C','pt',6.0,'session','2022/2023','semester','second'),
        jsonb_build_object('code','STA211','title','Applied Statistics','cu',3,'grade','F','pt',0.0,'session','2022/2023','semester','second')
      )
    ),
    ('PLT/HND/2023/001','David Brown','HND1','08012345675','567890','paid', 3.95, 118.5, 0,
      jsonb_build_array(
        jsonb_build_object('code','MTH311','title','Higher Mathematics I','cu',4,'grade','A','pt',20.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','ENG311','title','Advanced English','cu',2,'grade','A','pt',10.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','PHY311','title','Engineering Physics','cu',4,'grade','A','pt',20.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','CHM311','title','Industrial Chemistry','cu',3,'grade','A','pt',15.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','COM311','title','Advanced Programming','cu',3,'grade','A','pt',15.0,'session','2023/2024','semester','first'),
        jsonb_build_object('code','MTH312','title','Higher Mathematics II','cu',4,'grade','A','pt',20.0,'session','2023/2024','semester','second'),
        jsonb_build_object('code','ENG312','title','Project Management','cu',2,'grade','B','pt',8.0,'session','2023/2024','semester','second'),
        jsonb_build_object('code','STA311','title','Research Methods','cu',3,'grade','A','pt',15.0,'session','2023/2024','semester','second')
      )
    )
  ) LOOP
    SELECT id INTO v_user_id FROM auth.users WHERE email = rec.column1 || '@student.plateau.edu.ng';
    IF v_user_id IS NULL THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated','authenticated',
        rec.column1 || '@student.plateau.edu.ng', crypt(rec.column5, gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('role','student','full_name',rec.column2,'matric_number',rec.column1,'level',rec.column3,'phone_number',rec.column4),
        now(), now(), '', '', '', ''
      ) RETURNING id INTO v_user_id;
    END IF;

    INSERT INTO public.profiles (id, user_id, role, full_name, matric_number, phone_number, level, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, 'student', rec.column2, rec.column1, rec.column4, rec.column3, now(), now())
    ON CONFLICT (matric_number)
    DO UPDATE SET 
      user_id = EXCLUDED.user_id,
      full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number,
      level = EXCLUDED.level,
      updated_at = now()
    RETURNING id INTO v_profile_id;

    SELECT id INTO v_student_id FROM public.students WHERE profile_id = v_profile_id;
    IF v_student_id IS NULL THEN
      INSERT INTO public.students (id, profile_id, matric_number, level, pin, fee_status, cgp, total_gp, carryovers, created_at, updated_at)
      VALUES (gen_random_uuid(), v_profile_id, rec.column1, rec.column3, rec.column5, rec.column6, rec.column7, rec.column8, rec.column9, now(), now())
      RETURNING id INTO v_student_id;
    ELSE
      UPDATE public.students
        SET level = rec.column3,
            pin = rec.column5,
            fee_status = rec.column6,
            cgp = rec.column7,
            total_gp = rec.column8,
            carryovers = rec.column9,
            matric_number = rec.column1,
            updated_at = now()
      WHERE id = v_student_id;
    END IF;

    DELETE FROM public.results WHERE student_id = v_student_id;
    INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester, created_at)
    SELECT 
      v_student_id,
      (elem->>'code')::text,
      (elem->>'title')::text,
      (elem->>'cu')::int,
      (elem->>'grade')::text,
      (elem->>'pt')::numeric,
      rec.column3,
      (elem->>'session')::text,
      (elem->>'semester')::text,
      now()
    FROM jsonb_array_elements(rec.column10) AS elem;
  END LOOP;
END$$;