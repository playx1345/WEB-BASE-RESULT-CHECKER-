# Audit Log and Activity Tracking

This document describes the audit log and activity tracking system implemented for the Barkin Grade Access system.

## Overview

The audit log system provides comprehensive tracking of user activities and data changes for security, compliance, and transparency purposes. All activities are recorded with detailed metadata and are accessible to administrators through a dedicated audit log viewer.

## Features

### Automatic Database Auditing
- **Database Triggers**: Automatically log all INSERT, UPDATE, and DELETE operations on key tables:
  - `results` - Student academic results
  - `students` - Student records
  - `profiles` - User profiles
  - `announcements` - System announcements

### Manual Activity Tracking
- **User Authentication**: Login/logout events with metadata
- **Page Access**: Track when users access different views/pages
- **Data Viewing**: Log when sensitive data is accessed
- **Profile Updates**: Track user profile modifications

### Admin Audit Viewer
- **Comprehensive Dashboard**: View all system activities in one place
- **Advanced Filtering**: Filter by user, action type, table, date range
- **Search Functionality**: Search across actions, users, and tables
- **Statistics**: Activity summaries and trends
- **Pagination**: Efficient loading of large audit logs

## Database Schema

### `audit_logs` Table
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Security Features
- **Row Level Security (RLS)**: Only admins can view audit logs
- **Authenticated Logging**: All users can create audit entries
- **Automatic Triggers**: Database-level auditing cannot be bypassed
- **Comprehensive Metadata**: IP addresses, user agents, and custom metadata

## Usage

### For Administrators
1. Navigate to Admin Dashboard
2. Click on "Audit Logs" in the sidebar
3. Use filters to find specific activities:
   - Filter by action type (Login, Create, Update, Delete, View)
   - Filter by table (Results, Students, Profiles, Announcements)
   - Filter by date range
   - Search by user name or action

### Tracked Activities
- `user_login` - User authentication events
- `user_logout` - User sign-out events
- `user_signup` - New user registrations
- `view_results` - Access to results page
- `view_student_profile` - Profile page access
- `access_admin_dashboard` - Admin dashboard access
- `view_audit_logs` - Audit log page access
- `update_profile` - Profile modifications
- `insert_*` - Record creation (via triggers)
- `update_*` - Record modifications (via triggers)
- `delete_*` - Record deletions (via triggers)

## Implementation Details

### Audit Logger Utility (`src/lib/auditLogger.ts`)
- Provides TypeScript functions for manual activity logging
- Handles metadata collection (IP, user agent, timestamps)
- Includes React hook for easy component integration

### Database Functions
- `log_user_activity()` - Manual activity logging function
- `audit_trigger_function()` - Automatic trigger function for data changes

### Admin Components
- `AdminAuditLogsView` - Main audit log viewer component
- Integrated into existing admin dashboard navigation

### Activity Tracking Integration
- Authentication system (`useAuth`) - Logs login/logout events
- Page components - Log page access and data viewing
- Forms - Log data modifications

## Benefits

1. **Security Monitoring**: Track unauthorized access attempts and suspicious activities
2. **Compliance**: Meet regulatory requirements for data access logging
3. **Transparency**: Provide clear audit trail for all system changes
4. **Debugging**: Help diagnose issues by reviewing user actions
5. **Performance**: Understand system usage patterns

## Future Enhancements

- **Real-time Notifications**: Alert administrators to suspicious activities
- **Export Functionality**: Download audit logs for external analysis
- **Advanced Analytics**: Charts and trends for activity patterns
- **Retention Policies**: Automatic cleanup of old audit entries
- **API Access**: Programmatic access to audit data

## Privacy Considerations

- Audit logs contain user activity data and should be protected accordingly
- Only administrators have access to audit logs
- Personal identifiable information is logged minimally
- Consider data retention policies based on organizational requirements