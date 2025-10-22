# Computer Science Department Portal

## Overview
A comprehensive full-stack web application for the Computer Science Department at Plateau State Polytechnic Barkin Ladi. Built with React, TypeScript, and Supabase, this platform provides secure authentication, student result management, and administrative tools with a mobile-first responsive design.

## Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **Shadcn/ui** - Accessible component library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

### Backend
- **Supabase** - PostgreSQL database, authentication, and serverless functions
- **Row-Level Security (RLS)** - Database-level access control
- **Edge Functions** - Serverless API endpoints

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components (header, footer)
│   │   ├── ui/             # Reusable UI components (shadcn)
│   │   └── views/          # Page view components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication state management
│   │   └── useProfile.tsx  # User profile data
│   ├── lib/                # Utility libraries
│   │   ├── security.ts     # Security utilities
│   │   └── utils.ts        # Helper functions
│   ├── pages/              # Route pages
│   │   ├── Index.tsx       # Landing page
│   │   ├── Auth.tsx        # Login/signup page
│   │   └── static/         # Static pages (about, faculty, etc.)
│   ├── data/               # Static data files
│   └── integrations/       # API integrations
│       └── supabase/       # Supabase client & types
├── supabase/
│   ├── functions/          # Edge functions
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
└── scripts/                # Utility scripts
    ├── create-admin.js     # Admin account creation
    └── create-demo-students.js

```

## Database Schema

### Core Tables
- **profiles** - User profile information
- **user_roles** - Role-based access control (admin, student, teacher, parent)
- **students** - Student-specific data (matric number, PIN, GPA, fee status)
- **results** - Student academic results
- **announcements** - Department announcements
- **admins** - Admin-specific data
- **audit_logs** - System activity logging

### Security Features
- Row-Level Security (RLS) on all tables
- Secure PIN hashing with bcrypt
- Role-based access policies
- Audit logging for admin actions

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/bun
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cs-department-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     SUPABASE_URL=your_project_url
     SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Run database migrations**
   - Migrations are in `supabase/migrations/`
   - Apply via Supabase dashboard or CLI

5. **Create admin account**
   ```bash
   cd scripts
   npm install
   node create-admin.js
   ```
   Follow prompts to create your first admin user

6. **Start development server**
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:8080`

### Creating Demo Students
```bash
cd scripts
node create-demo-students.js
```
This creates sample student accounts for testing

## Key Features

### 🎯 Core Functionality
- **User-friendly interface** for students and admins
- **Secure login system** with enhanced validation
- **Comprehensive department information**
- **Dynamic content loading** using modern JavaScript

### 📱 Mobile-First Design
- **Responsive design** optimized for all device sizes
- **Mobile navigation** with hamburger menu and smooth animations
- **Touch-friendly interfaces** with proper touch target sizes (44px+)
- **Mobile sidebar toggles** for admin and student portals
- **Optimized typography** with readable font sizes on mobile

### 🛡️ Enhanced Security & Validation
- **Real-time form validation** with immediate feedback
- **Enhanced password requirements** for admin accounts
- **Input sanitization** and proper error handling
- **Session management** with timeout protection

### 🔔 User Experience Enhancements
- **Toast notification system** with mobile-optimized positioning
- **Loading states** and progress indicators
- **Smooth animations** and transitions
- **Accessibility features** with proper ARIA labels and keyboard navigation

### 📊 Dashboard Features
- **Student Portal**: Results viewing, GPA tracking, announcements, profile management
- **Admin Portal**: Student management, result uploads, analytics, system administration
- **Mobile-responsive tables** with horizontal scrolling
- **Interactive charts** and statistics

## Demo Credentials

### Admin Access
- **Email**: admin@plateau.edu.ng
- **Password**: Admin123456

### Demo Student (after creating with script)
See `RUN_DEMO_STUDENTS.md` for instructions on creating demo student accounts.

## Authentication System

### Admin Login
- Email/password authentication via Supabase Auth
- Role-based access control with user_roles table
- Secure password requirements enforced

### Student Login
- Matric number + PIN authentication
- PIN stored as bcrypt hash in database
- Fee status validation (must have "paid" status to view results)

## Key Features

### 🎯 Core Functionality
- **Supabase Authentication** - Secure user management
- **Role-Based Access Control** - Admin, Student, Teacher, Parent roles
- **Student Result Management** - Upload, view, and manage academic results
- **GPA Calculation** - Automatic CGPA and semester GPA computation
- **Announcements System** - Target announcements by level or all students
- **Audit Logging** - Track all administrative actions

### 📱 Mobile-First Responsive Design
- **Responsive layouts** - Optimized for mobile, tablet, and desktop
- **Mobile navigation** - Collapsible sidebar and hamburger menu
- **Touch-friendly UI** - Proper touch target sizing
- **Adaptive tables** - Horizontal scroll on mobile devices

### 🛡️ Security Features
- **Row-Level Security (RLS)** - Database-level access control
- **Secure PIN hashing** - bcrypt with salt for student PINs
- **Role verification** - Server-side role checks via security definer functions
- **Input validation** - Client and server-side validation
- **Audit trails** - Comprehensive activity logging

### 📊 Admin Dashboard
- **Student Management** - Create, update, view student records
- **Bulk Operations** - Upload multiple students via CSV
- **Result Upload** - Individual and bulk result entry
- **Analytics** - Student performance statistics
- **Announcements** - Create and manage department notices
- **Audit Logs** - View system activity history

### 🎓 Student Portal
- **Results Viewing** - Semester and cumulative results (requires paid fee status)
- **GPA Tracking** - Current semester and cumulative GPA
- **Announcements** - View department and level-specific notices
- **Profile Management** - View and update personal information

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with semantic design tokens
- **Shadcn/ui** for accessible, customizable components
- **TanStack Query** for efficient data fetching and caching
- **React Hook Form** + Zod for form validation

### Backend Stack
- **Supabase PostgreSQL** - Production-ready database
- **Supabase Auth** - User authentication and session management
- **Supabase Edge Functions** - Serverless API endpoints (e.g., SMS notifications)
- **Row-Level Security** - Declarative access control policies
- **Database Functions** - Stored procedures for complex operations

### Security Architecture
```sql
-- Role-based access example
user_roles table → has_role() function → RLS policies

-- Data access flow
User request → Supabase Auth → RLS evaluation → Data response
```

## API Documentation

### Key Database Functions

#### `admin_create_student()`
Creates a new student account with profile, auth user, and student record.
```sql
SELECT admin_create_student(
  'John Doe',           -- full_name
  'ND/CS/2024/001',    -- matric_number
  'ND1',               -- level
  '08012345678',       -- phone_number
  '123456'             -- pin (or null for auto-generated)
);
```

#### `authenticate_student()`
Verifies student matric number and PIN for login.

#### `get_current_user_role()`
Returns the current authenticated user's role.

## Deployment

### Via Lovable Platform
1. Click **Publish** in the Lovable editor
2. Your app is deployed to `<project-name>.lovable.app`
3. Configure custom domain in Project Settings (requires paid plan)

### Self-Hosted Deployment

#### Prerequisites
- Node.js 18+
- Supabase project

#### Build for Production
```bash
npm run build
```
Outputs to `dist/` directory

#### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables (Supabase URL and keys)

#### Environment Variables Required
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

#### Deploy with Docker
1. Build the Docker image:
   ```bash
   docker build -t cs-portal:latest .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 \
     -e VITE_SUPABASE_URL=your_url \
     -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
     cs-portal:latest
   ```

3. Or use docker-compose (copy `docker-compose.example.yml` first):
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   # Edit docker-compose.yml with your environment variables
   docker-compose up -d
   ```

For comprehensive deployment instructions, database migrations, and production best practices, see **[Migration & Deployment Guide](MIGRATION_DEPLOYMENT.md)**.


## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Semantic commit messages
- Component-based architecture

### Best Practices
- Use semantic design tokens (no hardcoded colors)
- Implement proper error boundaries
- Add loading states for async operations
- Follow mobile-first responsive design
- Write accessible HTML with ARIA labels

### Testing
- Manual testing across devices
- Console error monitoring
- Network request inspection
- RLS policy verification

## Troubleshooting

### Common Issues

**Students can't see results**
- Check fee_status is set to "paid" in students table
- Verify RLS policies on results table
- Confirm student is logged in with correct credentials

**Admin can't create students**
- Verify user has "admin" role in user_roles table
- Check audit_logs for error details
- Ensure pgcrypto extension is enabled

**Authentication errors**
- Check Supabase URL Configuration in dashboard
- Verify Site URL and Redirect URLs are set correctly
- Ensure email confirmation is disabled (for testing)

For detailed troubleshooting, see [Supabase Documentation](https://supabase.com/docs).

## Additional Documentation

- **[Quick Reference Guide](QUICK_REFERENCE.md)** - Common deployment commands and troubleshooting
- **[Admin Setup Guide](create-admin-account.md)** - Creating first admin account
- **[Demo Students Guide](RUN_DEMO_STUDENTS.md)** - Creating test student accounts
- **[Migration & Deployment Guide](MIGRATION_DEPLOYMENT.md)** - Production deployment and database migration checklist
- **[Copilot Instructions](.github/copilot-instructions.md)** - Development standards

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards in `.github/copilot-instructions.md`
4. Test thoroughly on multiple devices
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check existing issues on GitHub
- Review Supabase documentation
- Contact department IT support

---

Built with ❤️ for Plateau State Polytechnic Barkin Ladi Computer Science Department
