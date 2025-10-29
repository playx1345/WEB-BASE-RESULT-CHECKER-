import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Edit, User, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import { AdminCreateStudentDialog } from './AdminCreateStudentDialog';
import { AdminBulkCreateStudentsDialog } from './AdminBulkCreateStudentsDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Student {
  id: string;
  matric_number: string;
  level: string;
  fee_status: string;
  cgp: number;
  total_gp: number;
  carryovers: number;
  profile: {
    full_name: string;
    phone_number: string;
    user_id: string;
  };
}

export function AdminStudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [levelFilter, setLevelFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(full_name, phone_number, user_id)
        `);

      if (error) {
        toast.error("Failed to fetch students");
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFeeStatus = async (studentId: string, feeStatus: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ fee_status: feeStatus })
        .eq('id', studentId);

      if (error) {
        toast.error("Failed to update fee status");
        return;
      }

      toast.success("Fee status updated successfully");

      fetchStudents();
    } catch (error) {
      console.error('Error updating fee status:', error);
    }
  };

  const deleteStudent = async (studentId: string, studentName: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) {
        toast.error("Failed to delete student");
        return;
      }

      toast.success(`${studentName} has been removed from the system`);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error("An error occurred while deleting the student");
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.level.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    const matchesFeeStatus = feeStatusFilter === 'all' || student.fee_status === feeStatusFilter;
    
    return matchesSearch && matchesLevel && matchesFeeStatus;
  });

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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Management</h1>
          <p className="text-muted-foreground">
            Manage student records, fees, and academic information.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkCreateDialogOpen(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Bulk Create
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Students Overview</CardTitle>
          <CardDescription>
            Total Students: {students.length} | 
            Paid Fees: {students.filter(s => s.fee_status === 'paid').length} | 
            Unpaid Fees: {students.filter(s => s.fee_status === 'unpaid').length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by matric number, name, or level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="ND1">ND1</SelectItem>
                  <SelectItem value="ND2">ND2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Fee Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead>Carryovers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.matric_number}</TableCell>
                    <TableCell>{student.profile?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.level}</Badge>
                    </TableCell>
                    <TableCell>{student.cgp ? student.cgp.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.fee_status === 'paid' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        {student.fee_status === 'paid' ? (
                          <><UserCheck className="h-3 w-3 mr-1" />Paid</>
                        ) : (
                          <><UserX className="h-3 w-3 mr-1" />Unpaid</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.carryovers > 0 ? (
                        <Badge variant="destructive">{student.carryovers}</Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Student: {student.matric_number}</DialogTitle>
                              <DialogDescription>
                                Update student information and fee status.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input 
                                  id="name" 
                                  value={student.profile?.full_name || ''} 
                                  className="col-span-3" 
                                  disabled
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="matric" className="text-right">Matric No.</Label>
                                <Input 
                                  id="matric" 
                                  value={student.matric_number} 
                                  className="col-span-3" 
                                  disabled
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="level" className="text-right">Level</Label>
                                <Input 
                                  id="level" 
                                  value={student.level} 
                                  className="col-span-3" 
                                  disabled
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="feeStatus" className="text-right">Fee Status</Label>
                                <Select 
                                  defaultValue={student.fee_status}
                                  onValueChange={(value) => updateFeeStatus(student.id, value)}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the student
                                <strong> {student.profile?.full_name || student.matric_number}</strong> and 
                                remove all their data from the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteStudent(student.id, student.profile?.full_name || student.matric_number)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Student
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first student.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Student Dialog */}
      <AdminCreateStudentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onStudentCreated={fetchStudents}
      />

      {/* Bulk Create Students Dialog */}
      <AdminBulkCreateStudentsDialog
        open={isBulkCreateDialogOpen}
        onOpenChange={setIsBulkCreateDialogOpen}
        onStudentsCreated={fetchStudents}
      />
    </div>
  );
}