import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreVertical, User, Shield, GraduationCap, LogOut, BookOpen, Users, Mail, Newspaper } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Link, useNavigate } from 'react-router-dom';

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 header-bright-bg relative">
      <div className="absolute inset-0 bg-background/20 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img 
                src="/assets/plasu-polytechnic-logo-optimized.webp" 
                alt="Plateau State Polytechnic Barkin Ladi Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-shrink-0 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                loading="eager"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold gradient-text leading-tight truncate">
                  Plateau State Polytechnic Barkin Ladi
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-semibold tracking-wide hidden sm:block">
                  School of Information and Communication Technology
                </p>
                <p className="text-xs text-primary/80 font-medium tracking-wide hidden lg:block">
                  Department of Computer Science - Online Result Checker
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:block font-medium">
                  {user.email}
                </span>
              </div>
            )}
            
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 hover:bg-primary/20 transition-all duration-300 hover:scale-105 glass-morphism border-0"
                >
                  <MoreVertical className="h-5 w-5 text-primary" />
                  <span className="sr-only">Menu options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-morphism-card border-primary/20">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/about" className="w-full flex items-center space-x-2 hover:bg-primary/10 transition-colors">
                        <BookOpen className="h-4 w-4" />
                        <span>About</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/programs" className="w-full flex items-center space-x-2 hover:bg-primary/10 transition-colors">
                        <GraduationCap className="h-4 w-4" />
                        <span>Programs</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/faculty" className="w-full flex items-center space-x-2 hover:bg-primary/10 transition-colors">
                        <Users className="h-4 w-4" />
                        <span>Faculty</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/news" className="w-full flex items-center space-x-2 hover:bg-primary/10 transition-colors">
                        <Newspaper className="h-4 w-4" />
                        <span>News</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/contact" className="w-full flex items-center space-x-2 hover:bg-primary/10 transition-colors">
                        <Mail className="h-4 w-4" />
                        <span>Contact</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/auth?role=student" className="w-full flex items-center space-x-2 hover:bg-primary/10 transition-colors">
                        <GraduationCap className="h-4 w-4" />
                        <span>Student Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth?role=admin" className="w-full flex items-center space-x-2 hover:bg-primary/10 transition-colors">
                        <Shield className="h-4 w-4" />
                        <span>Admin Login</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {profile?.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full flex items-center space-x-2 text-primary hover:bg-primary/10 transition-colors">
                            <Shield className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="w-full flex items-center space-x-2 text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}