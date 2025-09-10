import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type NotificationPreference = Tables<'notification_preferences'>;

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .order('notification_type');

      if (error) throw error;

      setPreferences(data || []);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    id: string, 
    updates: TablesUpdate<'notification_preferences'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPreferences(prev => 
        prev.map(pref => 
          pref.id === id ? { ...pref, ...data } : pref
        )
      );

      return data;
    } catch (error) {
      console.error('Error updating notification preference:', error);
      throw error;
    }
  };

  const updatePreferenceByType = async (
    notificationType: string,
    updates: Omit<TablesUpdate<'notification_preferences'>, 'id' | 'user_id' | 'notification_type'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('notification_type', notificationType)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPreferences(prev => 
        prev.map(pref => 
          pref.notification_type === notificationType ? { ...pref, ...data } : pref
        )
      );

      return data;
    } catch (error) {
      console.error('Error updating notification preference by type:', error);
      throw error;
    }
  };

  const getPreferenceByType = (notificationType: string) => {
    return preferences.find(pref => pref.notification_type === notificationType);
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreference,
    updatePreferenceByType,
    getPreferenceByType,
    refetch: fetchPreferences,
  };
}