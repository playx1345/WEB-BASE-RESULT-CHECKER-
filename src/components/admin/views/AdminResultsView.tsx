import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Upload, FileText, Download, Edit, Trash2, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { useCrud } from '@/hooks/useCrud';
import { DataPagination } from '@/components/ui/data-pagination';
import { ResultForm } from '@/components/admin/forms/ResultForm';
import { BulkResultUpload } from '@/components/admin/forms/BulkResultUpload';
import { downloadCSV, downloadExcel } from '@/lib/file-utils';

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

export function AdminResultsView() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student?.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = sessionFilter === 'all' || result.session === sessionFilter;
    const matchesLevel = levelFilter === 'all' || result.level === levelFilter;
    const matchesSemester = semesterFilter === 'all' || result.semester === semesterFilter;
    
    return matchesSearch && matchesSession && matchesLevel && matchesSemester;
  });

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
    reset: resetPagination,
  } = usePagination({
    totalItems: filteredResults.length,
    itemsPerPage: 15,
  });

  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  const { create, update, remove, loading: crudLoading } = useCrud<Result>({
    table: 'results',
    onSuccess: () => {
      fetchResults();
      setIsFormOpen(false);
      setSelectedResult(null);
      setIsEditMode(false);
    },
  });

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    resetPagination();
  }, [searchTerm, sessionFilter, levelFilter, semesterFilter, resetPagination]);

  const fetchResults = useCallback(async () => {
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
  }, []);

  const handleCreateResult = async (resultData: any) => {
    await create(resultData);
  };

  const handleUpdateResult = async (resultData: any) => {
    if (!selectedResult) return;
    await update(selectedResult.id, resultData);
  };

  const handleDeleteResult = async (resultId: string) => {
    await remove(resultId);
  };

  const handleEditResult = (result: Result) => {
    setSelectedResult(result);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleAddResult = () => {
    setSelectedResult(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const exportToCSV = () => {
    const exportData = filteredResults.map(result => ({
      'Student Name': result.student?.profile?.full_name || 'N/A',
      'Matric Number': result.student?.matric_number || 'N/A',
      'Course Code': result.course_code,
      'Course Title': result.course_title,
      'Credit Units': result.credit_unit,
      'Grade': result.grade,
      'Grade Points': result.point,
      'Session': result.session,
      'Semester': result.semester,
      'Level': result.level,
    }));

    downloadCSV(exportData, 'results_export');
  };

  const exportToExcel = () => {
    const exportData = filteredResults.map(result => ({
      'Student Name': result.student?.profile?.full_name || 'N/A',
      'Matric Number': result.student?.matric_number || 'N/A',
      'Course Code': result.course_code,
      'Course Title': result.course_title,
      'Credit Units': result.credit_unit,
      'Grade': result.grade,
      'Grade Points': result.point,
      'Session': result.session,
      'Semester': result.semester,
      'Level': result.level,
    }));

    downloadExcel(exportData, 'results_export');
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

  const uniqueSessions = Array.from(new Set(results.map(r => r.session))).sort();
  const uniqueLevels = Array.from(new Set(results.map(r => r.level))).sort();
  const uniqueSemesters = Array.from(new Set(results.map(r => r.semester))).sort();

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
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={handleAddResult}>
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course, student name, or matric number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={sessionFilter} onValueChange={setSessionFilter}>
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {uniqueSemesters.map(semester => (
                    <SelectItem key={semester} value={semester}>
                      {semester === 'first' ? 'First' : 'Second'} Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-1">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Excel
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResults.map((result) => (
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditResult(result)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Result</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this result for {result.course_code}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteResult(result.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || sessionFilter !== 'all' || levelFilter !== 'all' || semesterFilter !== 'all'
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by adding academic results.'}
              </p>
              {!searchTerm && sessionFilter === 'all' && levelFilter === 'all' && semesterFilter === 'all' && (
                <Button onClick={handleAddResult}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Result
                </Button>
              )}
            </div>
          )}

          {filteredResults.length > 0 && (
            <div className="mt-6">
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ResultForm
        result={selectedResult}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={isEditMode ? handleUpdateResult : handleCreateResult}
        loading={crudLoading}
      />

      <BulkResultUpload
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSuccess={fetchResults}
      />
    </div>
  );
}