# SQL Scripts

This folder contains all SQL scripts used for the Supabase database setup.

## Files

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Initial database schema with tables, policies, and triggers |

## Usage

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Copy and paste the SQL from the relevant file
4. Click "Run"

## Schema Overview

### Tables

- **users** - User accounts with roles (admin/user)
- **task_lists** - Task lists stored in database (admin feature)

### Key Features

- **Row Level Security (RLS)** - All tables have RLS enabled
- **First User = Admin** - First signup gets admin role via user_metadata
- **Example Lists** - Public read access for is_example=true lists

## Important Notes

### localStorage vs Supabase Storage

| Data | Storage Location | Notes |
|------|------------------|-------|
| Task lists (user) | localStorage | Regular users store tasks locally |
| Task lists (admin) | Supabase | Admins can save to database |
| AI Chat History | localStorage | Stored per browser |
| Settings | localStorage | API keys, preferences |
| Auth session | Supabase + localStorage | Managed by Supabase SDK |

### Preventing Supabase Pause (Free Tier)

Free tier projects pause after 7 days of inactivity. To prevent:
1. Set up a cron job to ping your Supabase URL periodically
2. Or upgrade to a paid plan
3. Or manually unpause when needed

## Running Order

For fresh setup, run scripts in numerical order:
1. `001_initial_schema.sql`