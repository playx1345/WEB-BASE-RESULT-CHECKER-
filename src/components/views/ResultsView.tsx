import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, FileText, Search, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useActivityLogger } from '@/lib/auditLogger';
import { generateResultsPDF } from '@/lib/pdfUtils';
import { toast } from 'sonner';

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
}

export function ResultsView() {
  const { user } = useAuth();
  const { logActivity } = useActivityLogger();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [feeStatus, setFeeStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [profile, setProfile] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;

      try {
        // Log that user is viewing results
        await logActivity('view_results', {
          tableName: 'results',
          metadata: {
            action: 'access_results_page',
            userId: user.id
          }
        });

        // First check fee status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          
          const { data: studentDataResult } = await supabase
            .from('students')
            .select('*')
            .eq('profile_id', profileData.id)
            .single();

          if (studentDataResult) {
            setStudentData(studentDataResult);
            setFeeStatus(studentDataResult.fee_status);

            if (studentDataResult.fee_status === 'paid') {
              // Fetch results only if fees are paid
              const { data: resultsData } = await supabase
                .from('results')
                .select('*')
                .order('session', { ascending: false })
                .order('semester', { ascending: false });

              if (resultsData) {
                setResults(resultsData);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

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

  const handleDownloadPDF = async () => {
    if (!profile || !results.length) {
      toast.error('No results available to download');
      return;
    }

    setDownloading(true);
    try {
      await generateResultsPDF({
        results,
        profile: {
          full_name: profile.full_name,
          matric_number: studentData?.matric_number,
          level: profile.level
        },
        cgpa: studentData?.cgp || 0,
        totalGP: studentData?.total_gp || 0
      });
      
      toast.success('PDF downloaded successfully!');
      
      // Log the download activity
      await logActivity('download_results', {
        tableName: 'results',
        metadata: {
          action: 'download_pdf',
          userId: user?.id,
          resultCount: results.length
        }
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

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

  if (feeStatus !== 'paid') {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Academic Results</h1>
          <p className="text-muted-foreground">
            View your semester results and academic performance.
          </p>
        </div>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Restricted
            </CardTitle>
            <CardDescription>
              Your results are currently unavailable due to unpaid fees. 
              Please complete your fee payment to access your academic records.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredResults = results.filter(result => {
    const matchesSearch = result.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSession = sessionFilter === 'all' || result.session === sessionFilter;
    const matchesSemester = semesterFilter === 'all' || result.semester === semesterFilter;
    
    return matchesSearch && matchesSession && matchesSemester;
  });

  const groupedResults = filteredResults.reduce((acc, result) => {
    const key = `${result.session} - ${result.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, Result[]>);

  const exportResults = () => {
    const csv = [
      ['Session', 'Semester', 'Course Code', 'Course Title', 'Credit Units', 'Grade', 'Grade Points'],
      ...filteredResults.map(result => [
        result.session,
        result.semester,
        result.course_code,
        result.course_title,
        result.credit_unit,
        result.grade,
        result.point
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academic_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Academic Results</h1>
        <p className="text-muted-foreground">
          View your semester results and academic performance.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course code or title..."
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
            {Array.from(new Set(results.map(r => r.session))).map(session => (
              <SelectItem key={session} value={session}>{session}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            <SelectItem value="first">First Semester</SelectItem>
            <SelectItem value="second">Second Semester</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={exportResults} variant="outline" className="whitespace-nowrap">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        
        <Button 
          onClick={handleDownloadPDF} 
          disabled={downloading || results.length === 0}
          variant="default" 
          className="whitespace-nowrap"
        >
          <FileText className="h-4 w-4 mr-2" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>

      {Object.keys(groupedResults).length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              No Results Available
            </CardTitle>
            <CardDescription>
              No academic results have been published yet. Check back later for updates.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([sessionSemester, semesterResults]) => {
            const totalCredits = semesterResults.reduce((sum, result) => sum + result.credit_unit, 0);
            const totalGradePoints = semesterResults.reduce((sum, result) => sum + (result.point * result.credit_unit), 0);
            const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

            return (
              <Card key={sessionSemester}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{sessionSemester}</CardTitle>
                      <CardDescription>
                        {semesterResults.length} courses • {totalCredits} credit units
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Semester GPA</p>
                      <p className="text-2xl font-bold">{gpa}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead className="text-center">Credit Units</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Grade Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {semesterResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.course_code}</TableCell>
                          <TableCell>{result.course_title}</TableCell>
                          <TableCell className="text-center">{result.credit_unit}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{result.point.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}