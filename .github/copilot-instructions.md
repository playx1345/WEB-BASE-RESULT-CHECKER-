# Copilot Instructions for Barkin Grade Access System

## Project Overview

This is a student grade access system for Plateau State Polytechnic Barkin Ladi Computer Science Department. It's a modern React/TypeScript web application with three main user types: students, teachers, and administrators.

## Tech Stack & Architecture

- **Frontend**: React 18 + TypeScript + Vite (SWC)
- **UI Framework**: Tailwind CSS + shadcn/ui (Radix UI components)
- **Backend**: Supabase (PostgreSQL + Authentication + Real-time)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript rules

## Key Directories & Files

- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Route-level page components
- `src/hooks/` - Custom React hooks (especially `useAuth.tsx`)
- `src/integrations/supabase/` - Supabase client configuration and types
- `src/utils/` - Utility functions and validation helpers
- `src/lib/` - Core library functions (security, etc.)
- `supabase/` - Database migrations and configuration

## Coding Standards & Conventions

### File Naming

- Components: PascalCase (e.g., `StudentDashboard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.tsx`)
- Utilities: camelCase (e.g., `testingGuide.ts`)
- Pages: PascalCase in `/pages/` directory

### Component Patterns


- Use functional components with TypeScript interfaces
- Prefer composition over inheritance
- Extract reusable logic into custom hooks
- Use shadcn/ui components consistently for UI elements

### State Management


- Use React Query for all server state (API calls, caching)
- Use React's built-in state (useState, useReducer) for local component state
- Context is used for authentication (`AuthProvider`)

### Authentication & Authorization

- Three user roles: `student`, `teacher`, `admin`
- Use `useAuth` hook for authentication state
- Protect routes with `ProtectedRoute` component
- Store auth state in Supabase session

## Database Schema (Supabase)

Key tables:
- `students` - Student information and academic records
- `admin_users` - Admin user accounts
- `teacher_users` - Teacher user accounts  
- `results` - Student academic results/grades
- `announcements` - System announcements
- `audit_logs` - System activity tracking

## Development Guidelines

### When Adding New Features


1. Create components in appropriate subdirectories
2. Use TypeScript interfaces for all props and data structures
3. Implement proper error handling with try/catch blocks
4. Add loading states for async operations
5. Use React Query for API calls with proper cache invalidation
6. Follow existing patterns for authentication checks

### API Integration
- All API calls go through Supabase client (`src/integrations/supabase/client.ts`)
- Use React Query hooks for data fetching
- Handle loading, error, and success states consistently
- Implement optimistic updates where appropriate

### UI/UX Standards


- Mobile-first responsive design
- Use Tailwind utility classes
- Leverage shadcn/ui components (Card, Button, Input, etc.)
- Consistent color scheme and spacing
- Accessibility considerations (ARIA labels, keyboard navigation)

### Form Handling


- Use React Hook Form for all forms
- Validate with Zod schemas
- Provide clear error messages
- Handle submission states (loading, success, error)

### Security Considerations
- Validate all inputs on both client and server
- Use row-level security (RLS) in Supabase
- Sanitize data before display
- Log security-relevant actions in audit_logs

## Testing Approach
- Manual testing instructions are in `src/utils/testingGuide.ts`
- Test authentication flows thoroughly
- Verify role-based access controls
- Test responsive design on different screen sizes

## Build & Deployment

```bash
npm install      # Install dependencies
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Common Patterns & Examples

### Creating a New Component
```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  data: any[];
  onAction: (id: string) => void;
}

export function MyComponent({ title, data, onAction }: MyComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
}
```

### API Call with React Query
```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const { data, loading, error } = useQuery({
  queryKey: ['students'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*');
    
    if (error) throw error;
    return data;
  }
});
```

### Form with Validation
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

## Error Handling

- Use try/catch blocks for async operations
- Display user-friendly error messages
- Log errors to console in development
- Use toast notifications for user feedback (sonner library)

## Performance Considerations

- Use React Query for efficient caching
- Implement pagination for large data sets
- Optimize images and assets
- Use code splitting for large routes
- Minimize bundle size with proper imports

## Accessibility

- Use semantic HTML elements
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works
- Maintain proper contrast ratios
- Test with screen readers

Remember to maintain consistency with existing code patterns and always consider the user experience for students, teachers, and administrators when making changes.