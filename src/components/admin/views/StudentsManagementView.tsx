import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  matric_number: string;
  level: string;
  cgp: number | null;
  total_gp: number | null;
  carryovers: number | null;
  fee_status: string;
  created_at: string;
  profile: {
    full_name: string | null;
    phone_number: string | null;
  };
}

export function StudentsManagementView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    matric_number: '',
    full_name: '',
    phone_number: '',
    level: '',
    fee_status: 'unpaid',
    cgp: '',
    carryovers: '0'
  });
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
          profile:profiles!students_profile_id_fkey (
            full_name,
            phone_number
          )
        `)
        .order('matric_number');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matric_number || !formData.full_name || !formData.level) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingStudent) {
        // Update existing student
        const { error: studentError } = await supabase
          .from('students')
          .update({
            matric_number: formData.matric_number.toUpperCase(),
            level: formData.level,
            fee_status: formData.fee_status,
            cgp: formData.cgp ? parseFloat(formData.cgp) : null,
            carryovers: parseInt(formData.carryovers) || 0
          })
          .eq('id', editingStudent.id);

        if (studentError) throw studentError;

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone_number || null,
            matric_number: formData.matric_number.toUpperCase(),
            level: formData.level
          })
          .eq('id', editingStudent.profile_id);

        if (profileError) throw profileError;

        toast({
          title: "Success",
          description: "Student updated successfully.",
        });
      } else {
        // Create new student - this is complex as it requires creating a user first
        // For now, we'll show a message that this should be done through registration
        toast({
          title: "Information",
          description: "New students should register through the signup process. Use this form to update existing students only.",
          variant: "default",
        });
        return;
      }

      setIsDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      matric_number: student.matric_number,
      full_name: student.profile.full_name || '',
      phone_number: student.profile.phone_number || '',
      level: student.level,
      fee_status: student.fee_status,
      cgp: student.cgp?.toString() || '',
      carryovers: student.carryovers?.toString() || '0'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete student ${student.matric_number}? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });

      fetchStudents();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      matric_number: '',
      full_name: '',
      phone_number: '',
      level: '',
      fee_status: 'unpaid',
      cgp: '',
      carryovers: '0'
    });
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.profile.full_name && student.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    const matchesFeeStatus = feeStatusFilter === 'all' || student.fee_status === feeStatusFilter;
    
    return matchesSearch && matchesLevel && matchesFeeStatus;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Manage student records, enrollment, and fee status.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingStudent(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </DialogTitle>
              <DialogDescription>
                {editingStudent 
                  ? 'Update student information and academic records.' 
                  : 'Note: New students should register through the signup process. This form is for updating existing students.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matric_number">Matric Number *</Label>
                  <Input
                    id="matric_number"
                    value={formData.matric_number}
                    onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                    placeholder="e.g., ND/20/CSC/001"
                    required
                    disabled={!editingStudent} // Only allow editing for existing students
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ND1">ND1</SelectItem>
                      <SelectItem value="ND2">ND2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Student's full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="e.g., +234 123 456 7890"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee_status">Fee Status</Label>
                  <Select value={formData.fee_status} onValueChange={(value) => setFormData({ ...formData, fee_status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgp">CGPA</Label>
                  <Input
                    id="cgp"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={formData.cgp}
                    onChange={(e) => setFormData({ ...formData, cgp: e.target.value })}
                    placeholder="e.g., 3.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carryovers">Carryovers</Label>
                  <Input
                    id="carryovers"
                    type="number"
                    min="0"
                    value={formData.carryovers}
                    onChange={(e) => setFormData({ ...formData, carryovers: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Create'} Student
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({filteredStudents.length})
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Fee Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No students match your search criteria.' : 'No students have been registered yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead className="text-center">Level</TableHead>
                  <TableHead className="text-center">CGPA</TableHead>
                  <TableHead className="text-center">Fee Status</TableHead>
                  <TableHead className="text-center">Carryovers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.matric_number}</TableCell>
                    <TableCell>{student.profile.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{student.level}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {student.cgp ? student.cgp.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={student.fee_status === 'paid' ? 'default' : 'destructive'}
                        className={student.fee_status === 'paid' ? 'bg-green-500' : ''}
                      >
                        {student.fee_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{student.carryovers || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}