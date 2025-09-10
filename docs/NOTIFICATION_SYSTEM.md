# Grade Notification System

This document describes the Grade Notification System implemented for the Plateau State Polytechnic Barkin Ladi student portal.

## Overview

The notification system provides real-time notifications to students when their grades are posted or updated. It includes both in-app notifications and the foundation for email/SMS notifications.

## Features

### For Students
- **Real-time Notifications**: Automatic notifications when grades are posted or updated
- **Notification Bell**: Visual indicator with unread count badge
- **Notification List**: Dropdown list showing recent notifications
- **Notification Settings**: Configurable preferences for different notification types
- **Mark as Read**: Individual and bulk mark-as-read functionality

### For Administrators
- **Send Notifications**: Send custom notifications to all students or specific levels
- **Notification Management**: View all sent notifications and their status
- **Statistics**: Dashboard showing notification metrics
- **Notification History**: Complete history of sent notifications

## Database Schema

### Tables Added

1. **notifications**
   - Stores individual notifications sent to users
   - Includes metadata for grade-related information
   - Tracks read/unread status

2. **notification_preferences**
   - User-specific preferences for notification types
   - Supports in-app, email, and SMS preferences
   - Default preferences created automatically for new users

### Triggers

- **Grade Posted**: Automatically creates notifications when new results are inserted
- **Grade Updated**: Creates notifications when existing grades are modified

## Components

### Student Components
- `NotificationBell` - Bell icon with notification count
- `NotificationList` - Dropdown notification list
- `NotificationItem` - Individual notification display
- `NotificationSettings` - User preference management

### Admin Components
- `AdminNotificationView` - Complete notification management interface

## Hooks

- `useNotifications` - Manages notification data and real-time updates
- `useNotificationPreferences` - Handles user notification preferences

## API Functions

### Database Functions
- `mark_notification_read(notification_id)` - Mark single notification as read
- `mark_all_notifications_read()` - Mark all user notifications as read
- `get_unread_notification_count()` - Get count of unread notifications

### Triggers
- `notify_grade_posted()` - Triggered on new result insertion
- `notify_grade_updated()` - Triggered on result updates

## Real-time Features

The system uses Supabase real-time subscriptions to:
- Instantly show new notifications to users
- Update notification counts in real-time
- Reflect read status changes immediately

## Notification Types

1. **grade_posted** - New grade posted
2. **grade_updated** - Existing grade updated
3. **announcement** - Administrative announcements
4. **system** - System notifications

## Security

- Row Level Security (RLS) policies ensure users only see their own notifications
- Admins can create notifications for all users
- User preferences are private to each user

## Future Enhancements

### Email Notifications
The system includes placeholder configuration for email notifications. To implement:
1. Configure email service (SendGrid, Mailgun, etc.)
2. Create email templates
3. Add email sending logic to notification triggers

### SMS Notifications
Similar to email, SMS notifications can be added by:
1. Integrating SMS service (Twilio, etc.)
2. Adding phone number validation
3. Creating SMS templates

## Usage

### Student Usage
1. Notifications appear automatically when grades are posted/updated
2. Click the bell icon to view notifications
3. Access notification settings from the sidebar
4. Configure preferences for different notification types

### Admin Usage
1. Navigate to "Notifications" in admin sidebar
2. Send notifications using the "Send Notification" tab
3. View notification history and statistics
4. Manage notification settings

## Technical Notes

- Built with React, TypeScript, and Supabase
- Uses shadcn/ui components for consistent design
- Real-time updates via Supabase subscriptions
- Proper TypeScript typing for all components
- Responsive design for mobile compatibility