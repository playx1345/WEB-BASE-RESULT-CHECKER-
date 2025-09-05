import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, FileText } from 'lucide-react';

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
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [feeStatus, setFeeStatus] = useState<string>('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;

      try {
        // First check fee status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          const { data: studentData } = await supabase
            .from('students')
            .select('fee_status')
            .eq('profile_id', profileData.id)
            .single();

          if (studentData) {
            setFeeStatus(studentData.fee_status);

            if (studentData.fee_status === 'paid') {
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

  const groupedResults = results.reduce((acc, result) => {
    const key = `${result.session} - ${result.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, Result[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Academic Results</h1>
        <p className="text-muted-foreground">
          View your semester results and academic performance.
        </p>
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