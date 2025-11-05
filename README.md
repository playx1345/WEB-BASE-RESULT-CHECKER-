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

## Admin User Management

### Creating an Admin User

This project includes a script to programmatically create admin users with full system privileges. This is useful for initial setup or creating additional administrators.

#### Prerequisites

1. **Get your Supabase Service Role Key:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the `service_role` key (not the `anon` key)
   - This key has admin privileges - keep it secure!

2. **Configure Environment Variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your service role key
   SUPABASE_SERVICE_ROLE_KEY="your_actual_service_role_key_here"
   ```

#### Usage Options

**Option 1: Command Line Arguments**
```bash
# Using npm script
npm run create-admin -- --email admin@college.edu --password MySecurePass123

# Or directly with node
node scripts/create-admin.js --email admin@college.edu --password MySecurePass123
```

**Option 2: Environment Variables**
```bash
# Set environment variables and run
ADMIN_EMAIL="admin@college.edu" ADMIN_PASSWORD="MySecurePass123" npm run create-admin
```

**Option 3: Add to .env file**
```bash
# Add these to your .env file (temporarily)
ADMIN_EMAIL="admin@college.edu"
ADMIN_PASSWORD="MySecurePass123"

# Then run the script
npm run create-admin

# Remember to remove the credentials from .env after creation
```

#### Security Features

- **Email validation**: Ensures proper email format
- **Password strength**: Requires 8+ characters with letters and numbers
- **Duplicate prevention**: Checks for existing users before creation
- **Auto-confirmation**: Admin users are automatically email-verified
- **Secure metadata**: Sets admin role in user metadata for proper profile creation

#### What the Script Does

1. Validates input parameters and environment variables
2. Connects to Supabase using the service role key
3. Checks if a user with the email already exists
4. Creates the user with admin role metadata
5. Verifies the admin profile was created correctly
6. Provides detailed feedback on success/failure

#### Troubleshooting

**Error: "SUPABASE_SERVICE_ROLE_KEY environment variable is required"**
- Make sure you've added the service role key to your `.env` file
- Ensure the key is correct and has the proper format

**Error: "A user with email X already exists"**
- The email is already registered in your system
- Use a different email address for the new admin

**Error: "Password must be at least 8 characters and contain both letters and numbers"**
- Use a stronger password that meets the requirements
- Example: `AdminPass123` or `SecureAdmin2024`

#### After Admin Creation

Once created, the admin user can:
- Log in through the standard authentication flow at `/auth`
- Access all admin features in the system
- Manage students, view all profiles, and create announcements
- The admin role is automatically recognized by the system's Row Level Security policies

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c322879f-df62-472c-8fd0-ae664960a6c2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
