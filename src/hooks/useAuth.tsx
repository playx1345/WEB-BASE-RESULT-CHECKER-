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
      // Special handling for demo admin login
      if (email === 'admin@plateau.edu.ng' && password === 'Admin123456') {
        // Create a mock session for the demo admin
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@plateau.edu.ng',
          user_metadata: { role: 'admin', full_name: 'System Administrator' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;
        
        const mockSession = {
          user: mockUser,
          access_token: 'demo-admin-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'demo-refresh-token',
          expires_at: Date.now() + 3600000
        } as Session;
        
        setSession(mockSession);
        setUser(mockUser);
        
        return { error: null };
      }
      
      // Regular admin/teacher login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
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