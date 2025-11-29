import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, Edit, Trash2, Key, Eye, User, DollarSign, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AdminCreateStudentDialog } from './AdminCreateStudentDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Student {
  id: string;
  matric_number: string;
  email: string;
  level: string;
  fee_status: string;
  cgp: number;
  total_gp: number;
  carryovers: number;
  full_name: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile: {
    id: string;
    full_name: string;
    phone_number: string;
    user_id: string;
  } | null;
}

export function AdminStudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResetPinDialogOpen, setIsResetPinDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    level: '',
    phoneNumber: '',
    feeStatus: ''
  });
  const [newPin, setNewPin] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(id, full_name, phone_number, user_id)
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

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      fullName: student.profile?.full_name || student.full_name || '',
      level: student.level,
      phoneNumber: student.profile?.phone_number || '',
      feeStatus: student.fee_status || 'unpaid'
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const openResetPinDialog = (student: Student) => {
    setSelectedStudent(student);
    setNewPin('');
    setIsResetPinDialogOpen(true);
  };

  const updateStudent = async () => {
    if (!selectedStudent) return;
    
    setActionLoading(true);
    try {
      // Update student record
      const { error: studentError } = await supabase
        .from('students')
        .update({ 
          level: editForm.level,
          fee_status: editForm.feeStatus,
          full_name: editForm.fullName
        })
        .eq('id', selectedStudent.id);

      if (studentError) {
        toast.error("Failed to update student: " + studentError.message);
        return;
      }

      // Update profile if it exists
      if (selectedStudent.profile?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: editForm.fullName,
            phone_number: editForm.phoneNumber || null,
            level: editForm.level
          })
          .eq('id', selectedStudent.profile.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

      toast.success("Student updated successfully");
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteStudent = async (student: Student) => {
    setActionLoading(true);
    try {
      // First delete related results
      const { error: resultsError } = await supabase
        .from('results')
        .delete()
        .eq('student_id', student.id);

      if (resultsError) {
        console.error('Error deleting results:', resultsError);
      }

      // Delete the student record
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (studentError) {
        toast.error("Failed to delete student: " + studentError.message);
        return;
      }

      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const resetStudentPin = async () => {
    if (!selectedStudent || !newPin) return;
    
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      toast.error("PIN must be exactly 6 digits");
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_reset_student_pin', {
        student_id: selectedStudent.id,
        new_pin: newPin
      });

      if (error) {
        toast.error("Failed to reset PIN: " + error.message);
        return;
      }

      if (data) {
        toast.success("Student PIN reset successfully");
        setIsResetPinDialogOpen(false);
        setSelectedStudent(null);
        setNewPin('');
      } else {
        toast.error("Failed to reset PIN");
      }
    } catch (error) {
      console.error('Error resetting PIN:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(false);
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

  const filteredStudents = students.filter(student =>
    student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
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
          <div className="flex items-center gap-4 mb-6">
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
                  <TableCell>{student.profile?.full_name || student.full_name || 'N/A'}</TableCell>
                  <TableCell>{student.level}</TableCell>
                  <TableCell>{student.cgp ? student.cgp.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={student.fee_status === 'paid' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {student.fee_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.carryovers > 0 ? (
                      <Badge variant="destructive">{student.carryovers}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewDialog(student)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(student)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetPinDialog(student)}>
                          <Key className="mr-2 h-4 w-4" />
                          Reset PIN
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => updateFeeStatus(student.id, student.fee_status === 'paid' ? 'unpaid' : 'paid')}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Toggle Fee Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Student
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the student "{student.profile?.full_name || student.full_name || student.matric_number}" 
                                and all their associated results. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteStudent(student)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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

      {/* View Student Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedStudent?.profile?.full_name || selectedStudent?.full_name || selectedStudent?.matric_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Basic Info</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Full Name</Label>
                      <p className="font-medium">{selectedStudent.profile?.full_name || selectedStudent.full_name || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Matric Number</Label>
                      <p className="font-medium">{selectedStudent.matric_number}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Email</Label>
                      <p className="font-medium">{selectedStudent.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Phone Number</Label>
                      <p className="font-medium">{selectedStudent.profile?.phone_number || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Level</Label>
                      <p className="font-medium">{selectedStudent.level}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Fee Status</Label>
                      <Badge variant={selectedStudent.fee_status === 'paid' ? 'default' : 'destructive'}>
                        {selectedStudent.fee_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Created At</Label>
                    <p className="font-medium">
                      {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">CGPA</Label>
                      <p className="font-medium text-lg">{selectedStudent.cgp ? selectedStudent.cgp.toFixed(2) : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Total GP</Label>
                      <p className="font-medium text-lg">{selectedStudent.total_gp ? selectedStudent.total_gp.toFixed(2) : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Carryovers</Label>
                      <p className="font-medium">
                        {selectedStudent.carryovers > 0 ? (
                          <Badge variant="destructive">{selectedStudent.carryovers}</Badge>
                        ) : (
                          <span className="text-green-600">None</span>
                        )}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedStudent) openEditDialog(selectedStudent);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Student
            </DialogTitle>
            <DialogDescription>
              Update information for {selectedStudent?.matric_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-level">Level</Label>
              <Select value={editForm.level} onValueChange={(value) => setEditForm({ ...editForm, level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                  <SelectItem value="ND1">ND1</SelectItem>
                  <SelectItem value="ND2">ND2</SelectItem>
                  <SelectItem value="HND1">HND1</SelectItem>
                  <SelectItem value="HND2">HND2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-fee">Fee Status</Label>
              <Select value={editForm.feeStatus} onValueChange={(value) => setEditForm({ ...editForm, feeStatus: value })}>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateStudent} disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Dialog */}
      <Dialog open={isResetPinDialogOpen} onOpenChange={setIsResetPinDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset Student PIN
            </DialogTitle>
            <DialogDescription>
              Set a new 6-digit PIN for {selectedStudent?.profile?.full_name || selectedStudent?.full_name || selectedStudent?.matric_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-pin">New PIN</Label>
              <Input
                id="new-pin"
                type="text"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit PIN"
              />
              <p className="text-xs text-muted-foreground">
                The student will use this PIN to log in to their account.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPinDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={resetStudentPin} disabled={actionLoading || newPin.length !== 6}>
              {actionLoading ? 'Resetting...' : 'Reset PIN'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}