import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Download, Users, FileText } from 'lucide-react';

interface CsvRow {
  matric_number: string;
  course_code: string;
  course_title: string;
  credit_units: string;
  grade: string;
  grade_points: string;
  session: string;
  semester: string;
  level: string;
}

interface ValidationResult {
  row: CsvRow;
  rowIndex: number;
  status: 'valid' | 'warning' | 'error';
  errors: string[];
  warnings: string[];
  studentId?: string;
  studentName?: string;
  isDuplicate?: boolean;
}

interface AdminBulkResultsPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvData: CsvRow[];
  onUploadComplete: () => void;
}

const VALID_GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];
const VALID_SEMESTERS = ['first', 'second'];
const VALID_LEVELS = ['ND1', 'ND2', 'HND1', 'HND2'];

export function AdminBulkResultsPreviewDialog({
  open,
  onOpenChange,
  csvData,
  onUploadComplete
}: AdminBulkResultsPreviewDialogProps) {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open && csvData.length > 0) {
      validateData();
    }
  }, [open, csvData]);

  const validateData = async () => {
    setLoading(true);
    const results: ValidationResult[] = [];

    try {
      // Get all unique matric numbers
      const matricNumbers = [...new Set(csvData.map(row => row.matric_number))];
      
      // Fetch student data
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, matric_number, profile:profiles(full_name)')
        .in('matric_number', matricNumbers);

      if (studentsError) throw studentsError;

      const studentMap = new Map(
        students?.map(s => [s.matric_number, { id: s.id, name: s.profile?.full_name || 'Unknown' }]) || []
      );

      // Check for existing results to detect duplicates
      const { data: existingResults } = await supabase
        .from('results')
        .select('student_id, course_code, session, semester')
        .in('student_id', students?.map(s => s.id) || []);

      const existingResultsSet = new Set(
        existingResults?.map(r => `${r.student_id}-${r.course_code}-${r.session}-${r.semester}`) || []
      );

      // Validate each row
      csvData.forEach((row, index) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Required field validation
        if (!row.matric_number?.trim()) errors.push('Matric number is required');
        if (!row.course_code?.trim()) errors.push('Course code is required');
        if (!row.course_title?.trim()) errors.push('Course title is required');
        if (!row.session?.trim()) errors.push('Session is required');
        
        // Credit units validation
        const creditUnits = parseInt(row.credit_units);
        if (!row.credit_units || isNaN(creditUnits)) {
          errors.push('Credit units must be a number');
        } else if (creditUnits < 1 || creditUnits > 6) {
          warnings.push('Credit units typically range from 1-6');
        }
        
        // Grade validation
        if (!row.grade?.trim()) {
          errors.push('Grade is required');
        } else if (!VALID_GRADES.includes(row.grade.toUpperCase())) {
          errors.push(`Grade must be one of: ${VALID_GRADES.join(', ')}`);
        }
        
        // Grade points validation
        const gradePoints = parseFloat(row.grade_points);
        if (!row.grade_points || isNaN(gradePoints)) {
          errors.push('Grade points must be a number');
        } else if (gradePoints < 0 || gradePoints > 5) {
          errors.push('Grade points must be between 0 and 5');
        }
        
        // Semester validation
        if (!row.semester?.trim()) {
          errors.push('Semester is required');
        } else if (!VALID_SEMESTERS.includes(row.semester.toLowerCase())) {
          errors.push(`Semester must be 'first' or 'second'`);
        }
        
        // Level validation
        if (!row.level?.trim()) {
          errors.push('Level is required');
        } else if (!VALID_LEVELS.includes(row.level.toUpperCase())) {
          errors.push(`Level must be one of: ${VALID_LEVELS.join(', ')}`);
        }
        
        // Session validation (format: YYYY/YYYY)
        const sessionPattern = /^\d{4}\/\d{4}$/;
        if (row.session && !sessionPattern.test(row.session)) {
          errors.push('Session must be in format YYYY/YYYY (e.g., 2024/2025)');
        }
        
        // Student existence check
        const studentInfo = studentMap.get(row.matric_number);
        if (!studentInfo) {
          errors.push('Student with this matric number does not exist');
        }
        
        // Duplicate check
        const duplicateKey = studentInfo 
          ? `${studentInfo.id}-${row.course_code}-${row.session}-${row.semester}`
          : '';
        const isDuplicate = existingResultsSet.has(duplicateKey);
        if (isDuplicate) {
          warnings.push('A result for this course already exists (will be skipped)');
        }
        
        const status = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';
        
        results.push({
          row,
          rowIndex: index,
          status,
          errors,
          warnings,
          studentId: studentInfo?.id,
          studentName: studentInfo?.name,
          isDuplicate
        });

        // Auto-select valid rows
        if (status === 'valid' || status === 'warning') {
          setSelectedRows(prev => new Set([...prev, index]));
        }
      });

      setValidationResults(results);
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate CSV data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    const rowsToUpload = validationResults.filter(
      (result) => selectedRows.has(result.rowIndex) && result.studentId && !result.isDuplicate
    );

    if (rowsToUpload.length === 0) {
      toast.error('No valid rows selected for upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const resultsToInsert = rowsToUpload.map(result => ({
        student_id: result.studentId!,
        course_code: result.row.course_code.toUpperCase(),
        course_title: result.row.course_title,
        credit_unit: parseInt(result.row.credit_units),
        grade: result.row.grade.toUpperCase(),
        point: parseFloat(result.row.grade_points),
        session: result.row.session,
        semester: result.row.semester.toLowerCase(),
        level: result.row.level.toUpperCase()
      }));

      // Upload in batches
      const batchSize = 100;
      for (let i = 0; i < resultsToInsert.length; i += batchSize) {
        const batch = resultsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('results').insert(batch);
        
        if (error) throw error;
        
        setUploadProgress(Math.round(((i + batch.length) / resultsToInsert.length) * 100));
      }

      toast.success(`Successfully uploaded ${resultsToInsert.length} results`);
      onUploadComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload results');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadErrorLog = () => {
    const errorRows = validationResults.filter(r => r.status === 'error');
    const csv = [
      ['Row', 'Matric Number', 'Course Code', 'Errors'],
      ...errorRows.map(r => [
        r.rowIndex + 2,
        r.row.matric_number,
        r.row.course_code,
        r.errors.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation_errors.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleRow = (index: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === validationResults.filter(r => r.status !== 'error').length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(
        validationResults
          .filter(r => r.status !== 'error')
          .map(r => r.rowIndex)
      ));
    }
  };

  const stats = {
    total: validationResults.length,
    valid: validationResults.filter(r => r.status === 'valid').length,
    warnings: validationResults.filter(r => r.status === 'warning').length,
    errors: validationResults.filter(r => r.status === 'error').length,
    duplicates: validationResults.filter(r => r.isDuplicate).length,
    selected: selectedRows.size
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Valid</Badge>;
      case 'warning': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review CSV Data Before Upload</DialogTitle>
          <DialogDescription>
            Validate and preview your data. Select which rows to upload.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Total Rows
                </div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Valid
                </div>
                <div className="text-2xl font-bold text-green-700">{stats.valid}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-700 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings
                </div>
                <div className="text-2xl font-bold text-yellow-700">{stats.warnings}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-700 mb-1">
                  <XCircle className="h-4 w-4" />
                  Errors
                </div>
                <div className="text-2xl font-bold text-red-700">{stats.errors}</div>
              </div>
            </div>

            {/* Alerts */}
            {stats.errors > 0 && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{stats.errors} row(s) have errors and cannot be uploaded. Fix errors in your CSV and try again.</span>
                  <Button variant="outline" size="sm" onClick={downloadErrorLog}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Log
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {stats.duplicates > 0 && (
              <Alert>
                <AlertDescription>
                  {stats.duplicates} row(s) are duplicates of existing results and will be skipped.
                </AlertDescription>
              </Alert>
            )}

            {/* Preview Table */}
            <ScrollArea className="h-[400px] border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.size > 0 && selectedRows.size === validationResults.filter(r => r.status !== 'error').length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="w-16">Row</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead>Matric No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.map((result) => (
                    <TableRow 
                      key={result.rowIndex}
                      className={
                        result.status === 'error' ? 'bg-red-50' :
                        result.status === 'warning' ? 'bg-yellow-50' :
                        'bg-green-50'
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(result.rowIndex)}
                          onCheckedChange={() => toggleRow(result.rowIndex)}
                          disabled={result.status === 'error' || result.isDuplicate}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{result.rowIndex + 2}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{result.row.matric_number}</TableCell>
                      <TableCell>{result.studentName || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{result.row.course_code}</div>
                          <div className="text-muted-foreground truncate max-w-[200px]">{result.row.course_title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.row.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{result.row.session}</TableCell>
                      <TableCell>
                        {result.errors.length > 0 && (
                          <ul className="text-xs text-destructive space-y-1">
                            {result.errors.map((error, i) => (
                              <li key={i}>• {error}</li>
                            ))}
                          </ul>
                        )}
                        {result.warnings.length > 0 && (
                          <ul className="text-xs text-yellow-700 space-y-1">
                            {result.warnings.map((warning, i) => (
                              <li key={i}>• {warning}</li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading results...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {stats.selected} of {stats.total} rows selected for upload
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={loading || uploading || stats.selected === 0}
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading ? 'Uploading...' : `Upload ${stats.selected} Results`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
