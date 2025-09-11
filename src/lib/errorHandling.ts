import { toast } from 'sonner';

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  AUTH = 'auth',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  retryable?: boolean;
}

// Error classification helpers
export function classifyError(error: Error | { code?: string; message: string; details?: string; hint?: string }): AppError {
  // Handle Supabase/PostgreSQL errors
  if (error?.code) {
    if (error.code === 'PGRST116' || error.code === '42501') {
      return {
        type: ErrorType.PERMISSION,
        message: 'You do not have permission to perform this action',
        details: error.message,
        code: error.code,
        retryable: false
      };
    }
    
    if (error.code.startsWith('23') || error.code.startsWith('42')) {
      return {
        type: ErrorType.DATABASE,
        message: 'Database error occurred',
        details: error.message,
        code: error.code,
        retryable: false
      };
    }
  }

  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network connection failed',
      details: 'Please check your internet connection and try again',
      retryable: true
    };
  }

  // Handle auth errors
  if (error.message?.includes('auth') || error.message?.includes('token')) {
    return {
      type: ErrorType.AUTH,
      message: 'Authentication failed',
      details: error.message,
      retryable: false
    };
  }

  // Default to unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'An unexpected error occurred',
    details: error.details || error.hint,
    retryable: false
  };
}

// Toast notification helpers
export function showErrorToast(error: AppError | Error | { message: string }, customMessage?: string) {
  const appError = error.type ? error : classifyError(error);
  
  toast.error(customMessage || appError.message, {
    description: appError.details,
    duration: appError.type === ErrorType.NETWORK ? 5000 : 4000,
    action: appError.retryable ? {
      label: 'Retry',
      onClick: () => window.location.reload()
    } : undefined
  });
}

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000
  });
}

export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 4000
  });
}

export function showWarningToast(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 4000
  });
}

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    errorMessage?: string;
    successMessage?: string;
    showSuccess?: boolean;
    retryable?: boolean;
    maxRetries?: number;
  } = {}
): Promise<T | null> {
  const {
    errorMessage,
    successMessage,
    showSuccess = false,
    retryable = false,
    maxRetries = 3
  } = options;

  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      const result = await operation();
      
      if (showSuccess && successMessage) {
        showSuccessToast(successMessage);
      }
      
      return result;
    } catch (error) {
      const appError = classifyError(error);
      
      // Retry if error is retryable and we haven't exceeded max retries
      if (retryable && appError.retryable && retries < maxRetries) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        continue;
      }
      
      showErrorToast(appError, errorMessage);
      console.error('Operation failed:', error);
      return null;
    }
  }
  
  return null;
}

// Database operation helpers
export async function handleDatabaseOperation<T>(
  operation: () => Promise<{ data: T; error: Error | null }>,
  options: {
    errorMessage?: string;
    successMessage?: string;
    showSuccess?: boolean;
  } = {}
): Promise<T | null> {
  const { errorMessage = 'Database operation failed', successMessage, showSuccess = false } = options;
  
  try {
    const { data, error } = await operation();
    
    if (error) {
      const appError = classifyError(error);
      showErrorToast(appError, errorMessage);
      return null;
    }
    
    if (showSuccess && successMessage) {
      showSuccessToast(successMessage);
    }
    
    return data;
  } catch (error) {
    const appError = classifyError(error);
    showErrorToast(appError, errorMessage);
    console.error('Database operation failed:', error);
    return null;
  }
}

// Form submission error handler
export function handleFormError(error: Error | { message: string }, setFieldError?: (field: string, message: string) => void) {
  const appError = classifyError(error);
  
  // If it's a validation error and we have field error setter
  if (appError.type === ErrorType.VALIDATION && setFieldError && appError.details) {
    try {
      const fieldErrors = JSON.parse(appError.details);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        setFieldError(field, message as string);
      });
      return;
    } catch {
      // If parsing fails, show general error
    }
  }
  
  showErrorToast(appError);
}

// Loading state manager with error handling
export class LoadingStateManager {
  private loadingStates: Map<string, boolean> = new Map();
  private setLoading: (key: string, loading: boolean) => void;

  constructor(setLoading: (key: string, loading: boolean) => void) {
    this.setLoading = setLoading;
  }

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    options: {
      errorMessage?: string;
      successMessage?: string;
      showSuccess?: boolean;
    } = {}
  ): Promise<T | null> {
    if (this.loadingStates.get(key)) {
      return null; // Already loading
    }

    this.loadingStates.set(key, true);
    this.setLoading(key, true);

    try {
      const result = await withErrorHandling(operation, options);
      return result;
    } finally {
      this.loadingStates.set(key, false);
      this.setLoading(key, false);
    }
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }
}

// React hook for standardized error handling
export function useErrorHandler() {
  const handleError = (error: Error | { message: string }, customMessage?: string) => {
    showErrorToast(error, customMessage);
  };

  const handleSuccess = (message: string, description?: string) => {
    showSuccessToast(message, description);
  };

  const handleDatabaseError = async <T>(
    operation: () => Promise<{ data: T; error: Error | null }>,
    options?: {
      errorMessage?: string;
      successMessage?: string;
      showSuccess?: boolean;
    }
  ) => {
    return handleDatabaseOperation(operation, options);
  };

  return {
    handleError,
    handleSuccess,
    handleDatabaseError,
    showError: showErrorToast,
    showSuccess: showSuccessToast,
    showInfo: showInfoToast,
    showWarning: showWarningToast
  };
}