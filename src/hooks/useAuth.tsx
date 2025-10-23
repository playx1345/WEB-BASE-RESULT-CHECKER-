import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logUserActivity } from '@/lib/auditLogger';
import { useNavigate } from 'react-router-dom';
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
    console.log('[useAuth] Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state change event:', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Log authentication events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[useAuth] User signed in:', {
            userId: session.user.id,
            email: session.user.email
          });
          await logUserActivity('user_login', {
            metadata: {
              email: session.user.email,
              loginMethod: 'password',
              userAgent: navigator.userAgent,
            }
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('[useAuth] User signed out');
          await logUserActivity('user_logout', {
            metadata: {
              logoutReason: 'user_initiated'
            }
          });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[useAuth] Token refreshed for user:', session?.user?.id);
        } else if (event === 'USER_UPDATED') {
          console.log('[useAuth] User updated:', session?.user?.id);
        }
      }
    );

    // THEN check for existing session
    console.log('[useAuth] Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Existing session found:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('[useAuth] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, isStudent = false) => {
    console.log('[useAuth] Sign in attempt:', { isStudent, email: isStudent ? 'student' : email });
    
    if (isStudent) {
      // For students, email is matric number, password is PIN
      const matricNumber = email;
      const pin = password;
      
      console.log('[useAuth] Authenticating student with matric number:', matricNumber);
      
      // First verify credentials using authenticate_student function
      const { data: studentData, error: studentError } = await supabase
        .rpc('authenticate_student', {
          p_matric_number: matricNumber,
          p_pin: pin
        });
      
      if (studentError || !studentData || (Array.isArray(studentData) && studentData.length === 0)) {
        console.error('[useAuth] Student authentication failed:', studentError);
        return { 
          error: { 
            message: 'Invalid matric number or PIN', 
            status: 400, 
            name: 'AuthApiError' 
          } as AuthError 
        };
      }
      
      console.log('[useAuth] Student credentials verified, signing in');
      
      // Sign in with constructed email
      const studentEmail = `${matricNumber}@student.plateau.edu.ng`;
      const { error } = await supabase.auth.signInWithPassword({
        email: studentEmail,
        password: pin,
      });
      
      if (error) {
        console.error('[useAuth] Student sign in error:', error);
        return { error };
      }
      
      console.log('[useAuth] Student signed in successfully');
      return { error: null };
    } else {
      console.log('[useAuth] Authenticating admin/teacher with email:', email);
      
      // Regular admin/teacher login via Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[useAuth] Admin/teacher sign in error:', error);
      } else {
        console.log('[useAuth] Admin/teacher signed in successfully');
      }
      
      return { error };
    }
  };

  // Remove signUp - only admins can create users now

  const signOut = async () => {
    console.log('[useAuth] Signing out user');
    await supabase.auth.signOut();
    console.log('[useAuth] Sign out complete');
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