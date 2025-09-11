import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const matricNumberSchema = z
  .string()
  .min(1, 'Matric number is required')
  .regex(/^[A-Z0-9/]+$/i, 'Invalid matric number format');

// Message validation schema
export const messageSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  content: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  recipient_type: z.enum(['admin', 'teacher'], {
    required_error: 'Please select a recipient type'
  })
});

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: nameSchema,
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s-()]+$/.test(val),
      'Please enter a valid phone number'
    ),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Please enter a valid date'
    )
});

// Search and filter validation
export const searchSchema = z.object({
  query: z.string().max(100, 'Search query too long'),
  session: z.string().optional(),
  semester: z.string().optional(),
  level: z.string().optional()
});

// Helper function to validate and format errors
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { 
      success: false, 
      errors: { general: 'Validation failed' } 
    };
  }
};

// Custom validation hook for React Hook Form
export const useZodValidation = <T>(schema: z.ZodSchema<T>) => {
  return {
    resolver: (data: any) => {
      const result = validateWithSchema(schema, data);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      return { 
        values: {}, 
        errors: Object.fromEntries(
          Object.entries(result.errors).map(([key, value]) => [
            key,
            { type: 'validation', message: value }
          ])
        )
      };
    }
  };
};