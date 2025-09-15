import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { School, MoreVertical, User, Shield, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setUserRole(profile?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
              <DropdownMenuContent align="start" className="w-56 bg-popover border-border">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/auth?role=student" className="w-full flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Student Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth?role=admin" className="w-full flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin Login</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {userRole === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full flex items-center space-x-2 text-primary">
                            <Shield className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="w-full flex items-center space-x-2 text-destructive">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <School className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-foreground leading-tight truncate">
                  Plateau State University
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide hidden sm:block">
                  TECHNOLOGY FOR INNOVATION
                </p>
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:block">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}