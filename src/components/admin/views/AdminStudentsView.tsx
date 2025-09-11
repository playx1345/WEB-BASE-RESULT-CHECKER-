import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useStudentsData, useDebouncedSearch } from '@/hooks/useDataFetching';
import { useErrorHandler } from '@/lib/errorHandling';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { DataTableErrorBoundary } from '@/components/ErrorBoundary';

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
  const { data: students, loading, refetch } = useStudentsData();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { searchTerm, setSearchTerm } = useDebouncedSearch();
  const { handleDatabaseError, showSuccess } = useErrorHandler();

  const updateFeeStatus = async (studentId: string, feeStatus: string) => {
    const result = await handleDatabaseError(
      () => supabase
        .from('students')
        .update({ fee_status: feeStatus })
        .eq('id', studentId),
      {
        errorMessage: 'Failed to update fee status',
        successMessage: 'Fee status updated successfully',
        showSuccess: true
      }
    );

    if (result) {
      refetch();
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student: Student) =>
    student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define table columns
  const columns: ColumnDef<Student>[] = [
    {
      key: 'matric_number',
      header: 'Matric Number',
      className: 'font-medium'
    },
    {
      key: 'full_name',
      header: 'Full Name',
      accessor: (student) => student.profile?.full_name || 'N/A'
    },
    {
      key: 'level',
      header: 'Level'
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      accessor: (student) => student.cgp ? student.cgp.toFixed(2) : 'N/A'
    },
    {
      key: 'fee_status',
      header: 'Fee Status',
      render: (value) => (
        <Badge 
          variant={value === 'paid' ? 'default' : 'destructive'}
          className="capitalize"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'carryovers',
      header: 'Carryovers',
      render: (value) => (
        value > 0 ? (
          <Badge variant="destructive">{value}</Badge>
        ) : (
          <span className="text-muted-foreground">None</span>
        )
      )
    }
  ];

  const emptyState = (
    <div className="text-center py-8">
      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
      <p className="text-muted-foreground">
        {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first student.'}
      </p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Management</h1>
          <p className="text-muted-foreground">
            Manage student records, fees, and academic information.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Students Overview</CardTitle>
          <CardDescription>
            Total Students: {students.length} | 
            Paid Fees: {students.filter((s: Student) => s.fee_status === 'paid').length} | 
            Unpaid Fees: {students.filter((s: Student) => s.fee_status === 'unpaid').length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by matric number, name, or level..."
          />

          <DataTableErrorBoundary>
            <DataTable
              data={filteredStudents}
              columns={columns}
              loading={loading}
              emptyState={emptyState}
              actions={(student) => (
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
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {student.profile?.full_name || 'N/A'}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="matric" className="text-right">Matric No.</Label>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {student.matric_number}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="level" className="text-right">Level</Label>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {student.level}
                        </div>
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
              )}
            />
          </DataTableErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}