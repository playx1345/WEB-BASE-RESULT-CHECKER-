-- Enable pgcrypto extension (installs in extensions schema by default)
create extension if not exists pgcrypto;

-- Drop existing functions
drop function if exists public.authenticate_student(text, text);
drop function if exists public.admin_create_student(text, text, text, text, text);

-- Recreate authenticate_student using extensions.crypt
create or replace function public.authenticate_student(
  p_matric_number text,
  p_pin text
) returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from public.students s
    join public.profiles p on p.id = s.profile_id
    where s.matric_number = p_matric_number
      and s.pin_hash = extensions.crypt(p_pin, s.pin_hash)
  );
$$;

-- Recreate admin_create_student
create or replace function public.admin_create_student(
  p_full_name text,
  p_matric_number text,
  p_level text,
  p_phone_number text,
  p_pin text
) returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student_id uuid;
  v_profile_id uuid;
  v_user_id uuid;
  v_generated_pin text;
begin
  -- Only admins
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not_authorized';
  end if;

  -- Generate or use PIN
  if p_pin is null or p_pin = '' then
    v_generated_pin := public.generate_secure_pin();
  else
    v_generated_pin := p_pin;
  end if;

  v_user_id := gen_random_uuid();
  
  -- Create auth user
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_matric_number || '@student.plateau.edu.ng',
    extensions.crypt(v_generated_pin, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'full_name', p_full_name,
      'matric_number', p_matric_number,
      'level', p_level,
      'phone_number', p_phone_number
    ),
    now(), now(), '', '', '', ''
  );

  -- Profile
  insert into public.profiles (user_id, full_name, matric_number, phone_number, level)
  values (v_user_id, p_full_name, p_matric_number, p_phone_number, p_level)
  returning id into v_profile_id;

  -- Role
  insert into public.user_roles (user_id, role)
  values (v_user_id, 'student');

  -- Student
  insert into public.students (profile_id, matric_number, level, pin_hash, fee_status)
  values (
    v_profile_id,
    p_matric_number,
    p_level,
    extensions.crypt(v_generated_pin, extensions.gen_salt('bf')),
    'unpaid'
  ) returning id into v_student_id;

  -- Log
  perform public.log_user_activity(
    'student_created',
    'students',
    v_student_id::text,
    jsonb_build_object(
      'student_name', p_full_name,
      'matric_number', p_matric_number,
      'level', p_level,
      'generated_pin', v_generated_pin
    )
  );

  return v_student_id;
end;
$$;

-- Permissions
grant execute on function public.authenticate_student(text, text) to authenticated;
grant execute on function public.admin_create_student(text, text, text, text, text) to authenticated;