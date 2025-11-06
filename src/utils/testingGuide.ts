// Manual Testing Guide for Authentication & User Experience
// This file provides test cases and instructions for validating the authentication flows

export interface TestCredentials {
  description: string;
  email?: string;
  password?: string;
  matricNumber?: string;
  pin?: string;
  expectedResult: 'success' | 'failure';
  expectedError?: string;
}

// Student Login Test Cases
export const studentLoginTests: TestCredentials[] = [
  {
    description: 'Valid student login - John Doe',
    matricNumber: 'PLT/ND/2023/001',
    pin: '123456',
    expectedResult: 'success'
  },
  {
    description: 'Valid student login - Jane Smith',
    matricNumber: 'PLT/ND/2023/002',
    pin: '234567',
    expectedResult: 'success'
  },
  {
    description: 'Invalid matric number format',
    matricNumber: 'INVALID',
    pin: '123456',
    expectedResult: 'failure',
    expectedError: 'Invalid format. Use: CS/2021/001'
  },
  {
    description: 'Empty matric number',
    matricNumber: '',
    pin: '123456',
    expectedResult: 'failure',
    expectedError: 'Matric number is required'
  },
  {
    description: 'Empty PIN',
    matricNumber: 'PLT/ND/2023/001',
    pin: '',
    expectedResult: 'failure',
    expectedError: 'PIN is required'
  },
  {
    description: 'PIN too short',
    matricNumber: 'PLT/ND/2023/001',
    pin: '123',
    expectedResult: 'failure',
    expectedError: 'PIN must be 6 digits'
  },
  {
    description: 'PIN too long',
    matricNumber: 'PLT/ND/2023/001',
    pin: '1234567',
    expectedResult: 'failure',
    expectedError: 'PIN must be 6 digits'
  },
  {
    description: 'Wrong PIN for valid matric number',
    matricNumber: 'PLT/ND/2023/001',
    pin: '999999',
    expectedResult: 'failure',
    expectedError: 'Invalid matric number or PIN'
  },
  {
    description: 'Non-existent matric number',
    matricNumber: 'PLT/ND/2025/999',
    pin: '123456',
    expectedResult: 'failure',
    expectedError: 'Invalid matric number or PIN'
  }
];

// Admin Login Test Cases
export const adminLoginTests: TestCredentials[] = [
  {
    description: 'Valid admin login - Demo admin',
    email: 'admin@plateau.edu.ng',
    password: 'Admin123456',
    expectedResult: 'success'
  },
  {
    description: 'Invalid email format',
    email: 'invalid-email',
    password: 'Admin123456',
    expectedResult: 'failure',
    expectedError: 'Please enter a valid email address'
  },
  {
    description: 'Empty email',
    email: '',
    password: 'Admin123456',
    expectedResult: 'failure',
    expectedError: 'Email is required'
  },
  {
    description: 'Empty password',
    email: 'admin@plateau.edu.ng',
    password: '',
    expectedResult: 'failure',
    expectedError: 'Password is required'
  },
  {
    description: 'Password too short',
    email: 'admin@plateau.edu.ng',
    password: '123',
    expectedResult: 'failure',
    expectedError: 'Password must be at least 6 characters'
  },
  {
    description: 'Wrong password for valid email',
    email: 'admin@plateau.edu.ng',
    password: 'wrongpassword',
    expectedResult: 'failure',
    expectedError: 'Invalid email or password'
  },
  {
    description: 'Non-existent admin email',
    email: 'nonexistent@plateau.edu.ng',
    password: 'Admin123456',
    expectedResult: 'failure',
    expectedError: 'Invalid login credentials'
  }
];

// Password Reset Test Cases
export const passwordResetTests = [
  {
    description: 'Valid admin email for password reset',
    email: 'admin@plateau.edu.ng',
    expectedResult: 'success'
  },
  {
    description: 'Invalid email format for password reset',
    email: 'invalid-email',
    expectedResult: 'failure',
    expectedError: 'Please enter a valid email address'
  },
  {
    description: 'Empty email for password reset',
    email: '',
    expectedResult: 'failure',
    expectedError: 'Email is required'
  }
];

// Profile Management Test Cases
export const profileTests = [
  {
    description: 'Update profile with valid data',
    fullName: 'John Updated Doe',
    phoneNumber: '08012345678',
    expectedResult: 'success'
  },
  {
    description: 'Update profile with empty name',
    fullName: '',
    phoneNumber: '08012345678',
    expectedResult: 'failure',
    expectedError: 'Full name is required'
  },
  {
    description: 'Update profile with invalid phone number',
    fullName: 'John Doe',
    phoneNumber: '123',
    expectedResult: 'failure',
    expectedError: 'Please enter a valid Nigerian phone number'
  },
  {
    description: 'Update profile with international format phone',
    fullName: 'John Doe',
    phoneNumber: '+2348012345678',
    expectedResult: 'success'
  }
];

// Manual Testing Instructions
export const testingInstructions = {
  studentLogin: {
    title: 'Student Login Flow Testing',
    steps: [
      '1. Navigate to /auth',
      '2. Ensure "Student" tab is selected',
      '3. Test each case from studentLoginTests array',
      '4. Verify appropriate error messages appear',
      '5. Verify successful login redirects to dashboard',
      '6. Verify student dashboard shows correct information'
    ]
  },
  adminLogin: {
    title: 'Admin Login Flow Testing',
    steps: [
      '1. Navigate to /auth',
      '2. Click on "Admin" tab',
      '3. Test each case from adminLoginTests array',
      '4. Verify appropriate error messages appear',
      '5. Verify successful login redirects to admin dashboard',
      '6. Verify admin dashboard shows correct functionality'
    ]
  },
  passwordReset: {
    title: 'Password Reset Testing',
    steps: [
      '1. Navigate to /auth',
      '2. Click on "Admin" tab',
      '3. Click "Forgot your password?" link',
      '4. Test each case from passwordResetTests array',
      '5. Verify appropriate error messages appear',
      '6. Verify success message for valid email',
      '7. Check email for password reset link (if configured)'
    ]
  },
  profileManagement: {
    title: 'Profile Management Testing',
    steps: [
      '1. Login as student or admin',
      '2. Navigate to Profile section in sidebar',
      '3. Test updating profile information',
      '4. Verify validation errors for invalid data',
      '5. Verify success message for valid updates',
      '6. For admin users, test password change functionality',
      '7. Verify password change validation and success'
    ]
  }
};

// Utility function to validate phone numbers
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s+/g, '');
  return /^(\+?234|0)?[789]\d{9}$/.test(cleanPhone);
};

// Utility function to validate email
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Utility function to validate matric number
export const validateMatricNumber = (matricNumber: string): boolean => {
  return /^[A-Z]{2,4}\/([A-Z]{2}\/)?[0-9]{4}\/[0-9]{3}$/.test(matricNumber);
};

console.log('Authentication Testing Guide Loaded');
console.log('Use studentLoginTests, adminLoginTests, passwordResetTests, and profileTests arrays for test data');
console.log('Use testingInstructions object for step-by-step testing guide');