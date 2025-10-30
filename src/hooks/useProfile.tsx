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
      console.log('[useProfile] Starting fetch for user:', user?.id);
      
      if (!user) {
        console.log('[useProfile] No user found, clearing profile');
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch profile data
        console.log('[useProfile] Fetching profile data...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('[useProfile] Error fetching profile:', profileError);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.log('[useProfile] No profile data found for user');
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('[useProfile] Profile data fetched:', profileData);

        // Fetch role from user_roles table using RPC function
        console.log('[useProfile] Fetching user role...');
        const { data: roleData, error: roleError } = await supabase.rpc('get_current_user_role');

        if (roleError) {
          console.error('[useProfile] Error fetching role:', roleError);
        }

        console.log('[useProfile] Role data fetched:', roleData);

        // Combine profile and role data
        const combinedProfile = {
          ...profileData,
          role: (roleData as 'student' | 'admin' | 'teacher' | 'parent') || null
        };
        
        console.log('[useProfile] Final combined profile:', combinedProfile);
        setProfile(combinedProfile);
      } catch (error) {
        console.error('[useProfile] Unexpected error:', error);
        setProfile(null);
      } finally {
        setLoading(false);
        console.log('[useProfile] Fetch complete');
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, isAdmin: profile?.role === 'admin', isTeacher: profile?.role === 'teacher', isStudent: profile?.role === 'student', isParent: profile?.role === 'parent' };
};