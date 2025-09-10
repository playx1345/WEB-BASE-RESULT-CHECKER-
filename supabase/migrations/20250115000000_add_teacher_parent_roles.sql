-- Add teacher and parent roles to the user_role enum
ALTER TYPE public.user_role ADD VALUE 'teacher';
ALTER TYPE public.user_role ADD VALUE 'parent';

-- Update RLS policies to include teacher and parent roles

-- Allow teachers to view all student profiles and results for grade management
CREATE POLICY "Teachers can view all student profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Allow teachers to view all student records for grade management
CREATE POLICY "Teachers can view all student records" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Allow teachers to manage results (insert, update, delete)
CREATE POLICY "Teachers can insert results" ON public.results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update results" ON public.results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can delete results" ON public.results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Allow teachers to view all results for grade management
CREATE POLICY "Teachers can view all results" ON public.results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Allow parents to view their child's results if fees are paid
-- Note: This assumes parents are linked to students through some mechanism
-- For now, we'll allow parents to view results similar to students
CREATE POLICY "Parents can view results if fees paid" ON public.results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'parent'
    ) AND
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE s.fee_status = 'paid'
    )
  );

-- Allow parents to view their own profile
CREATE POLICY "Parents can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id AND role = 'parent');

CREATE POLICY "Parents can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id AND role = 'parent');

-- Allow teachers to view their own profile
CREATE POLICY "Teachers can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id AND role = 'teacher');

CREATE POLICY "Teachers can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id AND role = 'teacher');