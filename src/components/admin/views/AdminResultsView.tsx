import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Upload, FileText, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  student: {
    matric_number: string;
    profile: {
      full_name: string;
    };
  };
}

interface CsvRowData {
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

export function AdminResultsView() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          student:students(
            matric_number,
            profile:profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching results:', error);
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student?.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = sessionFilter === 'all' || result.session === sessionFilter;
    const matchesLevel = levelFilter === 'all' || result.level === levelFilter;
    
    return matchesSearch && matchesSession && matchesLevel;
  });

  const exportResults = () => {
    const csv = [
      ['Student Name', 'Matric Number', 'Course Code', 'Course Title', 'Credit Units', 'Grade', 'Grade Points', 'Session', 'Semester', 'Level'],
      ...filteredResults.map(result => [
        result.student?.profile?.full_name || 'N/A',
        result.student?.matric_number || 'N/A',
        result.course_code,
        result.course_title,
        result.credit_unit,
        result.grade,
        result.point,
        result.session,
        result.semester,
        result.level
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const csv = [
      ['Matric Number', 'Course Code', 'Course Title', 'Credit Units', 'Grade', 'Grade Points', 'Session', 'Semester', 'Level'],
      ['SAMPLE123', 'CSC101', 'Introduction to Computing', '3', 'A', '4.0', '2023/2024', 'first', 'ND1'],
      ['SAMPLE456', 'MTH102', 'Mathematics I', '3', 'B', '3.0', '2023/2024', 'first', 'ND1']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file.",
          variant: "destructive"
        });
        return;
      }
      setUploadFile(file);
    }
  };

  const parseCsvData = (csvText: string): CsvRowData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Skip sample rows by checking if matric number starts with "SAMPLE"
    const dataLines = lines.slice(1).filter(line => {
      const firstCol = line.split(',')[0]?.trim();
      return firstCol && !firstCol.toUpperCase().startsWith('SAMPLE');
    });
    
    return dataLines.map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
      });
      return row as CsvRowData;
    });
  };

  const validateRowData = (row: CsvRowData, rowIndex: number): string[] => {
    const errors: string[] = [];
    
    if (!row.matric_number) errors.push(`Row ${rowIndex + 2}: Matric Number is required`);
    if (!row.course_code) errors.push(`Row ${rowIndex + 2}: Course Code is required`);
    if (!row.course_title) errors.push(`Row ${rowIndex + 2}: Course Title is required`);
    if (!row.credit_units || isNaN(parseInt(row.credit_units))) {
      errors.push(`Row ${rowIndex + 2}: Credit Units must be a valid number`);
    }
    if (!row.grade) errors.push(`Row ${rowIndex + 2}: Grade is required`);
    if (!row.grade_points || isNaN(parseFloat(row.grade_points))) {
      errors.push(`Row ${rowIndex + 2}: Grade Points must be a valid number`);
    }
    if (!row.session) errors.push(`Row ${rowIndex + 2}: Session is required`);
    if (!row.semester) errors.push(`Row ${rowIndex + 2}: Semester is required`);
    if (!['first', 'second'].includes(row.semester)) {
      errors.push(`Row ${rowIndex + 2}: Semester must be 'first' or 'second'`);
    }
    if (!row.level) errors.push(`Row ${rowIndex + 2}: Level is required`);
    if (!['ND1', 'ND2'].includes(row.level)) {
      errors.push(`Row ${rowIndex + 2}: Level must be 'ND1' or 'ND2'`);
    }
    
    return errors;
  };

  const processBulkUpload = async () => {
    if (!uploadFile) return;
    
    setIsUploading(true);
    
    try {
      const csvText = await uploadFile.text();
      const parsedData = parseCsvData(csvText);
      
      if (parsedData.length === 0) {
        toast({
          title: "No data found",
          description: "The CSV file contains no valid data rows.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      // Validate all rows first
      const allErrors: string[] = [];
      parsedData.forEach((row, index) => {
        const rowErrors = validateRowData(row, index);
        allErrors.push(...rowErrors);
      });
      
      if (allErrors.length > 0) {
        toast({
          title: "Validation errors",
          description: `Found ${allErrors.length} error(s). Please check the console for details.`,
          variant: "destructive"
        });
        console.error('Validation errors:', allErrors);
        setIsUploading(false);
        return;
      }
      
      // Get student IDs for matric numbers
      const matricNumbers = parsedData.map(row => row.matric_number);
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, matric_number')
        .in('matric_number', matricNumbers);
      
      if (studentsError) {
        throw studentsError;
      }
      
      const studentMap = new Map(students?.map(s => [s.matric_number, s.id]) || []);
      
      // Check for missing students
      const missingStudents = matricNumbers.filter(mn => !studentMap.has(mn));
      if (missingStudents.length > 0) {
        toast({
          title: "Students not found",
          description: `The following matric numbers were not found: ${missingStudents.join(', ')}`,
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      // Prepare data for insertion
      const resultsToInsert = parsedData.map(row => ({
        student_id: studentMap.get(row.matric_number)!,
        course_code: row.course_code,
        course_title: row.course_title,
        credit_unit: parseInt(row.credit_units),
        grade: row.grade,
        point: parseFloat(row.grade_points),
        session: row.session,
        semester: row.semester,
        level: row.level
      }));
      
      // Insert results
      const { error: insertError } = await supabase
        .from('results')
        .insert(resultsToInsert);
      
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${resultsToInsert.length} results.`,
      });
      
      // Reset form and refresh data
      setUploadFile(null);
      setIsBulkUploadOpen(false);
      await fetchResults();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  const uniqueSessions = Array.from(new Set(results.map(r => r.session)));
  const uniqueLevels = Array.from(new Set(results.map(r => r.level)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Results Management</h1>
          <p className="text-muted-foreground">
            Manage student academic results and performance data.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Upload Results</DialogTitle>
                <DialogDescription>
                  Upload student results using a CSV file. Download the template first to ensure correct format.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <p className="text-blue-800 font-medium">Before uploading:</p>
                    <p className="text-blue-700">Download the template to see the required format</p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Upload CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {uploadFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {uploadFile.name}
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter className="sm:justify-start">
                <Button
                  onClick={processBulkUpload}
                  disabled={!uploadFile || isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Uploading...' : 'Upload Results'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Result
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Academic Results</CardTitle>
          <CardDescription>
            Total Results: {results.length} | Showing: {filteredResults.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course, student name, or matric number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {uniqueSessions.map(session => (
                  <SelectItem key={session} value={session}>{session}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {uniqueLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportResults} variant="outline" className="whitespace-nowrap">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button onClick={downloadTemplate} variant="outline" className="whitespace-nowrap">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV Template
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Matric No.</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Credit Units</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Semester</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">
                    {result.student?.profile?.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{result.student?.matric_number || 'N/A'}</TableCell>
                  <TableCell>{result.course_code}</TableCell>
                  <TableCell>{result.course_title}</TableCell>
                  <TableCell>{result.credit_unit}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        ['A', 'B'].includes(result.grade) ? 'default' :
                        ['C', 'D'].includes(result.grade) ? 'secondary' : 'destructive'
                      }
                    >
                      {result.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>{result.point}</TableCell>
                  <TableCell>{result.session}</TableCell>
                  <TableCell className="capitalize">{result.semester}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredResults.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                {searchTerm || sessionFilter !== 'all' || levelFilter !== 'all' 
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by adding academic results.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}