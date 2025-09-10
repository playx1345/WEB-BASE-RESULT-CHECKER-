import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CrudOptions {
  table: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCrud<T>({ table, onSuccess, onError }: CrudOptions) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const create = useCallback(async (data: Partial<T>) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record created successfully",
      });

      onSuccess?.();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Error",
        description: `Failed to create record: ${errorMessage}`,
        variant: "destructive",
      });
      onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table, onSuccess, onError, toast]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record updated successfully",
      });

      onSuccess?.();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Error",
        description: `Failed to update record: ${errorMessage}`,
        variant: "destructive",
      });
      onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table, onSuccess, onError, toast]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record deleted successfully",
      });

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Error",
        description: `Failed to delete record: ${errorMessage}`,
        variant: "destructive",
      });
      onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table, onSuccess, onError, toast]);

  const bulkCreate = useCallback(async (data: Partial<T>[]) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${result.length} records created successfully`,
      });

      onSuccess?.();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Error",
        description: `Failed to create records: ${errorMessage}`,
        variant: "destructive",
      });
      onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table, onSuccess, onError, toast]);

  return {
    create,
    update,
    remove,
    bulkCreate,
    loading,
  };
}