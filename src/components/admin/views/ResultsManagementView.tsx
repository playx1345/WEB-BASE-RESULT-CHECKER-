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
import { Plus, Edit, Trash2, FileText, Search, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Result {
  id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  point: number;
  semester: string;
  session: string;
  level: string;
  created_at: string;
  student: {
    id: string;
    matric_number: string;
    profile: {
      full_name: string | null;
    };
  };
}

interface Student {
  id: string;
  matric_number: string;
  profile: {
    full_name: string | null;
  };
}

interface Course {
  id: string;
  code: string;
  title: string;
  credit_unit: number;
}

export function ResultsManagementView() {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    course_code: '',
    course_title: '',
    credit_unit: '',
    grade: '',
    semester: '',
    session: '',
    level: ''
  });
  const { toast } = useToast();

  const gradePoints = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch results with student info
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select(`
          *,
          student:students!results_student_id_fkey (
            id,
            matric_number,
            profile:profiles!students_profile_id_fkey (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;

      // Fetch students for dropdown
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          matric_number,
          profile:profiles!students_profile_id_fkey (
            full_name
          )
        `)
        .order('matric_number');

      if (studentsError) throw studentsError;

      // Fetch courses for dropdown
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('code');

      if (coursesError) throw coursesError;

      setResults(resultsData || []);
      setStudents(studentsData || []);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.course_code || !formData.grade || !formData.semester || !formData.session || !formData.level) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedCourse = courses.find(c => c.code === formData.course_code);
      if (!selectedCourse) {
        throw new Error('Selected course not found');
      }

      const point = gradePoints[formData.grade as keyof typeof gradePoints];

      const resultData = {
        student_id: formData.student_id,
        course_code: formData.course_code,
        course_title: selectedCourse.title,
        credit_unit: selectedCourse.credit_unit,
        grade: formData.grade,
        point: point,
        semester: formData.semester,
        session: formData.session,
        level: formData.level
      };

      let error;
      
      if (editingResult) {
        ({ error } = await supabase
          .from('results')
          .update(resultData)
          .eq('id', editingResult.id));
      } else {
        // Check for duplicate result
        const { data: existingResult } = await supabase
          .from('results')
          .select('id')
          .eq('student_id', formData.student_id)
          .eq('course_code', formData.course_code)
          .eq('session', formData.session)
          .eq('semester', formData.semester)
          .single();

        if (existingResult) {
          throw new Error('Result already exists for this student, course, and session/semester combination');
        }

        ({ error } = await supabase
          .from('results')
          .insert([resultData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Result ${editingResult ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      setEditingResult(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving result:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save result. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (result: Result) => {
    setEditingResult(result);
    setFormData({
      student_id: result.student.id,
      course_code: result.course_code,
      course_title: result.course_title,
      credit_unit: result.credit_unit.toString(),
      grade: result.grade,
      semester: result.semester,
      session: result.session,
      level: result.level
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (result: Result) => {
    if (!confirm(`Are you sure you want to delete the result for ${result.course_code} - ${result.student.matric_number}?`)) return;

    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', result.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Result deleted successfully.",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete result. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      course_code: '',
      course_title: '',
      credit_unit: '',
      grade: '',
      semester: '',
      session: '',
      level: ''
    });
  };

  const handleCourseChange = (courseCode: string) => {
    const selectedCourse = courses.find(c => c.code === courseCode);
    if (selectedCourse) {
      setFormData({
        ...formData,
        course_code: courseCode,
        course_title: selectedCourse.title,
        credit_unit: selectedCourse.credit_unit.toString()
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.student.profile.full_name && result.student.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSession = sessionFilter === 'all' || result.session === sessionFilter;
    const matchesSemester = semesterFilter === 'all' || result.semester === semesterFilter;
    const matchesLevel = levelFilter === 'all' || result.level === levelFilter;
    
    return matchesSearch && matchesSession && matchesSemester && matchesLevel;
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
          <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
          <p className="text-muted-foreground">
            Enter, edit, and manage student academic results.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingResult(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingResult ? 'Edit Result' : 'Add New Result'}
              </DialogTitle>
              <DialogDescription>
                {editingResult ? 'Update student result information.' : 'Enter a new result for a student.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student *</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.matric_number} - {student.profile.full_name || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_code">Course *</Label>
                <Select value={formData.course_code} onValueChange={handleCourseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.code}>
                        {course.code} - {course.title} ({course.credit_unit} units)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session">Session *</Label>
                  <Input
                    id="session"
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    placeholder="e.g., 2023/2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Semester</SelectItem>
                      <SelectItem value="second">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="grade">Grade *</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A (4.0 points)</SelectItem>
                    <SelectItem value="B">B (3.0 points)</SelectItem>
                    <SelectItem value="C">C (2.0 points)</SelectItem>
                    <SelectItem value="D">D (1.0 point)</SelectItem>
                    <SelectItem value="F">F (0.0 points)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingResult ? 'Update' : 'Create'} Result
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Results ({filteredResults.length})
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sessionFilter} onValueChange={setSessionFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {Array.from(new Set(results.map(r => r.session))).map(session => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="first">First</SelectItem>
                  <SelectItem value="second">Second</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ND1">ND1</SelectItem>
                  <SelectItem value="ND2">ND2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No results match your search criteria.' : 'No results have been entered yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => { setEditingResult(null); resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Result
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Credit Units</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead className="text-center">Session</TableHead>
                  <TableHead className="text-center">Semester</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{result.student.matric_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.student.profile.full_name || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{result.course_code}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.course_title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{result.credit_unit}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getGradeColor(result.grade)}>
                        {result.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{result.point.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{result.session}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{result.semester}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(result)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(result)}
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