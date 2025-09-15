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
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl -z-10"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center w-36 h-36 bg-white rounded-full shadow-xl ring-8 ring-blue-50 hover:shadow-2xl transition-shadow duration-300">
            <img src="/assets/logo.jpg" alt="Plateau State University Logo" className="w-28 h-28 object-contain" />
          </div>
          
          {/* School Information */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
              Plateau State University
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-secondary-foreground max-w-3xl">
              Student Portal & Academic Management System
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Access your academic records, check results, view announcements, and manage your student profile all in one secure platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl">
              <a href="/auth" className="flex items-center">
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowAdminSetup(true)} className="flex items-center gap-2 px-8 py-6 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              <Settings className="h-4 w-4" />
              Admin Setup
            </Button>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Our Mission & Vision</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Driving excellence in academic management and student empowerment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-primary">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  To revolutionize academic transparency and efficiency through a secure, accessible, and intelligent result management system—empowering students and administrators of the Department of Computer Science with real-time academic insights and digital autonomy.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-primary">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-base leading-relaxed">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Develop a comprehensive platform for seamless academic data management</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Ensure data integrity and security for all academic records</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Drive digital transformation in academic administration</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Support academic excellence through innovative technology solutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-primary mb-4">Why Choose Our Platform</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover the advantages that make our academic management system the preferred choice
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Academic Excellence */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Academic Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    Our platform is designed to support rigorous academic programs with comprehensive result tracking, taught by expert faculty members who are leaders in their fields.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Professional Development */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Professional Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    Enhance your career prospects with industry-recognized academic tracking. Our system helps you build credentials needed to stand out in a competitive job market.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Modern Technology */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">State-of-the-Art Technology</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    We offer modern facilities and cutting-edge technology to enhance your academic experience. From secure data management to intuitive user interfaces.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Student Life */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Enhanced Student Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    At Plateau State University, learning extends beyond the classroom. Our diverse and inclusive digital environment fosters personal growth and academic success.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Global Opportunities */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                    <Globe className="h-8 w-8 text-cyan-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Global Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    We provide our students with international exposure through digital platforms, partnerships, and global academic standards to prepare you for success worldwide.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Career Support */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">Career Support & Networking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    With dedicated career services, strong alumni network, and partnerships with industry leaders, our platform provides unparalleled support to help you launch and grow your career.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto relative" style={{ backgroundImage: 'url(/src/assets/university-building.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
          <div className="absolute inset-0 bg-white/30"></div>
          <div className="relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">System Features</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform for students, administrators, and academic management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-primary">Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  Comprehensive student records, fee tracking, and academic progress monitoring with secure access controls.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-primary">Results Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  Real-time access to academic results, grade reports, and performance analytics for informed decision making.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold text-primary">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  Powerful administrative tools for managing students, results, announcements, and system analytics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our platform ensures data security, user privacy, and reliable access to academic information. 
              Built with modern technology to provide a seamless experience for all users.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">System Availability</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Data Security</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">Fast</div>
                <div className="text-muted-foreground">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>;
};
export default LandingPage;