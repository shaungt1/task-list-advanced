# Supabase Setup Guide

## Creating a New Supabase Project

1. **Go to [Supabase](https://supabase.com)** and sign in or create an account

2. **Create a new project**:
   - Click "New Project"
   - Choose your organization
   - Enter a project name (e.g., "task-list-advanced")
   - Create a strong database password (save this!)
   - Choose a region close to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup to complete

3. **Get your API credentials**:
   - Go to Project Settings (gear icon in sidebar)
   - Click "API" section
   - Copy the following:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (under "Project API keys")

4. **Update your .env file**:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Set up the database schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the SQL from the README.md file (see Database Setup section)
   - Run the SQL query

6. **Restart your dev server**:
   ```bash
   npm run dev
   ```

## Database Schema (Quick Setup)

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task_lists table
CREATE TABLE IF NOT EXISTS task_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  is_example BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Task lists policies for admin
CREATE POLICY "Admins can do anything with task lists"
  ON task_lists
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Task lists policies for regular users
CREATE POLICY "Anyone can read example lists"
  ON task_lists FOR SELECT
  USING (is_example = true);

CREATE POLICY "Users can read their own lists"
  ON task_lists FOR SELECT
  USING (created_by = auth.uid());

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.users;

  -- Insert new user with admin role if first user
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'user' END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record after auth signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_task_lists_name ON task_lists(name);
CREATE INDEX IF NOT EXISTS idx_task_lists_is_example ON task_lists(is_example);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

## Testing Your Setup

1. **Start the dev server**: `npm run dev`
2. **Visit** `http://localhost:5173` (or your dev port)
3. **Sign up** - You'll be the first user and become admin automatically
4. **Verify** that you can:
   - See the Admin button in the header
   - Create and save task lists
   - Access the admin dashboard

## Troubleshooting

### "Error: Invalid API key"
- Double-check your `VITE_SUPABASE_ANON_KEY` in `.env`
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env`

### "Error: relation 'users' does not exist"
- Run the database schema SQL in Supabase SQL Editor
- Make sure all tables were created successfully

### Authentication not working
- Check that email confirmations are disabled in Supabase:
  - Go to Authentication → Settings → Email Auth
  - Disable "Confirm email" for development
  - Or check your email for confirmation links

### Password reset not working
- Emails may go to spam folder
- Check Supabase email templates in Authentication → Email Templates
- For development, check Supabase logs to see the reset link

## Email Configuration (Optional)

By default, Supabase uses its own email service. For production, you should configure your own SMTP:

1. Go to Project Settings → Authentication
2. Scroll to "SMTP Settings"
3. Configure your email provider (SendGrid, AWS SES, etc.)
4. Update email templates in Authentication → Email Templates
