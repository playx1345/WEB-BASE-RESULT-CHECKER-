-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  target_level text DEFAULT 'all',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view announcements" ON public.announcements
  FOR SELECT TO authenticated USING (true);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id),
  matric_number text NOT NULL UNIQUE,
  email text,
  level text NOT NULL,
  pin_hash text,
  fee_status text DEFAULT 'unpaid',
  cgp numeric DEFAULT 0,
  total_gp numeric DEFAULT 0,
  carryovers integer DEFAULT 0,
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies for students
CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own record" ON public.students
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Create results table
CREATE TABLE IF NOT EXISTS public.results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  course_title text NOT NULL,
  credit_unit integer NOT NULL,
  grade text NOT NULL,
  point numeric NOT NULL,
  semester text NOT NULL,
  session text NOT NULL,
  level text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on results
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create policies for results
CREATE POLICY "Admins can manage results" ON public.results
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own results" ON public.results
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s 
      JOIN public.profiles p ON s.profile_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code text NOT NULL UNIQUE,
  course_title text NOT NULL,
  credit_unit integer NOT NULL,
  level text NOT NULL,
  semester text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Add matric_number and level columns to profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'matric_number') THEN
    ALTER TABLE public.profiles ADD COLUMN matric_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'level') THEN
    ALTER TABLE public.profiles ADD COLUMN level text;
  END IF;
END $$;