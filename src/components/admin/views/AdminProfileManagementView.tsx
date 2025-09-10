import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, User, Camera, Phone, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileUpdateRequest {
  id: string;
  request_type: string;
  current_data: any;
  requested_data: any;
  status: string;
  admin_notes?: string;
  created_at: string;
  student: {
    id: string;
    matric_number: string;
    profile: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface StudentRemark {
  id: string;
  title: string;
  content: string;
  category: string;
  severity: string;
  is_visible_to_student: boolean;
  created_at: string;
  student: {
    matric_number: string;
    profile: {
      full_name: string;
    };
  };
}

export function AdminProfileManagementView() {
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [remarks, setRemarks] = useState<StudentRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProfileUpdateRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profile update requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('profile_update_requests')
        .select(`
          *,
          student:students!profile_update_requests_student_id_fkey(
            id,
            matric_number,
            profile:profiles!students_profile_id_fkey(
              full_name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch student remarks
      const { data: remarksData, error: remarksError } = await supabase
        .from('student_remarks')
        .select(`
          *,
          student:students!student_remarks_student_id_fkey(
            matric_number,
            profile:profiles!students_profile_id_fkey(
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (remarksError) throw remarksError;

      setRequests(requestsData || []);
      setRemarks(remarksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile management data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('profile_update_requests')
        .update({
          status: action,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, update the actual profile data
      if (action === 'approved' && selectedRequest.request_type === 'profile_info') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(selectedRequest.requested_data)
          .eq('id', selectedRequest.student.id);

        if (profileError) throw profileError;
      }

      if (action === 'approved' && selectedRequest.request_type === 'avatar') {
        const { error: avatarError } = await supabase
          .from('profiles')
          .update({ avatar_url: selectedRequest.requested_data.avatar_url })
          .eq('id', selectedRequest.student.id);

        if (avatarError) throw avatarError;
      }

      toast({
        title: "Success",
        description: `Request ${action} successfully`,
      });

      setSelectedRequest(null);
      setAdminNotes('');
      fetchData();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-blue-600';
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
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Management</h1>
        <p className="text-muted-foreground">
          Manage student profile update requests and administrative remarks.
        </p>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Update Requests</TabsTrigger>
          <TabsTrigger value="remarks">Recent Remarks</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Profile Update Requests</CardTitle>
              <CardDescription>
                Review and approve student profile update requests.
                Pending: {requests.filter(r => r.status === 'pending').length} |
                Total: {requests.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.student.profile.avatar_url} />
                              <AvatarFallback>
                                {request.student.profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.student.profile.full_name}</p>
                              <p className="text-sm text-muted-foreground">{request.student.matric_number}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {request.request_type === 'avatar' ? (
                              <Camera className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                            <span className="capitalize">{request.request_type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {request.status.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Profile Update Request</DialogTitle>
                                <DialogDescription>
                                  Review and approve or reject this profile update request.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Student Information</Label>
                                    <div className="mt-2 p-3 border rounded-lg">
                                      <p className="font-medium">{request.student.profile.full_name}</p>
                                      <p className="text-sm text-muted-foreground">{request.student.matric_number}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Request Type</Label>
                                    <div className="mt-2 p-3 border rounded-lg">
                                      <p className="capitalize">{request.request_type.replace('_', ' ')}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Submitted on {new Date(request.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {request.request_type === 'profile_info' && (
                                  <div>
                                    <Label className="text-sm font-medium">Requested Changes</Label>
                                    <div className="mt-2 space-y-2">
                                      {Object.entries(request.requested_data).map(([key, value]) => (
                                        <div key={key} className="flex justify-between p-2 border rounded">
                                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                                          <span className="font-medium">{value as string}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {request.request_type === 'avatar' && (
                                  <div>
                                    <Label className="text-sm font-medium">Profile Picture Comparison</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                      <div className="text-center">
                                        <p className="text-sm text-muted-foreground mb-2">Current</p>
                                        <Avatar className="h-16 w-16">
                                          <AvatarImage src={request.current_data?.avatar_url} />
                                          <AvatarFallback>Current</AvatarFallback>
                                        </Avatar>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-sm text-muted-foreground mb-2">Requested</p>
                                        <Avatar className="h-16 w-16">
                                          <AvatarImage src={request.requested_data?.avatar_url} />
                                          <AvatarFallback>New</AvatarFallback>
                                        </Avatar>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <Label htmlFor="admin_notes">Admin Notes</Label>
                                  <Textarea
                                    id="admin_notes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about your decision..."
                                    className="mt-2"
                                  />
                                </div>
                              </div>

                              <DialogFooter className="gap-2">
                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRequestAction(request.id, 'rejected')}
                                      disabled={processing}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => handleRequestAction(request.id, 'approved')}
                                      disabled={processing}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                  </>
                                )}
                                {request.status !== 'pending' && (
                                  <p className="text-sm text-muted-foreground">
                                    This request has already been {request.status}.
                                  </p>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Profile Requests</h3>
                  <p className="text-muted-foreground">
                    Student profile update requests will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remarks">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Recent Administrative Remarks</CardTitle>
              <CardDescription>
                Recently added remarks for student profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {remarks.length > 0 ? (
                <div className="space-y-4">
                  {remarks.map((remark) => (
                    <div key={remark.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className={`h-4 w-4 ${getSeverityColor(remark.severity)}`} />
                          <h4 className="font-medium">{remark.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {remark.category}
                          </Badge>
                          <Badge variant={
                            remark.severity === 'positive' ? 'default' :
                            remark.severity === 'critical' ? 'destructive' : 'secondary'
                          }>
                            {remark.severity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{remark.content}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>
                          Student: {remark.student.profile.full_name} ({remark.student.matric_number})
                        </span>
                        <span>
                          {new Date(remark.created_at).toLocaleDateString()} |
                          Visible to student: {remark.is_visible_to_student ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Remarks</h3>
                  <p className="text-muted-foreground">
                    Administrative remarks will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}