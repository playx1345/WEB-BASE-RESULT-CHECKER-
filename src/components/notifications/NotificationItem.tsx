import { formatDistanceToNow } from 'date-fns';
import { GraduationCap, AlertCircle, Megaphone, Info, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'grade_posted':
    case 'grade_updated':
      return <GraduationCap className="h-4 w-4" />;
    case 'announcement':
      return <Megaphone className="h-4 w-4" />;
    case 'system':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'grade_posted':
      return 'text-green-600';
    case 'grade_updated':
      return 'text-blue-600';
    case 'announcement':
      return 'text-purple-600';
    case 'system':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-auto p-4 text-left justify-start hover:bg-muted/50 rounded-none",
        !notification.is_read && "bg-muted/20"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Icon */}
        <div className={cn("mt-0.5 flex-shrink-0", getNotificationColor(notification.notification_type))}>
          {getNotificationIcon(notification.notification_type)}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium leading-tight",
              !notification.is_read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.is_read && (
                <Circle className="h-2 w-2 fill-blue-600 text-blue-600" />
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at || ''), { 
                  addSuffix: true 
                })}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>

          {/* Metadata Display */}
          {notification.metadata && (
            <div className="text-xs text-muted-foreground">
              {notification.notification_type === 'grade_posted' && (
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium">{(notification.metadata as any)?.course_code}</span>
                  <span>•</span>
                  <span>{(notification.metadata as any)?.semester} semester</span>
                </span>
              )}
              {notification.notification_type === 'grade_updated' && (
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium">{(notification.metadata as any)?.course_code}</span>
                  <span>•</span>
                  <span>{(notification.metadata as any)?.old_grade} → {(notification.metadata as any)?.new_grade}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Button>
  );
}