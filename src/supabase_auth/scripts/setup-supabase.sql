-- ============================================================================
-- MODULAR SUPABASE AUTH - DATABASE SETUP SCRIPT
-- ============================================================================
-- This script sets up the required database tables and security policies
-- for the modular authentication system.
--
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- Prerequisites:
-- 1. Create a Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your project dashboard
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- This table stores additional user information beyond what Supabase Auth provides.
-- It syncs with auth.users via a trigger.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can delete their own data
CREATE POLICY "Users can delete own data"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 2. TASK LISTS TABLE
-- ============================================================================
-- Stores task lists with JSON data. Supports example lists visible to all users.

CREATE TABLE IF NOT EXISTS public.task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_example BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;

-- Anyone can read example lists
CREATE POLICY "Anyone can read example lists"
  ON public.task_lists
  FOR SELECT
  USING (is_example = TRUE);

-- Users can read their own lists
CREATE POLICY "Users can read own lists"
  ON public.task_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own lists
CREATE POLICY "Users can create own lists"
  ON public.task_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lists
CREATE POLICY "Users can update own lists"
  ON public.task_lists
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own lists
CREATE POLICY "Users can delete own lists"
  ON public.task_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins have full access to all lists
CREATE POLICY "Admins have full access to task lists"
  ON public.task_lists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. AUTO-CREATE USER TRIGGER
-- ============================================================================
-- Automatically creates a public.users record when a new auth.users record is created.
-- The first user to sign up becomes an admin.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
  user_role TEXT;
BEGIN
  -- Count existing users to determine if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.users;

  -- First user becomes admin, otherwise check metadata
  IF user_count = 0 THEN
    user_role := 'admin';
  ELSE
    -- Check if role is specified in user metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  END IF;

  -- Insert into public.users
  INSERT INTO public.users (id, email, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists to avoid errors on re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on task_lists for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_task_lists_user_id ON public.task_lists(user_id);

-- Index on task_lists for faster queries on example lists
CREATE INDEX IF NOT EXISTS idx_task_lists_is_example ON public.task_lists(is_example) WHERE is_example = TRUE;

-- Index on users for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================
-- Grant necessary permissions to authenticated and anonymous users

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.task_lists TO anon;
GRANT ALL ON public.task_lists TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the setup was successful:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check trigger
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================
-- Uncomment and run to remove everything:

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS public.task_lists;
-- DROP TABLE IF EXISTS public.users;
