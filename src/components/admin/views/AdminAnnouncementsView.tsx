import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Megaphone, Edit, Trash2, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_level: string | null;
  created_at: string;
  created_by: string;
}

export function AdminAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_level: 'all'
  });
  const [sendingSMS, setSendingSMS] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch announcements",
          variant: "destructive",
        });
        return;
      }

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const createAnnouncement = async () => {
    if (!formData.title || !formData.content || !user) return;

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: formData.title,
          content: formData.content,
          target_level: formData.target_level === 'all' ? 'all' : formData.target_level,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create announcement",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      // Send SMS notification
      if (data) {
        sendSMSNotification(data.id, formData.target_level);
      }

      setFormData({ title: '', content: '', target_level: 'all' });
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const sendSMSNotification = async (announcementId: string, targetLevel: string) => {
    try {
      setSendingSMS(true);
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          announcementId,
          targetLevel
        }
      });

      if (error) {
        console.error('SMS sending error:', error);
        toast({
          title: "SMS Warning",
          description: "Announcement created but SMS notification failed",
          variant: "destructive",
        });
        return;
      }

      const result = data as { sent: number; failed: number; total: number };
      
      if (result.sent > 0) {
        toast({
          title: "SMS Sent",
          description: `SMS notifications sent to ${result.sent} students`,
        });
      } else {
        toast({
          title: "SMS Info",
          description: "No students found with phone numbers for SMS",
        });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "SMS Warning", 
        description: "Failed to send SMS notifications",
        variant: "destructive",
      });
    } finally {
      setSendingSMS(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete announcement",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });

      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage announcements for students.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create an announcement to notify students about important updates.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="target">Target Audience</Label>
                <Select value={formData.target_level} onValueChange={(value) => setFormData({ ...formData, target_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter announcement content..."
                  className="min-h-32"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createAnnouncement} disabled={sendingSMS}>
                {sendingSMS ? (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2 animate-pulse" />
                    Sending SMS...
                  </>
                ) : (
                  'Create Announcement'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No announcements yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first announcement to notify students about important updates.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-foreground">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {announcement.target_level === 'all' ? 'All Students' : `${announcement.target_level} Level`}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}