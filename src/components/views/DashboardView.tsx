import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { PerformanceCharts } from '@/components/charts/PerformanceCharts';
import { QuickActions } from '@/components/QuickActions';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { GraduationCap, FileText, Bell, AlertTriangle, TrendingUp, Users, Calendar } from 'lucide-react';

interface StudentData {
  id: string;
  matric_number: string;
  level: string;
  fee_status: string;
  cgp: number;
  total_gp: number;
  carryovers: number;
}

interface CarryoverCount {
  count: number;
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
  const [carryoverCount, setCarryoverCount] = useState(0);

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
            
            // Fetch carryover count (F grades)
            const { data: carryoverData, count } = await supabase
              .from('results')
              .select('id', { count: 'exact', head: false })
              .eq('student_id', studentDataResult.id)
              .eq('is_carryover', true);
            
            if (count !== null) {
              setCarryoverCount(count);
            }
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

  const handleViewResults = () => {
    // This would be implemented to navigate to results view
    console.log('Navigate to results');
  };

  const handleViewProfile = () => {
    // This would be implemented to navigate to profile view
    console.log('Navigate to profile');
  };

  const handleViewAnnouncements = () => {
    // This would be implemented to navigate to announcements view
    console.log('Navigate to announcements');
  };

  if (loading) {
    return <LoadingState type="dashboard" />;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Welcome back, {profile?.full_name || 'Student'}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your academic progress and important updates.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData?.level || profile?.level || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Academic Year</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
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

        <Card className="hover:shadow-lg transition-shadow duration-300">
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

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carryovers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${carryoverCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {carryoverCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {carryoverCount > 0 ? 'Outstanding Courses' : 'No Carryovers'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Payment Warning */}
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

      {/* Quick Actions */}
      <QuickActions 
        onViewResults={handleViewResults}
        onViewProfile={handleViewProfile}
        onViewAnnouncements={handleViewAnnouncements}
        feeStatus={studentData?.fee_status}
      />

      {/* Performance Charts */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Academic Performance
          </h2>
          <p className="text-muted-foreground">
            Visual analysis of your academic progress and achievements
          </p>
        </div>
        <PerformanceCharts />
      </div>

      {/* Activity and Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Timeline - Takes 2 columns on large screens, full width on smaller */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <ActivityTimeline />
        </div>

        {/* Quick Summary - Takes 1 column on large screens, full width on smaller */}
        <div className="space-y-6 order-1 lg:order-2">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quick Stats
              </CardTitle>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Academic Session</span>
                <span className="font-medium">2024/2025</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Exam Registration</p>
                    <p className="text-xs text-muted-foreground">Opens in 5 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Course Registration</p>
                    <p className="text-xs text-muted-foreground">Now open</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Fee Payment</p>
                    <p className="text-xs text-muted-foreground">Due in 14 days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}