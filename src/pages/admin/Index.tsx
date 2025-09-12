import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const AdminIndex = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1">
          <AdminDashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminIndex;