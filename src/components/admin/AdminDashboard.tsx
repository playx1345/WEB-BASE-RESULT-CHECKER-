import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminStudentsView } from './views/AdminStudentsView';
import { AdminResultsView } from './views/AdminResultsView';
import { AdminAnnouncementsView } from './views/AdminAnnouncementsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { AdminNotificationView } from './views/AdminNotificationView';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'students':
        return <AdminStudentsView />;
      case 'results':
        return <AdminResultsView />;
      case 'announcements':
        return <AdminAnnouncementsView />;
      case 'notifications':
        return <AdminNotificationView />;
      case 'analytics':
        return <AdminAnalyticsView />;
      case 'notification-settings':
        return (
          <div className="p-6">
            <NotificationSettings />
          </div>
        );
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 bg-background">
          <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Admin Portal</h1>
                  <p className="text-sm text-muted-foreground">Plateau State Polytechnic Barkin Ladi</p>
                </div>
                <div className="flex items-center gap-4">
                  <NotificationBell />
                </div>
              </div>
            </div>
          </div>
          {renderView()}
        </main>
      </div>
    </SidebarProvider>
  );
}