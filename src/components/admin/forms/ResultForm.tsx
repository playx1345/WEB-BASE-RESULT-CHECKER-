import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { validateGrade, calculateGradePoint } from '@/lib/file-utils';
import { supabase } from '@/integrations/supabase/client';

interface Result {
  id?: string;
  student_id?: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  point: number;
  semester: string;
  level: string;
  session: string;
}

interface Student {
  id: string;
  matric_number: string;
  profile?: {
    full_name: string;
  };
}

interface ResultFormProps {
  result?: Result | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (resultData: any) => Promise<void>;
  loading?: boolean;
}

export function ResultForm({ result, open, onOpenChange, onSubmit, loading = false }: ResultFormProps) {
  const [formData, setFormData] = useState({
    student_id: '',
    course_code: '',
    course_title: '',
    credit_unit: '',
    grade: '',
    semester: '',
    level: '',
    session: '',
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  useEffect(() => {
    if (result) {
      setFormData({
        student_id: result.student_id || '',
        course_code: result.course_code || '',
        course_title: result.course_title || '',
        credit_unit: result.credit_unit?.toString() || '',
        grade: result.grade || '',
        semester: result.semester || '',
        level: result.level || '',
        session: result.session || '',
      });
    } else {
      setFormData({
        student_id: '',
        course_code: '',
        course_title: '',
        credit_unit: '',
        grade: '',
        semester: '',
        level: '',
        session: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
      });
    }
    setErrors({});
  }, [result, open]);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          matric_number,
          profile:profiles(full_name)
        `)
        .order('matric_number');

      if (!error && data) {
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id) {
      newErrors.student_id = 'Student is required';
    }

    if (!formData.course_code.trim()) {
      newErrors.course_code = 'Course code is required';
    }

    if (!formData.course_title.trim()) {
      newErrors.course_title = 'Course title is required';
    }

    if (!formData.credit_unit || isNaN(parseInt(formData.credit_unit)) || parseInt(formData.credit_unit) <= 0) {
      newErrors.credit_unit = 'Valid credit unit is required';
    }

    if (!formData.grade || !validateGrade(formData.grade)) {
      newErrors.grade = 'Valid grade (A, B, C, D, F) is required';
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    }

    if (!formData.session.trim()) {
      newErrors.session = 'Session is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const resultData = {
      student_id: formData.student_id,
      course_code: formData.course_code.toUpperCase(),
      course_title: formData.course_title,
      credit_unit: parseInt(formData.credit_unit),
      grade: formData.grade.toUpperCase(),
      point: calculateGradePoint(formData.grade),
      semester: formData.semester,
      level: formData.level,
      session: formData.session,
    };

    await onSubmit(resultData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedStudent = students.find(s => s.id === formData.student_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{result ? 'Edit Result' : 'Add New Result'}</DialogTitle>
          <DialogDescription>
            {result ? 'Update result information' : 'Enter result details to add to the system'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student_id">Student *</Label>
            <Select 
              value={formData.student_id} 
              onValueChange={(value) => handleInputChange('student_id', value)}
              disabled={loading || studentsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.matric_number} - {student.profile?.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.student_id && (
              <p className="text-sm text-destructive">{errors.student_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course_code">Course Code *</Label>
              <Input
                id="course_code"
                value={formData.course_code}
                onChange={(e) => handleInputChange('course_code', e.target.value)}
                placeholder="e.g., CSC 101"
                disabled={loading}
              />
              {errors.course_code && (
                <p className="text-sm text-destructive">{errors.course_code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_unit">Credit Unit *</Label>
              <Input
                id="credit_unit"
                type="number"
                min="1"
                max="6"
                value={formData.credit_unit}
                onChange={(e) => handleInputChange('credit_unit', e.target.value)}
                placeholder="e.g., 3"
                disabled={loading}
              />
              {errors.credit_unit && (
                <p className="text-sm text-destructive">{errors.credit_unit}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_title">Course Title *</Label>
            <Input
              id="course_title"
              value={formData.course_title}
              onChange={(e) => handleInputChange('course_title', e.target.value)}
              placeholder="e.g., Introduction to Computer Science"
              disabled={loading}
            />
            {errors.course_title && (
              <p className="text-sm text-destructive">{errors.course_title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select 
                value={formData.grade} 
                onValueChange={(value) => handleInputChange('grade', value)}
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
              {errors.grade && (
                <p className="text-sm text-destructive">{errors.grade}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select 
                value={formData.semester} 
                onValueChange={(value) => handleInputChange('semester', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Semester</SelectItem>
                  <SelectItem value="second">Second Semester</SelectItem>
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-sm text-destructive">{errors.semester}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => handleInputChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ND1">ND1</SelectItem>
                  <SelectItem value="ND2">ND2</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="session">Academic Session *</Label>
              <Input
                id="session"
                value={formData.session}
                onChange={(e) => handleInputChange('session', e.target.value)}
                placeholder="e.g., 2023/2024"
                disabled={loading}
              />
              {errors.session && (
                <p className="text-sm text-destructive">{errors.session}</p>
              )}
            </div>
          </div>

          {selectedStudent && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Selected Student: <span className="font-medium text-foreground">
                  {selectedStudent.matric_number} - {selectedStudent.profile?.full_name}
                </span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : result ? 'Update Result' : 'Add Result'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}