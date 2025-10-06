import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { OptimizedImage } from '@/components/OptimizedImage';
import { ChevronRight, BookOpen, Award, GraduationCap, Shield, BarChart, Lock, Zap, Users2 } from 'lucide-react';
import buildingBg from '@/assets/building-bg.jpg';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
        <div 
          className="absolute inset-0 opacity-20 -z-10"
          style={{ 
            backgroundImage: `url(${buildingBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-6 animate-fade-in">
              <OptimizedImage 
                src="/assets/plasu-polytechnic-logo.jpg" 
                alt="Plateau State Polytechnic Barkin Ladi Logo" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-full shadow-xl border-4 border-primary/20"
                skeletonClassName="w-24 h-24 md:w-32 md:h-32 rounded-full"
              />
            </div>
            
            {/* Heading */}
            <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                Plateau State Polytechnic Barkin Ladi
              </h1>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90">
                School of Information and Communication Technology
              </h2>
              <h3 className="text-lg md:text-xl text-muted-foreground">
                Department of Computer Science - Online Result Checker
              </h3>
            </div>
            
            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
              Experience the next generation of academic management with our secure, intelligent, and user-friendly platform designed for modern education.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Button asChild size="lg" className="w-full sm:w-auto text-base md:text-lg px-8 py-6">
                <Link to="/auth" className="flex items-center gap-2">
                  Get Started
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for academic excellence and administrative efficiency
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Real-time Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Access your academic results instantly with our secure, real-time result checking system
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Secure Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Your data is protected with industry-standard security and encryption protocols
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Admin Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Comprehensive administrative tools for efficient student and result management
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Student Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Personalized dashboard for viewing results, GPA tracking, and academic progress
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Course Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Track course registrations, grades, and academic performance all in one place
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Fast & Responsive</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Optimized for speed and mobile responsiveness for access anywhere, anytime
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Vision */}
              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-foreground">
                    To revolutionize academic transparency and efficiency through a secure, accessible, and intelligent result management system—empowering students and administrators with real-time academic insights.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Mission */}
              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-base text-foreground">
                    <li className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Comprehensive platform for seamless academic data management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Ensure data integrity and security for all academic records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Drive digital transformation in academic administration</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              Join thousands of students and administrators using our platform for academic excellence
            </p>
            <div className="pt-4">
              <Button asChild size="lg" variant="secondary" className="text-base md:text-lg px-8 py-6">
                <Link to="/auth" className="flex items-center gap-2">
                  Access Portal
                  <ChevronRight className="h-5 w-5" />
                </Link>
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
