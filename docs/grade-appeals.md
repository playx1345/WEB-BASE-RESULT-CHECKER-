# Grade Appeal/Review Workflow

This document outlines the Grade Appeal/Review Workflow implementation for the Plateau State Polytechnic Barkin Ladi grade access system.

## Overview

The Grade Appeal/Review Workflow allows students to request reviews of their grades and enables teachers/admins to manage and respond to these appeals within the system.

## Features

### For Students
- **Appeal Submission**: Students can submit appeals for any grade from their results view
- **Appeal Status Tracking**: Real-time status updates (pending, under review, approved, rejected)
- **Duplicate Prevention**: System prevents multiple appeals for the same result
- **Response Viewing**: Students can see admin responses to their appeals

### For Administrators
- **Appeal Management**: Comprehensive interface to review and manage all appeals
- **Status Updates**: Ability to change appeal status and provide responses
- **Filtering**: Filter appeals by status (pending, under review, approved, rejected)
- **Dashboard Integration**: Pending appeals count displayed on admin dashboard

## Database Schema

### grade_appeals Table
- `id`: UUID primary key
- `result_id`: Foreign key to results table
- `student_id`: Foreign key to students table
- `reason`: Text field for appeal reason (required)
- `details`: Optional additional details
- `status`: Enum (pending, under_review, approved, rejected)
- `admin_response`: Admin's response text
- `reviewed_by`: Foreign key to auth.users (admin who reviewed)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Appeal Status Types
- **pending**: Initial status when appeal is submitted
- **under_review**: Admin has started reviewing the appeal
- **approved**: Appeal has been approved
- **rejected**: Appeal has been rejected

## Security Features

- **Row Level Security (RLS)**: Students can only view/create appeals for their own results
- **Admin Access**: Only admins can update appeal statuses and provide responses
- **Duplicate Prevention**: Database-level constraint prevents duplicate appeals

## User Interface

### Student Interface
- Appeals can be submitted directly from the results table
- Each result shows either an "Appeal" button or the current appeal status
- Modal dialog for submitting appeals with reason and optional details

### Admin Interface
- Dedicated "Grade Appeals" section in admin sidebar
- Comprehensive table showing all appeals with student and course information
- Modal dialog for reviewing appeals and updating status/response
- Filter functionality to view appeals by status

## Usage Instructions

### For Students
1. Navigate to your Results page
2. Locate the grade you want to appeal
3. Click the "Appeal" button next to the result
4. Fill in the reason for your appeal and any additional details
5. Submit the appeal
6. Track the status in the same results table

### For Administrators
1. Navigate to the Admin panel
2. Click on "Grade Appeals" in the sidebar
3. Review pending appeals in the table
4. Click "Review" to open the appeal details
5. Update the status and provide a response
6. Save the changes

## Technical Implementation

- **Frontend**: React with TypeScript
- **Backend**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth with RLS policies
- **UI Components**: Radix UI components with shadcn/ui styling
- **State Management**: React hooks and Supabase real-time subscriptions

## Migration Files

The implementation includes a database migration file:
- `20250110000000_create_grade_appeals.sql`: Creates the grade_appeals table, enum types, RLS policies, and triggers