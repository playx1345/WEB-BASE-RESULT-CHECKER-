import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, UserCheck, Shield, FileText, Target, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            {/* School Logo and Branding */}
            <div className="mb-8">
              <School className="h-24 w-24 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Plateau State Polytechnic
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-2">
                Barkin Ladi
              </h2>
              <p className="text-xl text-muted-foreground mb-2">
                School of Information and Communication Technology
              </p>
              <p className="text-lg text-muted-foreground">
                Department of Computer Science - Online Result Checker
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 max-w-3xl mx-auto">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  className="w-full sm:w-auto px-8 py-6 text-lg"
                  size="lg"
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Student Login
                </Button>
              </Link>
              
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 py-6 text-lg"
                  size="lg"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Login
                </Button>
              </Link>
              
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  className="w-full sm:w-auto px-8 py-6 text-lg"
                  size="lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  View My Results
                </Button>
              </Link>
            </div>
          </div>

          {/* Vision and Mission Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Vision Card */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Target className="h-8 w-8 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  To be a leading institution in Information and Communication Technology, 
                  providing world-class education that produces globally competitive graduates 
                  equipped with cutting-edge technological skills and innovative thinking 
                  capabilities for the digital age.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Eye className="h-8 w-8 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  To deliver excellent technical education through innovative teaching methods, 
                  modern facilities, and industry partnerships. We are committed to nurturing 
                  skilled professionals in Computer Science and ICT who will drive technological 
                  advancement and contribute meaningfully to society.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Welcome to Our Online Result Checker System
                </h3>
                <p className="text-muted-foreground mb-4">
                  Access your academic records, check examination results, and stay updated 
                  with important announcements from the Department of Computer Science.
                </p>
                <p className="text-sm text-muted-foreground">
                  For support or technical assistance, please contact the ICT department.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <Dashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
