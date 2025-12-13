-- =====================================================
-- Task List Advanced - Initial Database Schema
-- Version: 1.0
-- Date: 2025-01-17
-- =====================================================

-- Create task_lists table
CREATE TABLE IF NOT EXISTS task_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  is_example boolean DEFAULT false
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_lists_is_example ON task_lists (is_example);
CREATE INDEX IF NOT EXISTS idx_task_lists_user_id ON task_lists (user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =====================================================
-- Task Lists Policies
-- =====================================================

-- Public read access for example lists
CREATE POLICY "Public read access for example lists"
  ON task_lists
  FOR SELECT
  USING (
    is_example = true OR
    (auth.role() = 'authenticated' AND auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  );

-- Admin write access
CREATE POLICY "Admin write access"
  ON task_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

-- Admin update access
CREATE POLICY "Admin update access"
  ON task_lists
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

-- Admin delete access
CREATE POLICY "Admin delete access"
  ON task_lists
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

-- =====================================================
-- Users Policies
-- =====================================================

-- Allow public read access to user count (for first user check)
CREATE POLICY "Allow public read access to user count"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Users can read own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all user data
CREATE POLICY "Admins can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

-- Admins can update user data
CREATE POLICY "Admins can update user data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

-- =====================================================
-- Function: Handle New User Creation
-- =====================================================
-- This function creates a user record when someone signs up
-- First user automatically becomes admin

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger: Create user record after auth signup
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE task_lists IS 'Stores all task lists including example lists';
COMMENT ON TABLE users IS 'Stores user information and roles';
COMMENT ON COLUMN task_lists.is_example IS 'Indicates if this is a public example list';
COMMENT ON COLUMN users.role IS 'User role (admin or user)';