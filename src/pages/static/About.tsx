import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { departmentInfo } from '@/data/contact';
import { GraduationCap, Award, Users, Building, BookOpen, Target, Heart, Star } from 'lucide-react';

const About = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-accent/5 -z-20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      {isMobile ? <MobileHeader /> : <SiteHeader />}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-500">
            <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            About Our Department
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Excellence in Computer Science Education Since {departmentInfo.establishedYear}
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {/* Mission Card */}
          <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold gradient-text">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <CardDescription className="text-center text-sm sm:text-base leading-relaxed text-foreground">
                {departmentInfo.mission}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Vision Card */}
          <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold gradient-text">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <CardDescription className="text-center text-sm sm:text-base leading-relaxed text-foreground">
                {departmentInfo.vision}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift mb-12 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">Our History</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-foreground text-center max-w-4xl mx-auto">
              {departmentInfo.history}
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift mb-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">Our Values</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {departmentInfo.values.map((value, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-3 sm:p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors duration-300"
                  style={{animationDelay: `${0.5 + index * 0.1}s`}}
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm sm:text-base text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {/* Facilities Card */}
          <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold gradient-text">Facilities</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                {departmentInfo.facilities.slice(0, 6).map((facility, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm text-foreground">{facility}</p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground italic pt-2">And {departmentInfo.facilities.length - 6} more...</p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold gradient-text">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                {departmentInfo.achievements.slice(0, 6).map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-accent to-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm text-foreground">{achievement}</p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground italic pt-2">And {departmentInfo.achievements.length - 6} more...</p>
              </div>
            </CardContent>
          </Card>

          {/* Partnerships Card */}
          <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group animate-fade-in-up md:col-span-2 lg:col-span-1" style={{animationDelay: '0.7s'}}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold gradient-text">Key Partnerships</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                {departmentInfo.partnerships.slice(0, 6).map((partnership, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm text-foreground">{partnership}</p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground italic pt-2">And {departmentInfo.partnerships.length - 6} more...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accreditation Section */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">Accreditation & Recognition</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {departmentInfo.accreditation.map((accred, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-3 sm:p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors duration-300"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full flex-shrink-0"></div>
                  <p className="text-sm sm:text-base text-foreground font-medium">{accred}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
};

export default About;