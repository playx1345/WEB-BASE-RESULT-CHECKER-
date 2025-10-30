-- Add carryover tracking to results table
-- This migration adds an is_carryover field to track failed courses that need to be repeated

-- Add is_carryover column to results table
ALTER TABLE public.results 
ADD COLUMN IF NOT EXISTS is_carryover boolean DEFAULT false;

-- Create index for efficient carryover queries
CREATE INDEX IF NOT EXISTS idx_results_carryover ON public.results(student_id, is_carryover) 
WHERE is_carryover = true;

-- Create a function to automatically mark F grades as carryovers
CREATE OR REPLACE FUNCTION public.mark_carryover_courses()
RETURNS TRIGGER AS $$
BEGIN
  -- If grade is F, mark as carryover
  IF NEW.grade = 'F' THEN
    NEW.is_carryover := true;
  ELSE
    NEW.is_carryover := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically mark carryovers on insert/update
DROP TRIGGER IF EXISTS trigger_mark_carryover ON public.results;
CREATE TRIGGER trigger_mark_carryover
  BEFORE INSERT OR UPDATE OF grade ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_carryover_courses();

-- Update existing F grades to be marked as carryovers
UPDATE public.results 
SET is_carryover = true 
WHERE grade = 'F' AND is_carryover = false;

-- Create view for easy carryover tracking
CREATE OR REPLACE VIEW public.student_carryovers AS
SELECT 
  s.id as student_id,
  s.matric_number,
  r.course_code,
  r.course_title,
  r.credit_unit,
  r.level,
  r.session,
  r.semester,
  r.grade
FROM public.students s
JOIN public.results r ON r.student_id = s.id
WHERE r.is_carryover = true
ORDER BY s.matric_number, r.session DESC, r.semester;

-- Grant appropriate permissions
GRANT SELECT ON public.student_carryovers TO authenticated;

COMMENT ON COLUMN public.results.is_carryover IS 'Indicates if this is a failed course that needs to be repeated';
COMMENT ON VIEW public.student_carryovers IS 'View of all carryover courses for easy tracking';
