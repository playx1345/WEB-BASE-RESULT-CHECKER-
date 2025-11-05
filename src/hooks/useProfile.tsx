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
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Handle demo admin user
      if (user.id === '00000000-0000-0000-0000-000000000001') {
        setProfile({
          id: '00000000-0000-0000-0000-000000000001',
          user_id: '00000000-0000-0000-0000-000000000001',
          role: 'admin',
          full_name: 'System Administrator',
          matric_number: null,
          phone_number: null,
          level: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, isAdmin: profile?.role === 'admin', isTeacher: profile?.role === 'teacher', isStudent: profile?.role === 'student', isParent: profile?.role === 'parent' };
};