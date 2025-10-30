# Create Demo Students

This guide explains how to create demo student accounts for testing.

## Prerequisites

1. Ensure you have Node.js installed
2. Make sure your `.env` file contains:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Steps to Create Demo Students

### Option 1: Using the Script (Recommended)

1. Open your terminal in the project root directory

2. Install dependencies if needed:
   ```bash
   npm install
   ```

3. Run the demo students creation script:
   ```bash
   node scripts/create-demo-students.js
   ```

4. The script will create 5 demo students with the following credentials:

   | Name | Matric Number | PIN | Level | Fee Status |
   |------|--------------|-----|-------|-----------|
   | John Doe | PSP/SICT/CSC/ND/24/001 | 123456 | ND1 | Paid |
   | Jane Smith | PSP/SICT/CSC/ND/24/002 | 234567 | ND1 | Unpaid |
   | Michael Johnson | PSP/SICT/CSC/ND/23/001 | 345678 | ND2 | Paid |
   | Sarah Wilson | PSP/SICT/CSC/ND/23/002 | 456789 | ND2 | Unpaid |
   | David Brown | PSP/SICT/CSC/HND/24/001 | 567890 | HND1 | Paid |

### Option 2: Using Admin UI

1. Log in to the admin dashboard
2. Navigate to the Students section
3. Click "Create Student" or "Bulk Create Students"
4. Fill in the student details
5. Click create

## Testing Student Login

After creating demo students, you can test login with:

**For students with "Paid" status:**
- Navigate to `/auth`
- Enter Matric Number (e.g., `PSP/SICT/CSC/ND/24/001`)
- Enter PIN (e.g., `123456`)
- Click "Sign In"

**Note:** Students with "Unpaid" fee status won't be able to view their results, but can still log in and see announcements.

## Troubleshooting

### Error: "Missing required environment variables"
- Ensure your `.env` file contains `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Get the service role key from Supabase Dashboard > Settings > API

### Error: "Only admins can create students"
- The script uses the service role key which bypasses RLS
- Make sure you're using the correct service role key

### Students already exist
- The script will skip existing students
- Check the console output for details

## Next Steps

After creating demo students:
1. Create demo results for these students (Phase 3)
2. Create demo announcements (Phase 4)
3. Test the complete student portal experience
