import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, DollarSign, User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
  };

  const updateFeeStatus = async (studentId: string, feeStatus: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ fee_status: feeStatus })
        .eq('id', studentId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update fee status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Fee status updated successfully",
      });

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
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
                    {student.carryovers > 0 ? (
                      <Badge variant="destructive">{student.carryovers}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                    </div>
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
    </div>
  );
}