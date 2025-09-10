import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, AlertTriangle, TrendingUp, DollarSign, BookOpen, Plus, Upload, Megaphone, Calendar, Activity, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface DashboardStats {
  totalStudents: number;
  totalResults: number;
  unpaidFees: number;
  averageCGP: number;
  recentResults: number;
  carryovers: number;
  activeAnnouncements: number;
  recentActivity: RecentActivity[];
}

interface RecentActivity {
  id: string;
  type: 'student' | 'result' | 'announcement';
  title: string;
  description: string;
  created_at: string;
}

export function AdminDashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total students
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // Fetch total results
        const { count: totalResults } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true });

        // Fetch students with unpaid fees
        const { count: unpaidFees } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('fee_status', 'unpaid');

        // Fetch average CGP
        const { data: cgpData } = await supabase
          .from('students')
          .select('cgp')
          .not('cgp', 'is', null);

        const averageCGP = cgpData && cgpData.length > 0 
          ? cgpData.reduce((sum, student) => sum + (student.cgp || 0), 0) / cgpData.length
          : 0;

        // Fetch recent results (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: recentResults } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());

        // Fetch total carryovers
        const { data: carryoverData } = await supabase
          .from('students')
          .select('carryovers')
          .not('carryovers', 'is', null);

        const totalCarryovers = carryoverData?.reduce((sum, student) => sum + (student.carryovers || 0), 0) || 0;

        // Fetch active announcements
        const { count: activeAnnouncements } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch recent activity
        const recentActivity = await fetchRecentActivity();

        setStats({
          totalStudents: totalStudents || 0,
          totalResults: totalResults || 0,
          unpaidFees: unpaidFees || 0,
          averageCGP: Number(averageCGP.toFixed(2)),
          recentResults: recentResults || 0,
          carryovers: totalCarryovers,
          activeAnnouncements: activeAnnouncements || 0,
          recentActivity,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    const activities: RecentActivity[] = [];
    const threeDaysAgo = subDays(new Date(), 3).toISOString();

    try {
      // Recent students
      const { data: recentStudents } = await supabase
        .from('students')
        .select('id, created_at, profile:profiles(full_name)')
        .gte('created_at', threeDaysAgo)
        .order('created_at', { ascending: false })
        .limit(3);

      recentStudents?.forEach(student => {
        activities.push({
          id: student.id,
          type: 'student',
          title: 'New Student Added',
          description: `${student.profile?.full_name} was registered`,
          created_at: student.created_at,
        });
      });

      // Recent results
      const { data: recentResults } = await supabase
        .from('results')
        .select('id, created_at, course_code, student:students(profile:profiles(full_name))')
        .gte('created_at', threeDaysAgo)
        .order('created_at', { ascending: false })
        .limit(3);

      recentResults?.forEach(result => {
        activities.push({
          id: result.id,
          type: 'result',
          title: 'Result Added',
          description: `${result.course_code} result for ${result.student?.profile?.full_name}`,
          created_at: result.created_at,
        });
      });

      // Recent announcements
      const { data: recentAnnouncements } = await supabase
        .from('announcements')
        .select('id, created_at, title')
        .gte('created_at', threeDaysAgo)
        .order('created_at', { ascending: false })
        .limit(3);

      recentAnnouncements?.forEach(announcement => {
        activities.push({
          id: announcement.id,
          type: 'announcement',
          title: 'Announcement Created',
          description: announcement.title,
          created_at: announcement.created_at,
        });
      });

      // Sort all activities by date
      return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of student management system metrics and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students in system
            </p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Results</CardTitle>
            <GraduationCap className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalResults}</div>
            <p className="text-xs text-muted-foreground">
              Academic results recorded
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Unpaid Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.unpaidFees}</div>
            <p className="text-xs text-muted-foreground">
              Students with outstanding fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Average CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.averageCGP}</div>
            <p className="text-xs text-muted-foreground">
              Overall student performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Recent Results</CardTitle>
            <BookOpen className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.recentResults}</div>
            <p className="text-xs text-muted-foreground">
              Added in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Carryovers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.carryovers}</div>
            <p className="text-xs text-muted-foreground">
              Across all students
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Active Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.activeAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              Currently visible to students
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => window.location.href = '/admin/students'}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <h4 className="font-medium text-foreground">Add New Student</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Register a new student in the system</p>
                </div>
                <Badge variant="outline">Quick</Badge>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => window.location.href = '/admin/results'}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <h4 className="font-medium text-foreground">Upload Results</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Bulk upload student results</p>
                </div>
                <Badge variant="outline">Bulk</Badge>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => window.location.href = '/admin/announcements'}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    <h4 className="font-medium text-foreground">Send Announcement</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Notify students about updates</p>
                </div>
                <Badge variant="outline">Notify</Badge>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="mt-1">
                      {activity.type === 'student' && <Users className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'result' && <BarChart3 className="h-4 w-4 text-green-500" />}
                      {activity.type === 'announcement' && <Megaphone className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}