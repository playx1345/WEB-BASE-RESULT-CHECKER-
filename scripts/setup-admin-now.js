#!/usr/bin/env node

/**
 * Quick Admin Setup Script - Direct Execution
 * Creates admin@plateau.edu.ng with password Admin123456
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://juftwuinlhjfmyphfyxt.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createAdminAccount() {
  console.log('🔄 Creating admin account...');
  
  // Validate environment
  if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'your_service_role_key_here') {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not properly configured');
    console.error('   Please set the SUPABASE_SERVICE_ROLE_KEY environment variable');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check if admin user already exists
    console.log('🔍 Checking if admin user already exists...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to check existing users: ${listError.message}`);
    }
    
    const existingAdmin = existingUsers.users.find(user => user.email === 'admin@plateau.edu.ng');
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists!');
      console.log('   User ID:', existingAdmin.id);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('user_id', existingAdmin.id)
        .single();
      
      if (profileError) {
        console.log('⚠️  Profile not found, creating...');
        // Create profile for existing user
        await createAdminProfile(supabase, existingAdmin.id);
      } else {
        console.log('✅ Admin profile exists:', profile.full_name, `(${profile.role})`);
        
        // Check if admin record exists
        const { data: adminRecord, error: adminError } = await supabase
          .from('admins')
          .select('id, department, admin_level')
          .eq('profile_id', profile.id)
          .single();
        
        if (adminError) {
          console.log('⚠️  Admin record not found, creating...');
          await createAdminRecord(supabase, profile.id);
        } else {
          console.log('✅ Admin record exists:', adminRecord.department, `(${adminRecord.admin_level})`);
        }
      }
      
      console.log('📋 Admin Credentials:');
      console.log('   Email: admin@plateau.edu.ng');
      console.log('   Password: Admin123456');
      return;
    }

    // Create new admin user
    console.log('👤 Creating new admin user...');
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
      throw createError;
    }

    console.log('✅ Admin account created successfully!');
    console.log('   User ID:', newUser.user.id);
    
    // Wait a moment for triggers to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify profile was created by trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('user_id', newUser.user.id)
      .single();
    
    if (profileError) {
      console.log('⚠️  Profile not created by trigger, creating manually...');
      await createAdminProfile(supabase, newUser.user.id);
    } else {
      console.log('✅ Admin profile created:', profile.full_name, `(${profile.role})`);
      
      // Create admin record
      await createAdminRecord(supabase, profile.id);
    }

    console.log('📋 Admin Credentials:');
    console.log('   Email: admin@plateau.edu.ng');
    console.log('   Password: Admin123456');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function createAdminProfile(supabase, userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      role: 'admin',
      full_name: 'System Administrator'
    })
    .select('id, role, full_name')
    .single();
  
  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
  
  console.log('✅ Admin profile created:', profile.full_name, `(${profile.role})`);
  return profile;
}

async function createAdminRecord(supabase, profileId) {
  const { data: adminRecord, error } = await supabase
    .from('admins')
    .insert({
      profile_id: profileId,
      department: 'Computer Science',
      admin_level: 'super',
      permissions: {
        manage_students: true,
        manage_results: true,
        manage_announcements: true,
        manage_admins: true
      }
    })
    .select('id, department, admin_level')
    .single();
  
  if (error) {
    throw new Error(`Failed to create admin record: ${error.message}`);
  }
  
  console.log('✅ Admin record created:', adminRecord.department, `(${adminRecord.admin_level})`);
  return adminRecord;
}

createAdminAccount();