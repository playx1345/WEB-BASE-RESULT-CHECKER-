import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  user_id: string;
  role: 'student' | 'admin' | 'teacher' | 'parent' | null;
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

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.warn('No profile data found for user:', user.id);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('Profile data fetched:', profileData);

        // Try RPC function first
        const { data: roleData, error: roleError } = await supabase.rpc('get_current_user_role');
        
        console.log('RPC role data:', roleData, 'Error:', roleError);

        let userRole = roleData as 'student' | 'admin' | 'teacher' | 'parent' | null;

        // Fallback: Query user_roles directly if RPC fails or returns null
        if (!userRole || roleError) {
          console.warn('RPC failed or returned null, querying user_roles directly');
          const { data: directRole, error: directError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          console.log('Direct role query:', directRole, 'Error:', directError);
          
          if (directRole && !directError) {
            userRole = directRole.role as 'student' | 'admin' | 'teacher' | 'parent';
          }
        }

        console.log('Final role assigned:', userRole);

        // Combine profile and role data
        setProfile({
          ...profileData,
          role: userRole || null
        });
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, isAdmin: profile?.role === 'admin', isTeacher: profile?.role === 'teacher', isStudent: profile?.role === 'student', isParent: profile?.role === 'parent' };
};