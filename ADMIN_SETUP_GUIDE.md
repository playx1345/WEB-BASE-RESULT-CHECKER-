# Admin User Account Setup Guide

This document provides comprehensive instructions for setting up the admin user account in the Barkin Grade Access system.

## Overview

The system requires an admin account to be created before the application can be properly managed. The admin account provides access to:

- Student management (create, update, view students)
- Result management (upload, modify, approve results)
- Announcement management (create, update, delete announcements)
- User role management
- System administration

## Quick Setup

### 1. Environment Configuration

Ensure your `.env` file contains the required Supabase configuration:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for admin creation and should be kept secure.

### 2. Create Admin Account

Run one of the following commands:

```bash
# Option 1: Using the quick setup script
npm run setup-admin

# Option 2: Using the configurable script
npm run create-admin

# Option 3: Direct execution
node scripts/setup-admin-now.js
```

### 3. Verify Setup

```bash
# Check if admin setup is complete
npm run verify-admin
```

### 4. Test Login

- Navigate to the login page
- Select "Admin" tab
- Use credentials:
  - **Email:** `admin@plateau.edu.ng`
  - **Password:** `Admin123456`

## Detailed Process

### Admin Account Components

The admin account consists of three main components:

1. **Auth User**: Created in `auth.users` table with email/password authentication
2. **Profile**: Created in `profiles` table with role='admin'
3. **Admin Record**: Created in `admins` table with permissions and department info

### Database Triggers

The system uses database triggers to automatically create profiles and admin records:

- `handle_new_user()`: Triggered on user creation to create profile
- `setup_admin_for_user()`: Function to manually setup admin components
- `check_admin_setup()`: Function to verify admin setup completeness

### Admin Permissions

Default admin permissions include:

```json
{
  "manage_students": true,
  "manage_results": true,
  "manage_announcements": true,
  "manage_admins": true
}
```

Admin level is set to 'super' by default, providing full system access.

## Troubleshooting

### Common Issues

#### 1. "Admin account may not exist" Error

**Solution:**
```bash
npm run setup-admin
```

#### 2. "Email not confirmed" Error

The setup script automatically confirms the email. If you see this error:

1. Check database for the admin user
2. Run the setup script again
3. Contact system administrator if issue persists

#### 3. Network Connectivity Issues

If you can't connect to Supabase:

1. Verify your internet connection
2. Check SUPABASE_URL in .env file
3. Ensure Supabase project is active
4. Verify service role key is correct

#### 4. Profile or Admin Record Missing

If login works but admin permissions are missing:

```bash
# Check what's missing
npm run verify-admin

# Fix missing components
npm run setup-admin
```

### Manual Verification

You can manually check admin setup using Supabase dashboard:

1. **Check auth.users**: Look for user with email '<admin@plateau.edu.ng>'
2. **Check profiles**: Verify profile exists with role='admin'
3. **Check admins**: Ensure admin record exists with proper permissions

## Scripts Reference

### setup-admin-now.js

Quick setup script with hardcoded credentials. Automatically:

- Creates admin user if not exists
- Creates profile and admin record
- Handles existing user scenarios
- Provides detailed feedback

### create-admin.js

Configurable script that accepts email/password parameters:
```bash
node scripts/create-admin.js --email admin@example.com --password MyPassword123
```

### verify-admin-setup.js
Verification script that checks:

- Environment configuration
- Migration files
- Script files
- Authentication components
- UI configuration

## Security Notes

1. **Service Role Key**: Keep the service role key secure and never commit it to version control
2. **Default Password**: Change the default admin password after first login
3. **Admin Permissions**: Review admin permissions based on your security requirements
4. **Database Access**: The service role key provides full database access

## Advanced Configuration

### Custom Admin Email

To use a different admin email, modify the scripts:

```javascript
// In scripts/setup-admin-now.js
const ADMIN_EMAIL = 'your-admin@domain.com';
const ADMIN_PASSWORD = 'YourSecurePassword';
```

### Custom Permissions

Modify the admin permissions in the setup function:

```javascript
permissions: {
  manage_students: true,
  manage_results: true,
  manage_announcements: false, // Disable if needed
  manage_admins: true
}
```

### Department Assignment

Change the default department:

```javascript
department: 'Your Department Name'
```

## Migration Information

The system includes several migrations for admin functionality:

- `20250122000001_auth_hooks_and_triggers.sql`: Core auth triggers
- `20250922083054_32569b56-f5ad-48b3-9b47-2247e8c56b38.sql`: Admins table
- `20250125000000_enhance_admin_creation.sql`: Enhanced admin functions

Ensure all migrations are applied before creating admin accounts.

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `npm run verify-admin` for diagnostic information
3. Review console logs for detailed error messages
4. Check Supabase dashboard for database state
5. Contact the development team for additional support

---

**Default Admin Credentials:**

- Email: `admin@plateau.edu.ng`
- Password: `Admin123456`

**Remember to change the default password after first login!**