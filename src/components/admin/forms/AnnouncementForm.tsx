import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Announcement {
  id?: string;
  title: string;
  content: string;
  target_level: string | null;
  created_by?: string;
  expires_at?: string | null;
  is_active?: boolean;
}

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (announcementData: any) => Promise<void>;
  loading?: boolean;
}

export function AnnouncementForm({ announcement, open, onOpenChange, onSubmit, loading = false }: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_level: 'all',
    expires_at: undefined as Date | undefined,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        target_level: announcement.target_level || 'all',
        expires_at: announcement.expires_at ? new Date(announcement.expires_at) : undefined,
        is_active: announcement.is_active ?? true,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        target_level: 'all',
        expires_at: undefined,
        is_active: true,
      });
    }
    setErrors({});
  }, [announcement, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters long';
    }

    if (formData.expires_at && formData.expires_at < new Date()) {
      newErrors.expires_at = 'Expiry date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const announcementData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      target_level: formData.target_level === 'all' ? null : formData.target_level,
      expires_at: formData.expires_at ? formData.expires_at.toISOString() : null,
      is_active: formData.is_active,
    };

    await onSubmit(announcementData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{announcement ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
          <DialogDescription>
            {announcement ? 'Update announcement details' : 'Create a new announcement for students'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter announcement title"
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Enter announcement content..."
              className="min-h-32"
              disabled={loading}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_level">Target Audience</Label>
              <Select 
                value={formData.target_level} 
                onValueChange={(value) => handleInputChange('target_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="ND1">ND1 Students</SelectItem>
                  <SelectItem value="ND2">ND2 Students</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expires_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expires_at ? (
                      format(formData.expires_at, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expires_at}
                    onSelect={(date) => handleInputChange('expires_at', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.expires_at && (
                <p className="text-sm text-destructive">{errors.expires_at}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active (visible to students)</Label>
          </div>

          {formData.expires_at && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This announcement will automatically become inactive on{' '}
                <span className="font-medium text-foreground">
                  {format(formData.expires_at, "PPP")}
                </span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : announcement ? 'Update Announcement' : 'Create Announcement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}