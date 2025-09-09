import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header Section */}
      <header className="container mx-auto px-4 py-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg">
            <img 
              src="/assets/logo.svg" 
              alt="Plateau State Polytechnic Barkin Ladi Logo" 
              className="w-24 h-24"
            />
          </div>
          
          {/* School Information */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Plateau State Polytechnic Barkin Ladi
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-secondary-foreground">
              School of Information and Communication Technology
            </h2>
            <p className="text-lg text-muted-foreground">
              Department of Computer Science - Online Result Checker
            </p>
          </div>
        </div>
      </header>

      {/* Action Buttons Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/auth"
              className="bg-primary text-primary-foreground px-6 py-4 rounded-lg hover:bg-primary/90 transition-colors font-medium text-center shadow-md hover:shadow-lg"
            >
              Student Login
            </a>
            <a
              href="/auth"
              className="bg-secondary text-secondary-foreground px-6 py-4 rounded-lg hover:bg-secondary/90 transition-colors font-medium text-center shadow-md hover:shadow-lg"
            >
              Admin Login
            </a>
            <a
              href="/auth"
              className="bg-accent text-accent-foreground px-6 py-4 rounded-lg hover:bg-accent/90 transition-colors font-medium text-center shadow-md hover:shadow-lg"
            >
              View My Results
            </a>
          </div>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vision Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  To be a leading polytechnic institution in Nigeria, recognized for excellence in 
                  technical education, innovation, and the development of skilled professionals 
                  who contribute meaningfully to national development and global competitiveness.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  To provide quality technical and vocational education that empowers students with 
                  practical skills, knowledge, and values necessary for productive careers, 
                  entrepreneurship, and lifelong learning in an ever-evolving technological landscape.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="container mx-auto px-4 py-8 mt-12">
        <div className="text-center border-t border-border pt-8">
          <p className="text-muted-foreground">
            © 2024 Plateau State Polytechnic Barkin Ladi. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            School of Information and Communication Technology - Building Future Tech Leaders
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;