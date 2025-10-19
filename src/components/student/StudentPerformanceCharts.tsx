import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SemesterData {
  session: string;
  semester: string;
  gpa: number;
  courses: number;
  credits: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
}

const GRADE_COLORS = {
  A: 'hsl(var(--chart-1))',
  B: 'hsl(var(--chart-2))',
  C: 'hsl(var(--chart-3))',
  D: 'hsl(var(--chart-4))',
  F: 'hsl(var(--chart-5))',
};

export function StudentPerformanceCharts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [semesterData, setSemesterData] = useState<SemesterData[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [cgpa, setCgpa] = useState(0);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user) return;

      try {
        // Get student profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile) return;

        // Get student record
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (!student) return;

        // Fetch all results
        const { data: results, error } = await supabase
          .from('results')
          .select('*')
          .eq('student_id', student.id)
          .order('session', { ascending: true })
          .order('semester', { ascending: true });

        if (error) throw error;
        if (!results || results.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate semester-wise data
        const semesterMap = new Map<string, { total_points: number; total_credits: number; courses: number }>();
        const gradeMap = new Map<string, number>();
        let totalCreditUnits = 0;
        let totalGradePoints = 0;

        results.forEach((result) => {
          const key = `${result.session}-${result.semester}`;
          const current = semesterMap.get(key) || { total_points: 0, total_credits: 0, courses: 0 };
          
          current.total_points += (result.point || 0) * (result.credit_unit || 0);
          current.total_credits += result.credit_unit || 0;
          current.courses += 1;
          semesterMap.set(key, current);

          // Grade distribution
          const grade = result.grade || 'F';
          gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);

          // Overall totals
          totalCreditUnits += result.credit_unit || 0;
          totalGradePoints += (result.point || 0) * (result.credit_unit || 0);
        });

        // Convert to array format for charts
        const semesterArray: SemesterData[] = Array.from(semesterMap.entries()).map(([key, data]) => {
          const [session, semester] = key.split('-');
          return {
            session,
            semester,
            gpa: data.total_credits > 0 ? Number((data.total_points / data.total_credits).toFixed(2)) : 0,
            courses: data.courses,
            credits: data.total_credits,
          };
        });

        const gradeArray: GradeDistribution[] = Array.from(gradeMap.entries()).map(([grade, count]) => ({
          grade,
          count,
        }));

        setSemesterData(semesterArray);
        setGradeDistribution(gradeArray);
        setTotalCredits(totalCreditUnits);
        setCgpa(totalCreditUnits > 0 ? Number((totalGradePoints / totalCreditUnits).toFixed(2)) : 0);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (semesterData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
          <CardDescription>No results available to display charts</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cgpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Cumulative Grade Point Average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">
              Credit units earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semesters</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{semesterData.length}</div>
            <p className="text-xs text-muted-foreground">
              Semesters completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* GPA Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>GPA Trend</CardTitle>
            <CardDescription>Semester-by-semester performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={semesterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="session" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  domain={[0, 5]} 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Line 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="GPA"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Breakdown of grades earned</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, count }) => `${grade}: ${count}`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                >
                  {gradeDistribution.map((entry) => (
                    <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || 'hsl(var(--muted))'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Credit Progress by Semester */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Credit Units Progress</CardTitle>
            <CardDescription>Credits earned each semester</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={semesterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="session" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="credits" fill="hsl(var(--primary))" name="Credits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
