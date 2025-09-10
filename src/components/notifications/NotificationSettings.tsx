import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Loader2 } from 'lucide-react';

const notificationTypes = [
  {
    key: 'grade_posted',
    title: 'New Grades Posted',
    description: 'Get notified when new grades are posted for your courses',
  },
  {
    key: 'grade_updated',
    title: 'Grade Updates',
    description: 'Get notified when your existing grades are updated',
  },
  {
    key: 'announcement',
    title: 'Announcements',
    description: 'Get notified about important announcements and updates',
  },
  {
    key: 'system',
    title: 'System Notifications',
    description: 'Get notified about system maintenance and updates',
  },
];

export function NotificationSettings() {
  const { preferences, loading, updatePreferenceByType } = useNotificationPreferences();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (
    notificationType: string,
    field: 'in_app_enabled' | 'email_enabled' | 'sms_enabled',
    value: boolean
  ) => {
    setUpdating(`${notificationType}-${field}`);
    
    try {
      await updatePreferenceByType(notificationType, {
        [field]: value,
      });
      
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getPreference = (notificationType: string) => {
    return preferences.find(pref => pref.notification_type === notificationType);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground">
          Manage how you receive notifications about grades and announcements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified for different types of updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((type, index) => {
            const preference = getPreference(type.key);
            
            return (
              <div key={type.key}>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{type.title}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* In-App Notifications */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`${type.key}-in-app`} className="text-sm">
                          In-app
                        </Label>
                      </div>
                      <Switch
                        id={`${type.key}-in-app`}
                        checked={preference?.in_app_enabled || false}
                        onCheckedChange={(checked) => 
                          handleToggle(type.key, 'in_app_enabled', checked)
                        }
                        disabled={updating === `${type.key}-in_app_enabled`}
                      />
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`${type.key}-email`} className="text-sm">
                          Email
                        </Label>
                      </div>
                      <Switch
                        id={`${type.key}-email`}
                        checked={preference?.email_enabled || false}
                        onCheckedChange={(checked) => 
                          handleToggle(type.key, 'email_enabled', checked)
                        }
                        disabled={updating === `${type.key}-email_enabled`}
                      />
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`${type.key}-sms`} className="text-sm">
                          SMS
                        </Label>
                      </div>
                      <Switch
                        id={`${type.key}-sms`}
                        checked={preference?.sms_enabled || false}
                        onCheckedChange={(checked) => 
                          handleToggle(type.key, 'sms_enabled', checked)
                        }
                        disabled={updating === `${type.key}-sms_enabled`}
                      />
                    </div>
                  </div>
                </div>
                
                {index < notificationTypes.length - 1 && <Separator className="mt-6" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
          <CardDescription>
            Information about how notifications are delivered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">In-app notifications</span> appear immediately in your notification center
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Email notifications</span> are sent to your registered email address (coming soon)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">SMS notifications</span> are sent to your registered phone number (coming soon)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}