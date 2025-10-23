# Creating Admin Account

To complete the setup, you need to create an admin account. Run this command in your terminal:

```bash
cd scripts
node create-admin.js --email admin@plateau.edu.ng --password Admin123456
```

This will create an admin account with:
- **Email**: admin@plateau.edu.ng  
- **Password**: Admin123456

After creating the admin account, you can:
1. **Login as Admin**: Go to /auth and login with the admin credentials
2. **Manage Students**: Access the admin dashboard to view/create students
3. **View Sample Data**: The system now has 5 sample students with results

## Sample Student Logins

You can also test the student login functionality with these accounts:

| Student | Matric Number | PIN | Level | Fee Status |
|---------|---------------|-----|-------|------------|
| John Doe | PLT/ND/2023/001 | 123456 | ND1 | Paid |
| Jane Smith | PLT/ND/2023/002 | 234567 | ND1 | Unpaid |
| Michael Johnson | PLT/ND/2022/001 | 345678 | ND2 | Paid |
| Sarah Wilson | PLT/ND/2022/002 | 456789 | ND2 | Unpaid |
| David Brown | PLT/HND/2023/001 | 567890 | HND1 | Paid |

Students with "Paid" fee status can view their results. Students with "Unpaid" status will see a payment prompt.