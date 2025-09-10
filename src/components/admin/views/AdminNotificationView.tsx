import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bell, Users, TrendingUp, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationStats {
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  recentActivity: number;
}

interface AllNotification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  recipient_name?: string;
  recipient_email?: string;
}

export function AdminNotificationView() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [notifications, setNotifications] = useState<AllNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system' as string,
    targetLevel: 'all',
  });
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      // Get total notifications
      const { count: totalSent } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      // Get read notifications
      const { count: totalRead } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', true);

      // Get unread notifications
      const { count: totalUnread } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentActivity } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalSent: totalSent || 0,
        totalRead: totalRead || 0,
        totalUnread: totalUnread || 0,
        recentActivity: recentActivity || 0,
      });
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Fetch notifications with user profile information
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          recipient:recipient_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedNotifications = data?.map(notification => ({
        ...notification,
        recipient_name: (notification as any).recipient?.raw_user_meta_data?.full_name || 'Unknown User',
        recipient_email: (notification as any).recipient?.email || '',
      })) || [];

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationToStudents = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and message for the notification.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Get student user IDs based on target level
      let query = supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'student');

      if (newNotification.targetLevel !== 'all') {
        query = query.eq('level', newNotification.targetLevel);
      }

      const { data: students, error: studentsError } = await query;

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        toast({
          title: "No recipients",
          description: "No students found for the selected criteria.",
          variant: "destructive",
        });
        return;
      }

      // Create notifications for all students
      const notificationsToCreate = students.map(student => ({
        recipient_id: student.user_id,
        title: newNotification.title,
        message: newNotification.message,
        notification_type: newNotification.type,
        metadata: {
          sent_by_admin: true,
          target_level: newNotification.targetLevel,
        },
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (insertError) throw insertError;

      toast({
        title: "Notifications sent",
        description: `Successfully sent notification to ${students.length} student(s).`,
      });

      // Reset form
      setNewNotification({
        title: '',
        message: '',
        type: 'system',
        targetLevel: 'all',
      });

      // Refresh data
      fetchStats();
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchNotifications();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notification Management</h1>
        <p className="text-muted-foreground">
          Send notifications to students and manage notification system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSent || 0}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRead || 0}</div>
            <p className="text-xs text-muted-foreground">Read by students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUnread || 0}</div>
            <p className="text-xs text-muted-foreground">Pending notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentActivity || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send New Notification</CardTitle>
              <CardDescription>
                Send a notification to students in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newNotification.type} onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Audience</Label>
                <Select value={newNotification.targetLevel} onValueChange={(value) => setNewNotification(prev => ({ ...prev, targetLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="ND1">ND1 Students Only</SelectItem>
                    <SelectItem value="ND2">ND2 Students Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  rows={4}
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <Button onClick={sendNotificationToStudents} disabled={sending} className="w-full md:w-auto">
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Notification'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent notifications sent to students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No notifications found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="border border-border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <Badge variant={notification.is_read ? "default" : "secondary"}>
                                {notification.is_read ? "Read" : "Unread"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {notification.notification_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>To: {notification.recipient_name} ({notification.recipient_email})</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                              {notification.read_at && (
                                <>
                                  <span>•</span>
                                  <span>Read {formatDistanceToNow(new Date(notification.read_at), { addSuffix: true })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}