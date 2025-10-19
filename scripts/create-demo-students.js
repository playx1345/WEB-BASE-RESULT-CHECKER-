#!/usr/bin/env node

/**
 * Demo Students Creation Script
 * 
 * Creates demo student accounts with real passwords for testing
 * 
 * Usage:
 *   node scripts/create-demo-students.js
 */

import { createClient } from '@supabase/supabase-js';
import { exit } from 'process';
import dotenv from 'dotenv';

dotenv.config();

const demoStudents = [
  {
    full_name: 'John Doe',
    matric_number: 'PSP/SICT/CSC/ND/24/001',
    pin: '123456',
    level: 'ND1',
    phone_number: '08012345678',
    fee_status: 'paid'
  },
  {
    full_name: 'Jane Smith',
    matric_number: 'PSP/SICT/CSC/ND/24/002',
    pin: '234567',
    level: 'ND1',
    phone_number: '08023456789',
    fee_status: 'unpaid'
  },
  {
    full_name: 'Michael Johnson',
    matric_number: 'PSP/SICT/CSC/ND/23/001',
    pin: '345678',
    level: 'ND2',
    phone_number: '08034567890',
    fee_status: 'paid'
  },
  {
    full_name: 'Sarah Wilson',
    matric_number: 'PSP/SICT/CSC/ND/23/002',
    pin: '456789',
    level: 'ND2',
    phone_number: '08045678901',
    fee_status: 'unpaid'
  },
  {
    full_name: 'David Brown',
    matric_number: 'PSP/SICT/CSC/HND/24/001',
    pin: '567890',
    level: 'HND1',
    phone_number: '08056789012',
    fee_status: 'paid'
  }
];

async function createDemoStudents() {
  try {
    console.log('🚀 Starting demo students creation process...\n');

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Error: Missing required environment variables');
      console.error('   Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
      exit(1);
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log(`📚 Creating ${demoStudents.length} demo students...\n`);
    
    for (const student of demoStudents) {
      console.log(`👤 Creating student: ${student.full_name} (${student.matric_number})`);
      
      // Check if student already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('matric_number')
        .eq('matric_number', student.matric_number)
        .single();
      
      if (existingStudent) {
        console.log(`   ⚠️  Student already exists, skipping...`);
        continue;
      }
      
      // Use admin_create_student RPC function
      const { data: result, error: createError } = await supabase
        .rpc('admin_create_student', {
          p_full_name: student.full_name,
          p_matric_number: student.matric_number,
          p_level: student.level,
          p_phone_number: student.phone_number,
          p_pin: student.pin
        });
      
      if (createError) {
        console.error(`   ❌ Error creating student: ${createError.message}`);
        continue;
      }
      
      // Update fee status
      const { error: updateError } = await supabase
        .from('students')
        .update({ fee_status: student.fee_status })
        .eq('matric_number', student.matric_number);
      
      if (updateError) {
        console.warn(`   ⚠️  Warning: Could not update fee status: ${updateError.message}`);
      }
      
      console.log(`   ✅ Created successfully (PIN: ${student.pin}, Fee: ${student.fee_status})`);
    }
    
    console.log('\n🎉 Demo students creation completed!');
    console.log('📋 Students can now log in at /auth using their matric number and PIN');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    exit(1);
  }
}

createDemoStudents();
