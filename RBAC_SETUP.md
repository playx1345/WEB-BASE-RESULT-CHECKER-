# Role-Based Access Control Setup Guide

## Overview
This document outlines how roles are assigned, checked, and enforced in the Barkin Ladi Grade Access system using Supabase Row Level Security (RLS) and custom database functions.

## User Roles
The system supports the following roles:
- **`admin`**: Full system access, can create/manage students, view all data
- **`student`**: Can view their own results (if fees are paid)
- **`teacher`**: Can manage courses and results (future enhancement)
- **`parent`**: Can view child's results (future enhancement)

## How Roles Are Stored
User roles are stored in the `profiles` table with a foreign key to the `auth.users` table:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  -- other fields...
);
```

## Role Assignment

### Admin Users
Admin users are created either:
1. **Using the creation script**: `npm run create-admin`
2. **Manual creation**: Using the demo admin account (see below)
3. **Database migration**: The system automatically creates a demo admin

### Student Users
Students are created by administrators through the admin dashboard:
- Admin logs in and navigates to the admin dashboard
- Uses "Create Student" functionality
- System automatically assigns `student` role

## Demo Admin Account
For testing purposes, a demo admin account is automatically created:
- **Email**: `admin@plateau.edu.ng`
- **Password**: `Admin123456`
- **Role**: `admin`

## Server-Side Role Verification

### Core Functions

#### `is_admin()` Function
Securely checks if the current user has admin role:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;
```

#### `check_user_role(required_role)` Function
General-purpose role checking:
```sql
CREATE OR REPLACE FUNCTION public.check_user_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = required_role::user_role
  );
END;
$$;
```

#### `admin_create_student()` Function
Protected function that only admins can use:
```sql
CREATE OR REPLACE FUNCTION public.admin_create_student(...)
RETURNS jsonb
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can create students. Current role: %', 
      (SELECT role FROM profiles WHERE user_id = auth.uid());
  END IF;
  
  -- Create student logic...
END;
$$;
```

## Row Level Security (RLS) Policies

### Profiles Table Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles (for creating students)
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Students Table Policies
```sql
-- Students can view their own data
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all students
CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Results Table Policies
```sql
-- Students can view their own results if fees paid
CREATE POLICY "Students can view their own results if fees paid" ON public.results
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid() AND s.fee_status = 'paid'
    )
  );

-- Admins can manage all results
CREATE POLICY "Admins can manage all results" ON public.results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Client-Side Role Checking

### Role Utilities (`src/lib/roleUtils.ts`)
The system provides helper functions for client-side role checking:

```typescript
import { isAdmin, verifyAdminAccess } from '@/lib/roleUtils';

// Check if current user is admin
const adminStatus = await isAdmin();

// Verify admin access with detailed response
const { hasAccess, message } = await verifyAdminAccess();
```

### ⚠️ Security Warning
**Client-side role checks are for UX purposes only!**
- They improve user experience by showing/hiding UI elements
- They are NOT authoritative for security
- All security-critical operations MUST be validated server-side
- Database functions and RLS policies provide the real security

## Testing Role-Based Permissions

### Test Scripts
Use the provided test scripts:
```bash
# Check admin setup
node scripts/check-admin.js

# Test role-based access control
node scripts/test-rbac.js
```

### Manual Testing Scenarios

#### Admin Login and Student Creation
1. **Admin Login Test**:
   - Navigate to `/auth`
   - Select "Admin" tab
   - Enter: `admin@plateau.edu.ng` / `Admin123456`
   - Should successfully log in

2. **Student Creation Test**:
   - As admin, navigate to admin dashboard
   - Click "Create Student"
   - Fill in student details
   - Should create successfully with generated PIN

3. **Unauthorized Access Test**:
   - Log out as admin
   - Try to access admin functions
   - Should be blocked with proper error messages

#### Student Login and Access
1. **Student Login Test**:
   - Use a created student's matric number and PIN
   - Should log in successfully

2. **Student Data Access Test**:
   - Student should see only their own data
   - Results visible only if fee status is "paid"

3. **Admin Function Access Test**:
   - Student tries to create another student
   - Should be blocked with "Only administrators can create students"

## Error Messages and Debugging

### Common Error Messages
- `"Authentication required: Please log in to create students"`
- `"Only administrators can create students. Current role: student"`
- `"User profile not found: Unable to verify permissions"`

### Debugging Steps
1. **Check User Authentication**:
   ```sql
   SELECT auth.uid(); -- Should return user ID
   ```

2. **Check User Profile**:
   ```sql
   SELECT * FROM profiles WHERE user_id = auth.uid();
   ```

3. **Test Role Function**:
   ```sql
   SELECT check_user_role('admin');
   ```

4. **Check RLS Policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

## Setup Checklist

### Initial Setup
- [ ] Run database migrations
- [ ] Create admin account using script or migration
- [ ] Test admin login
- [ ] Verify role checking functions work
- [ ] Test student creation by admin

### Security Verification
- [ ] RLS is enabled on all tables
- [ ] Admin functions reject non-admin users
- [ ] Students can only see their own data
- [ ] Client-side role checks work for UX
- [ ] Server-side validation is authoritative

### Production Deployment
- [ ] Change default admin password
- [ ] Remove or secure demo accounts
- [ ] Set up proper logging for role changes
- [ ] Monitor for unauthorized access attempts

## Future Enhancements

### Authentication Hooks
Consider adding Supabase Auth hooks to automatically assign roles:
```sql
-- Trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (NEW.id, 'student', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Role Management UI
- Admin interface for changing user roles
- Bulk role assignment
- Role history tracking

### Advanced Permissions
- Resource-level permissions
- Time-based access controls
- IP-based restrictions