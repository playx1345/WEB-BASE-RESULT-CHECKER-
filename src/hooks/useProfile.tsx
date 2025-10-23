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
      console.log('[useProfile] Fetching profile for user:', user?.id || 'no user');
      
      if (!user) {
        console.log('[useProfile] No user found, clearing profile');
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
          console.error('[useProfile] Error fetching profile:', profileError);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.log('[useProfile] No profile data found for user:', user.id);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('[useProfile] Profile data fetched successfully:', {
          userId: user.id,
          fullName: profileData.full_name,
          matricNumber: profileData.matric_number
        });

        // Fetch role from user_roles table using RPC function
        const { data: roleData } = await supabase.rpc('get_current_user_role');
        
        console.log('[useProfile] Role fetched:', roleData);

        // Combine profile and role data
        const newProfile = {
          ...profileData,
          role: (roleData as 'student' | 'admin' | 'teacher' | 'parent') || null
        };
        
        console.log('[useProfile] Setting profile with role:', newProfile.role);
        setProfile(newProfile);
      } catch (error) {
        console.error('[useProfile] Error:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, isAdmin: profile?.role === 'admin', isTeacher: profile?.role === 'teacher', isStudent: profile?.role === 'student', isParent: profile?.role === 'parent' };
};