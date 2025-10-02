import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logUserActivity } from '@/lib/auditLogger';

import { AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, isStudent?: boolean) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Log authentication events
        if (event === 'SIGNED_IN' && session?.user) {
          await logUserActivity('user_login', {
            metadata: {
              email: session.user.email,
              loginMethod: 'password',
              userAgent: navigator.userAgent,
            }
          });
        } else if (event === 'SIGNED_OUT') {
          await logUserActivity('user_logout', {
            metadata: {
              logoutReason: 'user_initiated'
            }
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, isStudent = false) => {
    if (isStudent) {
      // For students, email is matric number, password is PIN
      const matricNumber = email;
      const pin = password;
      
      // Authenticate student using custom function
      const { data: studentData, error: studentError } = await supabase
        .rpc('authenticate_student', {
          p_matric_number: matricNumber,
          p_pin: pin
        });
      
      if (studentError || !studentData || studentData.length === 0) {
        return { error: (studentError as unknown as AuthError) || ({ message: 'Invalid matric number or PIN', __isAuthError: true, status: 400, name: 'AuthError', code: 'invalid_credentials' } as unknown as AuthError) };
      }
      
      // Sign in with constructed email
      const studentEmail = `${matricNumber}@student.plateau.edu.ng`;
      const { error } = await supabase.auth.signInWithPassword({
        email: studentEmail,
        password: pin,
      });
      
      return { error };
    } else {
      // For admin/teacher login, try database authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If login successful, verify admin role and setup
      if (!error && data.user && email === 'admin@plateau.edu.ng') {
        try {
          // Check if admin setup is complete
          const { data: setupCheck, error: checkError } = await supabase
            .rpc('check_admin_setup', { user_email: email });
          
          if (checkError) {
            console.warn('Failed to check admin setup:', checkError);
          } else if (setupCheck && !setupCheck.admin_exists && setupCheck.profile_role === 'admin') {
            // Admin profile exists but admin record is missing, try to fix
            console.log('Admin profile found but admin record missing, attempting to fix...');
            const { error: setupError } = await supabase
              .rpc('setup_admin_for_user', { user_email: email });
            
            if (setupError) {
              console.warn('Failed to setup admin record:', setupError);
            } else {
              console.log('Admin setup completed successfully');
            }
          }
        } catch (adminSetupError) {
          console.warn('Admin setup check failed:', adminSetupError);
        }
      }
      
      // If database auth fails and this is the demo admin, show helpful message
      if (error && email === 'admin@plateau.edu.ng') {
        if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid email or password')) {
          return { 
            error: { 
              ...error,
              message: 'Admin login failed. The admin account may not exist in the database. Please run the admin creation script: npm run create-admin or node scripts/setup-admin-now.js',
            } as AuthError 
          };
        }
        if (error.message?.includes('Email not confirmed')) {
          return {
            error: {
              ...error,
              message: 'Admin account exists but email is not confirmed. Please check the admin setup process.',
            } as AuthError
          };
        }
      }
      
      return { error };
    }
  };

  // Remove signUp - only admins can create users now

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (!error) {
      await logUserActivity('password_reset_requested', {
        metadata: {
          email,
          resetMethod: 'email'
        }
      });
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    loading,
        signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};