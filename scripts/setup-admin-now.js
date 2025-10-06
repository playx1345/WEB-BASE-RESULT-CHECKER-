#!/usr/bin/env node

/**
 * Quick Admin Setup Script - Direct Execution
 * Creates admin@plateau.edu.ng with password Admin123456
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://juftwuinlhjfmyphfyxt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnR3dWlubGhqZm15cGhmeXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAyNDU5OCwiZXhwIjoyMDcyNjAwNTk4fQ.ILexoQDzBKnNqVhPiCPLVBcbj_pZQAT4m8PgDhp4oJU";

async function createAdminAccount() {
  console.log('🔄 Creating admin account...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Create admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@plateau.edu.ng',
      password: 'Admin123456',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'System Administrator',
        department: 'Computer Science'
      }
    });

    if (createError) {
      if (createError.message.includes('already registered')) {
        console.log('✅ Admin account already exists!');
        console.log('📋 Admin Credentials:');
        console.log('   Email: admin@plateau.edu.ng');
        console.log('   Password: Admin123456');
        return;
      }
      throw createError;
    }

    console.log('✅ Admin account created successfully!');
    console.log('📋 Admin Credentials:');
    console.log('   Email: admin@plateau.edu.ng');
    console.log('   Password: Admin123456');
    console.log('   User ID:', newUser.user.id);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminAccount();