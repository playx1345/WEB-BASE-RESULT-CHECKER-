import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface GradeAppeal {
  id: string;
  result_id: string;
  student_id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  admin_response: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  results: {
    course_code: string;
    course_title: string;
    grade: string;
    point: number;
    semester: string;
    session: string;
  };
  students: {
    matric_number: string;
    profiles: {
      full_name: string;
    };
  };
}

export function AdminAppealsView() {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState<GradeAppeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<GradeAppeal | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminResponse, setAdminResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const { data, error } = await supabase
        .from('grade_appeals')
        .select(`
          *,
          results (
            course_code,
            course_title,
            grade,
            point,
            semester,
            session
          ),
          students (
            matric_number,
            profiles (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppeals(data || []);
    } catch (error) {
      console.error('Error fetching appeals:', error);
      toast.error('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <Eye className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const openReviewDialog = (appeal: GradeAppeal) => {
    setSelectedAppeal(appeal);
    setNewStatus(appeal.status);
    setAdminResponse(appeal.admin_response || '');
    setReviewDialog(true);
  };

  const handleUpdateAppeal = async () => {
    if (!selectedAppeal || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('grade_appeals')
        .update({
          status: newStatus as any,
          admin_response: adminResponse.trim() || null,
          reviewed_by: user.id,
        })
        .eq('id', selectedAppeal.id);

      if (error) throw error;

      toast.success('Appeal updated successfully');
      setReviewDialog(false);
      fetchAppeals();
    } catch (error) {
      console.error('Error updating appeal:', error);
      toast.error('Failed to update appeal');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAppeals = appeals.filter(appeal => 
    statusFilter === 'all' || appeal.status === statusFilter
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grade Appeals</h1>
          <p className="text-muted-foreground">
            Review and manage student grade appeals
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Appeals</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appeals Overview</CardTitle>
          <CardDescription>
            {filteredAppeals.length} appeals found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No appeals found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Current Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppeals.map((appeal) => (
                  <TableRow key={appeal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appeal.students.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">{appeal.students.matric_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appeal.results.course_code}</p>
                        <p className="text-sm text-muted-foreground">{appeal.results.course_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {appeal.results.session} - {appeal.results.semester}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-800">
                        {appeal.results.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appeal.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(appeal.status)}
                          {appeal.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(appeal.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewDialog(appeal)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Grade Appeal</DialogTitle>
            <DialogDescription>
              Appeal from {selectedAppeal?.students.profiles.full_name} for{' '}
              {selectedAppeal?.results.course_code}
            </DialogDescription>
          </DialogHeader>
          {selectedAppeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Information</Label>
                  <div className="text-sm mt-1">
                    <p><strong>Code:</strong> {selectedAppeal.results.course_code}</p>
                    <p><strong>Title:</strong> {selectedAppeal.results.course_title}</p>
                    <p><strong>Current Grade:</strong> {selectedAppeal.results.grade}</p>
                    <p><strong>Session:</strong> {selectedAppeal.results.session} - {selectedAppeal.results.semester}</p>
                  </div>
                </div>
                <div>
                  <Label>Student Information</Label>
                  <div className="text-sm mt-1">
                    <p><strong>Name:</strong> {selectedAppeal.students.profiles.full_name}</p>
                    <p><strong>Matric Number:</strong> {selectedAppeal.students.matric_number}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedAppeal.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Student's Reason</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{selectedAppeal.reason}</p>
                </div>
              </div>

              {selectedAppeal.details && (
                <div>
                  <Label>Additional Details</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">{selectedAppeal.details}</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="response">Admin Response</Label>
                <Textarea
                  id="response"
                  placeholder="Provide feedback or explanation for your decision..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setReviewDialog(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateAppeal}
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update Appeal'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}