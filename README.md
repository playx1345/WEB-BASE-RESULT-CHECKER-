# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c322879f-df62-472c-8fd0-ae664960a6c2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c322879f-df62-472c-8fd0-ae664960a6c2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)

## Admin Login Feature

This application includes a comprehensive admin authentication system:

### Admin Account Creation
1. Navigate to `/auth` page
2. Click on "Sign Up" tab
3. Select "Admin Account" from the Account Type dropdown
4. Fill in required fields:
   - Email (required)
   - Full Name (required)
   - Phone Number (optional)
   - Password & Confirm Password (required)
5. Submit the form to create an admin account

### Admin Login
1. Navigate to `/auth` page
2. Use the "Sign In" tab (same form for both students and admins)
3. Enter your admin email and password
4. Admin users are automatically redirected to `/admin` dashboard

### Role-Based Access
- **Students**: Access student dashboard and result viewing (with paid fees)
- **Admins**: Access admin dashboard at `/admin` with full system management capabilities
- **Protected Routes**: Admin-only routes are protected via role-based access control

### Security Features
- Password hashing and secure authentication via Supabase
- Session management with automatic token refresh
- Role-based access control with database-level RLS policies
- Input validation and error handling
- Rate limiting and security best practices

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c322879f-df62-472c-8fd0-ae664960a6c2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
