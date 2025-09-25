/**
 * Admin Access Hook
 * 
 * Custom React hook for checking admin access throughout the application
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { isAdmin, getCurrentUserRole } from '@/lib/roleUtils';

interface AdminAccessState {
  isAdmin: boolean;
  userRole: string | null;
  loading: boolean;
  error: string | null;
}

export const useAdminAccess = (): AdminAccessState => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<AdminAccessState>({
    isAdmin: false,
    userRole: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) {
        return; // Wait for auth to finish loading
      }

      if (!user) {
        setState({
          isAdmin: false,
          userRole: null,
          loading: false,
          error: null
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Check both admin status and get user role in parallel
        const [adminStatus, userRole] = await Promise.all([
          isAdmin(),
          getCurrentUserRole()
        ]);

        setState({
          isAdmin: adminStatus,
          userRole,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error checking admin access:', error);
        setState({
          isAdmin: false,
          userRole: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    void checkAdminAccess();
  }, [user, authLoading]);

  return state;
};

/**
 * Higher-order component that requires admin access
 */
export const withAdminAccess = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const { isAdmin: hasAdminAccess, loading, error } = useAdminAccess();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-destructive mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Access Verification Failed</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => { window.location.reload(); }} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!hasAdminAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-destructive mb-4 text-4xl">🚫</div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Administrator privileges are required to access this page.
            </p>
            <button 
              onClick={() => { window.history.back(); }} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};