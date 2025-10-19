import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminResultsUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResultUploaded: () => void;
  studentId?: string;
  matricNumber?: string;
}

const GRADE_POINTS: { [key: string]: number } = {
  'A': 5.0,
  'B': 4.0,
  'C': 3.0,
  'D': 2.0,
  'E': 1.0,
  'F': 0.0
};

export function AdminResultsUploadDialog({ 
  open, 
  onOpenChange, 
  onResultUploaded,
  studentId,
  matricNumber 
}: AdminResultsUploadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: studentId || '',
    course_code: '',
    course_title: '',
    credit_unit: '',
    grade: '',
    semester: '',
    session: '',
    level: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.student_id) newErrors.student_id = 'Student is required';
    if (!formData.course_code.trim()) newErrors.course_code = 'Course code is required';
    if (!formData.course_title.trim()) newErrors.course_title = 'Course title is required';
    if (!formData.credit_unit || parseInt(formData.credit_unit) < 1) {
      newErrors.credit_unit = 'Credit unit must be at least 1';
    }
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.session.trim()) newErrors.session = 'Session is required';
    if (!formData.level) newErrors.level = 'Level is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);

    try {
      const point = GRADE_POINTS[formData.grade] || 0;

      const { error } = await supabase
        .from('results')
        .insert({
          student_id: formData.student_id,
          course_code: formData.course_code.toUpperCase(),
          course_title: formData.course_title,
          credit_unit: parseInt(formData.credit_unit),
          grade: formData.grade,
          point: point,
          semester: formData.semester,
          session: formData.session,
          level: formData.level
        });

      if (error) throw error;

      toast.success('Result uploaded successfully');
      handleClose();
      onResultUploaded();
    } catch (error: any) {
      console.error('Error uploading result:', error);
      toast.error(error.message || 'Failed to upload result');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      student_id: studentId || '',
      course_code: '',
      course_title: '',
      credit_unit: '',
      grade: '',
      semester: '',
      session: '',
      level: ''
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Student Result</DialogTitle>
          <DialogDescription>
            {matricNumber ? `Uploading result for ${matricNumber}` : 'Enter course and grade details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course_code">Course Code *</Label>
              <Input
                id="course_code"
                placeholder="e.g., CSC 201"
                value={formData.course_code}
                onChange={(e) => handleInputChange('course_code', e.target.value.toUpperCase())}
                className={errors.course_code ? 'border-destructive' : ''}
              />
              {errors.course_code && (
                <p className="text-sm text-destructive">{errors.course_code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_unit">Credit Units *</Label>
              <Input
                id="credit_unit"
                type="number"
                min="1"
                max="6"
                placeholder="e.g., 3"
                value={formData.credit_unit}
                onChange={(e) => handleInputChange('credit_unit', e.target.value)}
                className={errors.credit_unit ? 'border-destructive' : ''}
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
              placeholder="e.g., Data Structures and Algorithms"
              value={formData.course_title}
              onChange={(e) => handleInputChange('course_title', e.target.value)}
              className={errors.course_title ? 'border-destructive' : ''}
            />
            {errors.course_title && (
              <p className="text-sm text-destructive">{errors.course_title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                <SelectTrigger className={errors.grade ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (5.0)</SelectItem>
                  <SelectItem value="B">B (4.0)</SelectItem>
                  <SelectItem value="C">C (3.0)</SelectItem>
                  <SelectItem value="D">D (2.0)</SelectItem>
                  <SelectItem value="E">E (1.0)</SelectItem>
                  <SelectItem value="F">F (0.0)</SelectItem>
                </SelectContent>
              </Select>
              {errors.grade && (
                <p className="text-sm text-destructive">{errors.grade}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                <SelectTrigger className={errors.level ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ND1">ND1</SelectItem>
                  <SelectItem value="ND2">ND2</SelectItem>
                  <SelectItem value="HND1">HND1</SelectItem>
                  <SelectItem value="HND2">HND2</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                <SelectTrigger className={errors.semester ? 'border-destructive' : ''}>
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

            <div className="space-y-2">
              <Label htmlFor="session">Session *</Label>
              <Input
                id="session"
                placeholder="e.g., 2024/2025"
                value={formData.session}
                onChange={(e) => handleInputChange('session', e.target.value)}
                className={errors.session ? 'border-destructive' : ''}
              />
              {errors.session && (
                <p className="text-sm text-destructive">{errors.session}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Uploading...' : 'Upload Result'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
