-- Create 30 demo students for admin management
DO $$
DECLARE
  student_data RECORD;
  new_user_id uuid;
  new_profile_id uuid;
  generated_pin text;
BEGIN
  -- Array of student data: (full_name, matric_number, level, phone_number, fee_status, cgpa, carryovers)
  FOR student_data IN 
    SELECT * FROM (VALUES
      -- ND2 Students (Year 23)
      ('Adebayo Oluwaseun', 'PSP/SICT/CSC/ND/23/004', 'ND2', '+2348012345001', 'paid', 3.45, 0),
      ('Chukwuemeka Nnamdi', 'PSP/SICT/CSC/ND/23/005', 'ND2', '+2348012345002', 'paid', 3.78, 0),
      ('Fatima Ibrahim', 'PSP/SICT/CSC/ND/23/006', 'ND2', '+2348012345003', 'paid', 3.92, 0),
      ('Gyang Dakum', 'PSP/SICT/CSC/ND/23/007', 'ND2', '+2348012345004', 'unpaid', 2.85, 1),
      ('Chidinma Okafor', 'PSP/SICT/CSC/ND/23/008', 'ND2', '+2348012345005', 'paid', 3.56, 0),
      ('Abdullahi Musa', 'PSP/SICT/CSC/ND/23/009', 'ND2', '+2348012345006', 'paid', 3.34, 1),
      ('Ngozip Pwajok', 'PSP/SICT/CSC/ND/23/010', 'ND2', '+2348012345007', 'paid', 3.67, 0),
      ('Ayomide Adeyemi', 'PSP/SICT/CSC/ND/23/011', 'ND2', '+2348012345008', 'unpaid', 2.45, 2),
      ('Blessing Okoro', 'PSP/SICT/CSC/ND/23/012', 'ND2', '+2348012345009', 'paid', 3.89, 0),
      ('Yusuf Hassan', 'PSP/SICT/CSC/ND/23/013', 'ND2', '+2348012345010', 'paid', 3.23, 0),
      ('Chiamaka Eze', 'PSP/SICT/CSC/ND/23/014', 'ND2', '+2348012345011', 'paid', 3.71, 0),
      ('Emmanuel Akpan', 'PSP/SICT/CSC/ND/23/015', 'ND2', '+2348012345012', 'unpaid', 2.67, 1),
      ('Zainab Aliyu', 'PSP/SICT/CSC/ND/23/016', 'ND2', '+2348012345013', 'paid', 3.45, 0),
      ('Daniel Danjuma', 'PSP/SICT/CSC/ND/23/017', 'ND2', '+2348012345014', 'paid', 3.12, 1),
      ('Victoria Okon', 'PSP/SICT/CSC/ND/23/018', 'ND2', '+2348012345015', 'paid', 3.98, 0),
      
      -- ND1 Students (Year 24)
      ('Chinedu Okonkwo', 'PSP/SICT/CSC/ND/24/004', 'ND1', '+2348012345016', 'paid', 3.25, 0),
      ('Aisha Mohammed', 'PSP/SICT/CSC/ND/24/005', 'ND1', '+2348012345017', 'paid', 3.67, 0),
      ('Oluwatobi Fashola', 'PSP/SICT/CSC/ND/24/006', 'ND1', '+2348012345018', 'unpaid', 2.89, 1),
      ('Grace Udo', 'PSP/SICT/CSC/ND/24/007', 'ND1', '+2348012345019', 'paid', 3.54, 0),
      ('Ibrahim Bello', 'PSP/SICT/CSC/ND/24/008', 'ND1', '+2348012345020', 'paid', 3.78, 0),
      ('Ngozi Obiora', 'PSP/SICT/CSC/ND/24/009', 'ND1', '+2348012345021', 'paid', 3.45, 0),
      ('Samuel Gowon', 'PSP/SICT/CSC/ND/24/010', 'ND1', '+2348012345022', 'unpaid', 2.34, 2),
      ('Khadijah Usman', 'PSP/SICT/CSC/ND/24/011', 'ND1', '+2348012345023', 'paid', 3.91, 0),
      ('Peter Obi', 'PSP/SICT/CSC/ND/24/012', 'ND1', '+2348012345024', 'paid', 3.56, 0),
      ('Esther Jang', 'PSP/SICT/CSC/ND/24/013', 'ND1', '+2348012345025', 'paid', 3.82, 0),
      ('Tunde Bakare', 'PSP/SICT/CSC/ND/24/014', 'ND1', '+2348012345026', 'unpaid', 2.67, 1),
      ('Rachael Ishaku', 'PSP/SICT/CSC/ND/24/015', 'ND1', '+2348012345027', 'paid', 3.73, 0),
      ('Uche Nwosu', 'PSP/SICT/CSC/ND/24/016', 'ND1', '+2348012345028', 'paid', 3.29, 0),
      ('Halima Bawa', 'PSP/SICT/CSC/ND/24/017', 'ND1', '+2348012345029', 'unpaid', 2.56, 2),
      ('John Pwajok', 'PSP/SICT/CSC/ND/24/018', 'ND1', '+2348012345030', 'paid', 3.88, 0)
    ) AS t(full_name, matric_number, level, phone_number, fee_status, cgpa, carryovers)
  LOOP
    -- Generate a secure 6-digit PIN
    generated_pin := LPAD((FLOOR(RANDOM() * 900000) + 100000)::text, 6, '0');
    
    -- Create auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      student_data.matric_number || '@student.plateau.edu.ng',
      crypt(generated_pin, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'role', 'student',
        'full_name', student_data.full_name,
        'matric_number', student_data.matric_number,
        'level', student_data.level,
        'phone_number', student_data.phone_number
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO new_user_id;
    
    -- Get the profile_id that was auto-created by the trigger
    SELECT id INTO new_profile_id FROM public.profiles WHERE user_id = new_user_id;
    
    -- Create student record with hashed PIN
    INSERT INTO public.students (
      profile_id,
      matric_number,
      level,
      pin_hash,
      fee_status,
      cgp,
      carryovers,
      total_gp
    ) VALUES (
      new_profile_id,
      student_data.matric_number,
      student_data.level,
      crypt(generated_pin, gen_salt('bf')),
      student_data.fee_status,
      student_data.cgpa,
      student_data.carryovers,
      student_data.cgpa * 20  -- Assuming ~20 credit units per level
    );
    
    -- Log the creation
    RAISE NOTICE 'Created student: % (Matric: %, PIN: %)', 
      student_data.full_name, student_data.matric_number, generated_pin;
  END LOOP;
END $$;