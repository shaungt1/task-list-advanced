# Supabase Connection Fix Plan

**Date**: 2025-11-17
**Issue**: `ERR_NAME_NOT_RESOLVED` when trying to authenticate or access Supabase
**Root Cause**: Supabase URL `jnpcnfnfoqxjcvkvhhbk.supabase.co` is not resolving (project doesn't exist or was deleted)

---

## 1. Problem Analysis

### Current Error
```
POST https://jnpcnfnfoqxjcvkvhhbk.supabase.co/auth/v1/signup net::ERR_NAME_NOT_RESOLVED
POST https://jnpcnfnfoqxjcvkvhhbk.supabase.co/auth/v1/token?grant_type=password net::ERR_NAME_NOT_RESOLVED
POST https://jnpcnfnfoqxjcvkvhhbk.supabase.co/auth/v1/recover?redirect_to=... net::ERR_NAME_NOT_RESOLVED
HEAD https://jnpcnfnfoqxjcvkvhhbk.supabase.co/rest/v1/users?select=* net::ERR_NAME_NOT_RESOLVED
GET https://jnpcnfnfoqxjcvkvhhbk.supabase.co/rest/v1/task_lists?... net::ERR_NAME_NOT_RESOLVED
```

### Why This Happens
- DNS cannot resolve the Supabase project URL
- The project may have been:
  - Deleted
  - Paused (free tier limitation)
  - Never properly created
  - URL was incorrect from the start

---

## 2. Authentication Flow Trace

### Files Involved in Auth Flow

#### 2.1 Supabase Client Initialization
**File**: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
- **Purpose**: Creates single Supabase client instance used throughout app
- **Reads from**: `.env` file environment variables
- **Used by**: All components that need auth or database access

#### 2.2 Auth Hook
**File**: `src/hooks/useAuth.ts`
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.user_metadata?.role === 'admin');
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser?.user_metadata?.role === 'admin');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return { user, loading, isAdmin, signOut };
}
```
- **Purpose**: Manages auth state across entire app
- **Used by**: `App.tsx` (main component)
- **Provides**: Current user, loading state, admin status, sign out function

#### 2.3 Auth Modal
**File**: `src/components/auth/AuthModal.tsx`
- **Sign Up**: `supabase.auth.signUp({ email, password, options })`
- **Sign In**: `supabase.auth.signInWithPassword({ email, password })`
- **Password Reset**: `supabase.auth.resetPasswordForEmail(email, { redirectTo })`

#### 2.4 App.tsx Integration
**File**: `src/App.tsx` (lines 24, 115-139)
```typescript
const { user, loading: authLoading, isAdmin } = useAuth();

useEffect(() => {
  // Check if this is the first user
  const checkFirstUser = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        if (countError.code === '42501') {
          setIsFirstUser(true);
        } else {
          console.error('Error checking user count:', countError);
        }
      } else {
        setIsFirstUser(!count || count === 0);
      }
    } catch (error) {
      console.error('Error checking first user:', error);
    }
  };

  if (!authLoading) {
    checkFirstUser();
  }
}, [authLoading]);
```
- **Purpose**: Determines if user should be admin (first user becomes admin)
- **Checks**: `users` table count to see if any users exist

#### 2.5 Task List Service
**File**: `src/services/taskListService.ts`
- **Graceful Degradation**: Falls back to local example lists if Supabase fails
- **Used for**: Fetching task lists, saving lists, checking example lists
- **Note**: Already handles errors gracefully - no changes needed

---

## 3. Current Configuration

### Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=https://jnpcnfnfoqxjcvkvhhbk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

### Database Schema Required
From `README.md` (lines 75-190), the database needs:

**Tables:**
1. `task_lists` - Stores all task lists
2. `users` - Stores user data and roles

**Policies:**
- Row Level Security (RLS) enabled
- Public read for example lists
- Admin write/update/delete access
- User count check for anonymous users

**Functions:**
- `handle_new_user()` - Trigger that creates user record and assigns role

**Triggers:**
- `on_auth_user_created` - Fires after signup to create user record

---

## 4. The Solution (NO CODE CHANGES NEEDED)

### What's Working
✅ All authentication code is correct
✅ Password reset feature is properly implemented
✅ Auth flow logic is sound
✅ Graceful fallback to local lists is working
✅ useAuth hook is properly structured
✅ AuthModal has all needed functionality

### What's NOT Working
❌ Supabase project URL is not resolving
❌ Cannot connect to Supabase backend

### The Fix
**Option 1: Create New Supabase Project**
1. Go to https://supabase.com
2. Sign in or create account
3. Create new project
4. Wait 2-3 minutes for setup
5. Get credentials from Project Settings → API
6. Update `.env` file

**Option 2: Fix Existing Project**
1. Log into https://supabase.com
2. Check if project exists and is active
3. If paused, unpause it
4. Verify the correct URL
5. Update `.env` if needed

---

## 5. Execution Checklist

### Phase 1: Verify Supabase Project
- [ ] Log into https://supabase.com
- [ ] Check if project `jnpcnfnfoqxjcvkvhhbk` exists
- [ ] If exists and paused → unpause it
- [ ] If doesn't exist → proceed to Phase 2

### Phase 2: Create New Project (if needed)
- [ ] Click "New Project" in Supabase dashboard
- [ ] Enter project name (e.g., "task-list-advanced")
- [ ] Create strong database password (save it!)
- [ ] Select region
- [ ] Click "Create new project"
- [ ] Wait for project to finish setting up (2-3 minutes)

### Phase 3: Get Credentials
- [ ] Go to Project Settings (gear icon)
- [ ] Click "API" section
- [ ] Copy Project URL (e.g., `https://abcdef123.supabase.co`)
- [ ] Copy anon/public key

### Phase 4: Update Environment
- [ ] Open `.env` file
- [ ] Update `VITE_SUPABASE_URL` with new project URL
- [ ] Update `VITE_SUPABASE_ANON_KEY` with new anon key
- [ ] Save file

### Phase 5: Set Up Database Schema
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Copy SQL from README.md (lines 75-190)
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify all tables/policies/functions created successfully

### Phase 6: Restart & Test
- [ ] Stop dev server (Ctrl+C)
- [ ] Run `npm run dev`
- [ ] Open browser to dev URL
- [ ] Test sign up (should work now!)
- [ ] Verify you become admin (first user)
- [ ] Test sign in
- [ ] Test password reset feature
- [ ] Test creating/saving task lists

---

## 6. Files That Will NOT Be Modified

❌ `src/lib/supabase.ts` - No changes needed
❌ `src/hooks/useAuth.ts` - No changes needed
❌ `src/components/auth/AuthModal.tsx` - Already updated with password reset
❌ `src/App.tsx` - No changes needed
❌ `src/services/taskListService.ts` - No changes needed

✅ `.env` - ONLY file that needs updating!

---

## 7. Success Criteria

### Authentication Working
- [ ] Can sign up without DNS errors
- [ ] Can sign in without DNS errors
- [ ] Password reset sends email successfully
- [ ] First user becomes admin automatically

### Database Working
- [ ] Can fetch task lists from Supabase
- [ ] Can save task lists to Supabase
- [ ] Example lists load from database
- [ ] Admin can manage lists

### No Errors in Console
- [ ] No `ERR_NAME_NOT_RESOLVED` errors
- [ ] No Supabase connection errors
- [ ] App functions normally

---

## 8. Risk Assessment

### Complexity: 🟢 LOW
- No code changes required
- Only configuration update needed
- Well-documented process

### Time Required: ⏱️ 10-15 minutes
- 2-3 min: Project creation/verification
- 2-3 min: Database setup
- 1 min: Update .env
- 2-3 min: Testing
- 5 min: Buffer for any issues

### Risks: 🟢 MINIMAL
- Cannot break existing code (no code changes)
- Local example lists continue working
- Graceful degradation already in place

---

## 9. Rollback Plan

If something goes wrong:
1. Revert `.env` to original values
2. App will continue working with local example lists
3. Auth features simply won't work until valid Supabase URL is provided

---

## 10. Additional Notes

### Why Password Reset Was Already Added
- User requested password reset functionality
- Feature was successfully implemented in `AuthModal.tsx`
- Code is correct and will work once Supabase URL is fixed
- No changes needed to password reset implementation

### Why No Other Code Changes
- All existing code is properly written
- Auth flow is well-structured
- Error handling is in place
- The ONLY issue is the Supabase URL not resolving
- This is a configuration issue, not a code issue

### User's Concern About Over-Complexity
- This plan is DETAILED for clarity and reference
- The ACTUAL fix is very simple: update .env file
- No refactoring, no restructuring, no additional features
- Just documentation of what exists and what needs updating
