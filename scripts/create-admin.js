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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
  // At least 8 characters, contains letters and numbers
  return password && password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

async function createAdminUser() {
  try {
    console.log('🚀 Starting admin user creation process...\n');

    // Get configuration from command line args or environment variables
    const args = parseArgs();
    const email = args.email || process.env.ADMIN_EMAIL;
    const password = args.password || process.env.ADMIN_PASSWORD;
    
    // Validate required environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) {
      console.error('❌ Error: VITE_SUPABASE_URL environment variable is required');
      exit(1);
    }
    
    if (!serviceRoleKey) {
      console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
      console.error('   Please add your Supabase service role key to your .env file');
      exit(1);
    }
    
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
      exit(1);
    }
    
    if (!isValidPassword(password)) {
      console.error('❌ Error: Password must be at least 8 characters and contain both letters and numbers');
      exit(1);
    }
    
    console.log(`📧 Creating admin user with email: ${email}`);
    
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
      exit(1);
    }
    
    const existingUser = existingUsers.users.find(user => user.email === email);
    if (existingUser) {
      console.error(`❌ Error: A user with email ${email} already exists`);
      console.error('   User ID:', existingUser.id);
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
        created_at: new Date().toISOString()
      }
    });
    
    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      exit(1);
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('   User ID:', newUser.user.id);
    console.log('   Email:', newUser.user.email);
    
    // Verify profile was created with admin role
    console.log('🔍 Verifying admin profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', newUser.user.id)
      .single();
    
    if (profileError) {
      console.warn('⚠️  Warning: Could not verify profile creation:', profileError.message);
      console.warn('   The user was created but profile verification failed');
      console.warn('   This might be expected if the trigger hasn\'t run yet');
    } else {
      console.log('✅ Admin profile verified:');
      console.log('   Profile ID:', profile.id);
      console.log('   Role:', profile.role);
      console.log('   Full Name:', profile.full_name || 'Not set');
    }
    
    console.log('\n🎉 Admin user creation completed successfully!');
    console.log(`📋 Admin can now log in with email: ${email}`);
    console.log('🔐 Make sure to store the password securely');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    exit(1);
  }
}

// Run the script
createAdminUser();