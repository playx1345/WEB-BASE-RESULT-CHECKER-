import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { School, MoreVertical, User, Shield, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-primary/10 transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur border-border/50">
                <DropdownMenuItem asChild>
                  <a href="/auth?userType=student" className="w-full flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Student Login</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/auth?userType=admin" className="w-full flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin Login</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/auth?userType=parent" className="w-full flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Parent Login</span>
                  </a>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/admin" className="w-full flex items-center space-x-2 text-primary">
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full">
              <School className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-foreground tracking-tight font-poppins leading-tight">
                <span className="block sm:inline">PLATEAU STATE POLYTECHNIC</span>
                <span className="block sm:inline sm:ml-1">BARKIN-LADI</span>
              </h1>
              <p className="text-xs sm:text-sm text-primary font-medium font-inter tracking-wider">
                TECHNOLOGY FOR INNOVATION
              </p>
            </div>
          </div>
          
          {!user && (
            <div className="flex items-center space-x-2 sm:space-x-3 ml-2">
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="font-medium font-inter hover:bg-primary/10 transition-colors hidden sm:flex"
              >
                <a href="/auth">Login</a>
              </Button>
              <Button 
                asChild 
                size="sm" 
                className="font-medium font-inter shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
              >
                <a href="/auth">Get Started</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}