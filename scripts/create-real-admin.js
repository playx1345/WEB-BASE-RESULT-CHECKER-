#!/usr/bin/env node

/**
 * Real Admin User Creation Script
 * 
 * This script creates a real admin user in Supabase using the service role key.
 * It prompts for credentials and creates the admin account.
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const SUPABASE_URL = "https://juftwuinlhjfmyphfyxt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnR3dWlubGhqZm15cGhmeXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAyNDU5OCwiZXhwIjoyMDcyNjAwNTk4fQ.ILexoQDzBKnNqVhPiCPLVBcbj_pZQAT4m8PgDhp4oJU";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    process.stdin.on('data', function(char) {
      char = char.toString();
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.stdout.write('\n');
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createRealAdmin() {
  try {
    console.log('🔐 Creating Real Admin Account for PLASU CS Department\n');

    // Get admin details
    const email = await askQuestion('Enter admin email: ');
    const password = await askPassword('Enter admin password (min 8 chars): ');
    const fullName = await askQuestion('Enter admin full name: ');

    // Validate inputs
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    if (!fullName || fullName.trim().length < 2) {
      console.error('❌ Full name is required');
      process.exit(1);
    }

    console.log('\n🔄 Creating admin account...');

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error checking existing users:', listError.message);
      process.exit(1);
    }

    const existingUser = existingUsers.users.find(user => user.email === email);
    if (existingUser) {
      console.error(`❌ Error: A user with email ${email} already exists`);
      process.exit(1);
    }

    // Create the admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: fullName,
        created_by_script: true,
        created_at: new Date().toISOString()
      }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('   User ID:', newUser.user.id);
    console.log('   Email:', newUser.user.email);

    // Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', newUser.user.id)
      .single();

    if (profileError) {
      console.warn('⚠️  Warning: Could not verify profile creation:', profileError.message);
    } else {
      console.log('✅ Admin profile verified:');
      console.log('   Role:', profile.role);
      console.log('   Full Name:', profile.full_name);
    }

    console.log('\n🎉 Real admin account created successfully!');
    console.log(`📋 Admin Credentials:`);
    console.log(`   Email: ${email}`);
    console.log('   Password: [HIDDEN - use the password you entered]');
    console.log('\n🔒 Please store these credentials securely!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createRealAdmin();