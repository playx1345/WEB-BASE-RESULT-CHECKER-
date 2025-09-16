import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Bell, Download, User, BookOpen, HelpCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  disabled?: boolean;
}

interface QuickActionsProps {
  onViewResults?: () => void;
  onViewProfile?: () => void;
  onViewAnnouncements?: () => void;
  feeStatus?: string;
}

export function QuickActions({ 
  onViewResults, 
  onViewProfile, 
  onViewAnnouncements,
  feeStatus = 'paid'
}: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      title: 'View Results',
      description: 'Check your latest academic results',
      icon: <FileText className="h-5 w-5" />,
      action: () => onViewResults?.(),
      variant: 'default',
      disabled: feeStatus !== 'paid'
    },
    {
      title: 'Academic Calendar',
      description: 'View important dates and deadlines',
      icon: <Calendar className="h-5 w-5" />,
      action: () => console.log('Calendar clicked'),
      variant: 'outline'
    },
    {
      title: 'Announcements',
      description: 'Read latest updates from faculty',
      icon: <Bell className="h-5 w-5" />,
      action: () => onViewAnnouncements?.(),
      variant: 'outline'
    },
    {
      title: 'Download Transcript',
      description: 'Get official academic transcript',
      icon: <Download className="h-5 w-5" />,
      action: () => console.log('Transcript download clicked'),
      variant: 'outline',
      disabled: feeStatus !== 'paid'
    },
    {
      title: 'Update Profile',
      description: 'Manage your personal information',
      icon: <User className="h-5 w-5" />,
      action: () => onViewProfile?.(),
      variant: 'outline'
    },
    {
      title: 'Course Registration',
      description: 'Register for next semester courses',
      icon: <BookOpen className="h-5 w-5" />,
      action: () => console.log('Course registration clicked'),
      variant: 'outline'
    },
    {
      title: 'Help & Support',
      description: 'Get assistance with platform usage',
      icon: <HelpCircle className="h-5 w-5" />,
      action: () => console.log('Help clicked'),
      variant: 'secondary'
    },
    {
      title: 'Settings',
      description: 'Customize your preferences',
      icon: <Settings className="h-5 w-5" />,
      action: () => console.log('Settings clicked'),
      variant: 'secondary'
    }
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used features and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:scale-105 transition-transform duration-200"
              onClick={action.action}
              disabled={action.disabled}
            >
              <div className="p-2 rounded-full bg-primary/10">
                {action.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        {feeStatus !== 'paid' && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Some features are restricted until fees are paid. 
              Please complete your payment to access all services.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}