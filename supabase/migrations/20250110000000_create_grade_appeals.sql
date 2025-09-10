-- Create enum for appeal status
CREATE TYPE public.appeal_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Create grade_appeals table
CREATE TABLE public.grade_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES public.results(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status appeal_status NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on grade_appeals table
ALTER TABLE public.grade_appeals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for grade_appeals
CREATE POLICY "Students can view their own appeals" ON public.grade_appeals
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can create appeals for their own results" ON public.grade_appeals
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own pending appeals" ON public.grade_appeals
  FOR UPDATE USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid()
    ) AND status = 'pending'
  );

CREATE POLICY "Admins can manage all appeals" ON public.grade_appeals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_grade_appeals_updated_at
  BEFORE UPDATE ON public.grade_appeals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to prevent duplicate appeals for the same result
CREATE OR REPLACE FUNCTION public.check_duplicate_appeal()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.grade_appeals 
    WHERE result_id = NEW.result_id 
    AND student_id = NEW.student_id 
    AND status IN ('pending', 'under_review')
  ) THEN
    RAISE EXCEPTION 'An appeal for this result is already pending or under review';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to check for duplicate appeals
CREATE TRIGGER check_duplicate_appeal_trigger
  BEFORE INSERT ON public.grade_appeals
  FOR EACH ROW EXECUTE FUNCTION public.check_duplicate_appeal();