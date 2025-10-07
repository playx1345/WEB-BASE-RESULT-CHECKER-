import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, Award, AlertTriangle, Activity, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedAnalyticsCharts } from './EnhancedAnalyticsCharts';

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

  // Prepare chart data
  const levelChartData = Object.entries(analytics.levelDistribution).map(([name, students]) => ({
    name,
    students
  }));

  const gradeChartData = Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({
    grade,
    count
  }));

  const performanceChartData = [
    { category: 'Excellent (3.5+ CGPA)', value: analytics.performanceStats.excellentPerformers },
    { category: 'Average (2.0-3.4 CGPA)', value: analytics.performanceStats.averagePerformers },
    { category: 'Needs Support (<2.0 CGPA)', value: analytics.performanceStats.struggling },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Analytics & Reports
        </h1>
        <p className="text-muted-foreground">
          Comprehensive insights into student performance and system metrics with visual data representation.
        </p>
      </div>

      {/* Key Metrics Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered students</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <div className="p-2 rounded-full bg-green-500/20">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              {((analytics.feeStatusStats.paid / totalStudents) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{analytics.feeStatusStats.paid} of {totalStudents} paid</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20">
              <Award className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {analytics.performanceStats.excellentPerformers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Students with 3.5+ CGPA</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <div className="p-2 rounded-full bg-orange-500/20">
              <BookOpen className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              {Object.values(analytics.gradeDistribution).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Published results</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Visual Analytics
          </h2>
          <p className="text-sm text-muted-foreground">Interactive charts showing key performance indicators</p>
        </div>
        <EnhancedAnalyticsCharts 
          levelData={levelChartData}
          gradeData={gradeChartData}
          performanceData={performanceChartData}
        />
      </div>

      {/* Detailed Stats Grid */}
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
    </div>
  );
}