import { toast } from 'sonner';

interface ApiError extends Error {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export class ApiErrorHandler {
  static handle(error: unknown, context?: string): void {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as ApiError;
      
      // Handle specific Supabase errors
      if (apiError.code) {
        switch (apiError.code) {
          case 'PGRST116':
            toast.error('No data found', {
              description: 'The requested information could not be found.'
            });
            return;
          case 'PGRST301':
            toast.error('Access denied', {
              description: 'You do not have permission to perform this action.'
            });
            return;
          case '23505':
            toast.error('Duplicate entry', {
              description: 'This information already exists in the system.'
            });
            return;
          case '42P01':
            toast.error('System error', {
              description: 'Please contact support if this issue persists.'
            });
            return;
        }
      }
      
      // Handle general API errors
      const message = apiError.message || 'An unexpected error occurred';
      toast.error('Error', {
        description: message.length > 100 ? `${message.substring(0, 100)}...` : message
      });
    } else {
      // Handle unknown errors
      toast.error('Unexpected Error', {
        description: 'Something went wrong. Please try again.'
      });
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string,
    successMessage?: string
  ): Promise<T | null> {
    try {
      const result = await operation();
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }
}

// Higher-order function for components
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      ApiErrorHandler.handle(error, context);
      return null;
    }
  };
};