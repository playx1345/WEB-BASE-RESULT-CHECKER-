import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  matric_number: string | null;
  phone_number: string | null;
  level: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: {
    role: 'student' | 'admin' | 'teacher' | 'parent';
  }[];
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
          full_name: 'System Administrator',
          matric_number: null,
          phone_number: null,
          level: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_roles: [{ role: 'admin' }]
        });
        setLoading(false);
        return;
      }

      try {
        // First get the profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfile(null);
        } else if (profileData) {
          // Then get the user role using RPC
          const { data: roleData } = await supabase.rpc('get_current_user_role');

          setProfile({
            ...profileData,
            user_roles: roleData ? [{ role: roleData as 'student' | 'admin' | 'teacher' | 'parent' }] : []
          });
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

  const role = profile?.user_roles?.[0]?.role;
  return { profile, loading, isAdmin: role === 'admin', isTeacher: role === 'teacher', isStudent: role === 'student', isParent: role === 'parent' };
};