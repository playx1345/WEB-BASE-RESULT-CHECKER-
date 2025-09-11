import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UseSessionTimeoutOptions {
  timeout?: number; // in milliseconds, default 30 minutes
  warningTime?: number; // show warning before timeout, default 5 minutes
  checkInterval?: number; // check activity interval, default 1 minute
}

export const useSessionTimeout = ({
  timeout = 30 * 60 * 1000, // 30 minutes
  warningTime = 5 * 60 * 1000, // 5 minutes
  checkInterval = 60 * 1000 // 1 minute
}: UseSessionTimeoutOptions = {}) => {
  const { signOut, user } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const intervalIdRef = useRef<NodeJS.Timeout>();

  // Update last activity time
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  // Check for inactivity
  const checkInactivity = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Show warning if approaching timeout
    if (timeSinceLastActivity >= timeout - warningTime && !warningShownRef.current) {
      warningShownRef.current = true;
      const remainingMinutes = Math.ceil((timeout - timeSinceLastActivity) / (60 * 1000));
      
      toast.warning(`Session Warning`, {
        description: `Your session will expire in ${remainingMinutes} minutes due to inactivity. Click anywhere to extend your session.`,
        duration: warningTime,
        action: {
          label: 'Extend Session',
          onClick: updateActivity
        }
      });
    }

    // Auto logout if exceeded timeout
    if (timeSinceLastActivity >= timeout) {
      toast.error('Session Expired', {
        description: 'You have been logged out due to inactivity.',
      });
      signOut();
    }
  }, [user, timeout, warningTime, signOut, updateActivity]);

  // Activity event listeners
  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up periodic inactivity check
    intervalIdRef.current = setInterval(checkInactivity, checkInterval);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [user, updateActivity, checkInactivity, checkInterval]);

  // Initialize activity time when user logs in
  useEffect(() => {
    if (user) {
      updateActivity();
    }
  }, [user, updateActivity]);

  return {
    updateActivity,
    getRemainingTime: () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      return Math.max(0, timeout - timeSinceLastActivity);
    },
    getLastActivityTime: () => lastActivityRef.current
  };
};