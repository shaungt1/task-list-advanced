# Enterprise Authentication System Plan

## Overview

This document outlines the implementation plan for a production-ready, enterprise-level authentication system using Supabase, integrated with the existing React + Vite task management application.

---

## Current State Analysis

### What Currently Exists

| Feature | Status | Location |
|---------|--------|----------|
| Email/Password Sign-up | ✅ Working | `src/components/auth/AuthModal.tsx` |
| Email/Password Sign-in | ✅ Working | `src/components/auth/AuthModal.tsx` |
| Password Reset Request | ✅ Working | `src/components/auth/AuthModal.tsx` |
| First-user Admin Assignment | ✅ Working | `src/components/auth/AuthModal.tsx` |
| Session Management | ✅ Basic | `src/hooks/useAuth.ts` |
| Role-based Access (isAdmin) | ✅ Working | `src/hooks/useAuth.ts` |
| Supabase Client (anon key) | ✅ Working | `src/lib/supabase.ts` |
| Users Table + Trigger | ✅ Working | Supabase DB |
| RLS Policies | ✅ Working | Supabase DB |
| Prisma Schema | ⚠️ Empty | `prisma/schema.prisma` |

### Implementation Status (Updated 2025-12-17)

| Feature | Status | Location |
|---------|--------|----------|
| Password Reset Handler Page | ✅ Implemented | `src/components/auth/ResetPassword.tsx` |
| Magic Link Sign-in | ✅ Implemented | `src/components/auth/AuthModal.tsx` |
| Google OAuth Sign-in | ✅ Implemented | `src/components/auth/AuthModal.tsx` |
| Auth Token Hash Handler | ✅ Implemented | `src/components/auth/AuthCallback.tsx` |
| Auth Callback Route | ✅ Implemented | `/auth/callback` in `main.tsx` |
| Professional UI (shadcn) | ✅ Implemented | All auth components |
| Violet/Fuchsia Theme | ✅ Implemented | All auth components |
| Change Password (logged in) | ✅ Implemented | `src/components/auth/AccountSettings.tsx` |
| Change Email | ✅ Implemented | `src/components/auth/AccountSettings.tsx` |
| Account Deletion | ✅ Implemented | `src/components/auth/AccountSettings.tsx` |
| Sign Out All Devices | ✅ Implemented | `src/components/auth/AccountSettings.tsx` |
| Prisma Models | ✅ Implemented | `prisma/schema.prisma`, `generated/prisma/` |

### Critical Issue - RESOLVED

**Supabase Redirect URL Misconfiguration:**
- ~~Current Supabase redirect: `http://localhost:3000`~~
- User updated to: `http://localhost:5173`
- All auth flows now properly redirect to Vite dev server

---

## Architecture Design

### Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Vite)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Supabase Client (ANON KEY ONLY)                    │    │
│  │  - Sign up / Sign in / Sign out                     │    │
│  │  - Password reset request                           │    │
│  │  - Magic link request                               │    │
│  │  - OAuth initiation                                 │    │
│  │  - Session management (auto-refresh)               │    │
│  │  - NEVER has service_role key                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Auth Service                                        │    │
│  │  - JWT issuance & verification                      │    │
│  │  - Email verification                               │    │
│  │  - Password hashing                                 │    │
│  │  - OAuth provider integration                       │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Database + RLS                                      │    │
│  │  - Row Level Security enforces access               │    │
│  │  - Policies use auth.uid() and auth.jwt()          │    │
│  │  - No direct access without valid JWT               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Client vs Server Responsibilities

| Operation | Runs On | Key Used |
|-----------|---------|----------|
| Sign up | Client | anon key |
| Sign in (password) | Client | anon key |
| Sign in (magic link) | Client | anon key |
| Sign in (Google OAuth) | Client → Supabase | anon key |
| Password reset request | Client | anon key |
| Password update (with token) | Client | anon key |
| Email change | Client | anon key |
| Account deletion | Client (via RLS) | anon key |
| Session refresh | Client (auto) | anon key |
| Data access | Client | JWT (auto-attached) |

**Note:** Since this is a client-only Vite app without a custom backend, all operations use Supabase's built-in security. The service_role key should NEVER exist in the frontend codebase.

---

## Implementation Checklist

### Phase 1: Fix Critical Issues - COMPLETED

- [x] **1.1** Update Supabase redirect URLs in dashboard (User completed manually)
  - Site URL: `http://localhost:5173` (dev) / production URL
  - Redirect URLs: Add `http://localhost:5173/**`

- [x] **1.2** Create auth callback handler
  - Created `src/components/auth/AuthCallback.tsx`
  - Handles URL hash tokens (`#access_token=...`)
  - Handles URL search params (`?type=recovery`, `?type=signup`)
  - Added `/auth/callback` route in `main.tsx`

- [x] **1.3** Add `/reset-password` route
  - Updated `src/components/auth/ResetPassword.tsx` with professional UI
  - Handles recovery token from URL hash
  - Allows user to set new password
  - Added route in `main.tsx`

### Phase 2: Core Auth Features - COMPLETED

- [x] **2.1** Implement Magic Link Sign-in
  - Added Magic Link option in AuthModal
  - Uses `supabase.auth.signInWithOtp({ email })`
  - Redirects to `/auth/callback`

- [x] **2.2** Implement Google OAuth
  - User configured Google provider in Supabase dashboard
  - Added Google SSO button with proper branding
  - Uses `supabase.auth.signInWithOAuth({ provider: 'google' })`
  - Redirect callback handled by AuthCallback component

- [x] **2.3** Email Verification Flow
  - Sign-up detects if verification is required
  - AuthCallback handles verification tokens
  - Shows appropriate UI for unverified users

### Phase 3: Account Management - COMPLETED

- [x] **3.1** Change Password (when logged in)
  - Created `src/components/auth/AccountSettings.tsx`
  - Integrated into SettingsModal with collapsible UI
  - Uses `supabase.auth.updateUser({ password: newPassword })`

- [x] **3.2** Change Email
  - Added to AccountSettings component
  - Uses `supabase.auth.updateUser({ email: newEmail })`
  - Shows warning about verification email

- [x] **3.3** Account Deletion
  - Added to AccountSettings with DELETE confirmation
  - Deletes user data from `users` table
  - Deletes user's task_lists
  - Signs out user after deletion

### Phase 4: Session & Security - COMPLETED

- [x] **4.1** Session State Display
  - Shows user email and admin status in AccountSettings
  - Integrated into expandable Settings section

- [x] **4.2** Sign Out (current device)
  - Already implemented in useAuth
  - Available in SettingsModal

- [x] **4.3** Sign Out All Devices
  - Added to AccountSettings
  - Uses `supabase.auth.signOut({ scope: 'global' })`

### Phase 5: Prisma Schema - COMPLETED

- [x] **5.1** Define Prisma models matching Supabase schema
  - User model with proper field mappings (@map, @db.Uuid, @db.Timestamptz)
  - TaskList model with Json field for task data
  - Proper relations with onDelete: Cascade
  - @@map directives for table name mapping

- [x] **5.2** Generate Prisma client
  - Updated DATABASE_URL to use Supabase direct connection
  - Ran `npx prisma generate` successfully
  - Client generated to `./generated/prisma`
  - Note: Direct DB connection blocked by Supabase firewall (expected for client-only apps)

---

## File Changes Summary

### Files Created

| File | Purpose | Status |
|------|---------|--------|
| `src/components/auth/ResetPassword.tsx` | Password reset form after email link | ✅ Created |
| `src/components/auth/AuthCallback.tsx` | Handle auth redirects and tokens | ✅ Created |
| `src/components/auth/AccountSettings.tsx` | Change email, password, delete account | ✅ Created |

### Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/main.tsx` | Added `/reset-password` and `/auth/callback` routes | ✅ Done |
| `src/components/auth/AuthModal.tsx` | Complete rewrite with shadcn UI, Google SSO, Magic Link | ✅ Done |
| `src/components/SettingsModal.tsx` | Integrated AccountSettings with collapsible UI | ✅ Done |
| `prisma/schema.prisma` | Add User and TaskList models | ✅ Done |
| `.env` | Updated DATABASE_URL for Supabase | ✅ Done |

---

## Environment Variables

### Current (.env)
```
VITE_SUPABASE_URL=https://xmdtgiolsbkvjsywpgco.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DEV_MODE=true
DATABASE_URL="postgres://..."
```

### Additional Required
```
# No additional env vars required for basic auth
# Google OAuth is configured in Supabase dashboard, not in env
```

---

## Supabase Dashboard Configuration

### Authentication Settings

1. **Site URL:** `http://localhost:5173` (dev) or production URL
2. **Redirect URLs (add all):**
   - `http://localhost:5173`
   - `http://localhost:5173/reset-password`
   - `http://localhost:5173/auth/callback`
   - `https://your-production-domain.com`
   - `https://your-production-domain.com/reset-password`
   - `https://your-production-domain.com/auth/callback`

### Email Templates (Update redirect URLs)

1. **Confirm signup:** `{{ .SiteURL }}/auth/callback?type=signup`
2. **Magic Link:** `{{ .SiteURL }}/auth/callback?type=magiclink`
3. **Reset Password:** `{{ .SiteURL }}/reset-password?type=recovery`
4. **Change Email:** `{{ .SiteURL }}/auth/callback?type=email_change`

### Google OAuth Setup

1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Add Google Client ID and Secret (from Google Cloud Console)
4. Configure OAuth consent screen in Google Cloud
5. Add authorized redirect URI: `https://xmdtgiolsbkvjsywpgco.supabase.co/auth/v1/callback`

---

## Implementation Order

```
Phase 1 (Critical Fixes) ──────────────────────────────────────
│
├── 1.1 Fix Supabase redirect URLs (manual in dashboard)
├── 1.2 Create auth callback handler
└── 1.3 Create reset password page
│
Phase 2 (Core Features) ───────────────────────────────────────
│
├── 2.1 Magic link sign-in
├── 2.2 Google OAuth
└── 2.3 Email verification flow
│
Phase 3 (Account Management) ──────────────────────────────────
│
├── 3.1 Change password
├── 3.2 Change email
└── 3.3 Account deletion
│
Phase 4 (Session Management) ──────────────────────────────────
│
├── 4.1 Session display
├── 4.2 Sign out (current)
└── 4.3 Sign out all devices
│
Phase 5 (Optional: Prisma) ────────────────────────────────────
│
├── 5.1 Define models
└── 5.2 Generate client
```

---

## Common Mistakes to Avoid

1. **NEVER** put `SUPABASE_SERVICE_ROLE_KEY` in frontend code
2. **NEVER** expose service role operations to the client
3. **ALWAYS** use `anon` key for client-side Supabase
4. **ALWAYS** handle auth tokens from URL hash (not just query params)
5. **ALWAYS** clean up URL after processing auth tokens
6. **NEVER** store tokens manually - let Supabase handle it
7. **ALWAYS** verify redirect URLs match exactly in Supabase dashboard
8. **NEVER** skip email verification in production

---

## Testing Checklist

After implementation, verify each flow:

- [ ] Sign up with email → receives verification email → can verify → can sign in
- [ ] Sign in with password → session created → can access protected routes
- [ ] Sign in with magic link → receives email → clicking link signs in
- [ ] Sign in with Google → redirects to Google → returns signed in
- [ ] Forgot password → receives email → can reset password → can sign in
- [ ] Change password (logged in) → password changed → old password rejected
- [ ] Change email → receives verification → new email works
- [ ] Delete account → data removed → cannot sign in
- [ ] Sign out → session cleared → cannot access protected routes
- [ ] Sign out all devices → all sessions invalidated
- [ ] Admin role preserved after all auth flows

---

## Notes for Future Server-Side Integration

If you later add a Next.js backend or custom API:

1. Pass Supabase access token as `Authorization: Bearer <token>` header
2. Server verifies token using Supabase Admin client or JWT library
3. Extract `user_id` from verified token for database queries
4. Use service_role key ONLY on server, NEVER expose to client
5. Consider Auth.js (NextAuth) for Next.js with Supabase adapter

---

*Document created: 2025-12-17*
*Last updated: 2025-12-17 - All Phases Complete (1-5)*
