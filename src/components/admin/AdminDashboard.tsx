import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminStudentsView } from './views/AdminStudentsView';
import { AdminResultsView } from './views/AdminResultsView';
import { AdminAppealsView } from './views/AdminAppealsView';
import { AdminAnnouncementsView } from './views/AdminAnnouncementsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'students':
        return <AdminStudentsView />;
      case 'results':
        return <AdminResultsView />;
      case 'appeals':
        return <AdminAppealsView />;
      case 'announcements':
        return <AdminAnnouncementsView />;
      case 'analytics':
        return <AdminAnalyticsView />;
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