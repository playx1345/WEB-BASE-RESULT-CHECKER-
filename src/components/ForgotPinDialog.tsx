import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Phone, ArrowLeft, CheckCircle2, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';

type Step = 'matric' | 'verify' | 'new_pin' | 'success';

interface ForgotPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPinDialog = ({ open, onOpenChange }: ForgotPinDialogProps) => {
  const [step, setStep] = useState<Step>('matric');
  const [matricNumber, setMatricNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [maskedContact, setMaskedContact] = useState('');

  const resetState = () => {
    setStep('matric');
    setMatricNumber('');
    setVerificationCode('');
    setNewPin('');
    setConfirmPin('');
    setShowPin(false);
    setMaskedContact('');
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matricNumber.trim()) {
      toast({
        title: "Required",
        description: "Please enter your matric number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-pin', {
        body: {
          action: 'request_reset',
          matric_number: matricNumber.trim(),
          method: 'sms'
        }
      });

      if (error) throw error;

      if (data.success) {
        if (data.method === 'contact_admin') {
          toast({
            title: "Contact Required",
            description: data.message,
          });
        } else {
          setMaskedContact(data.masked_contact || '');
          setStep('verify');
          toast({
            title: "Code Sent",
            description: "A verification code has been sent to your phone",
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send reset code",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Reset request error:', error);
      toast({
        title: "Error",
        description: "Failed to send reset code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setStep('new_pin');
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 6 digits",
        variant: "destructive"
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-pin', {
        body: {
          action: 'verify_reset',
          matric_number: matricNumber.trim(),
          token: verificationCode,
          new_pin: newPin
        }
      });

      if (error) throw error;

      if (data.success) {
        setStep('success');
        toast({
          title: "Success!",
          description: "Your PIN has been reset successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset PIN",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('PIN reset error:', error);
      toast({
        title: "Error",
        description: "Failed to reset PIN. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {step === 'success' ? 'PIN Reset Complete' : 'Reset Your PIN'}
          </DialogTitle>
          <DialogDescription>
            {step === 'matric' && "Enter your matric number to receive a verification code"}
            {step === 'verify' && `Enter the 6-digit code sent to ${maskedContact}`}
            {step === 'new_pin' && "Create a new 6-digit PIN"}
            {step === 'success' && "Your PIN has been updated successfully"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Enter Matric Number */}
        {step === 'matric' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-matric">Matric Number</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-matric"
                  placeholder="e.g., ND/22/COM/1234"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                A verification code will be sent to your registered phone number
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Enter Verification Code */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification Code</Label>
              <Input
                id="verify-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Code expires in 15 minutes
            </p>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('matric')}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Verify Code
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Set New PIN */}
        {step === 'new_pin' && (
          <form onSubmit={handleResetPin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pin">New PIN</Label>
              <div className="relative">
                <Input
                  id="new-pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Enter 6-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pr-10"
                  maxLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type={showPin ? "text" : "password"}
                placeholder="Confirm 6-digit PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('verify')}
                className="flex-1"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset PIN'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">PIN Reset Successful!</p>
              <p className="text-sm text-muted-foreground">
                You can now log in with your new PIN
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close & Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
