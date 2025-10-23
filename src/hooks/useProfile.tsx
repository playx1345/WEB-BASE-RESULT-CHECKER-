import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  user_id: string;
  role: 'student' | 'admin' | 'teacher' | 'parent';
  full_name: string | null;
  matric_number: string | null;
  phone_number: string | null;
  level: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {

        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)

          setProfile(null);
        } else {
          setProfile(data);
        }

      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, isAdmin: profile?.role === 'admin', isTeacher: profile?.role === 'teacher', isStudent: profile?.role === 'student', isParent: profile?.role === 'parent' };
};