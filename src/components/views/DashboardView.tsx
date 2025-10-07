import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { PerformanceCharts } from '@/components/charts/PerformanceCharts';
import { QuickActions } from '@/components/QuickActions';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { AcademicStatsWidget } from '@/components/widgets/AcademicStatsWidget';
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

      {/* Enhanced Quick Stats Cards with Gradient Backgrounds */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {studentData?.level || profile?.level || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Academic Year 2024/2025</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <div className="p-2 rounded-full bg-green-500/20">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              {studentData?.cgp ? studentData.cgp.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {studentData?.cgp && studentData.cgp >= 3.5 ? 'Excellent Performance!' : 
               studentData?.cgp && studentData.cgp >= 2.5 ? 'Good Performance' : 'Keep Going!'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
          <div className={`absolute inset-0 ${studentData?.fee_status === 'paid' ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10' : 'bg-gradient-to-br from-red-500/10 to-red-600/10'}`}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
            <div className={`p-2 rounded-full ${studentData?.fee_status === 'paid' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              <Bell className={`h-4 w-4 ${studentData?.fee_status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <Badge 
              variant={studentData?.fee_status === 'paid' ? 'default' : 'destructive'}
              className="text-sm font-semibold"
            >
              {studentData?.fee_status ? studentData.fee_status.toUpperCase() : 'UNKNOWN'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Current Session</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
          <div className={`absolute inset-0 ${(studentData?.carryovers || 0) === 0 ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/10' : 'bg-gradient-to-br from-orange-500/10 to-orange-600/10'}`}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Carryovers</CardTitle>
            <div className={`p-2 rounded-full ${(studentData?.carryovers || 0) === 0 ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}>
              <AlertTriangle className={`h-4 w-4 ${(studentData?.carryovers || 0) === 0 ? 'text-purple-600' : 'text-orange-600'}`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold ${(studentData?.carryovers || 0) === 0 ? 'bg-gradient-to-r from-purple-600 to-purple-800' : 'bg-gradient-to-r from-orange-600 to-orange-800'} bg-clip-text text-transparent`}>
              {studentData?.carryovers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(studentData?.carryovers || 0) === 0 ? 'Excellent! No carryovers' : 'Outstanding Courses'}
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

      {/* Academic Stats Widget */}
      {studentData && (
        <AcademicStatsWidget 
          cgpa={studentData.cgp || 0}
          totalGP={studentData.total_gp || 0}
          carryovers={studentData.carryovers || 0}
          level={studentData.level}
        />
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