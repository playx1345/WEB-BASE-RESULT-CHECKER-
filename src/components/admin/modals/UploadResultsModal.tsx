import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

interface UploadResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CSVRow {
  student_matric_number: string;
  course_code: string;
  course_title: string;
  credit_unit: string;
  grade: string;
  point: string;
  semester: string;
  level: string;
  session: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function UploadResultsModal({ isOpen, onClose, onSuccess }: UploadResultsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'validating' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredColumns = [
    'student_matric_number',
    'course_code', 
    'course_title',
    'credit_unit',
    'grade',
    'point',
    'semester',
    'level',
    'session'
  ];

  const validSemesters = ['first', 'second'];
  const validLevels = ['ND1', 'ND2'];
  const validGrades = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      setErrorMessage('Please select a valid CSV file.');
      setUploadStatus('error');
    }
  };

  const parseCSV = (file: File) => {
    setUploadStatus('parsing');
    setValidationErrors([]);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setErrorMessage(`CSV parsing error: ${results.errors[0].message}`);
          setUploadStatus('error');
          return;
        }

        const data = results.data as CSVRow[];
        
        // Check if all required columns are present
        const headers = results.meta.fields || [];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          setErrorMessage(`Missing required columns: ${missingColumns.join(', ')}`);
          setUploadStatus('error');
          return;
        }

        setCsvData(data);
        validateData(data);
      },
      error: (error) => {
        setErrorMessage(`Error parsing CSV: ${error.message}`);
        setUploadStatus('error');
      }
    });
  };

  const validateData = (data: CSVRow[]) => {
    setUploadStatus('validating');
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row

      // Check required fields
      requiredColumns.forEach(column => {
        if (!row[column as keyof CSVRow]?.trim()) {
          errors.push({
            row: rowNumber,
            field: column,
            message: `${column} is required`
          });
        }
      });

      // Validate specific fields
      if (row.credit_unit && (isNaN(Number(row.credit_unit)) || Number(row.credit_unit) <= 0)) {
        errors.push({
          row: rowNumber,
          field: 'credit_unit',
          message: 'Credit unit must be a positive number'
        });
      }

      if (row.point && (isNaN(Number(row.point)) || Number(row.point) < 0 || Number(row.point) > 5)) {
        errors.push({
          row: rowNumber,
          field: 'point',
          message: 'Point must be a number between 0 and 5'
        });
      }

      if (row.semester && !validSemesters.includes(row.semester.toLowerCase())) {
        errors.push({
          row: rowNumber,
          field: 'semester',
          message: 'Semester must be "first" or "second"'
        });
      }

      if (row.level && !validLevels.includes(row.level.toUpperCase())) {
        errors.push({
          row: rowNumber,
          field: 'level',
          message: 'Level must be "ND1" or "ND2"'
        });
      }

      if (row.grade && !validGrades.includes(row.grade.toUpperCase())) {
        errors.push({
          row: rowNumber,
          field: 'grade',
          message: 'Grade must be A, B, C, D, E, or F'
        });
      }
    });

    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setUploadStatus('idle');
    } else {
      setUploadStatus('error');
      setErrorMessage(`Found ${errors.length} validation error(s). Please fix them before uploading.`);
    }
  };

  const handleUpload = async () => {
    if (validationErrors.length > 0 || csvData.length === 0) return;

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // First, get student IDs for all matric numbers
      const matricNumbers = [...new Set(csvData.map(row => row.student_matric_number))];
      
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, matric_number')
        .in('matric_number', matricNumbers);

      if (studentsError) {
        throw new Error(`Error fetching students: ${studentsError.message}`);
      }

      const studentMap = new Map(students?.map(s => [s.matric_number, s.id]) || []);
      
      // Check for missing students
      const missingStudents = matricNumbers.filter(matric => !studentMap.has(matric));
      if (missingStudents.length > 0) {
        throw new Error(`Students not found: ${missingStudents.join(', ')}`);
      }

      // Prepare results data for insertion
      const resultsData = csvData.map(row => ({
        student_id: studentMap.get(row.student_matric_number)!,
        course_code: row.course_code.trim(),
        course_title: row.course_title.trim(),
        credit_unit: parseInt(row.credit_unit),
        grade: row.grade.toUpperCase().trim(),
        point: parseFloat(row.point),
        semester: row.semester.toLowerCase().trim(),
        level: row.level.toUpperCase().trim(),
        session: row.session.trim()
      }));

      // Insert results in batches to avoid timeout
      const batchSize = 100;
      const totalBatches = Math.ceil(resultsData.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = resultsData.slice(i * batchSize, (i + 1) * batchSize);
        
        const { error: insertError } = await supabase
          .from('results')
          .insert(batch);

        if (insertError) {
          throw new Error(`Error inserting batch ${i + 1}: ${insertError.message}`);
        }

        setUploadProgress(((i + 1) / totalBatches) * 100);
      }

      setUploadStatus('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCsvData([]);
    setValidationErrors([]);
    setUploading(false);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'parsing':
      case 'validating':
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Upload Results
          </DialogTitle>
          <DialogDescription>
            Upload student results from a CSV file. Make sure your file contains all required columns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Select a CSV file with the following columns:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {requiredColumns.map(col => (
                  <Badge key={col} variant="outline" className="text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose CSV File
              </Button>
            </div>
          </div>

          {/* File Info */}
          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({csvData.length} rows)
              </span>
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Results uploaded successfully! The page will refresh shortly.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">
                Validation Errors ({validationErrors.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {validationErrors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-xs p-2 bg-destructive/10 rounded border-l-2 border-destructive">
                    <span className="font-medium">Row {error.row}, {error.field}:</span> {error.message}
                  </div>
                ))}
                {validationErrors.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    ... and {validationErrors.length - 10} more errors
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Cancel'}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || validationErrors.length > 0 || uploading || csvData.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload ${csvData.length} Results`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}