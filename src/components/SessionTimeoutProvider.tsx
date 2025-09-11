import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useAuth } from '@/hooks/useAuth';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
  timeout?: number; // 30 minutes default
  warningTime?: number; // 5 minutes default
}

export const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({
  children,
  timeout = 30 * 60 * 1000, // 30 minutes
  warningTime = 5 * 60 * 1000 // 5 minutes
}) => {
  const { user } = useAuth();
  
  // Only enable session timeout for authenticated users
  useSessionTimeout({
    timeout,
    warningTime,
    checkInterval: 60 * 1000 // Check every minute
  });

  return <>{children}</>;
};