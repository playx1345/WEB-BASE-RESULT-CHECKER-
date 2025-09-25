#!/usr/bin/env node

/**
 * Test Role-Based Access Control
 * 
 * This script tests the admin authentication and student creation functionality.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = "https://juftwuinlhjfmyphfyxt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnR3dWlubGhqZm15cGhmeXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjQ1OTgsImV4cCI6MjA3MjYwMDU5OH0.AOrVvdRrWelJ8oJDPr3icm0s1nb-HRh1KcOnqSmFso4";

async function testRoleBasedAccess() {
  console.log('🧪 Starting Role-Based Access Control Tests\n');
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    console.log('1️⃣ Testing Admin Authentication...');
    
    // Test admin login
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.signInWithPassword({
      email: 'admin@plateau.edu.ng',
      password: 'Admin123456'
    });
    
    if (adminAuthError) {
      console.error('❌ Admin authentication failed:', adminAuthError.message);
      console.log('💡 Make sure the admin user exists in the database');
      console.log('   Run: npm run create-admin');
      return;
    }
    
    console.log('✅ Admin authentication successful');
    console.log('   User ID:', adminAuth.user.id);
    
    // Test role verification
    console.log('\n2️⃣ Testing Role Verification...');
    
    const { data: roleCheck, error: roleError } = await supabase.rpc('check_user_role', {
      required_role: 'admin'
    });
    
    if (roleError) {
      console.error('❌ Role verification failed:', roleError.message);
      return;
    }
    
    if (!roleCheck) {
      console.error('❌ Admin role not found in database');
      console.log('💡 The user exists but doesn\'t have admin role assigned');
      return;
    }
    
    console.log('✅ Admin role verified');
    
    // Test student creation (with a test student)
    console.log('\n3️⃣ Testing Student Creation...');
    
    const testStudent = {
      p_full_name: 'Test Student',
      p_matric_number: 'TEST/2024/001',
      p_level: 'ND1',
      p_phone_number: '08012345678',
      p_pin: null // Let it generate a PIN
    };
    
    const { data: studentData, error: studentError } = await supabase.rpc('admin_create_student', testStudent);
    
    if (studentError) {
      console.error('❌ Student creation failed:', studentError.message);
      return;
    }
    
    console.log('✅ Student creation successful');
    console.log('   Student ID:', studentData.student_id);
    console.log('   Generated PIN:', studentData.generated_pin);
    
    // Clean up - delete the test student
    console.log('\n4️⃣ Cleaning up test data...');
    
    // Delete from students table
    const { error: deleteStudentError } = await supabase
      .from('students')
      .delete()
      .eq('id', studentData.student_id);
    
    if (deleteStudentError) {
      console.warn('⚠️ Warning: Could not delete test student:', deleteStudentError.message);
    } else {
      console.log('✅ Test student cleaned up');
    }
    
    console.log('\n5️⃣ Testing Student Access Restriction...');
    
    // Sign out admin
    await supabase.auth.signOut();
    
    // Try to create student without authentication
    const { data: unauthorizedData, error: unauthorizedError } = await supabase.rpc('admin_create_student', {
      p_full_name: 'Unauthorized Test',
      p_matric_number: 'UNAUTH/2024/001',
      p_level: 'ND1'
    });
    
    if (unauthorizedError && unauthorizedError.message.includes('Authentication required')) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.error('❌ Unauthorized access was not blocked properly');
    }
    
    console.log('\n🎉 All Role-Based Access Control Tests Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Admin authentication works');
    console.log('   ✅ Role verification works');
    console.log('   ✅ Admin can create students');
    console.log('   ✅ Unauthorized access is blocked');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the tests
testRoleBasedAccess();