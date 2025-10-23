import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';
import { useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('[Index] Auth state changed:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      loading
    });
  }, [user, loading]);

  if (loading) {
    console.log('[Index] Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[Index] No user found, showing landing page');
    return <LandingPage />;
  }

  console.log('[Index] User authenticated, rendering dashboard');
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <Dashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
