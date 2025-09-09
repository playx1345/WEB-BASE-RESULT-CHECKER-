import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminStudentsView } from './views/admin/AdminStudentsView';
import { AdminResultsView } from './views/admin/AdminResultsView';
import { AdminAnnouncementsView } from './views/admin/AdminAnnouncementsView';

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
      case 'users':
        return <div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p>Coming soon...</p></div>;
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