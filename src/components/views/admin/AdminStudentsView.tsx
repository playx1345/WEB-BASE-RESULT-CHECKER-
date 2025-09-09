import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  matric_number: string;
  level: string;
  cgp: number;
  total_gp: number;
  carryovers: number;
  fee_status: string;
  profile_id: string;
  profiles: {
    full_name: string;
    phone_number: string;
    user_id: string;
  };
}

interface NewStudent {
  matric_number: string;
  level: string;
  fee_status: string;
  full_name: string;
  phone_number: string;
}

export function AdminStudentsView() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState<NewStudent>({
    matric_number: '',
    level: 'ND1',
    fee_status: 'unpaid',
    full_name: '',
    phone_number: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles (
            full_name,
            phone_number,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async () => {
    try {
      // First create a profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          role: 'student',
          matric_number: newStudent.matric_number,
          phone_number: newStudent.phone_number,
          full_name: newStudent.full_name,
          level: newStudent.level,
          user_id: null // Admin-created students don't have user accounts initially
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Then create the student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          profile_id: profileData.id,
          matric_number: newStudent.matric_number,
          level: newStudent.level,
          fee_status: newStudent.fee_status,
          cgp: 0.00,
          total_gp: 0.00,
          carryovers: 0
        });

      if (studentError) throw studentError;

      toast.success('Student created successfully');
      setDialogOpen(false);
      setNewStudent({
        matric_number: '',
        level: 'ND1',
        fee_status: 'unpaid',
        full_name: '',
        phone_number: ''
      });
      fetchStudents();
    } catch (error: any) {
      console.error('Error creating student:', error);
      toast.error(error.message || 'Failed to create student');
    }
  };

  const handleUpdateFeeStatus = async (studentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ fee_status: newStatus })
        .eq('id', studentId);

      if (error) throw error;

      toast.success(`Fee status updated to ${newStatus}`);
      fetchStudents();
    } catch (error: any) {
      console.error('Error updating fee status:', error);
      toast.error('Failed to update fee status');
    }
  };

  const handleDeleteStudent = async (studentId: string, profileId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete student record first (due to foreign key constraints)
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (studentError) throw studentError;

      // Then delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (profileError) throw profileError;

      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const filteredStudents = students.filter(student =>
    student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">Manage student records and enrollment</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Create a new student record in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  placeholder="Enter student's full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="matric_number">Matric Number</Label>
                <Input
                  id="matric_number"
                  value={newStudent.matric_number}
                  onChange={(e) => setNewStudent({ ...newStudent, matric_number: e.target.value })}
                  placeholder="e.g., ND/2023/CS/001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={newStudent.level}
                  onValueChange={(value) => setNewStudent({ ...newStudent, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ND1">ND1</SelectItem>
                    <SelectItem value="ND2">ND2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={newStudent.phone_number}
                  onChange={(e) => setNewStudent({ ...newStudent, phone_number: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fee_status">Fee Status</Label>
                <Select
                  value={newStudent.fee_status}
                  onValueChange={(value) => setNewStudent({ ...newStudent, fee_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateStudent}>Create Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matric Number</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Carryovers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.matric_number}</TableCell>
                  <TableCell>{student.profiles?.full_name || 'N/A'}</TableCell>
                  <TableCell>{student.level}</TableCell>
                  <TableCell>{student.cgp.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={student.fee_status === 'paid' ? 'default' : 'destructive'}
                      className="cursor-pointer"
                      onClick={() => handleUpdateFeeStatus(
                        student.id, 
                        student.fee_status === 'paid' ? 'unpaid' : 'paid'
                      )}
                    >
                      {student.fee_status === 'paid' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Unpaid
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.carryovers > 0 ? 'destructive' : 'secondary'}>
                      {student.carryovers}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id, student.profile_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}