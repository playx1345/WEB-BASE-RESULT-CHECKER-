-- Add HND1 and HND2 support to announcements target_level
-- This allows announcements to target HND students in addition to ND students

DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'announcements_target_level_check' 
    AND conrelid = 'public.announcements'::regclass
  ) THEN
    ALTER TABLE public.announcements DROP CONSTRAINT announcements_target_level_check;
  END IF;
  
  -- Add new constraint with HND levels included
  ALTER TABLE public.announcements ADD CONSTRAINT announcements_target_level_check 
    CHECK (target_level = ANY (ARRAY['ND1', 'ND2', 'HND1', 'HND2', 'all']));
END$$;
