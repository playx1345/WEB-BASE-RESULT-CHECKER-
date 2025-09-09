import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, User, AlertTriangle } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'student' | 'admin';
  phone_number: string | null;
  user_id: string;
  created_at: string | null;
  level: string | null;
  matric_number: string | null;
}

interface UserPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserProfile | null;
  actionType: 'promote' | 'demote';
}

export function UserPromotionModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  actionType,
}: UserPromotionModalProps) {
  if (!user) return null;

  const isPromotion = actionType === 'promote';
  const newRole = isPromotion ? 'admin' : 'student';
  const currentRole = user.role;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {isPromotion ? (
              <Shield className="h-6 w-6 text-primary" />
            ) : (
              <User className="h-6 w-6 text-orange-600" />
            )}
            <AlertDialogTitle>
              {isPromotion ? 'Promote User to Admin' : 'Demote User to Student'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p>
                  You are about to {isPromotion ? 'promote' : 'demote'}{' '}
                  <strong>{user.full_name || 'Unknown User'}</strong> from{' '}
                  <strong>{currentRole}</strong> to <strong>{newRole}</strong>.
                </p>
              </div>
            </div>
            
            <div className="pl-6 space-y-2">
              <p className="text-sm">
                <strong>User Details:</strong>
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Name: {user.full_name || 'N/A'}</li>
                <li>Current Role: {currentRole}</li>
                <li>Matric Number: {user.matric_number || 'N/A'}</li>
                {user.phone_number && <li>Phone: {user.phone_number}</li>}
              </ul>
            </div>

            <div className="pl-6 space-y-2">
              <p className="text-sm">
                <strong>
                  {isPromotion ? 'Admin privileges include:' : 'This action will remove:'}
                </strong>
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Access to admin dashboard</li>
                <li>User management capabilities</li>
                <li>Student records management</li>
                <li>System analytics and reports</li>
                <li>Announcement management</li>
              </ul>
            </div>

            <p className="font-medium text-foreground">
              {isPromotion 
                ? 'Are you sure you want to grant admin privileges to this user?' 
                : 'Are you sure you want to revoke admin privileges from this user?'
              }
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isPromotion 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-orange-600 hover:bg-orange-600/90'
            }
          >
            {isPromotion ? 'Promote to Admin' : 'Demote to Student'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}