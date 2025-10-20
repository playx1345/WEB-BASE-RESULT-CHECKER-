import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, Award, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

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
}

export function AdminAnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch students for level distribution
      const { data: students } = await supabase
        .from('students')
        .select('level, fee_status, cgp, carryovers');

      // Fetch results for grade distribution
      const { data: results } = await supabase
        .from('results')
        .select('grade');

      if (!students || !results) return;

      // Calculate level distribution
      const levelDistribution = students.reduce((acc, student) => {
        acc[student.level] = (acc[student.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate grade distribution
      const gradeDistribution = results.reduce((acc, result) => {
        acc[result.grade] = (acc[result.grade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate fee status stats
      const feeStatusStats = students.reduce(
        (acc, student) => {
          if (student.fee_status === 'paid') acc.paid++;
          else acc.unpaid++;
          return acc;
        },
        { paid: 0, unpaid: 0 }
      );

      // Calculate performance stats based on CGPA
      const performanceStats = students.reduce(
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
      const carryoverStats = students.reduce((acc, student) => {
        const carryovers = student.carryovers || 0;
        if (carryovers === 0) acc['None'] = (acc['None'] || 0) + 1;
        else if (carryovers <= 2) acc['1-2'] = (acc['1-2'] || 0) + 1;
        else if (carryovers <= 5) acc['3-5'] = (acc['3-5'] || 0) + 1;
        else acc['6+'] = (acc['6+'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setAnalytics({
        levelDistribution,
        gradeDistribution,
        feeStatusStats,
        performanceStats,
        carryoverStats,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-3 sm:h-4 w-64 sm:w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 sm:h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-3 sm:p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No data available</h3>
          <p className="text-sm text-muted-foreground">Analytics will appear once students and results are added.</p>
        </div>
      </div>
    );
  }

  const totalStudents = Object.values(analytics.levelDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Comprehensive insights into student performance and system metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
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
    </div>
  );
}