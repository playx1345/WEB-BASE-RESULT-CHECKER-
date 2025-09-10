import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Download, AlertCircle } from 'lucide-react';
import { readFileAsText, parseCSV, validateGrade, calculateGradePoint } from '@/lib/file-utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
}

interface BulkResultUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkResultUpload({ open, onOpenChange, onSuccess }: BulkResultUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      ['matric_number', 'course_code', 'course_title', 'credit_unit', 'grade', 'semester', 'level', 'session'],
      ['ND22/CS/001', 'CSC 101', 'Introduction to Computer Science', '3', 'A', 'first', 'ND1', '2023/2024'],
      ['ND22/CS/002', 'MTH 101', 'General Mathematics I', '3', 'B', 'first', 'ND1', '2023/2024'],
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    try {
      const content = await readFileAsText(selectedFile);
      const parsedData = parseCSV(content);
      
      if (parsedData.length > 0) {
        setPreview(parsedData.slice(0, 5)); // Show first 5 rows
      }
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Could not parse the CSV file",
        variant: "destructive",
      });
    }
  };

  const validateResultData = (data: any[]) => {
    const errors: string[] = [];
    const validatedData: any[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because first row is header and arrays are 0-indexed
      
      if (!row.matric_number?.trim()) {
        errors.push(`Row ${rowNumber}: Matric number is required`);
        return;
      }
      
      if (!row.course_code?.trim()) {
        errors.push(`Row ${rowNumber}: Course code is required`);
        return;
      }
      
      if (!row.course_title?.trim()) {
        errors.push(`Row ${rowNumber}: Course title is required`);
        return;
      }
      
      const creditUnit = parseInt(row.credit_unit);
      if (isNaN(creditUnit) || creditUnit <= 0) {
        errors.push(`Row ${rowNumber}: Valid credit unit is required`);
        return;
      }
      
      if (!row.grade?.trim() || !validateGrade(row.grade)) {
        errors.push(`Row ${rowNumber}: Valid grade (A, B, C, D, F) is required`);
        return;
      }
      
      if (!['first', 'second'].includes(row.semester)) {
        errors.push(`Row ${rowNumber}: Semester must be 'first' or 'second'`);
        return;
      }
      
      if (!['ND1', 'ND2'].includes(row.level)) {
        errors.push(`Row ${rowNumber}: Level must be 'ND1' or 'ND2'`);
        return;
      }
      
      if (!row.session?.trim()) {
        errors.push(`Row ${rowNumber}: Session is required`);
        return;
      }

      validatedData.push({
        matric_number: row.matric_number.trim(),
        course_code: row.course_code.trim().toUpperCase(),
        course_title: row.course_title.trim(),
        credit_unit: creditUnit,
        grade: row.grade.trim().toUpperCase(),
        point: calculateGradePoint(row.grade),
        semester: row.semester,
        level: row.level,
        session: row.session.trim(),
      });
    });

    return { errors, validatedData };
  };

  const uploadResults = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const content = await readFileAsText(file);
      const parsedData = parseCSV(content);
      
      const { errors: validationErrors, validatedData } = validateResultData(parsedData);
      
      if (validationErrors.length > 0) {
        setResult({
          success: 0,
          failed: parsedData.length,
          errors: validationErrors.slice(0, 10), // Show first 10 errors
        });
        setUploading(false);
        return;
      }

      // Get all students to map matric numbers to student IDs
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, matric_number');

      if (studentsError) throw studentsError;

      const studentMap = new Map(students?.map(s => [s.matric_number, s.id]) || []);
      
      const resultsToInsert: any[] = [];
      const uploadErrors: string[] = [];

      validatedData.forEach((row, index) => {
        const studentId = studentMap.get(row.matric_number);
        if (!studentId) {
          uploadErrors.push(`Row ${index + 2}: Student with matric number ${row.matric_number} not found`);
          return;
        }

        resultsToInsert.push({
          ...row,
          student_id: studentId,
        });
      });

      if (uploadErrors.length > 0) {
        setResult({
          success: 0,
          failed: validatedData.length,
          errors: uploadErrors.slice(0, 10),
        });
        setUploading(false);
        return;
      }

      // Insert results in batches
      const batchSize = 100;
      let successCount = 0;
      const insertErrors: string[] = [];

      for (let i = 0; i < resultsToInsert.length; i += batchSize) {
        const batch = resultsToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('results')
          .insert(batch);

        if (error) {
          insertErrors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          successCount += batch.length;
        }

        setProgress((i + batch.length) / resultsToInsert.length * 100);
      }

      setResult({
        success: successCount,
        failed: resultsToInsert.length - successCount,
        errors: insertErrors,
      });

      if (successCount > 0) {
        toast({
          title: "Upload completed",
          description: `Successfully uploaded ${successCount} results`,
        });
        onSuccess();
      }

    } catch (error) {
      console.error('Error uploading results:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading results",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Results</DialogTitle>
          <DialogDescription>
            Upload multiple results from a CSV file. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <span className="text-sm text-muted-foreground">
              Download the CSV template to see the required format
            </span>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!file ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Upload CSV File</p>
                    <p className="text-xs text-muted-foreground">Click to select a CSV file</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 text-green-600 mx-auto" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                    Change File
                  </Button>
                </div>
              )}
            </div>

            {preview.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Preview (First 5 rows)</h4>
                <div className="border rounded-md p-3 bg-muted/50 max-h-40 overflow-auto">
                  <pre className="text-xs">
                    {preview.map((row, index) => (
                      <div key={index} className="mb-1">
                        {Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(' | ')}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading results...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <Alert className={result.success > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>Upload Results:</strong> {result.success} successful, {result.failed} failed
                    </p>
                    {result.errors.length > 0 && (
                      <div>
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {result.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {result.errors.length > 5 && (
                            <li>... and {result.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {file && !result && (
            <Button onClick={uploadResults} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Results'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}