import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AdminSetupInstructions } from '@/components/AdminSetupInstructions';
import { ChevronRight, Users, BookOpen, Award, Settings, GraduationCap, Shield, User, Globe, Briefcase } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import buildingBg from '@/assets/building-bg.webp';
const LandingPage = () => {
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const isMobile = useIsMobile();
  if (showAdminSetup) {
    return <div className="min-h-screen bg-background">
        {isMobile ? (
          <MobileHeader />
        ) : (
          <SiteHeader />
        )}
        <div className="container mx-auto py-4 px-4">
          <Button variant="outline" onClick={() => setShowAdminSetup(false)} className="mb-4 w-full sm:w-auto">
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
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl -z-10"></div>
      
      {isMobile ? (
        <MobileHeader onAdminSetup={() => setShowAdminSetup(true)} />
      ) : (
        <SiteHeader />
      )}
      
      {/* Hero Section */}
      <section className="relative container mx-auto px-3 sm:px-4 py-6 sm:py-12 md:py-16 lg:py-24 text-center overflow-hidden">        
        <div 
          className="flex flex-col items-center space-y-4 sm:space-y-8 md:space-y-10 lg:space-y-12 max-w-6xl mx-auto relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden modern-shadow p-4 sm:p-8 md:p-12 lg:p-16 touch-manipulation"
          style={{ 
            backgroundImage: `url(${buildingBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            minHeight: isMobile ? '85vh' : '80vh'
          }}
        >
          {/* Optimized background overlay - clearer image visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/30"></div>
          <div className="relative z-10 flex flex-col items-center space-y-4 sm:space-y-8 md:space-y-10 lg:space-y-12 w-full pb-safe">
          {/* Logo */}
          <div className="flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 glass-enhanced rounded-full shadow-2xl float-animation mt-2">
            <img 
              src="/assets/plasu-polytechnic-logo.webp" 
              alt="Plateau State Polytechnic Barkin Ladi Logo" 
              className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain rounded-full transition-transform duration-500 hover:scale-110"
              loading="eager"
            />
          </div>
          
          {/* Time Ribbon */}
          <div className="time-ribbon bg-primary/30 backdrop-blur-sm px-3 sm:px-6 md:px-8 py-1.5 sm:py-3 rounded-full">
            <p className="text-[10px] sm:text-sm md:text-base font-medium text-white text-center leading-tight">🔔 Welcome to the Future of Academic Management</p>
          </div>
          
          {/* School Information */}
          <div className="space-y-2 sm:space-y-4 md:space-y-5 lg:space-y-6 px-2">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white drop-shadow-lg">
              Plateau State Polytechnic Barkin Ladi
            </h1>
            <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white max-w-4xl mx-auto drop-shadow-md">
              School of Information and Communication Technology
            </h2>
            <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-white max-w-4xl mx-auto drop-shadow-md">
              Department of Computer Science - Online Result Checker
            </h3>
            <p className="text-xs sm:text-base md:text-lg text-white/95 max-w-3xl mx-auto leading-relaxed px-2 drop-shadow">
              Experience the next generation of academic management with our secure, intelligent, and user-friendly platform designed for modern education.
            </p>
          </div>

          {/* CTA Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center w-full px-2 sm:px-4 mt-2">
            <Button asChild size={isMobile ? "default" : "lg"} className="w-full sm:flex-1 px-6 sm:px-8 md:px-12 py-6 sm:py-4 md:py-6 lg:py-8 text-sm sm:text-base md:text-lg font-bold btn-gradient ripple shadow-2xl hover:shadow-primary/30 min-h-[48px] sm:min-h-[52px] touch-manipulation active:scale-95 transition-transform">
              <a href="/auth" className="flex items-center justify-center">
                Get Started Now
                <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
            {!isMobile && (
              <Button size="lg" variant="outline" onClick={() => setShowAdminSetup(true)} className="w-full sm:flex-1 flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 lg:py-8 text-sm sm:text-base md:text-lg font-bold glass-enhanced border-2 border-white/50 hover:bg-white hover:text-primary transition-all duration-500 min-h-[52px] touch-manipulation text-white">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:rotate-45" />
                Admin Setup
              </Button>
            )}
          </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
      </section>


      {/* Features Section */}
      <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto relative rounded-xl sm:rounded-3xl overflow-hidden modern-shadow bright-background">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30"></div>
          <div className="relative z-10 p-4 sm:p-8 md:p-10 lg:p-12">
          <div className="text-center mb-4 sm:mb-8 md:mb-10 animate-fade-in">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">System Features</h3>
            <p className="text-xs sm:text-base md:text-lg text-white/95 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
              A comprehensive platform designed for the future of academic excellence and administrative efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
            <Card className="glass-enhanced border-white/20 modern-shadow stagger-in group touch-manipulation min-h-[44px]">
              <CardHeader className="text-center p-3 sm:p-6">
                <div className="mx-auto w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center mb-2 sm:mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <Users className="h-5 w-5 sm:h-8 sm:w-8 text-white transition-colors duration-300 group-hover:text-primary-foreground" />
                </div>
                <CardTitle className="text-xs sm:text-base font-bold text-white text-shadow-bright group-hover:text-primary-foreground transition-colors duration-300">Student Management</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <CardDescription className="text-center text-[10px] sm:text-sm leading-relaxed text-white/95 text-shadow-bright transition-colors duration-300 group-hover:text-white">
                  Advanced student records management with comprehensive progress tracking, secure access controls, and real-time updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-enhanced border-white/20 modern-shadow stagger-in group">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-colors duration-300 group-hover:text-secondary-foreground" />
                </div>
                <CardTitle className="text-sm sm:text-base font-bold text-white text-shadow-bright group-hover:text-secondary-foreground transition-colors duration-300">Results Portal</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <CardDescription className="text-center text-xs sm:text-sm leading-relaxed text-white/95 text-shadow-bright transition-colors duration-300 group-hover:text-white">
                  Instant access to academic results with advanced analytics, performance insights, and comprehensive grade reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-white/20 modern-shadow hover-lift group sm:col-span-2 md:col-span-1">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-sm sm:text-base font-bold text-white">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <CardDescription className="text-center text-xs sm:text-sm leading-relaxed text-white/90">
                  Powerful administrative suite with advanced analytics, bulk operations, SMS notifications, and comprehensive system management.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/3 to-primary/3"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-4xl mx-auto px-4">
              Our platform ensures enterprise-grade data security, user privacy, and reliable access to academic information. 
              Built with cutting-edge technology to provide an exceptional experience for all users.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10 text-center">
              <div className="group">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-base sm:text-lg font-semibold text-muted-foreground">System Availability</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Always accessible when you need it</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">100%</div>
                <div className="text-base sm:text-lg font-semibold text-muted-foreground">Data Security</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Enterprise-grade protection</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <div className="text-base sm:text-lg font-semibold text-muted-foreground">Lightning Fast</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Optimized performance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>;
};
export default LandingPage;