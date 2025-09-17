import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react';

const TwoFactorSettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user, check2FAStatus, enable2FA, sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentStatus();
  }, [user, check2FAStatus]);

  const checkCurrentStatus = async () => {
    if (!user) return;
    
    try {
      const { enabled, error } = await check2FAStatus();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to check 2FA status",
          variant: "destructive",
        });
      } else {
        setIs2FAEnabled(enabled);
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!user?.email) return;
    
    if (!is2FAEnabled) {
      // Enabling 2FA - send OTP for verification
      setLoading(true);
      const { error } = await sendOTP(user.email);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to send verification code",
          variant: "destructive",
        });
        setLoading(false);
      } else {
        setIsVerifying(true);
        setLoading(false);
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the 6-digit code",
        });
      }
    } else {
      // Disabling 2FA
      setLoading(true);
      const { error } = await enable2FA(false);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to disable 2FA",
          variant: "destructive",
        });
      } else {
        setIs2FAEnabled(false);
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
      }
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!user?.email || otpValue.length !== 6) return;
    
    setLoading(true);
    
    try {
      const { error: verifyError } = await verifyOTP(user.email, otpValue);
      
      if (verifyError) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect or expired",
          variant: "destructive",
        });
      } else {
        // OTP verified, now enable 2FA
        const { error: enableError } = await enable2FA(true);
        
        if (enableError) {
          toast({
            title: "Error",
            description: "Failed to enable 2FA",
            variant: "destructive",
          });
        } else {
          setIs2FAEnabled(true);
          setIsVerifying(false);
          setOtpValue('');
          toast({
            title: "2FA Enabled",
            description: "Two-factor authentication has been enabled for your account",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelVerification = () => {
    setIsVerifying(false);
    setOtpValue('');
  };

  if (loading && !isVerifying) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {is2FAEnabled ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <ShieldOff className="h-5 w-5 text-gray-500" />
          )}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {is2FAEnabled 
            ? "Your account is protected with two-factor authentication"
            : "Add an extra layer of security to your account"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerifying ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter verification code</Label>
              <p className="text-sm text-muted-foreground mb-4">
                We've sent a 6-digit code to {user?.email}
              </p>
              <InputOTP
                value={otpValue}
                onChange={setOtpValue}
                maxLength={6}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyOTP} 
                disabled={loading || otpValue.length !== 6}
                className="flex-1"
              >
                {loading ? "Verifying..." : "Verify & Enable 2FA"}
              </Button>
              <Button 
                variant="outline" 
                onClick={cancelVerification}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Status: <span className={`font-medium ${is2FAEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {is2FAEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </p>
              {!is2FAEnabled && (
                <p className="text-sm text-muted-foreground mt-2">
                  When enabled, you'll need to enter a code sent to your email each time you sign in.
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleToggle2FA}
              disabled={loading}
              variant={is2FAEnabled ? "destructive" : "default"}
            >
              {loading 
                ? (is2FAEnabled ? "Disabling..." : "Enabling...") 
                : (is2FAEnabled ? "Disable 2FA" : "Enable 2FA")
              }
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSettings;