import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface MobileMenuProps {
  menuItems: Array<{
    title: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    id: string;
  }>;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function MobileMenu({ menuItems, activeView, onViewChange }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const handleItemClick = (viewId: string) => {
    onViewChange(viewId);
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                  <Badge variant="secondary" className="text-xs">
                    {profile?.role?.toUpperCase() || 'STUDENT'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </Button>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:bg-destructive/10"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}