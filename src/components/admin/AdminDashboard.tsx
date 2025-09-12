import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminStudentsView } from './views/AdminStudentsView';
import { AdminResultsView } from './views/AdminResultsView';
import { AdminAnnouncementsView } from './views/AdminAnnouncementsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
import { useActivityLogger } from '@/lib/auditLogger';
import { useEffect } from 'react';

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    // Log admin dashboard access
    logActivity('access_admin_dashboard', {
      metadata: { view: activeView }
    });
  }, [activeView, logActivity]);

  const renderView = () => {
    switch (activeView) {
      case 'students':
        return <AdminStudentsView />;
      case 'results':
        return <AdminResultsView />;
      case 'announcements':
        return <AdminAnnouncementsView />;
      case 'analytics':
        return <AdminAnalyticsView />;
      case 'audit-logs':
        return <AdminAuditLogsView />;
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 bg-background">
        {renderView()}
      </main>
    </div>
  );
}