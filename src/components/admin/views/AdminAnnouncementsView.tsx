import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Megaphone, Edit, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnnouncementsData } from '@/hooks/useDataFetching';
import { useErrorHandler } from '@/lib/errorHandling';
import { announcementSchema, validateSafely } from '@/lib/validation';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { DataTableErrorBoundary } from '@/components/ErrorBoundary';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_level: string | null;
  created_at: string;
  created_by: string;
}

export function AdminAnnouncementsView() {
  const { data: announcements, loading, refetch } = useAnnouncementsData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_level: 'all'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { handleDatabaseError, showError } = useErrorHandler();

  const createAnnouncement = async () => {
    // Clear previous errors
    setFormErrors({});

    // Validate form data
    const validation = validateSafely(announcementSchema, formData);
    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }

    if (!user) {
      showError(new Error('User not authenticated'));
      return;
    }

    const result = await handleDatabaseError(
      () => supabase.from('announcements').insert({
        title: formData.title,
        content: formData.content,
        target_level: formData.target_level === 'all' ? 'all' : formData.target_level,
        created_by: user.id
      }),
      {
        errorMessage: 'Failed to create announcement',
        successMessage: 'Announcement created successfully',
        showSuccess: true
      }
    );

    if (result) {
      setFormData({ title: '', content: '', target_level: 'all' });
      setIsDialogOpen(false);
      refetch();
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const result = await handleDatabaseError(
      () => supabase.from('announcements').delete().eq('id', id),
      {
        errorMessage: 'Failed to delete announcement',
        successMessage: 'Announcement deleted successfully',
        showSuccess: true
      }
    );

    if (result) {
      refetch();
    }
  };

  // Define table columns
  const columns: ColumnDef<Announcement>[] = [
    {
      key: 'title',
      header: 'Title',
      className: 'font-medium max-w-xs',
      render: (value) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'target_level',
      header: 'Target',
      render: (value) => (
        <Badge variant="outline">
          {value === 'all' ? 'All Students' : `${value} Level`}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (value) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'content',
      header: 'Preview',
      className: 'max-w-sm',
      render: (value) => (
        <div className="truncate text-muted-foreground" title={value}>
          {value}
        </div>
      )
    }
  ];

  const emptyState = (
    <div className="text-center py-8">
      <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">No announcements yet</h3>
      <p className="text-muted-foreground text-center mb-4">
        Create your first announcement to notify students about important updates.
      </p>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Announcement
      </Button>
    </div>
  );

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
                  className={formErrors.title ? 'border-destructive' : ''}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="target">Target Audience</Label>
                <Select 
                  value={formData.target_level} 
                  onValueChange={(value) => setFormData({ ...formData, target_level: value })}
                >
                  <SelectTrigger className={formErrors.target_level ? 'border-destructive' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="ND1">ND1 Level</SelectItem>
                    <SelectItem value="ND2">ND2 Level</SelectItem>
                    <SelectItem value="HND1">HND1 Level</SelectItem>
                    <SelectItem value="HND2">HND2 Level</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.target_level && (
                  <p className="text-sm text-destructive">{formErrors.target_level}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter announcement content..."
                  className={`min-h-32 ${formErrors.content ? 'border-destructive' : ''}`}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                {formErrors.content && (
                  <p className="text-sm text-destructive">{formErrors.content}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createAnnouncement}>
                Create Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTableErrorBoundary>
        <DataTable
          data={announcements}
          columns={columns}
          loading={loading}
          emptyState={emptyState}
          actions={(announcement) => (
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
          )}
        />
      </DataTableErrorBoundary>
    </div>
  );
}