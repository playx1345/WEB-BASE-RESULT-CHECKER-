import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { School, MoreVertical } from 'lucide-react';
export function SiteHeader() {
  return <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Login options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <a href="/auth?userType=student" className="w-full">
                    Student Login
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/auth?userType=admin" className="w-full">
                    Admin Login
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/auth?userType=parent" className="w-full">
                    Parent Login
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <School className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">PLATEAU STATE POLYTECHNIC BARKIN-LADI</h1>
              <p className="text-sm text-primary font-medium">TECHNOLOGY FOR INNOVATION</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button asChild variant="ghost" size="sm" className="font-medium">
              <a href="/auth">Login</a>
            </Button>
            <Button asChild size="sm" className="font-medium shadow-lg hover:shadow-xl transition-shadow">
              <a href="/auth">Get Started</a>
            </Button>
          </div>
        </div>
      </div>
    </header>;
}