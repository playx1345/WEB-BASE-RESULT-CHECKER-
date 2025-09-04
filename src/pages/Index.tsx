import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Target, Eye, Users, BookOpen, Award, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <School className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Online Result Checker System
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Plateau State Polytechnic Barkin Ladi<br />
              Department of Computer Science
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/dashboard")}
                  className="text-lg px-8 py-3"
                >
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="text-lg px-8 py-3"
                  >
                    Student Login <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="text-lg px-8 py-3"
                  >
                    Admin Login
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Vision and Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Eye className="h-6 w-6 text-primary" />
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To revolutionize academic transparency and efficiency through a secure, 
                    accessible, and intelligent result management system—empowering students 
                    and administrators of the Department of Computer Science with real-time 
                    academic insights and digital autonomy.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Target className="h-6 w-6 text-primary" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      • To develop a user-friendly web-based platform that simplifies result access, 
                      fee verification, and academic performance tracking for ND1 and ND2 students.
                    </p>
                    <p>
                      • To uphold data integrity, security, and accessibility using modern web 
                      technologies and cloud infrastructure.
                    </p>
                    <p>
                      • To foster digital transformation within the Department of Computer Science 
                      by automating administrative tasks and enhancing communication between students and faculty.
                    </p>
                    <p>
                      • To support academic excellence by providing timely feedback, personalized 
                      performance analytics, and seamless result printing capabilities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">System Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Student Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Secure login with matric number</li>
                    <li>• View ND1 and ND2 results</li>
                    <li>• Fee verification system</li>
                    <li>• Print results as PDF</li>
                    <li>• Profile management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Academic Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Real-time GP calculation</li>
                    <li>• Cumulative Grade Point (CGP)</li>
                    <li>• Carryover tracking</li>
                    <li>• Semester-wise results</li>
                    <li>• Performance analytics</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Admin Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Student account creation</li>
                    <li>• Result upload and management</li>
                    <li>• Fee payment verification</li>
                    <li>• Announcement system</li>
                    <li>• Comprehensive dashboard</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
