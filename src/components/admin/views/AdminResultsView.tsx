import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Upload, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UploadResultsModal } from '@/components/admin/modals/UploadResultsModal';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
          <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
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

      <UploadResultsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchResults}
      />
    </div>
  );
}