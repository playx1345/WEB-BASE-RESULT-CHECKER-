import { useState } from 'react';
import { LayoutDashboard, Users, FileText, Bell, User, LogOut, GraduationCap, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

const adminMenuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { title: 'Students', icon: Users, id: 'students' },
  { title: 'Results', icon: FileText, id: 'results' },
  { title: 'Announcements', icon: Bell, id: 'announcements' },
  { title: 'Users', icon: User, id: 'users' },
];

interface AdminSidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export function AdminSidebar({ activeView = 'dashboard', onViewChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const collapsed = state === 'collapsed';

  const handleViewChange = (view: string) => {
    onViewChange?.(view);
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-4">
          <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">Admin Portal</h1>
              <p className="text-xs text-sidebar-foreground/60">Management System</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="ml-auto mr-2 mb-2" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full ${
                      activeView === item.id 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                        : 'hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="w-full hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}