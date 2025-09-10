import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, DollarSign, User, Phone, Mail, Trash2, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { useCrud } from '@/hooks/useCrud';
import { DataPagination } from '@/components/ui/data-pagination';
import { StudentForm } from '@/components/admin/forms/StudentForm';

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
  const [levelFilter, setLevelFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.level.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    const matchesFeeStatus = feeStatusFilter === 'all' || student.fee_status === feeStatusFilter;
    
    return matchesSearch && matchesLevel && matchesFeeStatus;
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
    totalItems: filteredStudents.length,
    itemsPerPage: 10,
  });

  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const { create, update, remove, loading: crudLoading } = useCrud<Student>({
    table: 'students',
    onSuccess: () => {
      fetchStudents();
      setIsFormOpen(false);
      setSelectedStudent(null);
      setIsEditMode(false);
    },
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    resetPagination();
  }, [searchTerm, levelFilter, feeStatusFilter, resetPagination]);

  const fetchStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(full_name, phone_number, email, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        });
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCreateStudent = async (studentData: any, profileData: any) => {
    try {
      // First create or find the profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', profileData.full_name)
        .single();

      let profileId: string;

      if (existingProfile) {
        profileId = existingProfile.id;
        // Update the existing profile
        await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profileId);
      } else {
        // Create new profile with a placeholder user_id
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            ...profileData,
            user_id: crypto.randomUUID(), // Temporary, should be replaced with actual auth user
            role: 'student'
          })
          .select()
          .single();

        if (profileError) throw profileError;
        profileId = newProfile.id;
      }

      // Create student record
      await create({
        ...studentData,
        profile_id: profileId,
      });
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleUpdateStudent = async (studentData: any, profileData: any) => {
    if (!selectedStudent) return;

    try {
      // Update profile if it exists
      if (selectedStudent.profile) {
        await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', selectedStudent.profile_id);
      }

      // Update student record
      await update(selectedStudent.id, studentData);
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    await remove(studentId);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsEditMode(false);
    setIsFormOpen(true);
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Management</h1>
          <p className="text-muted-foreground">
            Manage student records, fees, and academic information.
          </p>
        </div>
        <Button onClick={handleAddStudent}>
          <Plus className="h-4 w-4 mr-2" />
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by matric number, name, or level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
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

          <div className="rounded-md border">
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
                {paginatedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.matric_number}</TableCell>
                  <TableCell>{student.profile?.full_name || 'N/A'}</TableCell>
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
                    <Badge variant="secondary">{student.carryovers || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
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
                            <AlertDialogTitle>Delete Student</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {student.profile?.full_name}? 
                              This action cannot be undone and will also delete all related results.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteStudent(student.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
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

          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || levelFilter !== 'all' || feeStatusFilter !== 'all' 
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by adding your first student.'}
              </p>
              {!searchTerm && levelFilter === 'all' && feeStatusFilter === 'all' && (
                <Button onClick={handleAddStudent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              )}
            </div>
          )}

          {filteredStudents.length > 0 && (
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

      <StudentForm
        student={selectedStudent}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={isEditMode ? handleUpdateStudent : handleCreateStudent}
        loading={crudLoading}
      />
    </div>
  );
}