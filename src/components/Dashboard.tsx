import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AdminDashboard } from './admin/AdminDashboard';
import { TeacherDashboard } from './teacher/TeacherDashboard';
import { DashboardView } from './views/DashboardView';
import { ResultsView } from './views/ResultsView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { ProfileView } from './views/ProfileView';
import { NotificationsView } from './views/NotificationsView';
import { DocumentsView } from './views/DocumentsView';
import { useProfile } from '@/hooks/useProfile';

export function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  // Show appropriate dashboard based on user role
  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (profile?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'results':
        return <ResultsView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'documents':
        return <DocumentsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 bg-background">
        {renderView()}
      </main>
    </div>
  );
}