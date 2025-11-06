import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminMobileHeaderProps {
  title: string;
}

export function AdminMobileHeader({ title }: AdminMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:hidden">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1">
        <h1 className="text-base font-semibold truncate">{title}</h1>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
