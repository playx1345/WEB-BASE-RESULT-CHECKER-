# Creating Admin Account

To set up a real admin account with full access, run this command in your terminal:

```bash
cd scripts
node create-admin.js --email admin@plateau.edu.ng --password Admin123456
```

This will create a **real admin account** stored in Supabase with:
- **Email**: admin@plateau.edu.ng  
- **Password**: Admin123456
- **Role**: admin (stored securely in the `user_roles` table)

## Security Features

✅ **No Mock Admin** - Real authentication via Supabase Auth  
✅ **Secure Role Storage** - Admin role stored in separate `user_roles` table  
✅ **Protected Access** - All admin operations secured with RLS policies  
✅ **Audit Logging** - All admin actions are logged in `audit_logs` table  

## After Creating Admin Account

1. **Login as Admin**: Go to `/auth` → Admin tab → Use the credentials above
2. **Manage Students**: Access the admin dashboard to create/manage students
3. **View Analytics**: Monitor system usage and student performance
4. **Upload Results**: Manage student results and grades

## Sample Student Logins

Test the student portal with these demo accounts:

| Student | Matric Number | PIN | Level | Fee Status |
|---------|---------------|-----|-------|------------|
| John Doe | PSP/SICT/CSC/ND/24/001 | 123456 | ND1 | Paid |
| Jane Smith | PSP/SICT/CSC/ND/24/002 | 234567 | ND1 | Unpaid |
| Michael Johnson | PSP/SICT/CSC/ND/23/001 | 345678 | ND2 | Paid |
| Sarah Wilson | PSP/SICT/CSC/ND/23/002 | 456789 | ND2 | Unpaid |
| David Brown | PSP/SICT/CSC/HND/24/001 | 567890 | HND1 | Paid |

**Note**: Students with "Paid" fee status can view their results. Students with "Unpaid" status will see a payment prompt.

## Creating Demo Students

To create the demo student accounts with real passwords, run:

```bash
cd scripts
node create-demo-students.js
```

## Important Security Notes

🔒 **No Client-Side Role Checking** - All admin verification happens server-side  
🔒 **No Hardcoded Credentials** - All auth goes through Supabase  
🔒 **Role-Based Access Control** - Separate `user_roles` table prevents privilege escalation  
🔒 **Database Security** - RLS policies enforce access control at the database level