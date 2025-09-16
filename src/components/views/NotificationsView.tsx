import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  created_at: string;
  target_level: string;
  read: boolean;
}

export function NotificationsView() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string>('');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // First get user level
        const { data: profileData } = await supabase
          .from('profiles')
          .select('level')
          .eq('user_id', user.id)
          .single();

        if (profileData?.level) {
          setUserLevel(profileData.level);

          // Fetch announcements as notifications
          const { data: announcements } = await supabase
            .from('announcements')
            .select('*')
            .or(`target_level.eq.${profileData.level},target_level.eq.all`)
            .order('created_at', { ascending: false });

          // Transform announcements to notifications format
          const notificationData = announcements?.map(announcement => ({
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            type: 'announcement' as const,
            created_at: announcement.created_at,
            target_level: announcement.target_level,
            read: false // We'll implement read status later
          })) || [];

          // Add system notifications
          const systemNotifications = await generateSystemNotifications(user.id, profileData.level);
          
          setNotifications([...systemNotifications, ...notificationData]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const generateSystemNotifications = async (userId: string, level: string): Promise<Notification[]> => {
    const systemNotifications: Notification[] = [];

    try {
      // Get student data for fee status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        const { data: studentData } = await supabase
          .from('students')
          .select('fee_status, carryovers')
          .eq('profile_id', profileData.id)
          .single();

        // Fee payment notification
        if (studentData?.fee_status === 'unpaid') {
          systemNotifications.push({
            id: 'fee-payment',
            title: 'Fee Payment Required',
            content: 'Your academic records are currently restricted due to unpaid fees. Please complete your fee payment to access your results and other services.',
            type: 'warning',
            created_at: new Date().toISOString(),
            target_level: level,
            read: false
          });
        }

        // Carryover notification
        if (studentData?.carryovers && studentData.carryovers > 0) {
          systemNotifications.push({
            id: 'carryovers',
            title: 'Outstanding Courses',
            content: `You have ${studentData.carryovers} carryover course(s). Please ensure you register for these courses in the upcoming semester.`,
            type: 'info',
            created_at: new Date().toISOString(),
            target_level: level,
            read: false
          });
        }
      }

      // Welcome notification for new users
      systemNotifications.push({
        id: 'welcome',
        title: 'Welcome to the Student Portal',
        content: 'Welcome to the Plateau State Polytechnic Barkin Ladi student portal. Here you can view your results, check announcements, and manage your profile.',
        type: 'success',
        created_at: new Date().toISOString(),
        target_level: level,
        read: false
      });

    } catch (error) {
      console.error('Error generating system notifications:', error);
    }

    return systemNotifications;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      case 'info':
        return 'secondary';
      case 'announcement':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </h1>
        <p className="text-muted-foreground">
          Stay updated with important announcements and system notifications.
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center">
              You're all caught up! New notifications will appear here when they arrive.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`transition-all duration-200 ${!notification.read ? 'border-primary/20 bg-primary/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(notification.created_at), 'PPp')}
                        <Badge variant={getNotificationBadgeVariant(notification.type) as any} className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {notification.content}
                </p>
                {notification.type === 'warning' && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This requires your immediate attention. Please take necessary action as soon as possible.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}