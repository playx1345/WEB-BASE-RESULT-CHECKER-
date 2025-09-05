import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, FileText, Bell, AlertTriangle } from 'lucide-react';

interface StudentData {
  id: string;
  matric_number: string;
  level: string;
  fee_status: string;
  cgp: number;
  total_gp: number;
  carryovers: number;
}

interface Profile {
  full_name: string;
  level: string;
}

export function DashboardView() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, level')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);

          // Fetch student data
          const { data: studentDataResult } = await supabase
            .from('students')
            .select('*')
            .eq('profile_id', profileData.id)
            .single();

          if (studentDataResult) {
            setStudentData(studentDataResult);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
          Welcome back, {profile?.full_name || 'Student'}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your academic progress and important updates.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData?.level || profile?.level || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Academic Year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentData?.cgp ? studentData.cgp.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Cumulative Grade Point</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge 
              variant={studentData?.fee_status === 'paid' ? 'default' : 'destructive'}
              className="text-sm"
            >
              {studentData?.fee_status ? studentData.fee_status.toUpperCase() : 'UNKNOWN'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Current Session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carryovers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {studentData?.carryovers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding Courses</p>
          </CardContent>
        </Card>
      </div>

      {studentData?.fee_status !== 'paid' && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Fee Payment Required
            </CardTitle>
            <CardDescription>
              Your academic records are currently restricted due to unpaid fees. 
              Please complete your fee payment to access your results and other services.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your academic performance summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Matric Number</span>
              <span className="font-medium">{studentData?.matric_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Grade Points</span>
              <span className="font-medium">{studentData?.total_gp?.toFixed(2) || '0.00'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check the announcements section for the latest updates from the academic office.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}