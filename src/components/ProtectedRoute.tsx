import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { School } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin' | 'teacher' | 'parent';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [roleChecking, setRoleChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const checkUserRole = useCallback(async () => {
    if (!user) return;
    
    // Handle demo admin user
    if (user.id === '00000000-0000-0000-0000-000000000001') {
      if (requiredRole === 'admin') {
        setHasAccess(true);
      } else {
        navigate('/');
      }
      setRoleChecking(false);
      return;
    }
    
    // Check role from user metadata first
    const userRole = user.user_metadata?.role;
    if (userRole && userRole === requiredRole) {
      setHasAccess(true);
      setRoleChecking(false);
      return;
    }
    
    try {
      // Check profile role from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Get role from profile - check if it's stored in user_roles table or profile
      let profileRole = null;
      
      // Try user_roles table first
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (userRoleData?.role) {
        profileRole = userRoleData.role;
      }
      
      if (profileRole === requiredRole) {
        setHasAccess(true);
      } else if (profile) {
        // For students, check if there's a student record
        if (requiredRole === 'student') {
          const { data: studentData } = await supabase
            .from('students')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
            
          if (studentData) {
            setHasAccess(true);
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/');
    } finally {
      setRoleChecking(false);
    }
  }, [user, requiredRole, navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && requiredRole) {
      checkUserRole();
    } else if (user) {
      setRoleChecking(false);
      setHasAccess(true);
    }
  }, [user, loading, navigate, requiredRole, checkUserRole]);

  if (loading || roleChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <School className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (requiredRole && !hasAccess)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;