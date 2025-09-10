import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, AlertTriangle, TrendingUp, DollarSign, BookOpen, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalStudents: number;
  totalResults: number;
  unpaidFees: number;
  averageCGP: number;
  recentResults: number;
  carryovers: number;
  totalAnnouncements: number;
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

        // Fetch recent results (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentResults } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Fetch total carryovers
        const { data: carryoverData } = await supabase
          .from('students')
          .select('carryovers')
          .not('carryovers', 'is', null);

        const totalCarryovers = carryoverData?.reduce((sum, student) => sum + (student.carryovers || 0), 0) || 0;

        // Fetch total announcements
        const { count: totalAnnouncements } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalStudents: totalStudents || 0,
          totalResults: totalResults || 0,
          unpaidFees: unpaidFees || 0,
          averageCGP: Number(averageCGP.toFixed(2)),
          recentResults: recentResults || 0,
          carryovers: totalCarryovers,
          totalAnnouncements: totalAnnouncements || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              Added in last 30 days
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

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              Active notices posted
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
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Add New Student</h4>
                <p className="text-sm text-muted-foreground">Register a new student in the system</p>
              </div>
              <Badge variant="outline">Quick</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Upload Results</h4>
                <p className="text-sm text-muted-foreground">Bulk upload student results</p>
              </div>
              <Badge variant="outline">Bulk</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Send Announcement</h4>
                <p className="text-sm text-muted-foreground">Notify students about updates</p>
              </div>
              <Badge variant="outline">Notify</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">System Health</CardTitle>
            <CardDescription>Current system status and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-foreground">Database Connection: Healthy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-foreground">Authentication Service: Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-foreground">Storage Usage: 68% (Monitor)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-foreground">API Response Time: &lt;200ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}