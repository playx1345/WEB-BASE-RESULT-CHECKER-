#!/usr/bin/env node

/**
 * Comprehensive Role-Based Access Control Testing
 * 
 * This script tests the complete RBAC system including:
 * - Admin authentication
 * - Role verification functions
 * - Student creation by admin
 * - Unauthorized access prevention
 * - RLS policy enforcement
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://juftwuinlhjfmyphfyxt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnR3dWlubGhqZm15cGhmeXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjQ1OTgsImV4cCI6MjA3MjYwMDU5OH0.AOrVvdRrWelJ8oJDPr3icm0s1nb-HRh1KcOnqSmFso4";

class RBACTester {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.testResults = [];
    this.cleanupTasks = [];
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive RBAC Testing Suite\n');
    console.log('=' .repeat(60));

    try {
      // Test 1: Admin Authentication
      await this.testAdminAuthentication();
      
      // Test 2: Role Verification Functions
      await this.testRoleVerificationFunctions();
      
      // Test 3: Admin Student Creation
      await this.testAdminStudentCreation();
      
      // Test 4: Unauthorized Access Prevention
      await this.testUnauthorizedAccessPrevention();
      
      // Test 5: RLS Policy Enforcement
      await this.testRLSPolicyEnforcement();
      
      // Cleanup
      await this.cleanup();
      
      // Summary
      this.printTestSummary();
      
    } catch (error) {
      console.error('❌ Test suite failed with error:', error.message);
      await this.cleanup();
    }
  }

  async testAdminAuthentication() {
    console.log('\n1️⃣  Testing Admin Authentication');
    console.log('-'.repeat(40));

    try {
      // Test admin login
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: 'admin@plateau.edu.ng',
        password: 'Admin123456'
      });

      if (authError) {
        this.recordTest('Admin Login', false, authError.message);
        return;
      }

      this.recordTest('Admin Login', true, `Authenticated as ${authData.user.email}`);
      console.log(`   ✅ User ID: ${authData.user.id}`);

      // Check if profile exists
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        this.recordTest('Admin Profile Check', false, profileError.message);
        return;
      }

      this.recordTest('Admin Profile Check', true, `Role: ${profile.role}, Name: ${profile.full_name}`);

    } catch (error) {
      this.recordTest('Admin Authentication', false, error.message);
    }
  }

  async testRoleVerificationFunctions() {
    console.log('\n2️⃣  Testing Role Verification Functions');
    console.log('-'.repeat(40));

    try {
      // Test is_admin function
      const { data: isAdminResult, error: isAdminError } = await this.supabase.rpc('is_admin');
      
      if (isAdminError) {
        this.recordTest('is_admin() Function', false, isAdminError.message);
      } else {
        this.recordTest('is_admin() Function', isAdminResult === true, `Returned: ${isAdminResult}`);
      }

      // Test check_user_role function
      const { data: checkRoleResult, error: checkRoleError } = await this.supabase.rpc('check_user_role', {
        required_role: 'admin'
      });

      if (checkRoleError) {
        this.recordTest('check_user_role() Function', false, checkRoleError.message);
      } else {
        this.recordTest('check_user_role() Function', checkRoleResult === true, `Returned: ${checkRoleResult}`);
      }

      // Test get_current_user_role function
      const { data: currentRole, error: currentRoleError } = await this.supabase.rpc('get_current_user_role');

      if (currentRoleError) {
        this.recordTest('get_current_user_role() Function', false, currentRoleError.message);
      } else {
        this.recordTest('get_current_user_role() Function', currentRole === 'admin', `Returned: ${currentRole}`);
      }

    } catch (error) {
      this.recordTest('Role Verification Functions', false, error.message);
    }
  }

  async testAdminStudentCreation() {
    console.log('\n3️⃣  Testing Admin Student Creation');
    console.log('-'.repeat(40));

    try {
      const testStudentData = {
        p_full_name: 'Test Student RBAC',
        p_matric_number: 'RBAC/TEST/001',
        p_level: 'ND1',
        p_phone_number: '08098765432',
        p_pin: null // Auto-generate PIN
      };

      const { data: createResult, error: createError } = await this.supabase.rpc(
        'admin_create_student', 
        testStudentData
      );

      if (createError) {
        this.recordTest('Admin Student Creation', false, createError.message);
        return;
      }

      this.recordTest('Admin Student Creation', true, `Student ID: ${createResult.student_id}, PIN: ${createResult.generated_pin}`);
      
      // Store for cleanup
      this.cleanupTasks.push({
        type: 'delete_student',
        student_id: createResult.student_id
      });

      // Verify student was actually created
      const { data: students, error: studentsError } = await this.supabase
        .from('students')
        .select('*')
        .eq('id', createResult.student_id);

      if (studentsError) {
        this.recordTest('Student Creation Verification', false, studentsError.message);
      } else {
        this.recordTest('Student Creation Verification', students.length === 1, `Found ${students.length} student(s)`);
      }

    } catch (error) {
      this.recordTest('Admin Student Creation', false, error.message);
    }
  }

  async testUnauthorizedAccessPrevention() {
    console.log('\n4️⃣  Testing Unauthorized Access Prevention');
    console.log('-'.repeat(40));

    try {
      // Sign out admin
      await this.supabase.auth.signOut();
      this.recordTest('Admin Logout', true, 'Successfully signed out');

      // Try to create student without authentication
      const { data: unauthorizedResult, error: unauthorizedError } = await this.supabase.rpc('admin_create_student', {
        p_full_name: 'Unauthorized Test',
        p_matric_number: 'UNAUTH/001',
        p_level: 'ND1'
      });

      // This should fail
      if (unauthorizedError && unauthorizedError.message.includes('Authentication required')) {
        this.recordTest('Unauthorized Student Creation Prevention', true, 'Access properly denied');
      } else if (unauthorizedResult) {
        this.recordTest('Unauthorized Student Creation Prevention', false, 'Unauthorized access was allowed');
      } else {
        this.recordTest('Unauthorized Student Creation Prevention', true, `Blocked with: ${unauthorizedError?.message}`);
      }

      // Test unauthenticated role check
      const { data: unauthRoleCheck, error: unauthRoleError } = await this.supabase.rpc('check_user_role', {
        required_role: 'admin'
      });

      if (!unauthRoleError && unauthRoleCheck === false) {
        this.recordTest('Unauthenticated Role Check', true, 'Correctly returned false for unauthenticated user');
      } else {
        this.recordTest('Unauthenticated Role Check', false, `Unexpected result: ${unauthRoleCheck}`);
      }

    } catch (error) {
      this.recordTest('Unauthorized Access Prevention', false, error.message);
    }
  }

  async testRLSPolicyEnforcement() {
    console.log('\n5️⃣  Testing RLS Policy Enforcement');
    console.log('-'.repeat(40));

    try {
      // Try to access profiles table without authentication
      const { data: profiles, error: profilesError } = await this.supabase
        .from('profiles')
        .select('*');

      // Should return empty or error due to RLS
      if (profilesError || (profiles && profiles.length === 0)) {
        this.recordTest('RLS Profiles Protection', true, 'Profiles protected from unauthenticated access');
      } else {
        this.recordTest('RLS Profiles Protection', false, `Profiles accessible: ${profiles.length} records`);
      }

      // Try to access students table
      const { data: students, error: studentsError } = await this.supabase
        .from('students')
        .select('*');

      if (studentsError || (students && students.length === 0)) {
        this.recordTest('RLS Students Protection', true, 'Students protected from unauthenticated access');
      } else {
        this.recordTest('RLS Students Protection', false, `Students accessible: ${students.length} records`);
      }

    } catch (error) {
      this.recordTest('RLS Policy Enforcement', false, error.message);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Re-authenticate as admin for cleanup
      await this.supabase.auth.signInWithPassword({
        email: 'admin@plateau.edu.ng',
        password: 'Admin123456'
      });

      for (const task of this.cleanupTasks) {
        if (task.type === 'delete_student') {
          const { error } = await this.supabase
            .from('students')
            .delete()
            .eq('id', task.student_id);

          if (error) {
            console.log(`   ⚠️  Could not cleanup student ${task.student_id}: ${error.message}`);
          } else {
            console.log(`   ✅ Cleaned up student ${task.student_id}`);
          }
        }
      }

      // Sign out after cleanup
      await this.supabase.auth.signOut();

    } catch (error) {
      console.log(`   ⚠️  Cleanup failed: ${error.message}`);
    }
  }

  recordTest(testName, passed, details) {
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${testName}: ${details}`);
    this.testResults.push({ name: testName, passed, details });
  }

  printTestSummary() {
    console.log('\n📊 Test Results Summary');
    console.log('=' .repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
    }

    console.log('\n' + '=' .repeat(60));
    if (failedTests === 0) {
      console.log('🎉 All RBAC tests passed! The system is secure.');
    } else {
      console.log('⚠️  Some tests failed. Please review the security configuration.');
    }
  }
}

// Run the tests
const tester = new RBACTester();
tester.runAllTests();