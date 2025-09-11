import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain letters')
  .regex(/\d/, 'Password must contain numbers');

export const matricNumberSchema = z.string()
  .min(1, 'Matric number is required')
  .regex(/^[A-Z0-9]+$/i, 'Matric number must contain only letters and numbers');

export const phoneNumberSchema = z.string()
  .optional()
  .refine((val) => !val || /^\+?[\d\s\-()]+$/.test(val), {
    message: 'Invalid phone number format'
  });

// Student validation schemas
export const studentSchema = z.object({
  matric_number: matricNumberSchema,
  level: z.enum(['ND1', 'ND2', 'HND1', 'HND2'], {
    errorMap: () => ({ message: 'Level must be ND1, ND2, HND1, or HND2' })
  }),
  fee_status: z.enum(['paid', 'unpaid'], {
    errorMap: () => ({ message: 'Fee status must be paid or unpaid' })
  }),
  cgp: z.number().min(0).max(4).optional(),
  total_gp: z.number().min(0).optional(),
  carryovers: z.number().min(0).default(0)
});

export const createStudentSchema = studentSchema.extend({
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: phoneNumberSchema
});

// Result validation schemas
export const gradeSchema = z.enum(['A', 'B', 'C', 'D', 'E', 'F'], {
  errorMap: () => ({ message: 'Grade must be A, B, C, D, E, or F' })
});

export const semesterSchema = z.enum(['first', 'second'], {
  errorMap: () => ({ message: 'Semester must be first or second' })
});

export const sessionSchema = z.string()
  .regex(/^\d{4}\/\d{4}$/, 'Session must be in format YYYY/YYYY (e.g., 2023/2024)');

export const resultSchema = z.object({
  course_code: z.string().min(1, 'Course code is required'),
  course_title: z.string().min(1, 'Course title is required'),
  credit_unit: z.number().int().min(1).max(6, 'Credit units must be between 1 and 6'),
  grade: gradeSchema,
  point: z.number().min(0).max(4, 'Grade points must be between 0 and 4'),
  semester: semesterSchema,
  session: sessionSchema,
  level: z.enum(['ND1', 'ND2', 'HND1', 'HND2'])
});

export const bulkResultSchema = z.object({
  matric_number: matricNumberSchema,
  course_code: z.string().min(1, 'Course code is required'),
  course_title: z.string().min(1, 'Course title is required'),
  credit_units: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 6;
  }, 'Credit units must be a number between 1 and 6'),
  grade: z.string().refine((val) => ['A', 'B', 'C', 'D', 'E', 'F'].includes(val.toUpperCase()), 
    'Grade must be A, B, C, D, E, or F'),
  grade_points: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 4;
  }, 'Grade points must be a number between 0 and 4'),
  session: z.string().refine((val) => /^\d{4}\/\d{4}$/.test(val), 
    'Session must be in format YYYY/YYYY'),
  semester: z.string().refine((val) => ['first', 'second'].includes(val.toLowerCase()),
    'Semester must be first or second'),
  level: z.string().refine((val) => ['ND1', 'ND2', 'HND1', 'HND2'].includes(val.toUpperCase()),
    'Level must be ND1, ND2, HND1, or HND2')
});

// Announcement validation schemas
export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  target_level: z.enum(['all', 'ND1', 'ND2', 'HND1', 'HND2'], {
    errorMap: () => ({ message: 'Target level must be all, ND1, ND2, HND1, or HND2' })
  })
});

// Admin creation validation
export const adminCreationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required').optional()
});

// CSV validation utilities
export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

export function validateCsvData<T>(
  data: unknown[],
  schema: z.ZodSchema<T>,
  skipSampleRows = true
): { validData: T[]; errors: ValidationError[] } {
  const validData: T[] = [];
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    // Skip sample rows if needed
    if (skipSampleRows && typeof row === 'object' && row !== null) {
      const firstValue = Object.values(row)[0];
      if (typeof firstValue === 'string' && firstValue.toUpperCase().startsWith('SAMPLE')) {
        return;
      }
    }

    try {
      const validated = schema.parse(row);
      validData.push(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((zodError) => {
          errors.push({
            row: index + 2, // +2 because CSV header is row 1, data starts at row 2
            field: zodError.path.join('.'),
            message: zodError.message,
            value: zodError.path.reduce((obj: Record<string, unknown>, key) => obj?.[key], row as Record<string, unknown>)
          });
        });
      }
    }
  });

  return { validData, errors };
}

// Form validation helper
export function getFormErrors(error: z.ZodError): Record<string, string> {
  const formErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    formErrors[field] = err.message;
  });
  
  return formErrors;
}

// Safe validation function that returns either data or errors
export function validateSafely<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: getFormErrors(error) };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Utility to parse CSV string
export function parseCsvString(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}