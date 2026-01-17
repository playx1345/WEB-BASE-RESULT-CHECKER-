import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AdminSetupInstructions } from '@/components/AdminSetupInstructions';
import { 
  ChevronRight, 
  Users, 
  BookOpen, 
  Award, 
  Settings, 
  GraduationCap, 
  Shield, 
  Lock,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const LandingPage = () => {
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [matricNumber, setMatricNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleQuickCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matricNumber.trim() || !pin.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your matric number and PIN",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(matricNumber, pin, true);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: "Invalid matric number or PIN. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Redirecting to your results...",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showAdminSetup) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto py-8">
          <Button variant="outline" onClick={() => setShowAdminSetup(false)} className="mb-4">
            ← Back to Home
          </Button>
          <AdminSetupInstructions />
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      {/* Hero Section with Quick Result Checker */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Info */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <img 
                  src="/assets/plasu-polytechnic-logo.jpg" 
                  alt="PLAPOLY Logo" 
                  className="w-20 h-20 rounded-full shadow-lg border-4 border-background"
                />
                <div>
                  <p className="text-sm font-medium text-primary">Computer Science Department</p>
                  <p className="text-xs text-muted-foreground">School of ICT</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  <span className="text-foreground">Online</span>{' '}
                  <span className="gradient-text">Result Checker</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                  Access your academic results instantly. Secure, fast, and available 24/7 for all Computer Science students.
                </p>
              </div>
              
              {/* Quick stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Verified Results</p>
                    <p className="text-xs text-muted-foreground">Official records</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">24/7 Access</p>
                    <p className="text-xs text-muted-foreground">Always available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Instant Results</p>
                    <p className="text-xs text-muted-foreground">Real-time data</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Quick Result Checker Card */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Card className="border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">Check Your Results</CardTitle>
                  <CardDescription>
                    Enter your credentials to view your academic results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleQuickCheck} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="matric" className="text-sm font-medium">
                        Matric Number
                      </Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="matric"
                          placeholder="e.g., ND/22/COM/1234"
                          value={matricNumber}
                          onChange={(e) => setMatricNumber(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pin" className="text-sm font-medium">
                        PIN
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="pin"
                          type={showPin ? "text" : "password"}
                          placeholder="Enter your PIN"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                          Checking...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          View My Results
                        </span>
                      )}
                    </Button>
                  </form>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground">
                      Having trouble? Contact ICT Department for support
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Checking your results is simple and straightforward
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg">Enter Credentials</h3>
              <p className="text-sm text-muted-foreground">
                Input your matric number and PIN provided by the department
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg">Verify Identity</h3>
              <p className="text-sm text-muted-foreground">
                System confirms your fee payment status and student records
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg">View Results</h3>
              <p className="text-sm text-muted-foreground">
                Access your complete academic records and download as PDF
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A modern academic management system built for efficiency
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Result Viewing</h3>
                <p className="text-sm text-muted-foreground">
                  View semester results with GPA calculations
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  Protected with PIN authentication
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">PDF Download</h3>
                <p className="text-sm text-muted-foreground">
                  Download official result documents
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Admin Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Manage students and upload results
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">24/7</p>
              <p className="text-muted-foreground font-medium">System Availability</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">100%</p>
              <p className="text-muted-foreground font-medium">Data Security</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">Fast</p>
              <p className="text-muted-foreground font-medium">Instant Results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg">Administrative Access</h3>
              <p className="text-sm text-muted-foreground">
                Staff and administrators can access the management portal
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href="/auth">Admin Login</a>
              </Button>
              <Button variant="ghost" onClick={() => setShowAdminSetup(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Setup Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default LandingPage;
