import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, School, ArrowLeft, Shield } from 'lucide-react';

const AdminLogin = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  
  const { signIn, resetPassword, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Admin Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back, Administrator!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Please check your email for password reset instructions.",
        });
        setShowReset(false);
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-red-600 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold text-foreground">Administrator Login</h1>
          <p className="text-muted-foreground">Plateau State Polytechnic Barkin Ladi</p>
          <p className="text-sm text-muted-foreground mt-2">Department of Computer Science</p>
        </div>

        {showReset ? (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Reset Admin Password</CardTitle>
              <CardDescription>Enter your admin email to receive reset instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Admin Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    Send Reset Link
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowReset(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Admin Sign In</CardTitle>
              <CardDescription>
                Enter your administrator credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your admin email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={isVisible ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setIsVisible(!isVisible)}
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Sign In as Administrator
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-red-600 hover:text-red-700"
                    onClick={() => setShowReset(true)}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Not an administrator? {' '}
            <Link to="/auth" className="text-red-600 hover:text-red-700 underline">
              Go to general login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;