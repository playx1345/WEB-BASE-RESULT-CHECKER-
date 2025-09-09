import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

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
  student_id: string;
  students: {
    matric_number: string;
    profiles: {
      full_name: string;
    };
  };
}

interface Student {
  id: string;
  matric_number: string;
  profiles: {
    full_name: string;
  };
}

interface NewResult {
  student_id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  point: number;
  semester: string;
  level: string;
  session: string;
}

const GRADE_POINTS: { [key: string]: number } = {
  'A': 4.0,
  'B': 3.0,
  'C': 2.0,
  'D': 1.0,
  'F': 0.0
};

export function AdminResultsView() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newResult, setNewResult] = useState<NewResult>({
    student_id: '',
    course_code: '',
    course_title: '',
    credit_unit: 1,
    grade: 'A',
    point: 4.0,
    semester: 'first',
    level: 'ND1',
    session: '2023/2024'
  });

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          students (
            matric_number,
            profiles (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          matric_number,
          profiles (
            full_name
          )
        `)
        .order('matric_number');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchStudents();
  }, []);

  const handleCreateResult = async () => {
    try {
      const { error } = await supabase
        .from('results')
        .insert(newResult);

      if (error) throw error;

      // Update student's CGPA and total GP
      await updateStudentGPA(newResult.student_id);

      toast.success('Result added successfully');
      setDialogOpen(false);
      setNewResult({
        student_id: '',
        course_code: '',
        course_title: '',
        credit_unit: 1,
        grade: 'A',
        point: 4.0,
        semester: 'first',
        level: 'ND1',
        session: '2023/2024'
      });
      fetchResults();
    } catch (error: any) {
      console.error('Error creating result:', error);
      toast.error(error.message || 'Failed to add result');
    }
  };

  const updateStudentGPA = async (studentId: string) => {
    try {
      // Get all results for this student
      const { data: studentResults } = await supabase
        .from('results')
        .select('point, credit_unit')
        .eq('student_id', studentId);

      if (studentResults && studentResults.length > 0) {
        // Calculate total grade points and total credit units
        const totalGP = studentResults.reduce((sum, result) => 
          sum + (result.point * result.credit_unit), 0);
        const totalCU = studentResults.reduce((sum, result) => 
          sum + result.credit_unit, 0);
        
        const cgp = totalCU > 0 ? totalGP / totalCU : 0;

        // Update student record
        await supabase
          .from('students')
          .update({ 
            cgp: cgp,
            total_gp: totalGP
          })
          .eq('id', studentId);
      }
    } catch (error) {
      console.error('Error updating student GPA:', error);
    }
  };

  const handleDeleteResult = async (resultId: string, studentId: string) => {
    if (!confirm('Are you sure you want to delete this result?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;

      // Update student's CGPA
      await updateStudentGPA(studentId);

      toast.success('Result deleted successfully');
      fetchResults();
    } catch (error: any) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    }
  };

  const handleGradeChange = (grade: string) => {
    setNewResult({
      ...newResult,
      grade,
      point: GRADE_POINTS[grade] || 0
    });
  };

  const filteredResults = results.filter(result =>
    result.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.students?.matric_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.students?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
          <p className="text-muted-foreground">Manage student course results and grades</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Course Result</DialogTitle>
                <DialogDescription>
                  Add a new course result for a student.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student">Student</Label>
                  <Select
                    value={newResult.student_id}
                    onValueChange={(value) => setNewResult({ ...newResult, student_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.matric_number} - {student.profiles?.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="course_code">Course Code</Label>
                    <Input
                      id="course_code"
                      value={newResult.course_code}
                      onChange={(e) => setNewResult({ ...newResult, course_code: e.target.value.toUpperCase() })}
                      placeholder="e.g., CSC101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="credit_unit">Credit Unit</Label>
                    <Input
                      id="credit_unit"
                      type="number"
                      min="1"
                      max="6"
                      value={newResult.credit_unit}
                      onChange={(e) => setNewResult({ ...newResult, credit_unit: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course_title">Course Title</Label>
                  <Input
                    id="course_title"
                    value={newResult.course_title}
                    onChange={(e) => setNewResult({ ...newResult, course_title: e.target.value })}
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Select
                      value={newResult.grade}
                      onValueChange={handleGradeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (4.0)</SelectItem>
                        <SelectItem value="B">B (3.0)</SelectItem>
                        <SelectItem value="C">C (2.0)</SelectItem>
                        <SelectItem value="D">D (1.0)</SelectItem>
                        <SelectItem value="F">F (0.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={newResult.semester}
                      onValueChange={(value) => setNewResult({ ...newResult, semester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">First</SelectItem>
                        <SelectItem value="second">Second</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level">Level</Label>
                    <Select
                      value={newResult.level}
                      onValueChange={(value) => setNewResult({ ...newResult, level: value })}
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session">Academic Session</Label>
                  <Input
                    id="session"
                    value={newResult.session}
                    onChange={(e) => setNewResult({ ...newResult, session: e.target.value })}
                    placeholder="e.g., 2023/2024"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateResult}>Add Result</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Course Results ({filteredResults.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search results..."
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
                <TableHead>Student</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Credit Unit</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Point</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.students?.matric_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.students?.profiles?.full_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{result.course_code}</TableCell>
                  <TableCell>{result.course_title}</TableCell>
                  <TableCell>{result.credit_unit}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      result.grade === 'A' ? 'text-green-600' :
                      result.grade === 'B' ? 'text-blue-600' :
                      result.grade === 'C' ? 'text-yellow-600' :
                      result.grade === 'D' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {result.grade}
                    </span>
                  </TableCell>
                  <TableCell>{result.point.toFixed(1)}</TableCell>
                  <TableCell className="capitalize">{result.semester}</TableCell>
                  <TableCell>{result.level}</TableCell>
                  <TableCell>{result.session}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteResult(result.id, result.student_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No results found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}