import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Megaphone, Edit, Trash2, Calendar, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { useCrud } from '@/hooks/useCrud';
import { DataPagination } from '@/components/ui/data-pagination';
import { AnnouncementForm } from '@/components/admin/forms/AnnouncementForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isAfter } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_level: string | null;
  created_at: string;
  created_by: string;
  expires_at?: string | null;
  is_active?: boolean;
}

export function AdminAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const isExpired = announcement.expires_at && isAfter(now, new Date(announcement.expires_at));
    const isActive = announcement.is_active && !isExpired;
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive) ||
      (statusFilter === 'expired' && isExpired);
    
    const matchesTarget = 
      targetFilter === 'all' ||
      (targetFilter === 'general' && (!announcement.target_level || announcement.target_level === 'all')) ||
      announcement.target_level === targetFilter;
    
    return matchesSearch && matchesStatus && matchesTarget;
  });

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
    reset: resetPagination,
  } = usePagination({
    totalItems: filteredAnnouncements.length,
    itemsPerPage: 10,
  });

  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  const { create, update, remove, loading: crudLoading } = useCrud<Announcement>({
    table: 'announcements',
    onSuccess: () => {
      fetchAnnouncements();
      setIsFormOpen(false);
      setSelectedAnnouncement(null);
      setIsEditMode(false);
    },
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    resetPagination();
  }, [searchTerm, statusFilter, targetFilter, resetPagination]);

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

  const handleCreateAnnouncement = async (announcementData: any) => {
    if (!user) return;
    
    await create({
      ...announcementData,
      created_by: user.id,
    });
  };

  const handleUpdateAnnouncement = async (announcementData: any) => {
    if (!selectedAnnouncement) return;
    await update(selectedAnnouncement.id, announcementData);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    await remove(announcementId);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleAddAnnouncement = () => {
    setSelectedAnnouncement(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const toggleAnnouncementStatus = async (announcement: Announcement) => {
    await update(announcement.id, {
      is_active: !announcement.is_active,
    });
  };

  const getAnnouncementStatus = (announcement: Announcement) => {
    const now = new Date();
    const isExpired = announcement.expires_at && isAfter(now, new Date(announcement.expires_at));
    
    if (isExpired) return { status: 'expired', label: 'Expired', variant: 'destructive' as const };
    if (announcement.is_active === false) return { status: 'inactive', label: 'Inactive', variant: 'secondary' as const };
    return { status: 'active', label: 'Active', variant: 'default' as const };
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
        <Button onClick={handleAddAnnouncement}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Announcements Overview</CardTitle>
          <CardDescription>
            Total Announcements: {announcements.length} | 
            Active: {announcements.filter(a => getAnnouncementStatus(a).status === 'active').length} | 
            Inactive: {announcements.filter(a => getAnnouncementStatus(a).status !== 'active').length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="ND1">ND1</SelectItem>
                  <SelectItem value="ND2">ND2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {paginatedAnnouncements.map((announcement) => {
              const statusInfo = getAnnouncementStatus(announcement);
              return (
                <Card key={announcement.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{announcement.title}</h3>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                          {announcement.target_level && announcement.target_level !== 'all' && (
                            <Badge variant="outline">
                              {announcement.target_level}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(announcement.created_at), 'PPP')}
                          </div>
                          {announcement.expires_at && (
                            <div>
                              Expires: {format(new Date(announcement.expires_at), 'PPP')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAnnouncementStatus(announcement)}
                          disabled={crudLoading}
                        >
                          {statusInfo.status === 'active' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAnnouncement(announcement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{announcement.title}"? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {announcement.content.substring(0, 200)}
                      {announcement.content.length > 200 && '...'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAnnouncements.length === 0 && !loading && (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No announcements found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || targetFilter !== 'all'
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by creating your first announcement.'}
              </p>
              {!searchTerm && statusFilter === 'all' && targetFilter === 'all' && (
                <Button onClick={handleAddAnnouncement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              )}
            </div>
          )}

          {filteredAnnouncements.length > 0 && (
            <div className="mt-6">
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AnnouncementForm
        announcement={selectedAnnouncement}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={isEditMode ? handleUpdateAnnouncement : handleCreateAnnouncement}
        loading={crudLoading}
      />
    </div>
  );
}