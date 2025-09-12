import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 
  | 'user_login' 
  | 'user_logout' 
  | 'view_results' 
  | 'view_student_profile' 
  | 'access_admin_dashboard'
  | 'view_audit_logs'
  | string;

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Log a user activity manually
 */
export async function logUserActivity(
  action: AuditAction,
  options: {
    tableName?: string;
    recordId?: string;
    metadata?: Record<string, unknown>;
  } = {}
) {
  try {
    const { tableName, recordId, metadata = {} } = options;
    
    // Get client info
    const userAgent = navigator.userAgent;
    const enhancedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    const { data, error } = await supabase.rpc('log_user_activity', {
      p_action: action,
      p_table_name: tableName || null,
      p_record_id: recordId || null,
      p_metadata: enhancedMetadata,
    });

    if (error) {
      console.error('Failed to log user activity:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error logging user activity:', error);
    return null;
  }
}

/**
 * Fetch audit logs (admin only)
 */
export async function fetchAuditLogs(options: {
  limit?: number;
  offset?: number;
  userId?: string;
  action?: string;
  tableName?: string;
  fromDate?: string;
  toDate?: string;
} = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      userId,
      action,
      tableName,
      fromDate,
      toDate,
    } = options;

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        profiles!audit_logs_user_id_fkey(full_name, matric_number)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (action) {
      query = query.ilike('action', `%${action}%`);
    }
    if (tableName) {
      query = query.eq('table_name', tableName);
    }
    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }
    if (toDate) {
      query = query.lte('created_at', toDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { data: [], error };
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats() {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (error) {
      console.error('Failed to fetch audit log stats:', error);
      return null;
    }

    const stats = {
      totalActivities: data.length,
      todayActivities: data.filter(log => 
        new Date(log.created_at).toDateString() === new Date().toDateString()
      ).length,
      actionBreakdown: data.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    return null;
  }
}

/**
 * Create a React hook for automatic activity logging
 */
export function useActivityLogger() {
  const logActivity = async (
    action: AuditAction,
    options?: {
      tableName?: string;
      recordId?: string;
      metadata?: Record<string, unknown>;
    }
  ) => {
    return await logUserActivity(action, options);
  };

  return { logActivity };
}