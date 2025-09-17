import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AdminSetupInstructions } from '@/components/AdminSetupInstructions';
import { ChevronRight, Users, BookOpen, Award, Settings, GraduationCap, Shield, User, Globe, Briefcase } from 'lucide-react';
import buildingBg from '@/assets/building-bg.jpg';
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
  return <div className="min-h-screen relative overflow-hidden">
      {/* Full Viewport Immersive Background */}
      <div 
        className="immersive-background"
        style={{ 
          backgroundImage: `url(${buildingBg})` 
        }}
      ></div>
      
      {/* Enhanced vibrant overlay */}
      <div className="absolute inset-0 vibrant-overlay -z-20"></div>
      
      {/* Dynamic background elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/25 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/30 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/8 to-secondary/8 rounded-full blur-3xl -z-10"></div>
      
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-24 text-center overflow-hidden">        
        <div className="flex flex-col items-center space-y-12 max-w-6xl mx-auto relative p-16">
          <div className="relative z-10 flex flex-col items-center space-y-12 w-full">
          {/* Logo */}
          <div className="flex items-center justify-center w-40 h-40 enhanced-glass rounded-full shadow-2xl float-animation">
            <img src="/assets/plasu-polytechnic-logo.jpg" alt="Plateau State Polytechnic Barkin Ladi Logo" className="w-32 h-32 object-contain rounded-full transition-transform duration-500 hover:scale-110" />
          </div>
          
          {/* Time Ribbon */}
          <div className="time-ribbon enhanced-glass px-8 py-3 rounded-full border border-white/40">
            <p className="text-sm font-medium text-white text-shadow-bright">🔔 Welcome to the Future of Academic Management</p>
          </div>
          
          {/* School Information */}
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text leading-tight text-shadow-bright text-white">
              Plateau State Polytechnic Barkin Ladi
            </h1>
            <h2 className="text-lg md:text-xl font-bold text-white max-w-4xl text-shadow-bright">
              School of Information and Communication Technology
            </h2>
            <h3 className="text-base md:text-lg font-semibold text-white/95 max-w-4xl text-shadow-bright">
              Department of Computer Science - Online Result Checker
            </h3>
            <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed text-shadow-bright">
              Experience the next generation of academic management with our secure, intelligent, and user-friendly platform designed for modern education.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="px-12 py-8 text-base font-bold btn-gradient ripple shadow-2xl hover:shadow-primary/30">
              <a href="/auth" className="flex items-center">
                Get Started Now
                <ChevronRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowAdminSetup(true)} className="flex items-center gap-3 px-12 py-8 text-base font-bold glass-enhanced border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-500">
              <Settings className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
              Admin Setup
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto enhanced-glass rounded-3xl p-16 modern-shadow border border-white/30">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-shadow-bright">Our Mission & Vision</h3>
            <p className="text-base text-white/90 max-w-3xl mx-auto leading-relaxed text-shadow-bright">
              Pioneering the future of academic excellence through innovative technology solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Vision Card */}
            <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-white text-shadow-bright">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg leading-relaxed text-white/95 text-shadow-bright">
                  To revolutionize academic transparency and efficiency through a secure, accessible, and intelligent result management system—empowering students and administrators of the Department of Computer Science with real-time academic insights and digital autonomy.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-accent/40 to-secondary/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-white text-shadow-bright">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-lg leading-relaxed text-white/95 text-shadow-bright">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p>Develop a comprehensive platform for seamless academic data management</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p>Ensure data integrity and security for all academic records</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p>Drive digital transformation in academic administration</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p>Support academic excellence through innovative technology solutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 to-secondary/12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-shadow-bright">Why Choose Our Platform</h3>
              <p className="text-base text-white/90 max-w-3xl mx-auto leading-relaxed text-shadow-bright">
                Experience the next generation of academic management with cutting-edge features designed for modern education
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Academic Excellence */}
              <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400/40 to-blue-500/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white text-shadow-bright">Academic Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-white/95 text-shadow-bright">
                    Our platform supports rigorous academic programs with comprehensive result tracking and expert-designed interfaces for seamless educational management.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Professional Development */}
              <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400/40 to-purple-500/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white text-shadow-bright">Professional Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-white/95 text-shadow-bright">
                    Build industry-recognized credentials with our comprehensive tracking system designed to showcase your academic achievements effectively.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Modern Technology */}
              <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400/40 to-green-500/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white text-shadow-bright">State-of-the-Art Technology</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-white/95 text-shadow-bright">
                    Experience cutting-edge technology with secure data management, intuitive interfaces, and real-time performance analytics.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Student Life */}
              <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400/40 to-orange-500/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white text-shadow-bright">Enhanced Student Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-white/95 text-shadow-bright">
                    Our inclusive digital environment fosters personal growth and academic success through innovative student-centered design.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Global Opportunities */}
              <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-400/40 to-cyan-500/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white text-shadow-bright">Global Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-white/95 text-shadow-bright">
                    Connect with international standards through our platform's global compatibility and partnership integrations.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Career Support */}
              <Card className="enhanced-glass border-white/30 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-400/40 to-indigo-500/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white text-shadow-bright">Career Support & Networking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-lg leading-relaxed text-white/95 text-shadow-bright">
                    Leverage our comprehensive career services and strong alumni network to accelerate your professional journey.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden modern-shadow enhanced-glass border border-white/30">
          <div className="relative z-10 p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-shadow-bright">System Features</h3>
            <p className="text-sm text-white/95 max-w-3xl mx-auto leading-relaxed text-shadow-bright">
              A comprehensive platform designed for the future of academic excellence and administrative efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="enhanced-glass border-white/20 modern-shadow stagger-in group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <Users className="h-8 w-8 text-white transition-colors duration-300 group-hover:text-primary-foreground" />
                </div>
                <CardTitle className="text-base font-bold text-white text-shadow-bright group-hover:text-primary-foreground transition-colors duration-300">Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm leading-relaxed text-white/95 text-shadow-bright transition-colors duration-300 group-hover:text-white">
                  Advanced student records management with comprehensive progress tracking, secure access controls, and real-time updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="enhanced-glass border-white/20 modern-shadow stagger-in group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary/40 to-primary/40 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <BookOpen className="h-8 w-8 text-white transition-colors duration-300 group-hover:text-secondary-foreground" />
                </div>
                <CardTitle className="text-base font-bold text-white text-shadow-bright group-hover:text-secondary-foreground transition-colors duration-300">Results Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm leading-relaxed text-white/95 text-shadow-bright transition-colors duration-300 group-hover:text-white">
                  Instant access to academic results with advanced analytics, performance insights, and comprehensive grade reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="enhanced-glass border-white/20 modern-shadow hover-lift group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent/40 to-primary/40 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-base font-bold text-white text-shadow-bright">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm leading-relaxed text-white/95 text-shadow-bright">
                  Powerful administrative suite with advanced analytics, bulk operations, SMS notifications, and comprehensive system management.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto text-shadow-bright">
              Our platform ensures enterprise-grade data security, user privacy, and reliable access to academic information. 
              Built with cutting-edge technology to provide an exceptional experience for all users.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-10 text-center">
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow-bright">24/7</div>
                <div className="text-lg font-semibold text-white/95 text-shadow-bright">System Availability</div>
                <div className="text-sm text-white/90 mt-2 text-shadow-bright">Always accessible when you need it</div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow-bright">100%</div>
                <div className="text-lg font-semibold text-white/95 text-shadow-bright">Data Security</div>
                <div className="text-sm text-white/90 mt-2 text-shadow-bright">Enterprise-grade protection</div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow-bright">⚡</div>
                <div className="text-lg font-semibold text-white/95 text-shadow-bright">Lightning Fast</div>
                <div className="text-sm text-white/90 mt-2 text-shadow-bright">Optimized performance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>;
};
export default LandingPage;