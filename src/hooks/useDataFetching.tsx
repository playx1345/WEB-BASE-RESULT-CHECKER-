import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/lib/errorHandling';

interface UseDataFetchingOptions<T> {
  initialData?: T;
  errorMessage?: string;
  fetchOnMount?: boolean;
  dependencies?: any[];
}

interface UseDataFetchingReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T>>;
}

// Generic hook for data fetching with error handling
export function useDataFetching<T>(
  fetchFunction: () => Promise<{ data: T; error: any }>,
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingReturn<T> {
  const {
    initialData,
    errorMessage = 'Failed to fetch data',
    fetchOnMount = true,
    dependencies = []
  } = options;

  const [data, setData] = useState<T>(initialData as T);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<string | null>(null);
  const { handleDatabaseError } = useErrorHandler();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await handleDatabaseError(fetchFunction, {
      errorMessage,
      showSuccess: false
    });

    if (result !== null) {
      setData(result);
    } else {
      setError(errorMessage);
    }

    setLoading(false);
  }, [fetchFunction, errorMessage, handleDatabaseError]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchData, fetchOnMount, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
}

// Hook for students data
export function useStudentsData() {
  const fetchStudents = useCallback(async () => {
    return await supabase
      .from('students')
      .select(`
        *,
        profile:profiles(full_name, phone_number, user_id)
      `);
  }, []);

  return useDataFetching(fetchStudents, {
    initialData: [],
    errorMessage: 'Failed to fetch students'
  });
}

// Hook for results data
export function useResultsData() {
  const fetchResults = useCallback(async () => {
    return await supabase
      .from('results')
      .select(`
        *,
        student:students(
          matric_number,
          profile:profiles(full_name)
        )
      `)
      .order('created_at', { ascending: false });
  }, []);

  return useDataFetching(fetchResults, {
    initialData: [],
    errorMessage: 'Failed to fetch results'
  });
}

// Hook for announcements data
export function useAnnouncementsData() {
  const fetchAnnouncements = useCallback(async () => {
    return await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
  }, []);

  return useDataFetching(fetchAnnouncements, {
    initialData: [],
    errorMessage: 'Failed to fetch announcements'
  });
}

// Hook for filtered data
interface UseFilteredDataOptions<T> {
  searchFields: (keyof T | string)[];
  searchTerm: string;
  filters?: Record<string, any>;
}

export function useFilteredData<T extends Record<string, any>>(
  data: T[],
  options: UseFilteredDataOptions<T>
): T[] {
  const { searchFields, searchTerm, filters = {} } = options;

  return data.filter((item) => {
    // Search filter
    const matchesSearch = searchTerm === '' || searchFields.some(field => {
      const value = getNestedValue(item, field as string);
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Additional filters
    const matchesFilters = Object.entries(filters).every(([key, filterValue]) => {
      if (filterValue === 'all' || filterValue === '' || filterValue === null) {
        return true;
      }
      const itemValue = getNestedValue(item, key);
      return itemValue === filterValue;
    });

    return matchesSearch && matchesFilters;
  });
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Hook for table pagination
interface UsePaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export function usePagination(
  totalItems: number,
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const { itemsPerPage: initialItemsPerPage = 10, initialPage = 1 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  // Reset to first page when items per page changes
  const handleSetItemsPerPage = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Reset to first page if current page is beyond total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage
  };
}

// Hook for managing multiple loading states
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
}

// Hook for debounced search
export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm
  };
}