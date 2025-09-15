import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Terminal, User, Shield } from 'lucide-react';

export function AdminSetupInstructions() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Account Setup
          </CardTitle>
          <CardDescription>
            Follow these steps to create your first admin account and start using the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>Create Admin Account:</strong><br />
              Use the admin creation script or contact your system administrator to create the first admin account. Once created, you can login and manage the system.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Start Steps:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Login as Admin</p>
                  <p className="text-sm text-muted-foreground">
                    Use the three-dot menu in the header to access "Admin Login" and sign in with the credentials above.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Access Admin Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Once logged in, click "Admin Dashboard" from the menu to manage students, results, and system settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Create Students</p>
                  <p className="text-sm text-muted-foreground">
                    In the Students section, use "Add Student" to create student accounts. Students will login with their matric number and PIN (default: 112233).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Make sure to change the default admin password after first login and update student PINs as needed.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Code className="h-4 w-4" />
              System Features
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Student management with fee tracking</li>
              <li>• Results management and viewing</li>
              <li>• Announcements system</li>
              <li>• Audit logs and analytics</li>
              <li>• Role-based access control</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}