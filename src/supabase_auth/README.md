# Modular Supabase Auth

A complete, reusable authentication system built on [Supabase](https://supabase.com). Drop this module into any React/Vite project for instant enterprise-grade authentication.

## Features

- **Email/Password Authentication** - Traditional sign up and sign in
- **Magic Link (Passwordless)** - Sign in via email link
- **Google OAuth** - One-click Google sign in
- **Password Reset** - Full reset flow with email verification
- **Email Change** - Change email with verification
- **Account Deletion** - Complete account removal
- **Session Management** - Auto-refresh tokens, sign out all devices
- **Role-Based Access** - Admin/user roles with first-user admin assignment
- **Toast Notifications** - Success, warning, and error feedback for all actions
- **TypeScript Support** - Fully typed with exported type definitions
- **Prisma Integration** - Schema and setup for database ORM

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Supabase Setup](#supabase-setup)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Database Setup](#database-setup)
6. [Component Reference](#component-reference)
7. [Hook Reference](#hook-reference)
8. [Wiring Up to Your App](#wiring-up-to-your-app)
9. [Prisma Integration](#prisma-integration)
10. [Toast Notifications](#toast-notifications)
11. [Troubleshooting](#troubleshooting)
12. [Resources](#resources)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js sonner lucide-react
```

### 2. Copy the Auth Module

Copy the entire `src/auth` folder to your project.

### 3. Add Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEV_MODE=true
```

### 4. Add Routes

```tsx
// main.tsx or App.tsx
import { AuthCallback, ResetPassword } from './auth';

<Routes>
  <Route path="/auth/callback" element={<AuthCallback />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  {/* Your other routes */}
</Routes>
```

### 5. Use in Your App

```tsx
import { useAuth, AuthModal } from './auth';

function App() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          {isAdmin && <span>Admin</span>}
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => setShowAuth(true)}>Sign In</button>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          isFirstUser={false}
        />
      )}
    </div>
  );
}
```

---

## Environment Setup

### Required Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api) |
| `VITE_SUPABASE_ANON_KEY` | Anonymous/public API key | [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api) |
| `VITE_DEV_MODE` | Enable debug logging | Set to `true` for development |

### Optional Variables (for Prisma)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `DIRECT_URL` | Direct connection URL (for migrations) |

### Example .env File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xmdtgiolsbkvjsywpgco.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Mode
VITE_DEV_MODE=true

# Prisma Database Connection (optional)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
```

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization or select existing
4. Create a new project with a strong database password

### 2. Configure Authentication Settings

Go to **Authentication → URL Configuration**:

| Setting | Development Value | Production Value |
|---------|-------------------|------------------|
| Site URL | `http://localhost:5173` | `https://yourdomain.com` |
| Redirect URLs | `http://localhost:5173/**` | `https://yourdomain.com/**` |

Add these redirect URLs:
```
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
https://yourdomain.com
https://yourdomain.com/auth/callback
https://yourdomain.com/reset-password
```

### 3. Configure Email Templates

Go to **Authentication → Email Templates** and update the redirect URLs:

| Template | Redirect URL |
|----------|--------------|
| Confirm signup | `{{ .SiteURL }}/auth/callback?type=signup` |
| Magic Link | `{{ .SiteURL }}/auth/callback?type=magiclink` |
| Reset Password | `{{ .SiteURL }}/reset-password?type=recovery` |
| Change Email | `{{ .SiteURL }}/auth/callback?type=email_change` |

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API (APIs & Services → Library → Google+ API)

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Select "External" user type
3. Fill in app information:
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if in testing mode

### 3. Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URI:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
5. Copy the **Client ID** and **Client Secret**

### 4. Configure Supabase

1. Go to **Authentication → Providers → Google**
2. Enable Google provider
3. Paste your Client ID and Client Secret
4. Save changes

### Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## Database Setup

### Option 1: Run SQL Script

1. Go to [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Copy the contents of `scripts/setup-supabase.sql`
3. Paste and click "Run"

### Option 2: Manual Setup

#### Users Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
```

#### Task Lists Table

```sql
CREATE TABLE public.task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_example BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read example lists" ON public.task_lists
  FOR SELECT USING (is_example = TRUE);

CREATE POLICY "Users can read own lists" ON public.task_lists
  FOR SELECT USING (auth.uid() = user_id);
```

#### Auto-Create User Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
  user_role TEXT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;

  IF user_count = 0 THEN
    user_role := 'admin';
  ELSE
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  END IF;

  INSERT INTO public.users (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, user_role, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Component Reference

### AuthModal

Main authentication modal with sign in, sign up, magic link, and password reset.

```tsx
import { AuthModal } from './auth';

<AuthModal
  onClose={() => setShowAuth(false)}
  isFirstUser={false}  // Set true if no users exist yet
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `onClose` | `() => void` | Called when modal should close |
| `isFirstUser` | `boolean` | If true, creates admin account |

### AuthCallback

Handles OAuth and magic link redirects. Mount at `/auth/callback`.

```tsx
import { AuthCallback } from './auth';

<Route path="/auth/callback" element={<AuthCallback />} />
```

### ResetPassword

Password reset form. Mount at `/reset-password`.

```tsx
import { ResetPassword } from './auth';

<Route path="/reset-password" element={<ResetPassword />} />
```

### AccountSettings

Account management panel (change password, email, delete account).

```tsx
import { AccountSettings } from './auth';

<AccountSettings
  user={user}
  onClose={() => {}}
  isAdmin={isAdmin}
/>
```

---

## Hook Reference

### useAuth

React hook for authentication state.

```tsx
import { useAuth } from './auth';

function MyComponent() {
  const {
    user,           // User object or null
    session,        // Session object or null
    loading,        // true while checking auth
    isAdmin,        // true if user has admin role
    signOut,        // Sign out current device
    signOutAllDevices,  // Sign out all devices
    refreshSession, // Manually refresh session
  } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}</div>;
}
```

---

## Wiring Up to Your App

### Complete Example

```tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { AuthCallback, ResetPassword } from './auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
```

```tsx
// App.tsx
import { useState } from 'react';
import { useAuth, AuthModal, AccountSettings } from './auth';

function App() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Check if this is the first user
  const [isFirstUser, setIsFirstUser] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
    </div>;
  }

  return (
    <div className="min-h-screen p-4">
      <header className="flex justify-between items-center mb-8">
        <h1>My App</h1>

        {user ? (
          <div className="flex items-center gap-4">
            <span>{user.email}</span>
            {isAdmin && <span className="badge">Admin</span>}
            <button onClick={() => setShowSettings(true)}>Settings</button>
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)}>Sign In</button>
        )}
      </header>

      <main>
        {/* Your app content */}
      </main>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          isFirstUser={isFirstUser}
        />
      )}

      {/* Settings Modal */}
      {showSettings && user && (
        <div className="modal">
          <AccountSettings
            user={user}
            onClose={() => setShowSettings(false)}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
}

export default App;
```

---

## Prisma Integration

### 1. Install Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Update prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String
  role      String   @default("user")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  taskLists TaskList[]

  @@map("users")
}

model TaskList {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  data      Json
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  userId    String?  @map("user_id") @db.Uuid
  isExample Boolean  @default(false) @map("is_example")

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("task_lists")
}
```

### 3. Set DATABASE_URL

Get your connection string from Supabase Dashboard → Settings → Database:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
```

### 4. Generate Client

```bash
npx prisma generate
```

### 5. Use Prisma (Server-Side Only)

```typescript
// For server-side code (Next.js API routes, Express, etc.)
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Get user by ID
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { taskLists: true }
});

// Create task list
const taskList = await prisma.taskList.create({
  data: {
    name: 'My List',
    data: JSON.stringify(tasks),
    userId: user.id,
    isExample: false
  }
});
```

### Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)

---

## Toast Notifications

All auth actions show toast notifications using [Sonner](https://sonner.emilkowal.ski/).

### Notification Types

| Type | Color | Usage |
|------|-------|-------|
| Success | Green | Successful operations |
| Error | Red | Failed operations |
| Warning | Yellow | Validation issues, email not verified |
| Info | Blue | Progress updates, redirecting |

### Setup Toaster

```tsx
import { Toaster } from 'sonner';

// In your root component
<Toaster
  position="top-right"
  richColors
  closeButton
  toastOptions={{
    duration: 4000,
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
    },
  }}
/>
```

### Example Notifications

```typescript
// Success
toast.success('Signed in successfully!', {
  description: 'Welcome back!',
});

// Error
toast.error('Invalid email or password');

// Warning
toast.warning('Email not verified', {
  description: 'Please check your inbox.',
});

// Info
toast.info('Sending magic link...', { duration: 2000 });
```

---

## Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"

Ensure `.env` file exists with:
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

#### OAuth redirect not working

1. Check redirect URLs in Supabase Dashboard
2. Ensure URL matches exactly (including trailing slashes)
3. For Google OAuth, verify the callback URL in Google Cloud Console

#### "Invalid login credentials"

- User may not exist
- Password may be incorrect
- Email may not be verified

#### Password reset link expired

- Links expire after 1 hour by default
- Request a new reset link

#### First user not becoming admin

- Check the `handle_new_user` trigger exists
- Verify no users exist in `public.users` table

### Debug Mode

Enable debug logging:
```env
VITE_DEV_MODE=true
```

Check browser console for `[Auth]` prefixed logs.

---

## Resources

### Supabase

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

### Google OAuth

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

### Prisma

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)

### UI Components

- [Sonner (Toast Library)](https://sonner.emilkowal.ski/)
- [Lucide Icons](https://lucide.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## License

MIT License - Use freely in your projects.

---

*Last updated: 2025-12-17*
