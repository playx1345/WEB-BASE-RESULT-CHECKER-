import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, IdCard, GraduationCap, Camera, Calendar, FileText, Clock, Award, AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  matric_number: string;
  phone_number: string;
  level: string;
  avatar_url?: string;
}

interface Student {
  id: string;
  profile_id: string;
  matric_number: string;
  level: string;
  cgp: number;
  total_gp: number;
  carryovers: number;
  fee_status: string;
}

interface Result {
  id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  point: number;
  semester: string;
  level: string;
  session: string;
}

interface Attendance {
  id: string;
  date: string;
  status: string;
  course_code?: string;
  remarks?: string;
}

interface Remark {
  id: string;
  title: string;
  content: string;
  category: string;
  severity: string;
  created_at: string;
}

interface UpdateRequest {
  id: string;
  request_type: string;
  status: string;
  requested_data: any;
  admin_notes?: string;
  created_at: string;
}

export function ProfileView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [updateRequests, setUpdateRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
  });

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            full_name: profileData.full_name || '',
            phone_number: profileData.phone_number || '',
          });

          // Fetch student data
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('profile_id', profileData.id)
            .single();

          if (studentData) {
            setStudent(studentData);

            // Fetch results
            const { data: resultsData } = await supabase
              .from('results')
              .select('*')
              .eq('student_id', studentData.id)
              .order('session', { ascending: false })
              .order('level', { ascending: false })
              .order('semester', { ascending: false });

            setResults(resultsData || []);

            // Fetch attendance (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: attendanceData } = await supabase
              .from('attendance')
              .select('*')
              .eq('student_id', studentData.id)
              .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
              .order('date', { ascending: false });

            setAttendance(attendanceData || []);

            // Fetch remarks
            const { data: remarksData } = await supabase
              .from('student_remarks')
              .select('*')
              .eq('student_id', studentData.id)
              .eq('is_visible_to_student', true)
              .order('created_at', { ascending: false });

            setRemarks(remarksData || []);

            // Fetch update requests
            const { data: requestsData } = await supabase
              .from('profile_update_requests')
              .select('*')
              .eq('student_id', studentData.id)
              .order('created_at', { ascending: false });

            setUpdateRequests(requestsData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, toast]);

  const submitUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !student) return;

    setUpdating(true);
    try {
      // Create update request instead of direct update
      const { error } = await supabase
        .from('profile_update_requests')
        .insert({
          student_id: student.id,
          request_type: 'profile_info',
          current_data: {
            full_name: profile.full_name,
            phone_number: profile.phone_number,
          },
          requested_data: formData,
          requested_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Update Request Submitted',
        description: 'Your profile update request has been submitted for admin approval.',
      });

      // Refresh requests
      const { data: requestsData } = await supabase
        .from('profile_update_requests')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      setUpdateRequests(requestsData || []);
    } catch (error) {
      console.error('Error submitting update request:', error);
      toast({
        title: 'Request Failed',
        description: 'There was an error submitting your update request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const submitAvatarRequest = async () => {
    if (!avatarFile || !user || !student) return;

    setUpdating(true);
    try {
      // Upload avatar to Supabase storage
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Create update request for avatar
      const { error } = await supabase
        .from('profile_update_requests')
        .insert({
          student_id: student.id,
          request_type: 'avatar',
          current_data: { avatar_url: profile?.avatar_url },
          requested_data: { avatar_url: urlData.publicUrl },
          requested_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Avatar Update Requested',
        description: 'Your profile picture update has been submitted for admin approval.',
      });

      setAvatarFile(null);
      
      // Refresh requests
      const { data: requestsData } = await supabase
        .from('profile_update_requests')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      setUpdateRequests(requestsData || []);
    } catch (error) {
      console.error('Error submitting avatar request:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setAvatarFile(file);
    }
  };

  const calculateAttendanceStats = () => {
    if (attendance.length === 0) return { present: 0, absent: 0, percentage: 0 };
    
    const present = attendance.filter(a => a.status === 'present').length;
    const total = attendance.length;
    const percentage = Math.round((present / total) * 100);
    
    return { present, absent: total - present, percentage };
  };

  const getLatestResults = () => {
    const currentLevelResults = results.filter(r => r.level === student?.level);
    return currentLevelResults.slice(0, 5); // Show latest 5 courses
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-blue-500" />;
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const attendanceStats = calculateAttendanceStats();
  const latestResults = getLatestResults();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information, view academic history, and track attendance.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="remarks">Remarks</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Submit changes for admin approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitUpdateRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed from this interface.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <Button type="submit" disabled={updating} className="w-full">
                    {updating ? 'Submitting...' : 'Request Update'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Information & Avatar Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your academic and account details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Section */}
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile Picture</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="text-xs"
                      />
                      {avatarFile && (
                        <Button 
                          size="sm" 
                          onClick={submitAvatarRequest}
                          disabled={updating}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <Badge variant="secondary">{profile?.role?.toUpperCase()}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <IdCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Matric Number</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.matric_number || 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Current Level</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.level || 'Not set'}
                    </p>
                  </div>
                </div>

                {student && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">CGPA</p>
                      <p className="text-sm text-muted-foreground">
                        {student.cgp ? student.cgp.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Academic Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Summary</CardTitle>
                <CardDescription>
                  Your overall academic performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {student && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{student.cgp ? student.cgp.toFixed(2) : 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">CGPA</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{student.carryovers}</p>
                        <p className="text-sm text-muted-foreground">Carryovers</p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Fee Status</p>
                      <Badge variant={student.fee_status === 'paid' ? 'default' : 'destructive'}>
                        {student.fee_status.toUpperCase()}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Latest Results */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>
                  Your latest course results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestResults.length > 0 ? (
                  <div className="space-y-2">
                    {latestResults.map((result) => (
                      <div key={result.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{result.course_code}</p>
                          <p className="text-xs text-muted-foreground">{result.course_title}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={result.grade.startsWith('A') || result.grade.startsWith('B') ? 'default' : 'secondary'}>
                            {result.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{result.point} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No results available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Results Table */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Academic Record</CardTitle>
                <CardDescription>
                  All your course results organized by session and semester.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.course_code}</TableCell>
                        <TableCell>{result.course_title}</TableCell>
                        <TableCell>{result.credit_unit}</TableCell>
                        <TableCell>
                          <Badge variant={result.grade.startsWith('A') || result.grade.startsWith('B') ? 'default' : 'secondary'}>
                            {result.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>{result.point}</TableCell>
                        <TableCell>{result.session}</TableCell>
                        <TableCell className="capitalize">{result.semester}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          {/* Attendance Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{attendanceStats.percentage}%</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Present Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{attendanceStats.present}</p>
                  <p className="text-sm text-muted-foreground">Out of {attendance.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Absent Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{attendanceStats.absent}</p>
                  <p className="text-sm text-muted-foreground">Missed classes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Details */}
          {attendance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>
                  Your attendance record for the last 30 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            record.status === 'present' ? 'default' :
                            record.status === 'late' ? 'secondary' : 'destructive'
                          }>
                            {record.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.course_code || 'General'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.remarks || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {attendance.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
                <p className="text-muted-foreground">
                  Your attendance records will appear here once classes begin.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="remarks" className="space-y-6">
          {remarks.length > 0 ? (
            <div className="space-y-4">
              {remarks.map((remark) => (
                <Card key={remark.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(remark.severity)}
                        <CardTitle className="text-lg">{remark.title}</CardTitle>
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
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{remark.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(remark.created_at).toLocaleDateString()} at {new Date(remark.created_at).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Remarks</h3>
                <p className="text-muted-foreground">
                  Administrative remarks and feedback will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {updateRequests.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Profile Update Requests</CardTitle>
                <CardDescription>
                  Track the status of your profile update requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updateRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium capitalize">{request.request_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {request.request_type === 'profile_info' && (
                        <div className="text-sm space-y-1">
                          <p><strong>Requested Changes:</strong></p>
                          {Object.entries(request.requested_data).map(([key, value]) => (
                            <p key={key} className="text-muted-foreground">
                              {key.replace('_', ' ')}: {value as string}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      {request.admin_notes && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <p><strong>Admin Notes:</strong></p>
                          <p className="text-muted-foreground">{request.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Requests</h3>
                <p className="text-muted-foreground">
                  Your profile update requests will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}