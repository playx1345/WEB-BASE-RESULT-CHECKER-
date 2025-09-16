import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, AlertCircle, FileText, Bell, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'result' | 'announcement' | 'profile' | 'system' | 'deadline';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'completed' | 'pending' | 'warning';
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities?: Activity[];
  maxItems?: number;
}

export function ActivityTimeline({ activities = [], maxItems = 10 }: ActivityTimelineProps) {
  // Mock data if not provided
  const defaultActivities: Activity[] = activities.length > 0 ? activities : [
    {
      id: '1',
      type: 'result',
      title: 'New Results Available',
      description: 'Computer Networks (CSC 301) results have been published',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed'
    },
    {
      id: '2',
      type: 'announcement',
      title: 'Academic Calendar Update',
      description: 'Second semester examination dates have been announced',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      id: '3',
      type: 'deadline',
      title: 'Fee Payment Reminder',
      description: 'School fees payment deadline is approaching (7 days remaining)',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      status: 'warning'
    },
    {
      id: '4',
      type: 'result',
      title: 'Grade Update',
      description: 'Database Systems (CSC 205) - Grade: B (78%)',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'completed'
    },
    {
      id: '5',
      type: 'system',
      title: 'Profile Updated',
      description: 'Contact information has been successfully updated',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'completed'
    },
    {
      id: '6',
      type: 'announcement',
      title: 'Course Registration Open',
      description: 'Registration for 2024/2 semester is now available',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: '7',
      type: 'deadline',
      title: 'Assignment Submission',
      description: 'Software Engineering project submission due tomorrow',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'pending'
    },
  ];

  const displayActivities = defaultActivities.slice(0, maxItems);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'result':
        return <FileText className="h-4 w-4" />;
      case 'announcement':
        return <Bell className="h-4 w-4" />;
      case 'profile':
        return <User className="h-4 w-4" />;
      case 'deadline':
        return <Calendar className="h-4 w-4" />;
      case 'system':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status?: Activity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'result':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'announcement':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'profile':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'deadline':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest academic updates and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm truncate">
                      {activity.title}
                    </h4>
                    {activity.status && getStatusIcon(activity.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                    
                    <Badge variant="outline" className="text-xs capitalize">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {defaultActivities.length > maxItems && (
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-xs">
              Showing {maxItems} of {defaultActivities.length} activities
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}