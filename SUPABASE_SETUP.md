# Supabase Setup Guide for Gym Tracker

This guide will walk you through setting up Supabase for your gym tracker application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in the project details:
    - **Name**: `gym-tracker` (or your preferred name)
    - **Database Password**: Create a strong password (save this!)
    - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
    - **Project URL** (starts with `https://`)
    - **anon public** key (starts with `eyJ`)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
touch .env.local
```

2. Add the following content to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Replace the placeholder values with your actual Supabase credentials from Step 2.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire content from `supabase/schema.sql` in your project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:

-   All necessary tables (users, exercises, workout_templates, etc.)
-   Row Level Security (RLS) policies
-   Triggers for user management
-   Initial exercise data

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Save the changes

## Step 6: Test the Connection

1. Start your development server:

```bash
pnpm dev
```

2. Open your browser to `http://localhost:3000`
3. You should see the authentication form
4. Try creating an account to test the connection

## Step 7: Verify Database Setup

1. In your Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
    - `users`
    - `exercises` (with initial data)
    - `workout_templates`
    - `workout_exercises`
    - `workout_sessions`
    - `workout_sets`

## Troubleshooting

### Common Issues:

1. **"Your project's URL and API key are required"**

    - Make sure your `.env.local` file exists and has the correct values
    - Restart your development server after adding environment variables

2. **Authentication errors**

    - Verify your Site URL and Redirect URLs are correct in Supabase Auth settings
    - Make sure you're using the `anon` key, not the `service_role` key

3. **Database connection errors**
    - Ensure the schema was executed successfully in the SQL Editor
    - Check that all tables were created

### Environment Variables Reference:

```env
# Required for the app to work
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Next Steps

Once Supabase is connected:

1. Test user registration and login
2. Create your first workout template
3. Start logging workouts
4. Check that progressive overload recommendations work

Your gym tracker should now be fully functional! 🎉
