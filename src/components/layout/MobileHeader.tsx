import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, User, Shield, GraduationCap, LogOut, Home, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface MobileHeaderProps {
  onAdminSetup?: () => void;
}

export function MobileHeader({ onAdminSetup }: MobileHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    navigate('/');
  };

  const handleNavigation = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  if (!isMobile) return null;

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <img 
              src="/assets/plasu-polytechnic-logo.jpg" 
              alt="Plateau State Polytechnic Logo" 
              className="h-10 w-10 object-contain flex-shrink-0 rounded-lg shadow-md"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-bold gradient-text leading-tight truncate">
                PLASU Barkin Ladi
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                ICT Department
              </p>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 hover:bg-primary/20 transition-all duration-300"
                >
                  <Menu className="h-5 w-5 text-primary" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-left">Menu</SheetTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {user && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2">
                        <User className="h-4 w-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                  </SheetHeader>

                  <div className="flex-1 p-6">
                    <nav className="space-y-4">
                      {!user ? (
                        <>
                          <Button 
                            asChild 
                            variant="ghost" 
                            className="w-full justify-start h-12 text-left"
                            onClick={() => setIsOpen(false)}
                          >
                            <Link to="/" className="flex items-center space-x-3">
                              <Home className="h-5 w-5" />
                              <span>Home</span>
                            </Link>
                          </Button>
                          <Button 
                            asChild 
                            variant="ghost" 
                            className="w-full justify-start h-12 text-left"
                            onClick={() => setIsOpen(false)}
                          >
                            <Link to="/auth?role=student" className="flex items-center space-x-3">
                              <GraduationCap className="h-5 w-5" />
                              <span>Student Login</span>
                            </Link>
                          </Button>
                          <Button 
                            asChild 
                            variant="ghost" 
                            className="w-full justify-start h-12 text-left"
                            onClick={() => setIsOpen(false)}
                          >
                            <Link to="/auth?role=admin" className="flex items-center space-x-3">
                              <Shield className="h-5 w-5" />
                              <span>Admin Login</span>
                            </Link>
                          </Button>
                          {onAdminSetup && (
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start h-12 text-left"
                              onClick={() => handleNavigation(onAdminSetup)}
                            >
                              <div className="flex items-center space-x-3">
                                <Settings className="h-5 w-5" />
                                <span>Admin Setup</span>
                              </div>
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Button 
                            asChild 
                            variant="ghost" 
                            className="w-full justify-start h-12 text-left"
                            onClick={() => setIsOpen(false)}
                          >
                            <Link to="/" className="flex items-center space-x-3">
                              <Home className="h-5 w-5" />
                              <span>Dashboard</span>
                            </Link>
                          </Button>
                          {userRole === 'admin' && (
                            <Button 
                              asChild 
                              variant="ghost" 
                              className="w-full justify-start h-12 text-left text-primary"
                              onClick={() => setIsOpen(false)}
                            >
                              <Link to="/admin" className="flex items-center space-x-3">
                                <Shield className="h-5 w-5" />
                                <span>Admin Dashboard</span>
                              </Link>
                            </Button>
                          )}
                          {userRole === 'teacher' && (
                            <Button 
                              asChild 
                              variant="ghost" 
                              className="w-full justify-start h-12 text-left text-primary"
                              onClick={() => setIsOpen(false)}
                            >
                              <Link to="/teacher" className="flex items-center space-x-3">
                                <GraduationCap className="h-5 w-5" />
                                <span>Teacher Dashboard</span>
                              </Link>
                            </Button>
                          )}
                        </>
                      )}
                    </nav>
                  </div>

                  {user && (
                    <div className="p-6 border-t border-border">
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start h-12"
                        onClick={handleSignOut}
                      >
                        <div className="flex items-center space-x-3">
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}