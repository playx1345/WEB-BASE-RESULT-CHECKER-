# Barkin Grade Access System

A modern, secure grade management system built with React, TypeScript, and Supabase. This application provides role-based access control for students, teachers, parents, and administrators.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your Supabase credentials
   VITE_SUPABASE_URL="your_supabase_url"
   VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Create your first admin user**
   ```bash
   npm run create-admin -- --email admin@yourschool.edu --password SecurePass123
   ```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Validation**: Zod schemas with TypeScript
- **State Management**: React hooks with custom utilities
- **Error Handling**: Centralized error boundaries and utilities

### Key Features

- **🔐 Role-Based Access Control**: Student, Teacher, Parent, Admin roles
- **📊 Grade Management**: Upload, view, and manage academic results
- **📢 Announcements**: Level-specific and system-wide notifications
- **🔍 Audit Logging**: Comprehensive activity tracking
- **📱 Responsive Design**: Mobile-first responsive interface
- **🛡️ Security**: Row Level Security (RLS) with Supabase
- **⚡ Performance**: Optimized with custom hooks and reusable components

## 👥 User Roles & Permissions

### Student
- View their own profile and academic results (if fees paid)
- View announcements for their level
- Cannot access admin functions

### Teacher
- View all student profiles and results
- Manage academic results (insert, update, delete)
- View all announcements

### Parent
- View child's results (if fees paid)
- View announcements
- Manage their own profile

### Admin
- Full system access
- Manage all users, students, results, and announcements
- View audit logs and system analytics
- Create additional admin users

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run create-admin # Create admin user
```

### Code Organization

```
src/
├── components/           # Reusable React components
│   ├── admin/           # Admin-specific components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   └── ErrorBoundary.tsx # Error handling boundaries
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication state
│   ├── useDataFetching.tsx # Data fetching utilities
│   └── useProfile.tsx   # User profile management
├── lib/                 # Utility libraries
│   ├── validation.ts    # Zod validation schemas
│   ├── errorHandling.ts # Error handling utilities
│   └── utils.ts         # General utilities
├── pages/               # Page components
└── integrations/        # External service integrations
    └── supabase/        # Supabase client and types
```

### Contributing Guidelines

1. **Code Standards**
   - Use TypeScript for all new code
   - Follow the existing ESLint configuration
   - Write self-documenting code with clear variable names
   - Use Zod schemas for all data validation

2. **Component Guidelines**
   - Keep components small and focused (< 200 lines)
   - Use custom hooks for complex logic
   - Implement proper error boundaries
   - Follow the existing UI component patterns

3. **Testing**
   - Test critical user flows
   - Validate error handling scenarios
   - Ensure responsive design works on mobile

4. **Security**
   - Never commit secrets or API keys
   - Always validate user input
   - Use RLS policies for data access control
   - Implement proper authentication checks

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication via Supabase Auth
- Role-based access control with RLS policies
- Secure session management
- Password strength requirements

### Data Protection
- Row Level Security (RLS) on all tables
- Encrypted data transmission (HTTPS)
- Input validation and sanitization
- Audit logging for all data changes

### Security Best Practices
- No sensitive data in environment variables
- Secure admin user creation process
- Regular security audits via audit logs
- Protection against common web vulnerabilities

## 📊 Database Schema

### Core Tables

**profiles** - User profile information
- `id`, `user_id`, `role`, `full_name`, `matric_number`, `phone_number`, `level`

**students** - Academic student records
- `id`, `profile_id`, `matric_number`, `level`, `cgp`, `total_gp`, `carryovers`, `fee_status`

**results** - Academic results/grades
- `id`, `student_id`, `course_code`, `course_title`, `credit_unit`, `grade`, `point`, `semester`, `session`, `level`

**announcements** - System announcements
- `id`, `title`, `content`, `target_level`, `created_by`, `created_at`

**audit_logs** - Activity tracking
- `id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `metadata`, `created_at`

### RLS Policies

All tables implement comprehensive Row Level Security:
- Students can only access their own data (if fees paid)
- Teachers can view/manage academic data
- Parents can view child's data (if fees paid)
- Admins have full access
- Audit logs restricted to admin access

## 🛠️ Admin User Management

### Creating an Admin User

This project includes a secure script to create admin users with enhanced security validation.

#### Quick Setup

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your Supabase service role key to .env
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   ```

2. **Create Admin User**
   ```bash
   npm run create-admin -- --email admin@yourschool.edu --password SecurePass123!
   ```

#### Enhanced Security Features

- **Strong Password Requirements**: 8+ characters with 3 of 4 requirements (uppercase, lowercase, numbers, special characters)
- **Email Validation**: RFC-compliant email format validation
- **Weak Pattern Detection**: Prevents common weak passwords
- **Duplicate Prevention**: Checks for existing users
- **Environment Validation**: Validates all required environment variables
- **Detailed Logging**: Comprehensive success/failure feedback

#### Security Considerations

⚠️ **Important Security Notes:**
- Store admin credentials securely after creation
- Change default passwords on first login
- Remove admin credentials from environment variables after creation
- Monitor admin activities through audit logs
- Use strong, unique passwords for each admin

## 🚀 Deployment

### Environment Variables

Required for production:
```bash
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key" # For admin creation only
```

### Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

### Deployment Platforms

- **Vercel**: Connect your repo and deploy automatically
- **Netlify**: Drag and drop the `dist` folder
- **Lovable**: Use the built-in deployment feature

## 📝 API Reference

### Validation Schemas

The application uses Zod for robust data validation:

```typescript
// Student validation
import { studentSchema } from '@/lib/validation';

// Result validation with CSV support
import { bulkResultSchema, validateCsvData } from '@/lib/validation';

// Announcement validation
import { announcementSchema } from '@/lib/validation';
```

### Error Handling

Centralized error handling with toast notifications:

```typescript
import { useErrorHandler } from '@/lib/errorHandling';

const { handleError, handleSuccess, handleDatabaseError } = useErrorHandler();
```

### Custom Hooks

Reusable data fetching and state management:

```typescript
import { 
  useStudentsData, 
  useResultsData, 
  useAnnouncementsData,
  useDebouncedSearch,
  usePagination 
} from '@/hooks/useDataFetching';
```

## 📞 Support

### Getting Help

1. **Documentation**: Check this README and inline code comments
2. **Issues**: Open a GitHub issue for bugs or feature requests
3. **Security**: Report security issues privately to maintainers

### Common Issues

**Build Errors**: Ensure all dependencies are installed with `npm install`
**Auth Issues**: Verify Supabase environment variables are correct
**Permission Errors**: Check RLS policies and user roles in Supabase dashboard

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**⭐ If this project helps you, please consider giving it a star!**
