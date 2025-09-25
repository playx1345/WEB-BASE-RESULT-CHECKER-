#!/usr/bin/env node

/**
 * Quick Admin Setup Script
 * 
 * This script sets up the demo admin using direct database queries
 * since the migration should already create the admin user.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://juftwuinlhjfmyphfyxt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnR3dWlubGhqZm15cGhmeXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjQ1OTgsImV4cCI6MjA3MjYwMDU5OH0.AOrVvdRrWelJ8oJDPr3icm0s1nb-HRh1KcOnqSmFso4";

async function checkAdminSetup() {
  console.log('🔍 Checking Admin Setup...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Test admin login
    console.log('1️⃣ Testing admin login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@plateau.edu.ng',
      password: 'Admin123456'
    });
    
    if (authError) {
      console.error('❌ Admin login failed:', authError.message);
      console.log('💡 This suggests the admin user was not created by the migration');
      console.log('   The migration should have created it automatically');
      return false;
    }
    
    console.log('✅ Admin login successful');
    console.log('   User ID:', authData.user.id);
    
    // Check profile
    console.log('\n2️⃣ Checking admin profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Admin profile not found:', profileError.message);
      return false;
    }
    
    console.log('✅ Admin profile found');
    console.log('   Role:', profile.role);
    console.log('   Name:', profile.full_name);
    
    // Test role function
    console.log('\n3️⃣ Testing role verification function...');
    const { data: roleCheck, error: roleError } = await supabase.rpc('check_user_role', {
      required_role: 'admin'
    });
    
    if (roleError) {
      console.error('❌ Role verification failed:', roleError.message);
      return false;
    }
    
    if (!roleCheck) {
      console.error('❌ Role verification returned false');
      return false;
    }
    
    console.log('✅ Role verification successful');
    
    console.log('\n🎉 Admin setup is complete and working!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@plateau.edu.ng');
    console.log('   Password: Admin123456');
    
    // Sign out
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the check
checkAdminSetup();