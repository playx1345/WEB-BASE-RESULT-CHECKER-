import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Dashboard } from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  console.log('[Index] Auth loading:', authLoading, 'Profile loading:', profileLoading, 'User:', user?.id, 'Profile role:', profile?.role);

  // Show loading state while checking authentication OR profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  // If no user, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // User is authenticated, show dashboard
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <main className="flex-1">
          <Dashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
