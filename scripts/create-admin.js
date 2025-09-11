#!/usr/bin/env node

/**
 * Admin User Creation Script
 * 
 * This script creates an admin user in Supabase using the service role key.
 * It sets the user's role to "admin" in their metadata, which triggers
 * automatic profile creation with admin privileges.
 * 
 * Usage:
 *   node scripts/create-admin.js --email admin@example.com --password securepassword
 *   
 * Or using environment variables:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepassword node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import { exit } from 'process';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    if (key === '--email') config.email = value;
    if (key === '--password') config.password = value;
    if (key === '--help' || key === '-h') {
      console.log(`
Admin User Creation Script

Usage:
  node scripts/create-admin.js --email <email> --password <password>
  
Environment Variables:
  ADMIN_EMAIL       - Email for the admin user
  ADMIN_PASSWORD    - Password for the admin user
  SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (required)
  
Options:
  --email <email>      Email address for the admin user
  --password <password> Password for the admin user
  --help, -h          Show this help message

Examples:
  node scripts/create-admin.js --email admin@college.edu --password MySecurePass123
  ADMIN_EMAIL=admin@college.edu ADMIN_PASSWORD=MySecurePass123 node scripts/create-admin.js
      `);
      exit(0);
    }
  }
  
  return config;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

// Enhanced password validation
function isValidPassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  const requirements = [
    { test: /[a-z]/, message: 'lowercase letter' },
    { test: /[A-Z]/, message: 'uppercase letter' },
    { test: /\d/, message: 'number' },
    { test: /[!@#$%^&*(),.?":{}|<>]/, message: 'special character' }
  ];
  
  const failedRequirements = requirements.filter(req => !req.test.test(password));
  
  // Require at least 3 out of 4 requirements
  if (failedRequirements.length > 1) {
    const missing = failedRequirements.map(req => req.message);
    return { 
      valid: false, 
      message: `Password must contain at least 3 of: ${missing.join(', ')}`
    };
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    /^(.)\1+$/, // Same character repeated
    /123456|abcdef|qwerty|password/i, // Common sequences
    /^admin|^user|^test/i // Common prefixes
  ];
  
  if (weakPatterns.some(pattern => pattern.test(password))) {
    return { valid: false, message: 'Password contains common weak patterns' };
  }
  
  return { valid: true };
}

// Validate environment variables
function validateEnvironment() {
  const required = ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => {
      console.error(`   - ${key}`);
    });
    console.error('\nPlease add these to your .env file');
    return false;
  }
  
  return true;
}

async function createAdminUser() {
  try {
    console.log('🚀 Starting admin user creation process...\n');

    // Validate environment first
    if (!validateEnvironment()) {
      exit(1);
    }

    // Get configuration from command line args or environment variables
    const args = parseArgs();
    const email = args.email || process.env.ADMIN_EMAIL;
    const password = args.password || process.env.ADMIN_PASSWORD;
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!email) {
      console.error('❌ Error: Email is required');
      console.error('   Use --email <email> or set ADMIN_EMAIL environment variable');
      exit(1);
    }
    
    if (!password) {
      console.error('❌ Error: Password is required');
      console.error('   Use --password <password> or set ADMIN_PASSWORD environment variable');
      exit(1);
    }
    
    // Validate inputs
    if (!isValidEmail(email)) {
      console.error('❌ Error: Invalid email format');
      console.error('   Please provide a valid email address');
      exit(1);
    }
    
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      console.error('❌ Error:', passwordValidation.message);
      exit(1);
    }
    
    console.log(`📧 Creating admin user with email: ${email}`);
    console.log('🔐 Password meets security requirements');
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error checking existing users:', listError.message);
      console.error('   Make sure your service role key is correct and has admin privileges');
      exit(1);
    }
    
    const existingUser = existingUsers.users.find(user => user.email === email);
    if (existingUser) {
      console.error(`❌ Error: A user with email ${email} already exists`);
      console.error('   User ID:', existingUser.id);
      console.error('   Created:', new Date(existingUser.created_at).toLocaleString());
      exit(1);
    }
    
    // Create the admin user
    console.log('👤 Creating user account...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin',
        full_name: 'System Administrator',
        created_by_script: true,
        created_at: new Date().toISOString(),
        security_clearance: 'high'
      }
    });
    
    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      if (createError.message.includes('rate limit')) {
        console.error('   Please wait a moment before trying again');
      }
      exit(1);
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('   User ID:', newUser.user.id);
    console.log('   Email:', newUser.user.email);
    console.log('   Email Confirmed:', newUser.user.email_confirmed_at ? 'Yes' : 'No');
    
    // Verify profile was created with admin role
    console.log('🔍 Verifying admin profile creation...');
    
    // Wait a moment for triggers to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', newUser.user.id)
      .single();
    
    if (profileError) {
      console.warn('⚠️  Warning: Could not verify profile creation:', profileError.message);
      console.warn('   The user was created but profile verification failed');
      console.warn('   This might be expected if the database trigger hasn\'t run yet');
      console.warn('   Please check the database manually or try logging in');
    } else {
      console.log('✅ Admin profile verified:');
      console.log('   Profile ID:', profile.id);
      console.log('   Role:', profile.role);
      console.log('   Full Name:', profile.full_name || 'Not set');
      
      if (profile.role !== 'admin') {
        console.warn('⚠️  Warning: Profile role is not set to "admin"');
        console.warn('   Please check your database triggers and RLS policies');
      }
    }
    
    console.log('\n🎉 Admin user creation completed successfully!');
    console.log(`📋 Admin can now log in with:`);
    console.log(`   Email: ${email}`);
    console.log('🔐 Password: [SECURE - Store safely]');
    console.log('\n🛡️  Security Notes:');
    console.log('   - Change the default password after first login');
    console.log('   - Remove admin credentials from environment variables');
    console.log('   - Monitor admin activities through audit logs');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
    exit(1);
  }
}

// Run the script
createAdminUser();