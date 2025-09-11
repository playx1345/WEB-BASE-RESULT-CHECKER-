import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ARIA_LABELS, useScreenReader } from '@/lib/accessibility';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const { announce } = useScreenReader();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      announce(`Marked notification "${notification.title}" as read`, 'polite');
    }
    
    // If notification has a link, navigate to it
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    announce('All notifications marked as read', 'polite');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`${ARIA_LABELS.notifications}${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                aria-hidden="true"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
              <span className="sr-only">{unreadCount} unread notifications</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" role="dialog" aria-label="Notifications">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" id="notifications-heading">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
                aria-describedby="notifications-heading"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96" aria-label="Notification list">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground" role="status">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div role="list">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 cursor-pointer border-b focus:bg-accent ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  role="listitem"
                  aria-describedby={`notification-${notification.id}`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="text-lg flex-shrink-0" aria-hidden="true">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0" id={`notification-${notification.id}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div 
                            className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" 
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}