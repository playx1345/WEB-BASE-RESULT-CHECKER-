import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { DashboardView } from './views/DashboardView';
import { ResultsView } from './views/ResultsView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { ProfileView } from './views/ProfileView';

export function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'results':
        return <ResultsView />;
      case 'announcements':
        return <AnnouncementsView />;
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