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
}

interface UserRole {
  role: 'student' | 'admin' | 'teacher' | 'parent';
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole['role'] | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch profile (without role field)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch role from secure user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) throw roleError;

        setProfile(profileData);
        setRole(roleData.role);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { 
    profile, 
    role,
    loading, 
    isAdmin: role === 'admin', 
    isTeacher: role === 'teacher', 
    isStudent: role === 'student', 
    isParent: role === 'parent' 
  };
};