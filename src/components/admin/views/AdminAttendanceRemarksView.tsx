import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus, Search, MessageSquare, Users, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Student {
  id: string;
  matric_number: string;
  level: string;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  course_code?: string;
  remarks?: string;
  student: {
    matric_number: string;
    profile: {
      full_name: string;
    };
  };
}

interface RemarkForm {
  student_id: string;
  title: string;
  content: string;
  category: string;
  severity: string;
  is_visible_to_student: boolean;
}

export function AdminAttendanceRemarksView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [remarkForm, setRemarkForm] = useState<RemarkForm>({
    student_id: '',
    title: '',
    content: '',
    category: 'general',
    severity: 'info',
    is_visible_to_student: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles!students_profile_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .order('matric_number');

      if (studentsError) throw studentsError;

      // Fetch recent attendance (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students!attendance_student_id_fkey(
            matric_number,
            profile:profiles!students_profile_id_fkey(
              full_name
            )
          )
        `)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      setStudents(studentsData || []);
      setAttendance(attendanceData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          date: selectedDate,
          status,
          course_code: selectedCourse || null,
          marked_by: user.id,
        }, {
          onConflict: 'student_id,date,course_code'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const submitRemark = async () => {
    if (!user || !remarkForm.student_id || !remarkForm.title || !remarkForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('student_remarks')
        .insert({
          ...remarkForm,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Remark added successfully",
      });

      setRemarkForm({
        student_id: '',
        title: '',
        content: '',
        category: 'general',
        severity: 'info',
        is_visible_to_student: true,
      });

      fetchData();
    } catch (error) {
      console.error('Error adding remark:', error);
      toast({
        title: "Error",
        description: "Failed to add remark",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getAttendanceForStudent = (studentId: string) => {
    return attendance.filter(a => a.student.matric_number === students.find(s => s.id === studentId)?.matric_number);
  };

  const getAttendanceStats = () => {
    const totalRecords = attendance.length;
    const presentRecords = attendance.filter(a => a.status === 'present').length;
    const absentRecords = attendance.filter(a => a.status === 'absent').length;
    const lateRecords = attendance.filter(a => a.status === 'late').length;

    return {
      total: totalRecords,
      present: presentRecords,
      absent: absentRecords,
      late: lateRecords,
      percentage: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0,
    };
  };

  const filteredStudents = students.filter(student =>
    student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getAttendanceStats();

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance & Remarks</h1>
        <p className="text-muted-foreground">
          Manage student attendance and add administrative remarks.
        </p>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Management</TabsTrigger>
          <TabsTrigger value="remarks">Add Remarks</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          {/* Attendance Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                  <p className="text-sm text-muted-foreground">{stats.percentage}% attendance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                  <p className="text-sm text-muted-foreground">Missed classes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                  <p className="text-sm text-muted-foreground">Late arrivals</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Mark Attendance</CardTitle>
              <CardDescription>
                Select date and course, then mark attendance for students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Input
                  placeholder="Course code (optional)"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-40"
                />
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by matric number, name, or level..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matric Number</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Recent Attendance</TableHead>
                    <TableHead>Mark Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const studentAttendance = getAttendanceForStudent(student.id);
                    const todayAttendance = studentAttendance.find(a => a.date === selectedDate);
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.matric_number}</TableCell>
                        <TableCell>{student.profile?.full_name || 'N/A'}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {studentAttendance.slice(0, 5).map((record, index) => (
                              <div
                                key={index}
                                className={`w-3 h-3 rounded-full ${
                                  record.status === 'present' ? 'bg-green-500' :
                                  record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                title={`${record.date} - ${record.status}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={todayAttendance?.status === 'present' ? 'default' : 'outline'}
                              onClick={() => markAttendance(student.id, 'present')}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={todayAttendance?.status === 'late' ? 'secondary' : 'outline'}
                              onClick={() => markAttendance(student.id, 'late')}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={todayAttendance?.status === 'absent' ? 'destructive' : 'outline'}
                              onClick={() => markAttendance(student.id, 'absent')}
                            >
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'No students available.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Add Administrative Remark</CardTitle>
              <CardDescription>
                Add remarks for students that will be visible in their profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Student</Label>
                    <Select
                      value={remarkForm.student_id}
                      onValueChange={(value) => setRemarkForm(prev => ({ ...prev, student_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.profile?.full_name} ({student.matric_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={remarkForm.category}
                      onValueChange={(value) => setRemarkForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="disciplinary">Disciplinary</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={remarkForm.severity}
                      onValueChange={(value) => setRemarkForm(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select
                      value={remarkForm.is_visible_to_student.toString()}
                      onValueChange={(value) => setRemarkForm(prev => ({ ...prev, is_visible_to_student: value === 'true' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Visible to Student</SelectItem>
                        <SelectItem value="false">Admin Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={remarkForm.title}
                    onChange={(e) => setRemarkForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter remark title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={remarkForm.content}
                    onChange={(e) => setRemarkForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter detailed remark content"
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={submitRemark} disabled={submitting} className="w-full">
                  {submitting ? 'Adding Remark...' : 'Add Remark'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}