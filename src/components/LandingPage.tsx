import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ChevronRight, Users, BookOpen, Award } from 'lucide-react';
const LandingPage = () => {
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
            <img src="/assets/logo.svg" alt="Plateau State Polytechnic Barkin Ladi Logo" className="w-28 h-28" />
          </div>
          
          {/* School Information */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
              Plateau State Polytechnic
              <span className="block text-4xl md:text-5xl text-primary/80">Barkin Ladi</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-secondary-foreground max-w-3xl">
              School of Information and Communication Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Department of Computer Science - Online Result Checker
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <a href="/auth" className="flex items-center">
                Check Your Results
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              <a href="/auth">Student Portal</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Why Choose PSPBL?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leading the way in technical education with modern facilities and innovative learning approaches
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-primary mb-3">Expert Faculty</h4>
              <p className="text-muted-foreground">Learn from industry professionals and experienced educators</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-primary mb-3">Modern Curriculum</h4>
              <p className="text-muted-foreground">Up-to-date courses aligned with industry standards</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-primary mb-3">Excellence</h4>
              <p className="text-muted-foreground">Recognized for quality education and student success</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-3xl mx-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Our Foundation</h3>
            <p className="text-lg text-muted-foreground">Built on strong values and clear direction</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vision Card */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-primary flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-700">
                  To be a leading polytechnic institution in Nigeria, recognized for excellence in 
                  technical education, innovation, and the development of skilled professionals 
                  who contribute meaningfully to national development and global competitiveness.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-primary flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-700">
                  To provide quality technical and vocational education that empowers students with 
                  practical skills, knowledge, and values necessary for productive careers, 
                  entrepreneurship, and lifelong learning in an ever-evolving technological landscape.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>;
};
export default LandingPage;