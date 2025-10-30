import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileHeader } from './AdminMobileHeader';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminStudentsView } from './views/AdminStudentsView';
import { AdminResultsView } from './views/AdminResultsView';
import { AdminAnnouncementsView } from './views/AdminAnnouncementsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
import { useActivityLogger } from '@/lib/auditLogger';
import { useIsMobile } from '@/hooks/use-mobile';

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const { logActivity } = useActivityLogger();
  const isMobile = useIsMobile();

  const getViewTitle = () => {
    switch (activeView) {
      case 'students': return 'Student Management';
      case 'results': return 'Results Management';
      case 'announcements': return 'Announcements';
      case 'analytics': return 'Analytics';
      case 'audit-logs': return 'Audit Logs';
      default: return 'Dashboard';
    }
  };

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
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 flex flex-col w-full">
          <AdminMobileHeader title={getViewTitle()} />
          <main className="flex-1 bg-background">
            {renderView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}