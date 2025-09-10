import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, FileText, Bell, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';

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

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  target_level: string;
}

export function DashboardView() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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

        // Fetch recent announcements
        const { data: announcementsData } = await supabase
          .from('announcements')
          .select('id, title, content, created_at, target_level')
          .order('created_at', { ascending: false })
          .limit(3);

        if (announcementsData) {
          setAnnouncements(announcementsData);
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Announcements
                </CardTitle>
                <CardDescription>Latest updates from the administration</CardDescription>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No announcements at the moment. Check back later for updates.
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-2 border-primary/20 pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{announcement.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}