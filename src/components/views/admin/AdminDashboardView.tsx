import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, FileText, Bell, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminStats {
  totalStudents: number;
  totalResults: number;
  totalAnnouncements: number;
  paidFees: number;
  unpaidFees: number;
  avgCGPA: number;
}

export function AdminDashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!user) return;

      try {
        // Get total students
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // Get total results
        const { count: totalResults } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true });

        // Get total announcements
        const { count: totalAnnouncements } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true });

        // Get fee status breakdown
        const { count: paidFees } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('fee_status', 'paid');

        const { count: unpaidFees } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('fee_status', 'unpaid');

        // Get average CGPA
        const { data: cgpaData } = await supabase
          .from('students')
          .select('cgp');

        const avgCGPA = cgpaData && cgpaData.length > 0 
          ? cgpaData.reduce((sum, student) => sum + (student.cgp || 0), 0) / cgpaData.length
          : 0;

        setStats({
          totalStudents: totalStudents || 0,
          totalResults: totalResults || 0,
          totalAnnouncements: totalAnnouncements || 0,
          paidFees: paidFees || 0,
          unpaidFees: unpaidFees || 0,
          avgCGPA
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
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
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of the student management system and key metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResults || 0}</div>
            <p className="text-xs text-muted-foreground">Course results entered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAnnouncements || 0}</div>
            <p className="text-xs text-muted-foreground">Active announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.paidFees || 0}</div>
            <p className="text-xs text-muted-foreground">Students with paid fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Unpaid</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.unpaidFees || 0}</div>
            <p className="text-xs text-muted-foreground">Students with unpaid fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CGPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avgCGPA ? stats.avgCGPA.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">System-wide average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Payment Status</CardTitle>
            <CardDescription>Overview of student fee payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Paid</span>
              <Badge variant="default" className="bg-green-500">
                {stats?.paidFees || 0} students
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unpaid</span>
              <Badge variant="destructive">
                {stats?.unpaidFees || 0} students
              </Badge>
            </div>
            {stats && stats.totalStudents > 0 && (
              <div className="text-xs text-muted-foreground">
                Payment rate: {((stats.paidFees / stats.totalStudents) * 100).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Manage student records and enrollment</p>
              <p>• Upload and manage course results</p>
              <p>• Create and publish announcements</p>
              <p>• Monitor fee payment status</p>
              <p>• Generate reports and analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats && stats.unpaidFees > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Fee Payment Alert
            </CardTitle>
            <CardDescription>
              {stats.unpaidFees} student(s) have unpaid fees. Their access to results is restricted.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}