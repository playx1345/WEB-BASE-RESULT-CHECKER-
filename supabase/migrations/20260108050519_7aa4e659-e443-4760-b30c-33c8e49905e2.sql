-- Create sample students for testing
DO $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_student_id uuid;
  v_pin_hash text;
BEGIN
  -- Student 1: Blessing Musa (ND1)
  v_user_id := extensions.uuid_generate_v4();
  v_pin_hash := extensions.crypt('123456', extensions.gen_salt('bf', 12));
  
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'PSP/SICT/ND1/CS/001@student.plateau.edu.ng', extensions.crypt('123456', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Blessing Musa","matric_number":"PSP/SICT/ND1/CS/001","level":"ND1"}'::jsonb, now(), now(), '', '', '', '');
  
  UPDATE public.profiles SET full_name = 'Blessing Musa', matric_number = 'PSP/SICT/ND1/CS/001', level = 'ND1' WHERE user_id = v_user_id RETURNING id INTO v_profile_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'student');
  INSERT INTO public.students (profile_id, matric_number, email, level, pin_hash, fee_status, full_name, cgp) VALUES (v_profile_id, 'PSP/SICT/ND1/CS/001', 'PSP/SICT/ND1/CS/001@student.plateau.edu.ng', 'ND1', v_pin_hash, 'paid', 'Blessing Musa', 3.85);

  -- Student 2: David Gyang (ND1)
  v_user_id := extensions.uuid_generate_v4();
  v_pin_hash := extensions.crypt('234567', extensions.gen_salt('bf', 12));
  
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'PSP/SICT/ND1/CS/002@student.plateau.edu.ng', extensions.crypt('234567', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"David Gyang","matric_number":"PSP/SICT/ND1/CS/002","level":"ND1"}'::jsonb, now(), now(), '', '', '', '');
  
  UPDATE public.profiles SET full_name = 'David Gyang', matric_number = 'PSP/SICT/ND1/CS/002', level = 'ND1' WHERE user_id = v_user_id RETURNING id INTO v_profile_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'student');
  INSERT INTO public.students (profile_id, matric_number, email, level, pin_hash, fee_status, full_name, cgp) VALUES (v_profile_id, 'PSP/SICT/ND1/CS/002', 'PSP/SICT/ND1/CS/002@student.plateau.edu.ng', 'ND1', v_pin_hash, 'paid', 'David Gyang', 3.42);

  -- Student 3: Grace Pam (ND2)
  v_user_id := extensions.uuid_generate_v4();
  v_pin_hash := extensions.crypt('345678', extensions.gen_salt('bf', 12));
  
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'PSP/SICT/ND2/CS/001@student.plateau.edu.ng', extensions.crypt('345678', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Grace Pam","matric_number":"PSP/SICT/ND2/CS/001","level":"ND2"}'::jsonb, now(), now(), '', '', '', '');
  
  UPDATE public.profiles SET full_name = 'Grace Pam', matric_number = 'PSP/SICT/ND2/CS/001', level = 'ND2' WHERE user_id = v_user_id RETURNING id INTO v_profile_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'student');
  INSERT INTO public.students (profile_id, matric_number, email, level, pin_hash, fee_status, full_name, cgp) VALUES (v_profile_id, 'PSP/SICT/ND2/CS/001', 'PSP/SICT/ND2/CS/001@student.plateau.edu.ng', 'ND2', v_pin_hash, 'paid', 'Grace Pam', 4.12);

  -- Student 4: Emmanuel Dung (ND2 - unpaid fees)
  v_user_id := extensions.uuid_generate_v4();
  v_pin_hash := extensions.crypt('456789', extensions.gen_salt('bf', 12));
  
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'PSP/SICT/ND2/CS/002@student.plateau.edu.ng', extensions.crypt('456789', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Emmanuel Dung","matric_number":"PSP/SICT/ND2/CS/002","level":"ND2"}'::jsonb, now(), now(), '', '', '', '');
  
  UPDATE public.profiles SET full_name = 'Emmanuel Dung', matric_number = 'PSP/SICT/ND2/CS/002', level = 'ND2' WHERE user_id = v_user_id RETURNING id INTO v_profile_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'student');
  INSERT INTO public.students (profile_id, matric_number, email, level, pin_hash, fee_status, full_name, cgp) VALUES (v_profile_id, 'PSP/SICT/ND2/CS/002', 'PSP/SICT/ND2/CS/002@student.plateau.edu.ng', 'ND2', v_pin_hash, 'unpaid', 'Emmanuel Dung', 2.95);

  RAISE NOTICE 'Sample students created successfully';
END $$;