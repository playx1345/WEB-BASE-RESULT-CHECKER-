import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, BookX, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CarryoverCourse {
  id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  level: string;
  session: string;
  semester: string;
}

export function CarryoverCoursesView() {
  const { user } = useAuth();
  const [carryoverCourses, setCarryoverCourses] = useState<CarryoverCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    const fetchCarryoverCourses = async () => {
      if (!user) return;

      try {
        // Get student profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profileData) return;

        // Get student data
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', profileData.id)
          .single();

        if (!studentData) return;

        // Fetch carryover courses (F grades)
        const { data: resultsData } = await supabase
          .from('results')
          .select('*')
          .eq('student_id', studentData.id)
          .eq('is_carryover', true)
          .order('session', { ascending: false })
          .order('semester', { ascending: false });

        if (resultsData) {
          setCarryoverCourses(resultsData);
          const credits = resultsData.reduce((sum, course) => sum + course.credit_unit, 0);
          setTotalCredits(credits);
        }
      } catch (error) {
        console.error('Error fetching carryover courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarryoverCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Carryover Courses</h1>
        <p className="text-muted-foreground">
          View and track courses that need to be repeated.
        </p>
      </div>

      {carryoverCourses.length === 0 ? (
        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/10">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-600">Excellent Performance!</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-500">
            You have no carryover courses. Keep up the great work!
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/10">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-600">Attention Required</AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-500">
              You have {carryoverCourses.length} carryover course{carryoverCourses.length !== 1 ? 's' : ''} 
              {' '}({totalCredits} credit unit{totalCredits !== 1 ? 's' : ''}) that need to be repeated.
              Please register for these courses in the next available semester.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookX className="h-5 w-5 text-orange-600" />
                Courses to Repeat
              </CardTitle>
              <CardDescription>
                Failed courses that require retaking to improve your grade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead className="text-center">Credit Units</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Semester</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carryoverCourses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-orange-50 dark:hover:bg-orange-950/10">
                      <TableCell className="font-medium">{course.course_code}</TableCell>
                      <TableCell>{course.course_title}</TableCell>
                      <TableCell className="text-center">{course.credit_unit}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          {course.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{course.session}</TableCell>
                      <TableCell className="capitalize">{course.semester}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Total Carryover Courses</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {carryoverCourses.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Total Credit Units</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {totalCredits}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
