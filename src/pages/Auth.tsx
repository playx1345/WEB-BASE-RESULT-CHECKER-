import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Eye, EyeOff, User, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data for different login types
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: ''
  });
  
  const [studentForm, setStudentForm] = useState({
    matricNumber: '',
    pin: ''
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'admin') {
      setActiveTab('admin');
    }
  }, [searchParams]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.email || !adminForm.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(adminForm.email, adminForm.password, false);
      
      if (error) {
        setError(error.message || 'Login failed');
        toast.error('Login failed: ' + (error.message || 'Unknown error'));
      } else {
        toast.success('Successfully logged in!');
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.matricNumber || !studentForm.pin) {
      setError('Please fill in all fields');
      return;
    }

    if (studentForm.pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(studentForm.matricNumber, studentForm.pin, true);
      
      if (error) {
        setError(error.message || 'Invalid matric number or PIN');
        toast.error('Login failed: ' + (error.message || 'Invalid matric number or PIN'));
      } else {
        toast.success('Successfully logged in!');
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/plasu-logo.jpg" alt="PLASU Logo" className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Signing in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* School Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img src="/assets/plasu-logo.jpg" alt="PLASU Logo" className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">PLASU Portal</h1>
          <p className="text-sm text-muted-foreground">Plateau State University</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your login type and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Student Login */}
              <TabsContent value="student" className="space-y-4 mt-4">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricNumber">Matric Number</Label>
                    <Input
                      id="matricNumber"
                      type="text"
                      placeholder="Enter your matric number"
                      value={studentForm.matricNumber}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, matricNumber: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentPin">6-Digit PIN</Label>
                    <div className="relative">
                      <Input
                        id="studentPin"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your 6-digit PIN"
                        value={studentForm.pin}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className="w-full pr-10"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Default PIN is 112233. Contact admin to change your PIN.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In as Student'}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin" className="space-y-4 mt-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="Enter your admin email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In as Admin'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Students: Use your matric number and 6-digit PIN</p>
          <p>Admin: Use your email and password</p>
        </div>
      </div>
    </div>
  );
}