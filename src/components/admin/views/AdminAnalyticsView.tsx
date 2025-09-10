import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Award, AlertTriangle, Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PerformanceTrendChart } from '@/components/charts/PerformanceTrendChart';
import { SubjectAnalysisChart } from '@/components/charts/SubjectAnalysisChart';
import { TopPerformersList } from '@/components/charts/TopPerformersList';
import { exportAnalyticsToPDF, exportAnalyticsToExcel } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface AnalyticsData {
  levelDistribution: Record<string, number>;
  gradeDistribution: Record<string, number>;
  feeStatusStats: { paid: number; unpaid: number };
  performanceStats: {
    excellentPerformers: number;
    averagePerformers: number;
    struggling: number;
  };
  carryoverStats: Record<string, number>;
  topPerformers: Array<{
    id: string;
    matricNumber: string;
    fullName: string;
    level: string;
    cgp: number;
    rank: number;
  }>;
  subjectAnalysis: Array<{
    courseCode: string;
    courseTitle: string;
    averagePoint: number;
    studentCount: number;
    passRate: number;
    needsImprovement: boolean;
  }>;
  performanceTrends: Array<{
    semester: string;
    averageGP: number;
    excellentPerformers: number;
    strugglingStudents: number;
  }>;
}

export function AdminAnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch students with profile information for top performers
      const { data: studentsWithProfiles } = await supabase
        .from('students')
        .select(`
          id,
          profile_id,
          matric_number,
          level,
          cgp,
          carryovers,
          fee_status,
          profiles!inner(full_name)
        `)
        .order('cgp', { ascending: false });

      // Fetch results for grade and subject analysis
      const { data: results } = await supabase
        .from('results')
        .select('grade, point, course_code, course_title, credit_unit, semester, session, level');

      if (!studentsWithProfiles || !results) return;

      // Calculate level distribution
      const levelDistribution = studentsWithProfiles.reduce((acc, student) => {
        acc[student.level] = (acc[student.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate grade distribution
      const gradeDistribution = results.reduce((acc, result) => {
        acc[result.grade] = (acc[result.grade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate fee status stats
      const feeStatusStats = studentsWithProfiles.reduce(
        (acc, student) => {
          if (student.fee_status === 'paid') acc.paid++;
          else acc.unpaid++;
          return acc;
        },
        { paid: 0, unpaid: 0 }
      );

      // Calculate performance stats based on CGPA
      const performanceStats = studentsWithProfiles.reduce(
        (acc, student) => {
          const cgp = student.cgp || 0;
          if (cgp >= 3.5) acc.excellentPerformers++;
          else if (cgp >= 2.0) acc.averagePerformers++;
          else acc.struggling++;
          return acc;
        },
        { excellentPerformers: 0, averagePerformers: 0, struggling: 0 }
      );

      // Calculate carryover stats
      const carryoverStats = studentsWithProfiles.reduce((acc, student) => {
        const carryovers = student.carryovers || 0;
        if (carryovers === 0) acc['None'] = (acc['None'] || 0) + 1;
        else if (carryovers <= 2) acc['1-2'] = (acc['1-2'] || 0) + 1;
        else if (carryovers <= 5) acc['3-5'] = (acc['3-5'] || 0) + 1;
        else acc['6+'] = (acc['6+'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate top performers
      const topPerformers = studentsWithProfiles
        .filter(student => student.cgp > 0)
        .slice(0, 20)
        .map((student, index) => ({
          id: student.id,
          matricNumber: student.matric_number,
          fullName: student.profiles?.full_name || 'Unknown',
          level: student.level,
          cgp: student.cgp || 0,
          rank: index + 1
        }));

      // Calculate subject analysis
      const subjectMap = new Map();
      results.forEach(result => {
        const key = result.course_code;
        if (!subjectMap.has(key)) {
          subjectMap.set(key, {
            courseCode: result.course_code,
            courseTitle: result.course_title,
            points: [],
            grades: []
          });
        }
        subjectMap.get(key).points.push(result.point);
        subjectMap.get(key).grades.push(result.grade);
      });

      const subjectAnalysis = Array.from(subjectMap.values()).map(subject => {
        const averagePoint = subject.points.reduce((sum: number, point: number) => sum + point, 0) / subject.points.length;
        const passingGrades = ['A', 'B', 'C', 'D'];
        const passCount = subject.grades.filter((grade: string) => passingGrades.includes(grade)).length;
        const passRate = (passCount / subject.grades.length) * 100;
        
        return {
          courseCode: subject.courseCode,
          courseTitle: subject.courseTitle,
          averagePoint: Number(averagePoint.toFixed(2)),
          studentCount: subject.points.length,
          passRate: Number(passRate.toFixed(1)),
          needsImprovement: averagePoint < 2.0 || passRate < 70
        };
      }).sort((a, b) => a.averagePoint - b.averagePoint);

      // Calculate performance trends (mock data for now, could be enhanced with historical data)
      const semesters = [...new Set(results.map(r => `${r.session} ${r.semester}`))].sort();
      const performanceTrends = semesters.slice(-6).map(semester => {
        const semesterResults = results.filter(r => `${r.session} ${r.semester}` === semester);
        const avgGP = semesterResults.reduce((sum, r) => sum + r.point, 0) / semesterResults.length || 0;
        
        return {
          semester: semester.replace('first', 'First Sem').replace('second', 'Second Sem'),
          averageGP: Number(avgGP.toFixed(2)),
          excellentPerformers: semesterResults.filter(r => r.point >= 3.5).length,
          strugglingStudents: semesterResults.filter(r => r.point < 2.0).length
        };
      });

      setAnalytics({
        levelDistribution,
        gradeDistribution,
        feeStatusStats,
        performanceStats,
        carryoverStats,
        topPerformers,
        subjectAnalysis,
        performanceTrends
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No data available</h3>
          <p className="text-muted-foreground">Analytics will appear once students and results are added.</p>
        </div>
      </div>
    );
  }

  const totalStudents = Object.values(analytics.levelDistribution).reduce((sum, count) => sum + count, 0);

  const handleExportPDF = async () => {
    try {
      await exportAnalyticsToPDF('analytics-dashboard', 'analytics-report');
      toast.success('Analytics report exported to PDF successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('Export error:', error);
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = {
        totalStudents,
        excellentPerformers: analytics.performanceStats.excellentPerformers,
        averagePerformers: analytics.performanceStats.averagePerformers,
        strugglingStudents: analytics.performanceStats.struggling,
        feeCollectionRate: ((analytics.feeStatusStats.paid / totalStudents) * 100).toFixed(1),
        levelDistribution: analytics.levelDistribution,
        gradeDistribution: analytics.gradeDistribution,
        topPerformers: analytics.topPerformers,
        subjectAnalysis: analytics.subjectAnalysis
      };
      
      exportAnalyticsToExcel(exportData, 'analytics-data');
      toast.success('Analytics data exported to Excel successfully!');
    } catch (error) {
      toast.error('Failed to export Excel file');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6" id="analytics-dashboard">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into student performance and system metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5" />
                  Student Distribution by Level
                </CardTitle>
                <CardDescription>Enrollment across academic levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.levelDistribution).map(([level, count]) => (
                  <div key={level} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{level} Level</span>
                      <span className="text-muted-foreground">{count} students</span>
                    </div>
                    <Progress value={(count / totalStudents) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Award className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
                <CardDescription>Overall performance across all courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.gradeDistribution)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([grade, count]) => (
                    <div key={grade} className="flex justify-between items-center">
                      <Badge 
                        variant={
                          ['A', 'B'].includes(grade) ? 'default' :
                          ['C', 'D'].includes(grade) ? 'secondary' : 'destructive'
                        }
                      >
                        Grade {grade}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{count} results</span>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Fee Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5" />
                  Fee Payment Status
                </CardTitle>
                <CardDescription>Student fee payment overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Paid Fees</span>
                    <span className="text-muted-foreground">{analytics.feeStatusStats.paid} students</span>
                  </div>
                  <Progress 
                    value={(analytics.feeStatusStats.paid / totalStudents) * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Unpaid Fees</span>
                    <span className="text-muted-foreground">{analytics.feeStatusStats.unpaid} students</span>
                  </div>
                  <Progress 
                    value={(analytics.feeStatusStats.unpaid / totalStudents) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Award className="h-5 w-5" />
                  Academic Performance
                </CardTitle>
                <CardDescription>Student performance categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-foreground">Excellent (3.5+ CGPA)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{analytics.performanceStats.excellentPerformers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-foreground">Average (2.0-3.4 CGPA)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{analytics.performanceStats.averagePerformers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-foreground">Needs Support (&lt;2.0 CGPA)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{analytics.performanceStats.struggling}</span>
                </div>
              </CardContent>
            </Card>

            {/* Carryover Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  Carryover Analysis
                </CardTitle>
                <CardDescription>Student carryover distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.carryoverStats).map(([range, count]) => (
                  <div key={range} className="flex justify-between items-center">
                    <span className="text-sm text-foreground">
                      {range === 'None' ? 'No Carryovers' : `${range} Carryovers`}
                    </span>
                    <Badge variant={range === 'None' ? 'default' : range === '6+' ? 'destructive' : 'secondary'}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Quick Summary</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-foreground">Total Students</span>
                  <span className="font-medium text-foreground">{totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-foreground">Fee Collection Rate</span>
                  <span className="font-medium text-foreground">
                    {((analytics.feeStatusStats.paid / totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-foreground">Excellent Performers</span>
                  <span className="font-medium text-foreground">
                    {((analytics.performanceStats.excellentPerformers / totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-foreground">Students with Carryovers</span>
                  <span className="font-medium text-foreground">
                    {totalStudents - (analytics.carryoverStats['None'] || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPerformersList 
              data={analytics.topPerformers} 
              title="Top Academic Performers"
              limit={15}
            />
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>Breakdown of student performance levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {analytics.performanceStats.excellentPerformers}
                      </div>
                      <div className="text-sm text-muted-foreground">Excellent Performers</div>
                      <div className="text-xs text-muted-foreground">
                        {((analytics.performanceStats.excellentPerformers / totalStudents) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {analytics.performanceStats.averagePerformers}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Performers</div>
                      <div className="text-xs text-muted-foreground">
                        {((analytics.performanceStats.averagePerformers / totalStudents) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {analytics.performanceStats.struggling}
                      </div>
                      <div className="text-sm text-muted-foreground">Need Support</div>
                      <div className="text-xs text-muted-foreground">
                        {((analytics.performanceStats.struggling / totalStudents) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <SubjectAnalysisChart data={analytics.subjectAnalysis} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Subjects Needing Improvement</CardTitle>
                <CardDescription>Courses with low average performance (below 2.0 GPA)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.subjectAnalysis
                    .filter(subject => subject.needsImprovement)
                    .slice(0, 10)
                    .map((subject, index) => (
                      <div key={subject.courseCode} className="flex justify-between items-center p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                        <div>
                          <div className="font-medium">{subject.courseCode}</div>
                          <div className="text-sm text-muted-foreground">{subject.courseTitle}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{subject.averagePoint}</div>
                          <div className="text-xs text-muted-foreground">{subject.passRate}% pass rate</div>
                        </div>
                      </div>
                    ))}
                  {analytics.subjectAnalysis.filter(subject => subject.needsImprovement).length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      All subjects are performing well!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Top Performing Subjects</CardTitle>
                <CardDescription>Courses with highest average performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.subjectAnalysis
                    .filter(subject => !subject.needsImprovement)
                    .sort((a, b) => b.averagePoint - a.averagePoint)
                    .slice(0, 10)
                    .map((subject, index) => (
                      <div key={subject.courseCode} className="flex justify-between items-center p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                        <div>
                          <div className="font-medium">{subject.courseCode}</div>
                          <div className="text-sm text-muted-foreground">{subject.courseTitle}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{subject.averagePoint}</div>
                          <div className="text-xs text-muted-foreground">{subject.passRate}% pass rate</div>
                        </div>
                      </div>
                    ))}
                  {analytics.subjectAnalysis.filter(subject => !subject.needsImprovement).length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No subject data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <PerformanceTrendChart data={analytics.performanceTrends} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Performance direction over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.performanceTrends.length >= 2 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {analytics.performanceTrends[analytics.performanceTrends.length - 1]?.averageGP.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Average GPA</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        (analytics.performanceTrends[analytics.performanceTrends.length - 1]?.averageGP || 0) >= 
                        (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.averageGP || 0) 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(analytics.performanceTrends[analytics.performanceTrends.length - 1]?.averageGP || 0) >= 
                         (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.averageGP || 0) 
                          ? '↗ Improving' : '↘ Declining'}
                      </div>
                      <div className="text-xs text-muted-foreground">Compared to previous semester</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Insufficient data for trend analysis
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Excellence Growth</CardTitle>
                <CardDescription>Change in top performers</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.performanceTrends.length >= 2 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {analytics.performanceTrends[analytics.performanceTrends.length - 1]?.excellentPerformers || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Excellent Performers</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        (analytics.performanceTrends[analytics.performanceTrends.length - 1]?.excellentPerformers || 0) >= 
                        (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.excellentPerformers || 0) 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(analytics.performanceTrends[analytics.performanceTrends.length - 1]?.excellentPerformers || 0) - 
                         (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.excellentPerformers || 0) >= 0 
                          ? '+' : ''}{(analytics.performanceTrends[analytics.performanceTrends.length - 1]?.excellentPerformers || 0) - 
                               (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.excellentPerformers || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Change from last semester</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Insufficient data for analysis
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Needed</CardTitle>
                <CardDescription>Students requiring assistance</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.performanceTrends.length >= 2 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {analytics.performanceTrends[analytics.performanceTrends.length - 1]?.strugglingStudents || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Students Needing Support</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        (analytics.performanceTrends[analytics.performanceTrends.length - 1]?.strugglingStudents || 0) <= 
                        (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.strugglingStudents || 0) 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(analytics.performanceTrends[analytics.performanceTrends.length - 1]?.strugglingStudents || 0) - 
                         (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.strugglingStudents || 0) <= 0 
                          ? (analytics.performanceTrends[analytics.performanceTrends.length - 1]?.strugglingStudents || 0) - 
                            (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.strugglingStudents || 0) === 0
                            ? 'No Change' 
                            : `${(analytics.performanceTrends[analytics.performanceTrends.length - 1]?.strugglingStudents || 0) - 
                                 (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.strugglingStudents || 0)} Improved`
                          : `+${(analytics.performanceTrends[analytics.performanceTrends.length - 1]?.strugglingStudents || 0) - 
                                 (analytics.performanceTrends[analytics.performanceTrends.length - 2]?.strugglingStudents || 0)} More`}
                      </div>
                      <div className="text-xs text-muted-foreground">Change from last semester</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Insufficient data for analysis
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}