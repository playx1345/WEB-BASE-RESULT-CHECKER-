import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AdminSetupInstructions } from '@/components/AdminSetupInstructions';
import { ChevronRight, Users, BookOpen, Award, Settings, GraduationCap, Shield, User, Globe, Briefcase } from 'lucide-react';
const LandingPage = () => {
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  if (showAdminSetup) {
    return <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto py-8">
          <Button variant="outline" onClick={() => setShowAdminSetup(false)} className="mb-4">
            ← Back to Home
          </Button>
          <AdminSetupInstructions />
        </div>
        <SiteFooter />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Modern background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-accent/5 -z-20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl -z-10"></div>
      
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-24 text-center overflow-hidden animate-fade-in">        
        <div className="flex flex-col items-center space-y-12 max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center w-40 h-40 glass-morphism-card rounded-full shadow-2xl hover-lift animate-glow">
            <img src="/assets/plasu-polytechnic-logo.jpg" alt="Plateau State Polytechnic Barkin Ladi Logo" className="w-32 h-32 object-contain animate-pulse-slow" />
          </div>
          
          {/* Time Ribbon */}
          <div className="time-ribbon bg-primary/10 px-8 py-3 rounded-full animate-shimmer">
            <p className="text-sm font-medium text-primary">🔔 Welcome to the Future of Academic Management</p>
          </div>
          
          {/* School Information */}
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold gradient-text leading-tight">
              Plateau State Polytechnic Barkin Ladi
            </h1>
            <h2 className="text-xl md:text-3xl font-bold text-primary max-w-4xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              School of Information and Communication Technology
            </h2>
            <h3 className="text-lg md:text-2xl font-semibold text-accent max-w-4xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Department of Computer Science - Online Result Checker
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              Experience the next generation of academic management with our secure, intelligent, and user-friendly platform designed for modern education.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <Button asChild size="lg" className="px-12 py-8 text-xl font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-500 shadow-2xl hover-lift animate-glow">
              <a href="/auth" className="flex items-center">
                Get Started Now
                <ChevronRight className="ml-3 h-6 w-6" />
              </a>
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowAdminSetup(true)} className="flex items-center gap-3 px-12 py-8 text-xl font-bold glass-morphism border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-500 hover-lift">
              <Settings className="h-5 w-5" />
              Admin Setup
            </Button>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold gradient-text mb-6">Our Mission & Vision</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Pioneering the future of academic excellence through innovative technology solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Vision Card */}
            <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold gradient-text">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg leading-relaxed text-foreground">
                  To revolutionize academic transparency and efficiency through a secure, accessible, and intelligent result management system—empowering students and administrators of the Department of Computer Science with real-time academic insights and digital autonomy.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="text-2xl font-bold gradient-text">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-lg leading-relaxed">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse-slow"></div>
                    <p>Develop a comprehensive platform for seamless academic data management</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
                    <p>Ensure data integrity and security for all academic records</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                    <p>Drive digital transformation in academic administration</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
                    <p>Support academic excellence through innovative technology solutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-accent/3"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h3 className="text-4xl md:text-5xl font-bold gradient-text mb-6">Why Choose Our Platform</h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience the next generation of academic management with cutting-edge features designed for modern education
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Academic Excellence */}
              <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Academic Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-foreground">
                    Our platform supports rigorous academic programs with comprehensive result tracking and expert-designed interfaces for seamless educational management.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Professional Development */}
              <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-10 w-10 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Professional Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-foreground">
                    Build industry-recognized credentials with our comprehensive tracking system designed to showcase your academic achievements effectively.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Modern Technology */}
              <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">State-of-the-Art Technology</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-foreground">
                    Experience cutting-edge technology with secure data management, intuitive interfaces, and real-time performance analytics.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Student Life */}
              <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <User className="h-10 w-10 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Enhanced Student Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-foreground">
                    Our inclusive digital environment fosters personal growth and academic success through innovative student-centered design.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Global Opportunities */}
              <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-10 w-10 text-cyan-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Global Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-foreground">
                    Connect with international standards through our platform's global compatibility and partnership integrations.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Career Support */}
              <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-10 w-10 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Career Support & Networking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-foreground">
                    Leverage our comprehensive career services and strong alumni network to accelerate your professional journey.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden modern-shadow" style={{ backgroundImage: 'url(/src/assets/university-building.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80"></div>
          <div className="relative z-10 p-12">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">System Features</h3>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              A comprehensive platform designed for the future of academic excellence and administrative efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Card className="glass-morphism border-white/20 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg leading-relaxed text-white/90">
                  Advanced student records management with comprehensive progress tracking, secure access controls, and real-time updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-white/20 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">Results Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg leading-relaxed text-white/90">
                  Instant access to academic results with advanced analytics, performance insights, and comprehensive grade reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-white/20 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg leading-relaxed text-white/90">
                  Powerful administrative suite with advanced analytics, bulk operations, SMS notifications, and comprehensive system management.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/3 to-primary/3"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Our platform ensures enterprise-grade data security, user privacy, and reliable access to academic information. 
              Built with cutting-edge technology to provide an exceptional experience for all users.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-10 text-center">
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-lg font-semibold text-muted-foreground">System Availability</div>
                <div className="text-sm text-muted-foreground mt-2">Always accessible when you need it</div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform duration-300">100%</div>
                <div className="text-lg font-semibold text-muted-foreground">Data Security</div>
                <div className="text-sm text-muted-foreground mt-2">Enterprise-grade protection</div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <div className="text-lg font-semibold text-muted-foreground">Lightning Fast</div>
                <div className="text-sm text-muted-foreground mt-2">Optimized performance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>;
};
export default LandingPage;