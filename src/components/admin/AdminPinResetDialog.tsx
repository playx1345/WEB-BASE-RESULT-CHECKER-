import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActivityLogger } from '@/lib/auditLogger';

interface AdminPinResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    matric_number: string;
    profile?: {
      full_name: string;
    };
  } | null;
  onSuccess?: () => void;
}

export function AdminPinResetDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: AdminPinResetDialogProps) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetting, setResetting] = useState(false);
  const [errors, setErrors] = useState<{ newPin?: string; confirmPin?: string }>({});
  const { logActivity } = useActivityLogger();

  const validateForm = (): boolean => {
    const newErrors: { newPin?: string; confirmPin?: string } = {};

    if (!newPin) {
      newErrors.newPin = 'New PIN is required';
    } else if (newPin.length < 4 || newPin.length > 8) {
      newErrors.newPin = 'PIN must be between 4 and 8 characters';
    } else if (!/^\d+$/.test(newPin)) {
      newErrors.newPin = 'PIN must contain only numbers';
    }

    if (!confirmPin) {
      newErrors.confirmPin = 'Please confirm the PIN';
    } else if (newPin !== confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!student || !validateForm()) return;

    setResetting(true);
    try {
      // Call the Supabase function to reset PIN
      const { data, error } = await supabase.rpc('admin_reset_student_pin', {
        student_id: student.id,
        new_pin: newPin,
      });

      if (error) throw error;

      // Log the PIN reset activity
      await logActivity('reset_pin', {
        tableName: 'students',
        recordId: student.id,
        metadata: {
          action: 'admin_reset_student_pin',
          matricNumber: student.matric_number,
          studentName: student.profile?.full_name || 'Unknown',
        },
      });

      toast.success(`PIN reset successfully for ${student.matric_number}`);
      setNewPin('');
      setConfirmPin('');
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error resetting PIN:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset PIN. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResetting(false);
    }
  };

  const handleClose = () => {
    setNewPin('');
    setConfirmPin('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reset Student PIN
          </DialogTitle>
          <DialogDescription>
            Reset the PIN for{' '}
            <span className="font-semibold">{student?.profile?.full_name || 'this student'}</span>
            {' '}({student?.matric_number})
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-500">
            The new PIN will be securely hashed and stored. Make sure to share it with the student.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPin">New PIN</Label>
            <Input
              id="newPin"
              type="password"
              value={newPin}
              onChange={(e) => {
                setNewPin(e.target.value);
                if (errors.newPin) {
                  setErrors({ ...errors, newPin: undefined });
                }
              }}
              placeholder="Enter new PIN (4-8 digits)"
              maxLength={8}
              className={errors.newPin ? 'border-destructive' : ''}
            />
            {errors.newPin && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newPin}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value);
                if (errors.confirmPin) {
                  setErrors({ ...errors, confirmPin: undefined });
                }
              }}
              placeholder="Re-enter new PIN"
              maxLength={8}
              className={errors.confirmPin ? 'border-destructive' : ''}
            />
            {errors.confirmPin && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPin}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={resetting}>
            Cancel
          </Button>
          <Button onClick={handleReset} disabled={resetting}>
            <Lock className="h-4 w-4 mr-2" />
            {resetting ? 'Resetting...' : 'Reset PIN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
