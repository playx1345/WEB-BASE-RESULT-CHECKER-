/**
 * Role-based access control utilities
 * Provides helper functions for checking user roles securely
 */

import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'student' | 'admin' | 'teacher' | 'parent';
  full_name: string | null;
}

/**
 * Check if the current user has admin role
 * This function calls the secure server-side function for verification
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_user_role', {
      required_role: 'admin'
    });
    
    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Unexpected error checking admin role:', error);
    return false;
  }
}

/**
 * Check if the current user has student role
 */
export async function isStudent(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_user_role', {
      required_role: 'student'
    });
    
    if (error) {
      console.error('Error checking student role:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Unexpected error checking student role:', error);
    return false;
  }
}

/**
 * Get the current user's role from the database
 */
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_current_user_role');
    
    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error getting user role:', error);
    return null;
  }
}

/**
 * Get the current user's profile with role information
 */
export async function getUserProfile(userId?: string): Promise<UserRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, role, full_name')
      .eq('user_id', targetUserId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserRole;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
}

/**
 * Check if a user has the required role
 * @param requiredRole The role required for access
 * @param user Optional user object, defaults to current user
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_user_role', {
      required_role: requiredRole
    });
    
    if (error) {
      console.error(`Error checking ${requiredRole} role:`, error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error(`Unexpected error checking ${requiredRole} role:`, error);
    return false;
  }
}

/**
 * Verify admin access before performing admin-only actions
 * This should be used as a double-check on the client side,
 * but the server-side validation is the authoritative check
 */
export async function verifyAdminAccess(): Promise<{ hasAccess: boolean; message: string }> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        hasAccess: false,
        message: 'Authentication required. Please log in to continue.'
      };
    }
    
    // Check admin role using secure server-side function
    const isAdminUser = await isAdmin();
    
    if (!isAdminUser) {
      const currentRole = await getCurrentUserRole();
      return {
        hasAccess: false,
        message: `Admin access required. Current role: ${currentRole || 'unknown'}`
      };
    }
    
    return {
      hasAccess: true,
      message: 'Admin access verified'
    };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return {
      hasAccess: false,
      message: 'Error verifying permissions. Please try again.'
    };
  }
}

/**
 * Client-side warning about role-based security
 */
export const SECURITY_WARNING = `
⚠️ SECURITY NOTE: 
Client-side role checks are for UX purposes only. 
All security-critical operations MUST be validated server-side.
Never rely on client-side checks for actual authorization.
`;

// Log the security warning in development
if (import.meta.env.DEV) {
  console.warn(SECURITY_WARNING);
}