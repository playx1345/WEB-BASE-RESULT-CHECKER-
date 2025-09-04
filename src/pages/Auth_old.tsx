import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, School, ArrowLeft, User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [studentLogin, setStudentLogin] = useState({
    matricNumber: '',
    pin: ''
  });
  const [adminLogin, setAdminLogin] = useState({
    username: '',
    password: ''
  });
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First, find the profile with the matric number
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, role')
        .eq('matric_number', studentLogin.matricNumber)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "Login Failed",
          description: "Invalid matric number. Please check and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get the user's email from auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin
        .getUserById(profiles.user_id);

      if (authError || !authUser.user) {
        toast({
          title: "Login Failed",
          description: "Account not found. Please contact administrator.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Try to sign in with email and PIN (or fallback to default PIN 2233)
      const { error } = await supabase.auth.signInWithPassword({
        email: authUser.user.email!,
        password: studentLogin.pin || '2233',
      });
      
      if (error) {
        toast({
          title: "Login Failed",
          description: "Invalid PIN. Please check and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome to your dashboard!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check for default admin credentials
      if (adminLogin.username === 'admin' && adminLogin.password === '123456') {
        // Look for admin user in database or create temporary admin session
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@plateaupolytechnic.edu.ng',
          password: '123456',
        });
        
        if (error) {
          // If admin doesn't exist, we might need to create it or handle differently
          toast({
            title: "Admin Setup Required",
            description: "Please contact system administrator to set up admin account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Admin Login Successful",
            description: "Welcome to admin dashboard!",
          });
          navigate('/admin');
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      });
      
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
export default Auth;