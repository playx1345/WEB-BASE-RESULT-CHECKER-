import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardView } from './views/AdminDashboardView';
import { StudentsManagementView } from './views/StudentsManagementView';
import { CoursesManagementView } from './views/CoursesManagementView';
import { ResultsManagementView } from './views/ResultsManagementView';
import { AnnouncementsView } from '../views/AnnouncementsView';
import { ProfileView } from '../views/ProfileView';

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'students':
        return <StudentsManagementView />;
      case 'courses':
        return <CoursesManagementView />;
      case 'results':
        return <ResultsManagementView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'profile':
        return <ProfileView />;
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