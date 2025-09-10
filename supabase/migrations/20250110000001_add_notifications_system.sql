-- Create enum for notification types
CREATE TYPE public.notification_type AS ENUM ('grade_posted', 'grade_updated', 'announcement', 'system');

-- Create enum for notification delivery methods
CREATE TYPE public.delivery_method AS ENUM ('in_app', 'email', 'sms');

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID, -- Can reference results.id, announcements.id, etc.
  metadata JSONB, -- Additional data like course_code, grade, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type notification_type NOT NULL,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Enable RLS on notification tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Create RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Admins can create notifications for all users
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user notification preferences
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default notification preferences for new users
  INSERT INTO public.notification_preferences (user_id, notification_type, in_app_enabled, email_enabled, sms_enabled)
  VALUES 
    (NEW.id, 'grade_posted', TRUE, TRUE, FALSE),
    (NEW.id, 'grade_updated', TRUE, TRUE, FALSE),
    (NEW.id, 'announcement', TRUE, TRUE, FALSE),
    (NEW.id, 'system', TRUE, TRUE, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user notification preferences
CREATE TRIGGER on_auth_user_created_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();

-- Create function to send grade notifications
CREATE OR REPLACE FUNCTION public.notify_grade_posted()
RETURNS TRIGGER AS $$
DECLARE
  student_user_id UUID;
  student_name TEXT;
  student_level TEXT;
BEGIN
  -- Get the student's user_id and details
  SELECT p.user_id, p.full_name, s.level 
  INTO student_user_id, student_name, student_level
  FROM public.students s
  JOIN public.profiles p ON s.profile_id = p.id
  WHERE s.id = NEW.student_id;

  -- Create notification for the student
  INSERT INTO public.notifications (
    recipient_id,
    title,
    message,
    notification_type,
    related_id,
    metadata
  ) VALUES (
    student_user_id,
    'New Grade Posted',
    format('Your grade for %s (%s) has been posted: %s', NEW.course_title, NEW.course_code, NEW.grade),
    'grade_posted',
    NEW.id,
    jsonb_build_object(
      'course_code', NEW.course_code,
      'course_title', NEW.course_title,
      'grade', NEW.grade,
      'semester', NEW.semester,
      'session', NEW.session,
      'level', NEW.level
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to send grade update notifications
CREATE OR REPLACE FUNCTION public.notify_grade_updated()
RETURNS TRIGGER AS $$
DECLARE
  student_user_id UUID;
  student_name TEXT;
BEGIN
  -- Only notify if the grade actually changed
  IF OLD.grade != NEW.grade THEN
    -- Get the student's user_id and details
    SELECT p.user_id, p.full_name 
    INTO student_user_id, student_name
    FROM public.students s
    JOIN public.profiles p ON s.profile_id = p.id
    WHERE s.id = NEW.student_id;

    -- Create notification for the student
    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      notification_type,
      related_id,
      metadata
    ) VALUES (
      student_user_id,
      'Grade Updated',
      format('Your grade for %s (%s) has been updated from %s to %s', NEW.course_title, NEW.course_code, OLD.grade, NEW.grade),
      'grade_updated',
      NEW.id,
      jsonb_build_object(
        'course_code', NEW.course_code,
        'course_title', NEW.course_title,
        'old_grade', OLD.grade,
        'new_grade', NEW.grade,
        'semester', NEW.semester,
        'session', NEW.session,
        'level', NEW.level
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for grade notifications
CREATE TRIGGER trigger_notify_grade_posted
  AFTER INSERT ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.notify_grade_posted();

CREATE TRIGGER trigger_notify_grade_updated
  AFTER UPDATE ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.notify_grade_updated();

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = TRUE, read_at = now()
  WHERE id = notification_id AND recipient_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_read = TRUE, read_at = now()
  WHERE recipient_id = auth.uid() AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.notifications
  WHERE recipient_id = auth.uid() AND is_read = FALSE;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add updated_at trigger for notification preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();