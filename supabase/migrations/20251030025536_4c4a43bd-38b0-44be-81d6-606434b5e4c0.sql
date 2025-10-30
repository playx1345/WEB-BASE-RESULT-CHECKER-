-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view courses (they are public information)
CREATE POLICY "Anyone can view courses"
ON public.courses
FOR SELECT
USING (true);

-- Only admins can manage courses
CREATE POLICY "Admins can manage courses"
ON public.courses
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));