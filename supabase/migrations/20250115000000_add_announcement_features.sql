-- Add expires_at and is_active columns to announcements table

ALTER TABLE public.announcements 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Add index for better performance on active announcements
CREATE INDEX idx_announcements_active ON public.announcements(is_active);
CREATE INDEX idx_announcements_expires_at ON public.announcements(expires_at);

-- Update existing announcements to be active by default
UPDATE public.announcements SET is_active = true WHERE is_active IS NULL;